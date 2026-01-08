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
      const apiAccounts = await volumetricaClient.getUserAccounts(userId);
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

      result.user = {
        userId,
        apiCount: apiAccountIds.length,
        projectionCount: projectionAccountIds.length,
        ...diffArray(apiAccountIds, projectionAccountIds),
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
