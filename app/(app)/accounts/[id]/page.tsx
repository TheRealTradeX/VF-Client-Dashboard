import { AccountDetailsView } from "@/components/accounts/account-details-view";
import { getDataMode } from "@/lib/data-mode";
import type { Account, AccountStatus, JournalEntry, Trade } from "@/lib/mockData";
import {
  computeTradeNetPnl,
  getAuthenticatedSupabaseUser,
  getAccountIdentifiers,
  getSnapshotNumber,
  getTraderAccountById,
  listTradesByAccountIds,
} from "@/lib/volumetrica/trader-data";
import type { VolumetricaAccountRow, VolumetricaTradeRow } from "@/lib/volumetrica/trader-data";

type AccountDetailsPageProps = {
  params: { id: string };
};

export const dynamic = "force-dynamic";

const readText = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const toStatus = (status: string | null, enabled: boolean | null): AccountStatus => {
  const normalized = (status ?? "").toLowerCase();
  if (enabled === false || normalized.includes("disabled") || normalized.includes("closed")) {
    return "paused";
  }
  if (enabled === true || normalized.includes("active") || normalized.includes("enabled")) {
    return "active";
  }
  return "in-progress";
};

const toIsoDate = (value: string | null | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const toAccountType = (ruleName: string | null) => {
  const normalized = (ruleName ?? "").toLowerCase();
  if (normalized.includes("funded")) return "Funded Account";
  if (normalized.includes("eval") || normalized.includes("evaluation") || normalized.includes("starter")) {
    return "Evaluation";
  }
  return "Trading Account";
};

const buildAccountDetails = (account: VolumetricaAccountRow, trades: VolumetricaTradeRow[]) => {
  const rawSnapshot =
    account.snapshot && typeof account.snapshot === "object" ? (account.snapshot as Record<string, unknown>) : null;
  const rawAccount = account.raw && typeof account.raw === "object" ? (account.raw as Record<string, unknown>) : null;

  const balance = getSnapshotNumber(rawSnapshot, "balance") ?? 0;
  const equity = getSnapshotNumber(rawSnapshot, "equity") ?? balance;
  const startBalance =
    getSnapshotNumber(rawSnapshot, "startBalance") ??
    getSnapshotNumber(rawSnapshot, "initialBalance") ??
    balance;
  const dailyPnl =
    getSnapshotNumber(rawSnapshot, "dailyNetPL") ??
    getSnapshotNumber(rawSnapshot, "dailyPL") ??
    0;
  const tradePnl = trades.reduce((sum, trade) => sum + computeTradeNetPnl(trade), 0);
  const totalPnl = trades.length ? tradePnl : balance - startBalance;
  const wins = trades.filter((trade) => computeTradeNetPnl(trade) > 0);
  const losses = trades.filter((trade) => computeTradeNetPnl(trade) < 0);
  const grossProfit = wins.reduce((sum, trade) => sum + computeTradeNetPnl(trade), 0);
  const grossLoss = Math.abs(losses.reduce((sum, trade) => sum + computeTradeNetPnl(trade), 0));
  const winRate = trades.length ? (wins.length / trades.length) * 100 : undefined;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : undefined;

  const ruleName = account.rule_name ?? null;
  const label = ruleName ?? "Trading Account";
  const type = toAccountType(ruleName);
  const phase = ruleName ?? account.status ?? "Account";
  const displayId =
    readText(rawAccount?.accountHeader) ||
    readText(rawAccount?.header) ||
    readText(rawAccount?.accountNumber) ||
    account.account_id;
  const startDate =
    toIsoDate(readText(rawSnapshot?.updateUtc)) ??
    toIsoDate(readText(rawSnapshot?.creationUtc)) ??
    toIsoDate(account.updated_at) ??
    new Date().toISOString().slice(0, 10);

  const accountView: Account = {
    id: displayId,
    label,
    type,
    size: startBalance || balance,
    balance,
    equity,
    dailyPnl,
    totalPnl,
    startDate,
    phase,
    status: toStatus(account.status ?? null, account.enabled ?? null),
    winRate,
    profitFactor,
  };

  const tradeViews: Trade[] = trades.map((trade, index) => {
    const entryTime = trade.entry_date ?? trade.exit_date ?? trade.updated_at ?? new Date().toISOString();
    const exitTime = trade.exit_date ?? trade.entry_date ?? trade.updated_at ?? entryTime;
    const entryMs = Date.parse(entryTime);
    const exitMs = Date.parse(exitTime);
    const durationMinutes =
      Number.isFinite(entryMs) && Number.isFinite(exitMs)
        ? Math.max(0, Math.round((exitMs - entryMs) / 60000))
        : 0;
    const qty = typeof trade.quantity === "number" ? trade.quantity : 0;
    return {
      id: trade.trade_id ? `T-${trade.trade_id}` : trade.trade_key ?? `trade-${index + 1}`,
      accountId: account.account_id,
      symbol: trade.symbol_name ?? trade.contract_id?.toString() ?? "-",
      side: qty < 0 ? "SHORT" : "LONG",
      qty: Math.abs(qty),
      entryTime,
      exitTime,
      entryPrice: trade.open_price ?? 0,
      exitPrice: trade.close_price ?? trade.open_price ?? 0,
      pnl: computeTradeNetPnl(trade),
      fees: 0,
      commissions: trade.commission_paid ?? 0,
      durationMinutes,
      setupTag: "Trade",
    };
  });

  const journalEntries: JournalEntry[] = [];

  return { account: accountView, trades: tradeViews, journalEntries };
};

export default async function AccountDetailsPage({ params }: AccountDetailsPageProps) {
  const mode = getDataMode();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  let routeId = rawId ?? "";
  try {
    routeId = decodeURIComponent(routeId);
  } catch {
    // keep raw route id if decode fails
  }
  if (!routeId) {
    console.warn("volumetrica.accounts.detail.missing", {
      source: "AccountDetailsPage",
      account_ref: rawId ?? null,
    });
    return (
      <div className="p-6">
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 text-zinc-300">
          <div className="text-white mb-2">Missing account reference.</div>
          <div className="text-sm text-zinc-500">Open an account from the list to view details.</div>
        </div>
      </div>
    );
  }

  if (mode === "mock") {
    const {
      accounts,
      credentialsByAccountId,
      getAccountRouteId,
      journalEntries,
      rulesByAccountId,
      trades,
    } = await import("@/lib/mockData");

    const normalize = (value: string) => value.toString().toLowerCase().trim();
    const account =
      accounts.find((acct) => {
        const routeKey = getAccountRouteId(acct);
        return normalize(routeKey) === normalize(routeId) || normalize(acct.id) === normalize(routeId);
      }) ?? accounts[0];

    const accountTrades = trades.filter((trade) => trade.accountId === account.id);
    const accountJournal = journalEntries.filter((entry) => entry.accountId === account.id);
    const rules = rulesByAccountId[account.id];
    const credentials = credentialsByAccountId[account.id];

    return (
      <div className="p-6">
        <AccountDetailsView
          account={account}
          trades={accountTrades}
          journalEntries={accountJournal}
          rules={rules}
          credentials={credentials}
        />
      </div>
    );
  }

  const user = await getAuthenticatedSupabaseUser();
  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 text-zinc-300">
          <div className="text-white mb-2">Not signed in.</div>
          <div className="text-sm text-zinc-500">Sign in to view account details.</div>
        </div>
      </div>
    );
  }

  const account = await getTraderAccountById(user, routeId);
  if (!account) {
    console.info("volumetrica.accounts.detail.not_found", {
      source: "AccountDetailsPage",
      user_id: user.id,
      email: user.email ?? null,
      account_ref: routeId,
    });
    return (
      <div className="p-6">
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 text-zinc-300">
          <div className="text-white mb-2">Account not available yet.</div>
          <div className="text-sm text-zinc-500">
            We couldn&apos;t find this account in projections. Run reconciliation for{" "}
            <span className="text-zinc-200">{routeId}</span> and refresh.
          </div>
        </div>
      </div>
    );
  }
  const accountIds = getAccountIdentifiers(account);
  const trades = await listTradesByAccountIds(accountIds, { limit: 500 });
  const { account: accountView, trades: tradeViews, journalEntries } = buildAccountDetails(account, trades);

  return (
    <div className="p-6">
      <AccountDetailsView account={accountView} trades={tradeViews} journalEntries={journalEntries} />
    </div>
  );
}
