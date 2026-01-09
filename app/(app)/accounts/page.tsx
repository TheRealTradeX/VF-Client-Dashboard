import { AccountCard } from "@/components/accounts/AccountCard";
import { Filter, Plus, Search } from "lucide-react";
import { getDataMode } from "@/lib/data-mode";
import { getAuthenticatedSupabaseUser, listTraderAccounts } from "@/lib/volumetrica/trader-data";
import { TRADING_PLATFORM_LABEL } from "@/lib/platform-labels";

export default async function AccountsPage() {
  const mode = getDataMode();
  if (mode === "mock") {
    const { mockAccounts, getAccountRouteId, normalizeAccounts } = await import("@/lib/mockData");
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl mb-1">My Trading Accounts</h1>
            <p className="text-zinc-400">Manage and monitor all your trading accounts</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Challenge</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search accounts..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {normalizeAccounts(mockAccounts).map((account) => (
            <AccountCard key={getAccountRouteId(account)} account={account} />
          ))}
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

  const accounts = await listTraderAccounts(user);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl mb-1">My Trading Accounts</h1>
          <p className="text-zinc-400">Manage and monitor all your trading accounts</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          <span>New Challenge</span>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search accounts..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <AccountCard key={account.account_id} account={account} />
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 text-zinc-300">
          <div className="text-white mb-2">No accounts found.</div>
          <div className="text-sm text-zinc-500">
            Waiting for {TRADING_PLATFORM_LABEL} updates to populate your accounts. If you recently created an account,
            check back in a few minutes.
          </div>
        </div>
      )}
    </div>
  );
}
