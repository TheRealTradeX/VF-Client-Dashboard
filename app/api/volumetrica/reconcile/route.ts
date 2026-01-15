import { NextResponse } from "next/server";

import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { volumetricaClient } from "@/lib/volumetrica/client";

export const runtime = "nodejs";

type ReconcileRequest = {
  userId?: string;
  accountId?: string;
};

const toNullableString = (value: unknown) => (typeof value === "string" ? value : null);

const toNullableBoolean = (value: unknown) => (typeof value === "boolean" ? value : null);

const normalizeAccountRecord = (account: Record<string, unknown>, receivedAt: string) => {
  const rawUser = account.user;
  const rawUserRecord = rawUser && typeof rawUser === "object" ? (rawUser as Record<string, unknown>) : null;
  return {
    account_id: toNullableString(account.id) ?? toNullableString(account.accountId) ?? "",
    user_id: toNullableString(rawUserRecord?.userId) ?? toNullableString(account.userId) ?? null,
    status: toNullableString(account.status),
    trading_permission: toNullableString(account.tradingPermission),
    enabled: toNullableBoolean(account.enabled),
    reason: toNullableString(account.reason),
    end_date: toNullableString(account.endDate),
    rule_id: toNullableString(account.ruleId),
    rule_name: toNullableString(account.ruleName),
    account_family_id: toNullableString(account.accountFamilyId),
    owner_organization_user_id: toNullableString(account.ownerOrganizationUserId),
    snapshot: account.snapshot && typeof account.snapshot === "object" ? account.snapshot : null,
    raw: account,
    last_event_id: null,
    updated_at: receivedAt,
    is_deleted: false,
    deleted_at: null,
  };
};

const diffArray = (apiValues: string[], projectionValues: string[]) => {
  const apiSet = new Set(apiValues);
  const projectionSet = new Set(projectionValues);
  const missingInProjection = apiValues.filter((value) => !projectionSet.has(value));
  const missingInApi = projectionValues.filter((value) => !apiSet.has(value));
  return { missingInProjection, missingInApi };
};

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  let body: ReconcileRequest = {};
  try {
    body = (await request.json()) as ReconcileRequest;
  } catch {
    body = {};
  }

  const userId = body.userId?.trim();
  const accountId = body.accountId?.trim();
  if (!userId && !accountId) {
    return NextResponse.json({ ok: false, error: "userId or accountId is required." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const result: Record<string, unknown> = {};

  try {
    if (userId) {
      const { data: userLink } = await supabase
        .from("volumetrica_users")
        .select("volumetrica_user_id, external_id, raw")
        .or(
          [
            `volumetrica_user_id.eq.${userId}`,
            `external_id.eq.${userId}`,
            userId.includes("@") ? `raw->>email.eq.${userId}` : null,
          ]
            .filter(Boolean)
            .join(","),
        )
        .maybeSingle();

      const resolvedUserId =
        (userLink as { volumetrica_user_id?: string | null } | null)?.volumetrica_user_id ?? userId;

      const apiAccounts = await volumetricaClient.getUserAccounts(resolvedUserId);
      const apiAccountIds = (apiAccounts ?? [])
        .map((acct) => (typeof acct === "object" && acct ? (acct as Record<string, unknown>).id : null))
        .filter((id): id is string => typeof id === "string");

      const { data: projectedAccounts, error } = await supabase
        .from("volumetrica_accounts")
        .select("account_id")
        .eq("user_id", userId);

      if (error) {
        throw new Error(error.message);
      }

      const projectionAccountIds = (projectedAccounts ?? [])
        .map((row) => row.account_id)
        .filter((id): id is string => typeof id === "string");

      const diff = diffArray(apiAccountIds, projectionAccountIds);
      let backfilled = 0;
      const receivedAt = new Date().toISOString();

      for (const missingId of diff.missingInProjection) {
        const apiAccount = await volumetricaClient.getAccountInfo(missingId);
        const record =
          typeof apiAccount === "object" && apiAccount
            ? normalizeAccountRecord(apiAccount as Record<string, unknown>, receivedAt)
            : null;

        if (!record || !record.account_id) {
          continue;
        }

        const { error: upsertError } = await supabase
          .from("volumetrica_accounts")
          .upsert(record, { onConflict: "account_id" });

        if (!upsertError) {
          backfilled += 1;
        }
      }

      result.user = {
        userId,
        resolvedUserId,
        apiCount: apiAccountIds.length,
        projectionCount: projectionAccountIds.length,
        ...diff,
        backfilled,
      };
    }

    if (accountId) {
      const apiAccount = await volumetricaClient.getAccountInfo(accountId);
      const { data: projection, error } = await supabase
        .from("volumetrica_accounts")
        .select("account_id,status,trading_permission,enabled,rule_id")
        .eq("account_id", accountId)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      const apiRecord = typeof apiAccount === "object" && apiAccount ? (apiAccount as Record<string, unknown>) : {};

      result.account = {
        accountId,
        api: {
          status: apiRecord.status ?? null,
          tradingPermission: apiRecord.tradingPermission ?? null,
          enabled: apiRecord.enabled ?? null,
          ruleId: apiRecord.tradingRuleId ?? null,
        },
        projection: projection ?? null,
      };
    }
  } catch (error) {
    await logAdminAction({
      action: "volumetrica.reconcile.failed",
      actorUserId: admin.userId,
      actorEmail: admin.email,
      targetType: userId ? "user" : "account",
      targetId: userId ?? accountId ?? null,
      metadata: { error: (error as Error).message },
    });

    return NextResponse.json(
      { ok: false, error: "Reconciliation failed.", details: (error as Error).message },
      { status: 502 },
    );
  }

  await logAdminAction({
    action: "volumetrica.reconcile",
    actorUserId: admin.userId,
    actorEmail: admin.email,
    targetType: userId ? "user" : "account",
    targetId: userId ?? accountId ?? null,
    metadata: result,
  });

  return NextResponse.json({ ok: true, result });
}
