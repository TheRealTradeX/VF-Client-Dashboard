"use client";

import { Bell, Search } from "lucide-react";

export function Topbar() {
  return (
    <header className="h-16 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between px-6">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search accounts, trades, or analytics..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-white">John Doe</div>
            <div className="text-xs text-zinc-500">Funded Trader</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-black font-medium">
            JD
          </div>
        </div>
      </div>
    </header>
  );
}
