import Link from "next/link";
import { CheckCircle2, Clock } from 'lucide-react';
import { resolveAccountRouteId } from "@/lib/volumetrica/account-routing";

export type AccountsOverviewItem = {
  id: string;
  type: string;
  balance: string;
  pnl: string;
  status: string;
  phase: string;
};

const fallbackAccounts: AccountsOverviewItem[] = [
  {
    id: 'VF-2025-8423',
    type: 'Funded Account',
    balance: '$125,430.00',
    pnl: '+$5,430.00',
    status: 'active',
    phase: 'Funded',
  },
  {
    id: 'VF-2025-8401',
    type: 'Phase 2 Challenge',
    balance: '$80,245.00',
    pnl: '+$4,245.00',
    status: 'in-progress',
    phase: 'Phase 2',
  },
  {
    id: 'VF-2025-8392',
    type: 'Phase 1 Challenge',
    balance: '$40,157.00',
    pnl: '+$157.00',
    status: 'in-progress',
    phase: 'Phase 1',
  },
];

export function AccountsOverview({ accounts }: { accounts?: AccountsOverviewItem[] }) {
  const rows = accounts ?? fallbackAccounts;
  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white">Active Accounts</h2>
        <span className="text-sm text-zinc-500">{rows.length} accounts</span>
      </div>

      {rows.length === 0 ? (
        <div className="text-sm text-zinc-500">No accounts yet.</div>
      ) : (
        <div className="space-y-3">
          {rows.map((account) => (
            <Link
              key={account.id}
              href={`/accounts/${encodeURIComponent(resolveAccountRouteId(account))}`}
              className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-emerald-500/30 transition-colors cursor-pointer block"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-white text-sm mb-1">{account.type}</div>
                  <div className="text-xs text-zinc-500">{account.id}</div>
                </div>
                {account.status === "active" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {account.status !== "active" && <Clock className="w-4 h-4 text-yellow-500" />}
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <div className="text-white text-lg mb-1">{account.balance}</div>
                  <div className="text-emerald-500 text-sm">{account.pnl}</div>
                </div>
                <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-500">
                  {account.phase}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link
        href="/accounts"
        className="block text-center w-full mt-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg transition-colors"
      >
        View All Accounts
      </Link>
    </div>
  );
}
