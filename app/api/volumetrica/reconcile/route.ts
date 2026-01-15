import { NextResponse } from "next/server";

import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { applyWebhookProjections } from "@/lib/volumetrica/projections";
import { volumetricaClient } from "@/lib/volumetrica/client";
import type { TradingTradeInfoModel } from "@/lib/volumetrica/types";

export const runtime = "nodejs";

type ReconcileRequest = {
  userId?: string;
  accountId?: string;
  startDt?: string;
  endDt?: string;
};

const toNullableString = (value: unknown) => (typeof value === "string" ? value : null);

const toNullableBoolean = (value: unknown) => (typeof value === "boolean" ? value : null);

const toNullableNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const toIsoFromEpoch = (value: unknown) => {
  const numeric = toNullableNumber(value);
  if (numeric === null) return null;

  let ms: number | null = null;
  if (numeric > 1e15) {
    // Treat as .NET ticks if the value is extremely large.
    ms = Math.floor((numeric - 621355968000000000) / 10000);
  } else if (numeric > 1e12) {
    ms = Math.floor(numeric);
  } else {
    ms = Math.floor(numeric * 1000);
  }

  if (!Number.isFinite(ms) || ms <= 0) return null;
  return new Date(ms).toISOString();
};

const toIsoFromDate = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) return null;
  const normalized = value.trim();
  const date = new Date(normalized.includes("T") ? normalized : `${normalized}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

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

const resolveReportData = (report: unknown) => {
  if (!report || typeof report !== "object") return null;
  const record = report as Record<string, unknown>;
  if (record.data && typeof record.data === "object") {
    return record.data as Record<string, unknown>;
  }
  return record;
};

const normalizeReportTrade = (trade: Record<string, unknown>): TradingTradeInfoModel => {
  const entryDate =
    toIsoFromEpoch(trade.entryDate) ??
    toIsoFromDate(trade.entrySessionDate) ??
    toIsoFromDate(trade.entryDateUtc);
  const exitDate =
    toIsoFromEpoch(trade.exitDate) ??
    toIsoFromDate(trade.exitSessionDate) ??
    toIsoFromDate(trade.exitDateUtc);

  return {
    tradeId: toNullableNumber(trade.tradeId),
    contractId: toNullableNumber(trade.contractId),
    entryDate,
    exitDate,
    quantity: toNullableNumber(trade.quantity),
    openPrice: toNullableNumber(trade.entryPrice),
    closePrice: toNullableNumber(trade.exitPrice),
    pl: toNullableNumber(trade.netPl ?? trade.tradePl ?? trade.grossPl),
    convertedPL: toNullableNumber(trade.convertedNetPl ?? trade.convertedTradePl ?? trade.convertedGrossPl),
    commissionPaid: null,
    symbolName: toNullableString(trade.symbolName),
    unaccounted: typeof trade.unaccounted === "boolean" ? trade.unaccounted : null,
    flags: toNullableNumber(trade.flags),
  };
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
  const startDt = body.startDt?.trim();
  const endDt = body.endDt?.trim();
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
      const apiAccountRecords = (apiAccounts ?? []).filter(
        (acct): acct is Record<string, unknown> => typeof acct === "object" && acct !== null,
      );
      const apiAccountIds = apiAccountRecords
        .map((acct) => (typeof acct.id === "string" ? acct.id : null))
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
      let tradesBackfilled = 0;
      const tradeBackfillErrors: string[] = [];
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

      const reportStart =
        startDt ??
        new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString();

      for (const accountIdToBackfill of apiAccountIds) {
        const apiAccount = apiAccountRecords.find(
          (acct) => typeof acct.id === "string" && acct.id === accountIdToBackfill,
        );
        const accountUser = apiAccount?.user && typeof apiAccount.user === "object"
          ? (apiAccount.user as Record<string, unknown>)
          : null;
        const report = await volumetricaClient.getAccountReport(accountIdToBackfill, reportStart, endDt);
        const reportData = resolveReportData(report);
        const reportTrades = Array.isArray(reportData?.trades) ? reportData?.trades : [];
        if (!reportTrades.length) continue;

        const trades = reportTrades
          .filter((trade): trade is Record<string, unknown> => typeof trade === "object" && trade !== null)
          .map(normalizeReportTrade)
          .filter((trade) => trade.tradeId || trade.entryDate || trade.exitDate || trade.symbolName);

        if (!trades.length) continue;

        const projection = await applyWebhookProjections(
          {
            accountId: accountIdToBackfill,
            userId: toNullableString(accountUser?.userId) ?? resolvedUserId ?? userId ?? null,
            tradeReport: trades,
          },
          { eventId: `reconcile:${accountIdToBackfill}:${reportStart}`, receivedAt },
        );

        if (projection.errors.length) {
          tradeBackfillErrors.push(...projection.errors.map((message) => `${accountIdToBackfill}: ${message}`));
        } else {
          tradesBackfilled += trades.length;
        }
      }

      result.user = {
        userId,
        resolvedUserId,
        apiCount: apiAccountIds.length,
        projectionCount: projectionAccountIds.length,
        ...diff,
        backfilled,
        tradesBackfilled,
        tradeBackfillErrors,
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

      const reportStart =
        startDt ??
        new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString();
      const report = await volumetricaClient.getAccountReport(accountId, reportStart, endDt);
      const reportData = resolveReportData(report);
      const reportTrades = Array.isArray(reportData?.trades) ? reportData?.trades : [];
      const trades = reportTrades
        .filter((trade): trade is Record<string, unknown> => typeof trade === "object" && trade !== null)
        .map(normalizeReportTrade)
        .filter((trade) => trade.tradeId || trade.entryDate || trade.exitDate || trade.symbolName);

      const tradeBackfillResult = trades.length
        ? await applyWebhookProjections(
            { accountId, tradeReport: trades },
            { eventId: `reconcile:${accountId}:${reportStart}`, receivedAt: new Date().toISOString() },
          )
        : { updates: [], errors: [] };

      result.account = {
        accountId,
        api: {
          status: apiRecord.status ?? null,
          tradingPermission: apiRecord.tradingPermission ?? null,
          enabled: apiRecord.enabled ?? null,
          ruleId: apiRecord.tradingRuleId ?? null,
        },
        projection: projection ?? null,
        tradesBackfilled: trades.length,
        tradeBackfillErrors: tradeBackfillResult.errors,
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
