import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { computeTradeNetPnl, getSnapshotNumber } from "@/lib/volumetrica/trader-data";

type AccountRow = {
  account_id: string;
  user_id: string | null;
  status: string | null;
  enabled: boolean | null;
  snapshot: Record<string, unknown> | null;
  raw: Record<string, unknown> | null;
  is_hidden: boolean;
  is_test: boolean;
  is_deleted: boolean;
};

type TradeRow = {
  account_id: string | null;
  exit_date: string | null;
  entry_date: string | null;
  pl: number | null;
  commission_paid: number | null;
};

type LeaderboardEntry = {
  rank: number;
  accountId: string;
  displayName: string;
  netPnl: number;
  progressPct: number | null;
  tradingDays: number;
  firstTradeAt: string | null;
  isCurrentUser: boolean;
};

const getMonthStartUtc = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
};

const getUserDisplayName = (account: AccountRow) => {
  const raw = account.raw;
  if (!raw || typeof raw !== "object") {
    return `Trader ${account.account_id.slice(-4)}`;
  }
  const user = (raw as Record<string, unknown>).user;
  if (!user || typeof user !== "object") {
    return `Trader ${account.account_id.slice(-4)}`;
  }
  const userRecord = user as Record<string, unknown>;
  const fullName = typeof userRecord.fullName === "string" ? userRecord.fullName : null;
  const username = typeof userRecord.username === "string" ? userRecord.username : null;
  const email = typeof userRecord.email === "string" ? userRecord.email : null;
  return fullName ?? username ?? email ?? `Trader ${account.account_id.slice(-4)}`;
};

const isAccountEligible = (account: AccountRow) => {
  if (account.is_deleted || account.is_hidden || account.is_test) return false;
  if (account.enabled === false) return false;
  const status = (account.status ?? "").toLowerCase();
  if (status.includes("fail") || status.includes("breach") || status.includes("disabled")) {
    return false;
  }
  return true;
};

const resolveProgressPct = (account: AccountRow) => {
  const balance = getSnapshotNumber(account.snapshot, "balance");
  const startBalance = getSnapshotNumber(account.snapshot, "startBalance");
  const profitTargetBalance = getSnapshotNumber(account.snapshot, "profitTargetBalance");
  if (
    balance === null ||
    startBalance === null ||
    profitTargetBalance === null ||
    profitTargetBalance === startBalance
  ) {
    return null;
  }
  return ((balance - startBalance) / (profitTargetBalance - startBalance)) * 100;
};

const getRawUserId = (account: AccountRow) => {
  const raw = account.raw;
  if (!raw || typeof raw !== "object") return null;
  const user = (raw as Record<string, unknown>).user;
  if (!user || typeof user !== "object") return null;
  const userRecord = user as Record<string, unknown>;
  return typeof userRecord.extEntityId === "string"
    ? userRecord.extEntityId
    : typeof userRecord.userId === "string"
      ? userRecord.userId
      : null;
};

export async function buildLeaderboard(currentUserId?: string | null): Promise<LeaderboardEntry[]> {
  const supabase = createSupabaseAdminClient();
  const { data: accountsData, error: accountsError } = await supabase
    .from("volumetrica_accounts")
    .select("account_id,user_id,status,enabled,snapshot,raw,is_hidden,is_test,is_deleted")
    .eq("is_deleted", false);

  if (accountsError) {
    throw new Error(accountsError.message);
  }

  const eligibleAccounts = (accountsData as AccountRow[] | null)?.filter(isAccountEligible) ?? [];
  if (!eligibleAccounts.length) return [];

  const accountIds = eligibleAccounts.map((account) => account.account_id);
  const monthStart = getMonthStartUtc().toISOString();

  const { data: tradesData, error: tradesError } = await supabase
    .from("volumetrica_trades")
    .select("account_id,exit_date,entry_date,pl,commission_paid")
    .in("account_id", accountIds)
    .gte("exit_date", monthStart)
    .not("exit_date", "is", null);

  if (tradesError) {
    throw new Error(tradesError.message);
  }

  const tradeStats = new Map<
    string,
    { netPnl: number; tradingDays: Set<string>; firstTradeAt: string | null }
  >();

  (tradesData as TradeRow[] | null)?.forEach((trade) => {
    if (!trade.account_id) return;
    const stats = tradeStats.get(trade.account_id) ?? {
      netPnl: 0,
      tradingDays: new Set<string>(),
      firstTradeAt: null,
    };
    stats.netPnl += computeTradeNetPnl(trade);
    const tradeTime = trade.exit_date ?? trade.entry_date;
    if (tradeTime) {
      stats.tradingDays.add(tradeTime.slice(0, 10));
      if (!stats.firstTradeAt || tradeTime < stats.firstTradeAt) {
        stats.firstTradeAt = tradeTime;
      }
    }
    tradeStats.set(trade.account_id, stats);
  });

  const entries = eligibleAccounts.map((account) => {
    const stats = tradeStats.get(account.account_id);
    const netPnl = stats?.netPnl ?? 0;
    const tradingDays = stats?.tradingDays.size ?? 0;
    const firstTradeAt = stats?.firstTradeAt ?? null;
    const progressPct = resolveProgressPct(account);
    const displayName = getUserDisplayName(account);
    const rawUserId = getRawUserId(account);
    const isCurrentUser =
      Boolean(currentUserId) &&
      (account.user_id === currentUserId || rawUserId === currentUserId);

    return {
      rank: 0,
      accountId: account.account_id,
      displayName,
      netPnl,
      progressPct,
      tradingDays,
      firstTradeAt,
      isCurrentUser,
    };
  });

  const sorted = entries.sort((a, b) => {
    if (a.netPnl !== b.netPnl) return b.netPnl - a.netPnl;
    const aProgress = a.progressPct ?? Number.NEGATIVE_INFINITY;
    const bProgress = b.progressPct ?? Number.NEGATIVE_INFINITY;
    if (aProgress !== bProgress) return bProgress - aProgress;
    if (a.tradingDays !== b.tradingDays) return a.tradingDays - b.tradingDays;
    const aFirst = a.firstTradeAt ? Date.parse(a.firstTradeAt) : Number.POSITIVE_INFINITY;
    const bFirst = b.firstTradeAt ? Date.parse(b.firstTradeAt) : Number.POSITIVE_INFINITY;
    return aFirst - bFirst;
  });

  return sorted.map((entry, index) => ({ ...entry, rank: index + 1 }));
}
