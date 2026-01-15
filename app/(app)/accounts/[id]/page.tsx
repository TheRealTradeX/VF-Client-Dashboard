import { notFound } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDataMode } from "@/lib/data-mode";
import { formatCurrency } from "@/lib/mockData";
import {
  computeTradeNetPnl,
  getAuthenticatedSupabaseUser,
  getAccountIdentifiers,
  getSnapshotNumber,
  getTraderAccountById,
  listPositionsByAccountIds,
  listTradesByAccountIds,
} from "@/lib/volumetrica/trader-data";

type AccountDetailsPageProps = {
  params: { id: string };
};

const formatSignedCurrency = (value: number | null) => {
  if (value === null || !Number.isFinite(value)) return "-";
  if (value >= 0) return `+${formatCurrency(value)}`;
  return formatCurrency(value);
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
  if (!routeId) notFound();

  if (mode === "mock") {
    const { AccountDetailsView } = await import("@/components/accounts/account-details-view");
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
  if (!user) notFound();

  const account = await getTraderAccountById(user, routeId);
  if (!account) notFound();

  const accountIds = getAccountIdentifiers(account);
  const positions = await listPositionsByAccountIds(accountIds);
  const trades = await listTradesByAccountIds(accountIds, { limit: 200 });

  const snapshotBalance = getSnapshotNumber(account.snapshot, "balance");
  const snapshotEquity = getSnapshotNumber(account.snapshot, "equity") ?? snapshotBalance;
  const snapshotStartBalance = getSnapshotNumber(account.snapshot, "startBalance");
  const dailyNetPl =
    getSnapshotNumber(account.snapshot, "dailyNetPL") ?? getSnapshotNumber(account.snapshot, "dailyPL");
  const profitTargetBalance = getSnapshotNumber(account.snapshot, "profitTargetBalance");
  const netPnl = snapshotBalance !== null && snapshotStartBalance !== null ? snapshotBalance - snapshotStartBalance : null;

  const progressPct =
    snapshotBalance !== null &&
    snapshotStartBalance !== null &&
    profitTargetBalance !== null &&
    profitTargetBalance !== snapshotStartBalance
      ? ((snapshotBalance - snapshotStartBalance) / (profitTargetBalance - snapshotStartBalance)) * 100
      : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-zinc-400 text-sm">Account</div>
          <h1 className="text-white text-2xl">{account.account_id}</h1>
          <div className="text-sm text-zinc-500">
            {account.rule_name ? `Rule: ${account.rule_name}` : account.rule_id ? `Rule ID: ${account.rule_id}` : "-"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-zinc-400 text-sm">Status</div>
          <div className="text-white">{account.status ?? "-"}</div>
          <div className="text-zinc-500 text-sm">{account.enabled ? "Enabled" : "Disabled"}</div>
          <div className="text-zinc-500 text-sm">Permission: {account.trading_permission ?? "-"}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
          <div className="text-zinc-400 text-sm mb-1">Balance</div>
          <div className="text-white text-xl">{snapshotBalance === null ? "-" : formatCurrency(snapshotBalance)}</div>
          <div className="text-zinc-500 text-xs">Start: {snapshotStartBalance === null ? "-" : formatCurrency(snapshotStartBalance)}</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
          <div className="text-zinc-400 text-sm mb-1">Equity</div>
          <div className="text-white text-xl">{snapshotEquity === null ? "-" : formatCurrency(snapshotEquity)}</div>
          <div className="text-zinc-500 text-xs">Daily Net: {formatSignedCurrency(dailyNetPl)}</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
          <div className="text-zinc-400 text-sm mb-1">Net P&L</div>
          <div className={`text-xl ${typeof netPnl === "number" && netPnl < 0 ? "text-red-500" : "text-emerald-500"}`}>
            {formatSignedCurrency(netPnl)}
          </div>
          <div className="text-zinc-500 text-xs">Realized via snapshot</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
          <div className="text-zinc-400 text-sm mb-1">Profit Target</div>
          <div className="text-white text-xl">
            {profitTargetBalance === null ? "-" : formatCurrency(profitTargetBalance)}
          </div>
          <div className="text-zinc-500 text-xs">
            Progress: {progressPct === null ? "-" : `${Math.max(0, progressPct).toFixed(1)}%`}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white">Open Positions</h2>
            <div className="text-sm text-zinc-500">{positions.length} positions</div>
          </div>
          {positions.length === 0 ? (
            <div className="text-sm text-zinc-500">No positions.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-900">
                  <TableHead className="text-zinc-400">Symbol</TableHead>
                  <TableHead className="text-zinc-400 text-right">Qty</TableHead>
                  <TableHead className="text-zinc-400 text-right">Daily P&L</TableHead>
                  <TableHead className="text-zinc-400 text-right">Open P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.slice(0, 25).map((pos) => (
                  <TableRow key={pos.position_key} className="border-zinc-900">
                    <TableCell className="text-white">{pos.symbol_name ?? pos.contract_id ?? "-"}</TableCell>
                    <TableCell className="text-zinc-300 text-right">{pos.quantity ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      <span className={(pos.daily_pl ?? 0) >= 0 ? "text-emerald-500" : "text-red-500"}>
                        {pos.daily_pl === null ? "-" : formatSignedCurrency(pos.daily_pl)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={(pos.open_pl ?? 0) >= 0 ? "text-emerald-500" : "text-red-500"}>
                        {pos.open_pl === null ? "-" : formatSignedCurrency(pos.open_pl)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white">Recent Trades</h2>
            <div className="text-sm text-zinc-500">{trades.length} trades</div>
          </div>
          {trades.length === 0 ? (
            <div className="text-sm text-zinc-500">No trades.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-900">
                  <TableHead className="text-zinc-400">Exit</TableHead>
                  <TableHead className="text-zinc-400">Symbol</TableHead>
                  <TableHead className="text-zinc-400 text-right">Qty</TableHead>
                  <TableHead className="text-zinc-400 text-right">Net P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.slice(0, 25).map((trade) => {
                  const net = computeTradeNetPnl(trade);
                  return (
                    <TableRow key={trade.trade_key} className="border-zinc-900">
                      <TableCell className="text-zinc-300">
                        {(trade.exit_date ?? trade.entry_date ?? trade.updated_at).slice(0, 16).replace("T", " ")}
                      </TableCell>
                      <TableCell className="text-white">{trade.symbol_name ?? trade.contract_id ?? "-"}</TableCell>
                      <TableCell className="text-zinc-300 text-right">{trade.quantity ?? "-"}</TableCell>
                      <TableCell className="text-right">
                        <span className={net >= 0 ? "text-emerald-500" : "text-red-500"}>
                          {formatSignedCurrency(net)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
