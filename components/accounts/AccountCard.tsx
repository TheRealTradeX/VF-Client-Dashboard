import { MoreVertical, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { formatCurrency } from "@/lib/mockData";
import { resolveAccountRouteId } from "@/lib/volumetrica/account-routing";
import Link from "next/link";

interface AccountCardProps {
  account: any;
}

export function AccountCard({ account }: AccountCardProps) {
  const routeId = resolveAccountRouteId(account);
  const accountId = account?.id ?? account?.account_id ?? routeId ?? "-";
  const snapshot = typeof account?.snapshot === "object" && account.snapshot ? (account.snapshot as any) : null;

  const balanceNumber =
    typeof snapshot?.balance === "number"
      ? snapshot.balance
      : typeof account?.balance === "number"
        ? account.balance
        : typeof account?.balance === "string"
          ? Number(account.balance.replace(/[^0-9.-]+/g, ""))
          : null;
  const equityNumber =
    typeof snapshot?.equity === "number"
      ? snapshot.equity
      : typeof account?.equity === "number"
        ? account.equity
        : typeof account?.equity === "string"
          ? Number(account.equity.replace(/[^0-9.-]+/g, ""))
          : null;
  const startBalanceNumber =
    typeof snapshot?.startBalance === "number"
      ? snapshot.startBalance
      : typeof account?.size === "number"
        ? account.size
        : null;

  const dailyPnlNumber =
    typeof snapshot?.dailyNetPL === "number"
      ? snapshot.dailyNetPL
      : typeof snapshot?.dailyPL === "number"
        ? snapshot.dailyPL
        : typeof account?.dailyPnl === "number"
          ? account.dailyPnl
          : typeof account?.dailyPnl === "string"
            ? Number(account.dailyPnl.replace(/[^0-9.-]+/g, ""))
            : null;

  const totalPnlNumber =
    typeof account?.totalPnl === "number"
      ? account.totalPnl
      : typeof account?.totalPnl === "string"
        ? Number(account.totalPnl.replace(/[^0-9.-]+/g, ""))
        : balanceNumber !== null && startBalanceNumber !== null
          ? balanceNumber - startBalanceNumber
          : null;

  const formatSigned = (value: number | null) => {
    if (value === null || !Number.isFinite(value)) return "-";
    if (value >= 0) return `+${formatCurrency(value)}`;
    return formatCurrency(value);
  };

  const balanceDisplay = balanceNumber === null ? account?.balance ?? "-" : formatCurrency(balanceNumber);
  const equityDisplay = equityNumber === null ? account?.equity ?? "-" : formatCurrency(equityNumber);
  const sizeDisplay = startBalanceNumber === null ? account?.size ?? "-" : formatCurrency(startBalanceNumber);
  const dailyPnlDisplay =
    typeof account?.dailyPnl === "string" ? account.dailyPnl : formatSigned(dailyPnlNumber);
  const totalPnlDisplay =
    typeof account?.totalPnl === "string" ? account.totalPnl : formatSigned(totalPnlNumber);

  const statusText = String(account?.status ?? "").toLowerCase();
  const isActive = account?.enabled === true || statusText === "active" || statusText.includes("active");
  const phaseLabel = account?.phase ?? account?.rule_name ?? account?.ruleName ?? account?.status ?? "Account";
  const typeLabel = account?.type ?? account?.rule_name ?? account?.ruleName ?? "Trading Account";
  const startDateLabel =
    account?.startDate ??
    (typeof snapshot?.updateUtc === "string" ? snapshot.updateUtc.slice(0, 10) : null) ??
    "-";

  const isProfitable =
    typeof totalPnlNumber === "number"
      ? totalPnlNumber >= 0
      : typeof account?.totalPnl === "string"
        ? account.totalPnl.startsWith("+") || !account.totalPnl.startsWith("-")
        : true;
  const isBalancePositive = typeof balanceNumber === "number" ? balanceNumber >= 0 : true;

  return (
    <Link
      href={routeId ? `/accounts/${encodeURIComponent(routeId)}` : "#"}
      className={`block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-xl ${
        routeId ? "" : "pointer-events-none"
      }`}
    >
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 group-hover:border-emerald-500/30 transition-colors h-full">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white">{typeLabel}</h3>
              {isActive ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <Clock className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            <div className="text-sm text-zinc-500">{accountId}</div>
          </div>
        <div className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors">
          <MoreVertical className="w-4 h-4" />
        </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <div className="text-zinc-400 text-sm mb-1">Account Balance</div>
            <div className={`text-2xl ${isBalancePositive ? "text-emerald-500" : "text-red-500"}`}>{balanceDisplay}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-zinc-400 text-xs mb-1">Daily P&L</div>
              <div className={`${isProfitable ? 'text-emerald-500' : 'text-red-500'}`}>
                {dailyPnlDisplay}
              </div>
            </div>
            <div>
              <div className="text-zinc-400 text-xs mb-1">Total P&L</div>
              <div className={`${isProfitable ? 'text-emerald-500' : 'text-red-500'}`}>
                {totalPnlDisplay}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-zinc-400 text-xs mb-1">Equity</div>
              <div className="text-white text-sm">{equityDisplay}</div>
            </div>
            <div>
              <div className="text-zinc-400 text-xs mb-1">Account Size</div>
              <div className="text-white text-sm">{sizeDisplay}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            <div
              className={`px-2.5 py-1 rounded-lg text-xs ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
              }`}
            >
              {phaseLabel}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Calendar className="w-3 h-3" />
            <span>Since {startDateLabel}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
