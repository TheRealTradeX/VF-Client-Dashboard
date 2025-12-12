import Link from "next/link";
import { MoreVertical, TrendingUp, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { getAccountRouteId } from "@/lib/mockData";

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

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 hover:border-emerald-500/30 transition-colors">
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
        <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <div className="text-zinc-400 text-sm mb-1">Account Balance</div>
          <div className="text-white text-2xl">{account.balance}</div>
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

      {routeId ? (
        <Link
          href={`/accounts/${encodeURIComponent(routeId)}`}
          className="block text-center w-full mt-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg transition-colors"
        >
          View Details
        </Link>
      ) : (
        <div className="block text-center w-full mt-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-lg">
          View Details
        </div>
      )}
    </div>
  );
}
