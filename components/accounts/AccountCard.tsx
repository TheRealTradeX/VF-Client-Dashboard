import { MoreVertical, TrendingUp, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { getAccountRouteId, formatCurrency } from "@/lib/mockData";
import Link from "next/link";

interface Account {
  id: string;
  type: string;
  size: string;
  balance: string;
  equity: string;
  dailyPnl: string;
  totalPnl: string;
  phase: string;
  status: string;
  startDate: string;
}

interface AccountCardProps {
  account: any;
}

export function AccountCard({ account }: AccountCardProps) {
  const routeId = getAccountRouteId(account);
  const isProfitable =
    typeof account?.totalPnl === "string"
      ? account.totalPnl.startsWith("+") || !account.totalPnl.startsWith("-")
      : Number(account?.totalPnl ?? 0) >= 0;
  const rawBalance =
    typeof account?.balance === "string"
      ? Number(account.balance.replace(/[^0-9.-]+/g, ""))
      : Number(account?.balance ?? 0);
  const isBalancePositive = Number.isFinite(rawBalance) ? rawBalance >= 0 : true;
  const balanceDisplay = Number.isFinite(rawBalance) ? formatCurrency(rawBalance) : account?.balance ?? "-";

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
              <h3 className="text-white">{account.type}</h3>
              {account.status === 'active' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <Clock className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            <div className="text-sm text-zinc-500">{account.id}</div>
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
                {account.dailyPnl}
              </div>
            </div>
            <div>
              <div className="text-zinc-400 text-xs mb-1">Total P&L</div>
              <div className={`${isProfitable ? 'text-emerald-500' : 'text-red-500'}`}>
                {account.totalPnl}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-zinc-400 text-xs mb-1">Equity</div>
              <div className="text-white text-sm">{account.equity}</div>
            </div>
            <div>
              <div className="text-zinc-400 text-xs mb-1">Account Size</div>
              <div className="text-white text-sm">{account.size}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            <div className={`px-2.5 py-1 rounded-lg text-xs ${
              account.status === 'active'
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
            }`}>
              {account.phase}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Calendar className="w-3 h-3" />
            <span>Since {account.startDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
