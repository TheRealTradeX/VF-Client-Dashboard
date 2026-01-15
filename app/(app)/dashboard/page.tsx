import { AccountsOverview } from "@/components/dashboard/AccountsOverview";
import { LiveTrades } from "@/components/dashboard/LiveTrades";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { TradeNowButton } from "@/components/dashboard/TradeNowButton";
import type { StatsGridItem } from "@/components/dashboard/StatsGrid";
import { formatCurrency } from "@/lib/mockData";
import { getDataMode } from "@/lib/data-mode";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  computeTradeNetPnl,
  getAuthenticatedSupabaseUser,
  getAccountIdentifiers,
  getSnapshotNumber,
  listRecentEventsByAccountIds,
  listTradesByAccountIds,
  listTraderAccounts,
} from "@/lib/volumetrica/trader-data";
import { Activity, DollarSign, Percent, Target } from "lucide-react";

const formatSignedCurrency = (value: number | null) => {
  if (value === null || !Number.isFinite(value)) return "-";
  if (value >= 0) return `+${formatCurrency(value)}`;
  return formatCurrency(value);
};

const formatPct = (value: number | null) => {
  if (value === null || !Number.isFinite(value)) return "-";
  return `${value.toFixed(1)}%`;
};

const toDateKeyUtc = (iso: string) => {
  const date = new Date(iso);
  const key = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  return key.toISOString().slice(0, 10);
};

const formatTimeAgo = (iso: string) => {
  const value = new Date(iso).getTime();
  const diffMs = Date.now() - value;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 48) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
};

export default async function DashboardPage() {
  const mode = getDataMode();
  if (mode === "mock") {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-white text-2xl mb-1">Welcome back</h1>
          <p className="text-zinc-400">Here&apos;s what&apos;s happening with your accounts today</p>
        </div>

        <StatsGrid />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceChart />
          </div>
          <div>
            <AccountsOverview />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LiveTrades />
          <RecentActivity />
        </div>
      </div>
    );
  }

  const user = await getAuthenticatedSupabaseUser();
  if (!user) {
    return (
      <div className="p-6">
        <div className="text-white">Not signed in.</div>
      </div>
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();
  const profileName = typeof profile?.full_name === "string" ? profile.full_name.trim() : "";
  const profileEmail = typeof profile?.email === "string" ? profile.email.trim() : "";
  const displayEmail = user.email ?? profileEmail;
  const userLabel = profileName || (displayEmail ? displayEmail.split("@")[0] : "Trader");

  const accounts = await listTraderAccounts(user);
  const accountIds = Array.from(new Set(accounts.flatMap(getAccountIdentifiers)));

  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const startDateUtc = monthStart.toISOString();

  const trades = await listTradesByAccountIds(accountIds, { startDateUtc, limit: 500 });
  const recentEvents = await listRecentEventsByAccountIds(accountIds, { limit: 6 });

  const totalBalance = accounts.reduce((sum, account) => sum + (getSnapshotNumber(account.snapshot, "balance") ?? 0), 0);
  const netPnlTrades = trades.map(computeTradeNetPnl);
  const wins = netPnlTrades.filter((pnl) => pnl > 0);
  const losses = netPnlTrades.filter((pnl) => pnl < 0);
  const grossProfit = wins.reduce((sum, pnl) => sum + pnl, 0);
  const grossLoss = Math.abs(losses.reduce((sum, pnl) => sum + pnl, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : null;
  const winRate = netPnlTrades.length ? (wins.length / netPnlTrades.length) * 100 : null;
  const mtdNetPnl = netPnlTrades.reduce((sum, pnl) => sum + pnl, 0);
  const snapshotPnl = accounts.reduce((sum, account) => {
    const balance = getSnapshotNumber(account.snapshot, "balance");
    const startBalance = getSnapshotNumber(account.snapshot, "startBalance");
    if (balance !== null && startBalance !== null) {
      return sum + (balance - startBalance);
    }
    return sum;
  }, 0);
  const effectivePnl = netPnlTrades.length ? mtdNetPnl : snapshotPnl;

  const changePercent =
    totalBalance > 0 && Number.isFinite(effectivePnl)
      ? `${((effectivePnl / totalBalance) * 100).toFixed(2)}%`
      : "-";
  const changePercentDisplay =
    changePercent === "-" ? "-" : changePercent.startsWith("-") ? changePercent : `+${changePercent}`;

  const stats: StatsGridItem[] = [
    {
      label: "Total Balance",
      value: accounts.length ? formatCurrency(totalBalance) : "-",
      change: `Across ${accounts.length} account${accounts.length === 1 ? "" : "s"}`,
      changePercent: changePercentDisplay,
      trend: mtdNetPnl >= 0 ? "up" : "down",
      icon: DollarSign,
    },
    {
      label: "MTD Net P&L",
      value: formatSignedCurrency(effectivePnl),
      change: netPnlTrades.length
        ? `${netPnlTrades.length} closed trade${netPnlTrades.length === 1 ? "" : "s"}`
        : "Based on account snapshots",
      changePercent: "-",
      trend: effectivePnl >= 0 ? "up" : "down",
      icon: Activity,
    },
    {
      label: "Win Rate (MTD)",
      value: formatPct(winRate),
      change: `${wins.length} / ${netPnlTrades.length} trades`,
      changePercent: "-",
      trend: (winRate ?? 0) >= 50 ? "up" : "down",
      icon: Target,
    },
    {
      label: "Profit Factor (MTD)",
      value: profitFactor === null ? "-" : profitFactor.toFixed(2),
      change: "Trade report",
      changePercent: "-",
      trend: (profitFactor ?? 0) >= 1 ? "up" : "down",
      icon: Percent,
    },
  ];

  const overviewAccounts = accounts.slice(0, 5).map((account) => {
    const balance = getSnapshotNumber(account.snapshot, "balance");
    const startBalance = getSnapshotNumber(account.snapshot, "startBalance");
    const pnl = balance !== null && startBalance !== null ? balance - startBalance : null;
    const status = account.enabled ? "active" : "in-progress";
    const phase = account.rule_name ?? account.status ?? "Account";

    return {
      id: account.account_id,
      type: account.rule_name ?? "Trading Account",
      balance: balance === null ? "-" : formatCurrency(balance),
      pnl: pnl === null ? "-" : formatSignedCurrency(pnl),
      status,
      phase,
    };
  });

  const performanceMap = new Map<string, number>();
  trades.forEach((trade) => {
    const dt = trade.exit_date ?? trade.entry_date;
    if (!dt) return;
    const key = toDateKeyUtc(dt);
    performanceMap.set(key, (performanceMap.get(key) ?? 0) + computeTradeNetPnl(trade));
  });

  const startBalanceSum = accounts.reduce(
    (sum, account) => sum + (getSnapshotNumber(account.snapshot, "startBalance") ?? 0),
    0,
  );

  const dailyKeys = Array.from(performanceMap.keys()).sort((a, b) => a.localeCompare(b));
  let running = startBalanceSum;
  const performanceData = dailyKeys.map((key) => {
    running += performanceMap.get(key) ?? 0;
    const [, month, day] = key.split("-").map((s) => Number(s));
    const label = `${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
    return { date: label, balance: running, equity: running };
  });
  if (!performanceData.length && totalBalance > 0) {
    const today = new Date();
    const label = `${String(today.getUTCMonth() + 1).padStart(2, "0")}/${String(today.getUTCDate()).padStart(2, "0")}`;
    performanceData.push({ date: label, balance: totalBalance, equity: totalBalance });
  }

  const recentTrades = trades.slice(0, 6).map((trade) => {
    const dt = trade.exit_date ?? trade.entry_date ?? trade.updated_at;
    const time = dt ? new Date(dt).toISOString().slice(11, 19) : "--:--:--";
    return {
      id: trade.trade_key,
      time,
      symbol: trade.symbol_name ?? trade.contract_id?.toString() ?? "-",
      entry: trade.open_price ?? null,
      current: trade.close_price ?? null,
      size: trade.quantity ?? null,
      pnl: computeTradeNetPnl(trade),
      status: "closed" as const,
    };
  });

  const activityItems = recentEvents.map((evt) => {
    const category = evt.category ?? "Event";
    const eventType = evt.event ?? "";
    const title = `${category} ${eventType}`.trim();
    const description = evt.account_id ? `Account ${evt.account_id}` : "Update received";
    return {
      id: evt.event_id,
      type: category.toLowerCase(),
      title,
      description,
      time: formatTimeAgo(evt.received_at),
      icon: Activity,
      color: "emerald" as const,
    };
  });

  const primaryAccountId = accounts[0]?.account_id ?? null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-white text-2xl mb-1">Welcome back, {userLabel}</h1>
          <p className="text-zinc-400">Here&apos;s what&apos;s happening with your accounts today</p>
        </div>
        <TradeNowButton accountId={primaryAccountId} />
      </div>

      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceChart data={performanceData} rangeLabel="MTD realized net P&L" />
        </div>
        <div>
          <AccountsOverview accounts={overviewAccounts} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveTrades trades={recentTrades} />
        <RecentActivity activities={activityItems} />
      </div>
    </div>
  );
}
