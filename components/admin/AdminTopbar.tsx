"use client";

import { Bell, Plus, Search } from "lucide-react";

export function AdminTopbar() {
  return (
    <header className="h-16 bg-zinc-950/95 border-b border-zinc-900 flex items-center justify-between px-6 sticky top-0 z-40 backdrop-blur">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search users, accounts, or tickets..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="inline-flex items-center gap-2 px-3 py-2 text-sm text-black bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          Add User
        </button>
        <button className="relative p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-white">Jefrey Peralta</div>
            <div className="text-xs text-zinc-500">Admin</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-black font-medium">
            JP
          </div>
        </div>
      </div>
    </header>
  );
}
