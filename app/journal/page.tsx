"use client";

import * as React from "react";
import { AddTradeModal } from "@/components/journal/AddTradeModal";
import { JournalEntry } from "@/components/journal/JournalEntry";
import { JournalStats } from "@/components/journal/JournalStats";
import { Calendar as CalendarIcon, Filter, Plus, Search } from "lucide-react";

const journalEntries = [
  {
    id: "1",
    date: "2025-12-12",
    time: "14:23:15",
    symbol: "NQ",
    type: "LONG" as const,
    entry: 21450.5,
    exit: 21468.25,
    size: 2,
    pnl: 712.5,
    pnlPercent: 1.67,
    setup: "Breakout",
    emotions: ["Confident", "Focused"],
    tags: ["Trend Following", "High Probability"],
    notes:
      "Clean breakout above resistance. Waited for confirmation before entry. Managed position well and took profit at target.",
    screenshot: null,
    mistakes: [],
    lessonsLearned: "Patience paid off waiting for the right setup",
  },
  {
    id: "2",
    date: "2025-12-12",
    time: "13:45:22",
    symbol: "ES",
    type: "SHORT" as const,
    entry: 6025.75,
    exit: 6020.5,
    size: 3,
    pnl: 787.5,
    pnlPercent: 2.18,
    setup: "Reversal",
    emotions: ["Calm", "Patient"],
    tags: ["Resistance Rejection", "Volume Confirmation"],
    notes:
      "Perfect reversal at key resistance level. Strong volume on rejection. Followed plan exactly.",
    screenshot: null,
    mistakes: [],
    lessonsLearned: "High volume confirms reversal patterns",
  },
  {
    id: "3",
    date: "2025-12-12",
    time: "12:15:08",
    symbol: "NQ",
    type: "LONG" as const,
    entry: 21425.0,
    exit: 21421.75,
    size: 2,
    pnl: -130.0,
    pnlPercent: -0.3,
    setup: "Failed Breakout",
    emotions: ["Frustrated", "Impatient"],
    tags: ["False Breakout", "Revenge Trade"],
    notes: "Entered too early without proper confirmation. Market was choppy and I forced the trade.",
    screenshot: null,
    mistakes: ["Entered without confirmation", "Ignored market conditions"],
    lessonsLearned: "Wait for clear confirmation, especially in choppy markets",
  },
  {
    id: "4",
    date: "2025-12-11",
    time: "15:42:18",
    symbol: "NQ",
    type: "SHORT" as const,
    entry: 21380.75,
    exit: 21375.5,
    size: 2,
    pnl: 210.0,
    pnlPercent: 0.49,
    setup: "Moving Average Rejection",
    emotions: ["Confident", "Disciplined"],
    tags: ["MA Strategy", "End of Day"],
    notes: "Quick scalp near close. Respected moving average and got quick rejection.",
    screenshot: null,
    mistakes: [],
    lessonsLearned: "End of day setups can be profitable with tight stops",
  },
];

export default function JournalPage() {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [filterSetup, setFilterSetup] = React.useState<string>("all");
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredEntries = journalEntries.filter((entry) => {
    const matchesSetup =
      filterSetup === "all" || entry.setup.toLowerCase().includes(filterSetup.toLowerCase());
    const matchesSearch =
      entry.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.notes.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSetup && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl mb-1">Trading Journal</h1>
          <p className="text-zinc-400">Track your trades, emotions, and improve your strategy</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Entry</span>
        </button>
      </div>

      <JournalStats entries={journalEntries} />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterSetup}
            onChange={(e) => setFilterSetup(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Setups</option>
            <option value="breakout">Breakout</option>
            <option value="reversal">Reversal</option>
            <option value="pullback">Pullback</option>
            <option value="continuation">Continuation</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors">
            <CalendarIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Date Range</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <JournalEntry key={entry.id} entry={entry} />
        ))}
      </div>

      {filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-white mb-2">No entries found</h3>
          <p className="text-zinc-400 text-sm">Try adjusting your search or filters</p>
        </div>
      )}

      {showAddModal && <AddTradeModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
