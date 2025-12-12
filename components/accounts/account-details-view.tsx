"use client";

import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  Account,
  AccountCredentials,
  AccountRules,
  JournalEntry,
  Trade,
  formatCurrency,
} from "@/lib/mockData";
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";

type AccountDetailsViewProps = {
  account: Account;
  trades: Trade[];
  journalEntries: JournalEntry[];
  rules?: AccountRules;
  credentials?: AccountCredentials[];
};

type CalendarDay = {
  date: Date;
  label: number;
  inCurrentMonth: boolean;
  trades: Trade[];
  pnl: number;
};

export function AccountDetailsView({
  account,
  trades,
  journalEntries,
  rules,
  credentials,
}: AccountDetailsViewProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const kpis = useMemo(() => {
    const accountTrades = trades;
    const wins = accountTrades.filter((t) => t.pnl > 0);
    const losses = accountTrades.filter((t) => t.pnl < 0);
    const winRate =
      wins.length + losses.length > 0 ? (wins.length / (wins.length + losses.length)) * 100 : account.winRate || 0;
    const grossWin = wins.reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
    const profitFactor = grossLoss > 0 ? grossWin / grossLoss : account.profitFactor || 0;

    return [
      { label: "Balance", value: formatCurrency(account.balance) },
      { label: "Equity", value: formatCurrency(account.equity) },
      { label: "Today P&L", value: formatCurrency(account.dailyPnl), positive: account.dailyPnl >= 0 },
      { label: "Total P&L", value: formatCurrency(account.totalPnl), positive: account.totalPnl >= 0 },
      { label: "Win Rate", value: `${winRate.toFixed(1)}%` },
      { label: "Profit Factor", value: profitFactor.toFixed(2) },
    ];
  }, [account, trades]);

  const [journal, setJournal] = useState<JournalEntry[]>([]);

  useEffect(() => {
    const storageKey = `vf-journal-${account.id}`;
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
    const parsed = stored ? (JSON.parse(stored) as JournalEntry[]) : [];
    setJournal([...journalEntries, ...parsed]);
  }, [account.id, journalEntries]);

  const handleAddJournal = (entry: Omit<JournalEntry, "id">) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: `J-${Date.now()}`,
    };
    const updated = [newEntry, ...journal];
    setJournal(updated);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(`vf-journal-${account.id}`, JSON.stringify(updated.filter((e) => !journalEntries.find(j => j.id === e.id))));
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex items-center gap-3 text-sm text-zinc-400">
        <Link href="/accounts" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to My Accounts
        </Link>
        <span>/</span>
        <span className="text-white">{account.label}</span>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl text-white">{account.label}</h1>
            <p className="text-sm text-zinc-400">{account.type}</p>
          </div>
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
              account.status === "active"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
            }`}
          >
            {account.phase}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-zinc-950 border border-zinc-900 rounded-lg p-4">
              <div className="text-xs text-zinc-500">{kpi.label}</div>
              <div className={`text-white text-lg ${kpi.positive === false ? "text-red-400" : kpi.positive ? "text-emerald-400" : "text-white"}`}>
                {kpi.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 min-w-0">
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <PnLCalendar trades={trades} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          <TradesTable trades={trades} selectedDate={selectedDate} />
          <Journal accountId={account.id} entries={journal} onAdd={handleAddJournal} />
        </div>
        <div className="space-y-4">
          <FundingCard rules={rules} />
          <AccountInfoCard account={account} credentials={credentials} />
          <RiskCard account={account} rules={rules} />
        </div>
      </div>
    </div>
  );
}

function PnLCalendar({
  trades,
  selectedDate,
  onSelectDate,
}: {
  trades: Trade[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const calendarDays = useMemo<CalendarDay[]>(() => {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const startDay = startOfMonth.getDay();
    const startDate = new Date(startOfMonth);
    startDate.setDate(startOfMonth.getDate() - startDay);

    return Array.from({ length: 42 }).map((_, idx) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + idx);
      const dateStr = date.toISOString().slice(0, 10);
      const dayTrades = trades.filter((t) => t.entryTime.slice(0, 10) === dateStr);
      const pnl = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
      return {
        date,
        label: date.getDate(),
        inCurrentMonth: date.getMonth() === month.getMonth(),
        trades: dayTrades,
        pnl,
      };
    });
  }, [month, trades]);

  const monthlyPnl = useMemo(() => {
    return calendarDays
      .filter((d) => d.inCurrentMonth)
      .reduce((sum, d) => sum + d.pnl, 0);
  }, [calendarDays]);

  const handleChangeMonth = (delta: number) => {
    setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    onSelectDate(null);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-white text-lg">P&L Calendar</div>
          <div className="text-sm text-zinc-500">
            {month.toLocaleString("default", { month: "long", year: "numeric" })} · Monthly P&L{" "}
            <span className={monthlyPnl >= 0 ? "text-emerald-400" : "text-red-400"}>{formatCurrency(monthlyPnl)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleChangeMonth(-1)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMonth(new Date())}
            className="px-3 h-9 inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 hover:text-white"
          >
            <CalendarDays className="h-4 w-4" />
            This month
          </button>
          <button
            onClick={() => handleChangeMonth(1)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-xs text-zinc-500">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day) => {
          const dateKey = day.date.toISOString().slice(0, 10);
          const isSelected = selectedDate === dateKey;
          const hasTrades = day.trades.length > 0;
          const pnlClass = day.pnl > 0 ? "text-emerald-400" : day.pnl < 0 ? "text-red-400" : "text-zinc-500";
          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate(isSelected ? null : dateKey)}
              className={`p-2 rounded-lg border text-left transition-colors ${
                isSelected ? "border-emerald-500 bg-emerald-500/10" : "border-zinc-900 bg-zinc-900/40 hover:border-zinc-800"
              } ${day.inCurrentMonth ? "opacity-100" : "opacity-50"}`}
            >
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{day.label}</span>
                {hasTrades && <span className={pnlClass}>{formatCurrency(day.pnl, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>}
              </div>
              {hasTrades && (
                <div className="mt-2 text-[11px] text-zinc-500">
                  {day.trades.length} trades
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TradesTable({ trades, selectedDate }: { trades: Trade[]; selectedDate: string | null }) {
  const [symbol, setSymbol] = useState("");
  const [side, setSide] = useState<"" | Trade["side"]>("");
  const [tag, setTag] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const filtered = useMemo(() => {
    return trades.filter((t) => {
      const entryDate = t.entryTime.slice(0, 10);
      if (selectedDate && entryDate !== selectedDate) return false;
      if (symbol && t.symbol.toLowerCase() !== symbol.toLowerCase()) return false;
      if (side && t.side !== side) return false;
      if (tag && !t.setupTag.toLowerCase().includes(tag.toLowerCase())) return false;
      if (start && entryDate < start) return false;
      if (end && entryDate > end) return false;
      return true;
    });
  }, [trades, selectedDate, symbol, side, tag, start, end]);

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4 min-w-0">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <div className="text-white text-lg">Trades</div>
          <div className="text-sm text-zinc-500">Filtered list by date, symbol, side, setup</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Symbol"
            className="h-9 w-28 rounded-lg bg-zinc-900 border border-zinc-800 px-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <select
            value={side}
            onChange={(e) => setSide(e.target.value as any)}
            className="h-9 rounded-lg bg-zinc-900 border border-zinc-800 px-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Side</option>
            <option value="LONG">Long</option>
            <option value="SHORT">Short</option>
          </select>
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Setup"
            className="h-9 w-32 rounded-lg bg-zinc-900 border border-zinc-800 px-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="h-9 rounded-lg bg-zinc-900 border border-zinc-800 px-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="h-9 rounded-lg bg-zinc-900 border border-zinc-800 px-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="text-left text-zinc-500 border-b border-zinc-800">
              <th className="py-2 pr-3">ID</th>
              <th className="py-2 pr-3">Symbol</th>
              <th className="py-2 pr-3">Side</th>
              <th className="py-2 pr-3">Size</th>
              <th className="py-2 pr-3">Entry Time</th>
              <th className="py-2 pr-3">Exit Time</th>
              <th className="py-2 pr-3">Duration</th>
              <th className="py-2 pr-3">Entry</th>
              <th className="py-2 pr-3">Exit</th>
              <th className="py-2 pr-3">P&L</th>
              <th className="py-2 pr-3">Comms</th>
              <th className="py-2 pr-3">Fees</th>
              <th className="py-2 pr-3">Setup</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filtered.map((trade) => (
              <tr key={trade.id} className="text-white">
                <td className="py-2 pr-3 text-zinc-400">{trade.id}</td>
                <td className="py-2 pr-3">{trade.symbol}</td>
                <td className="py-2 pr-3">{trade.side}</td>
                <td className="py-2 pr-3">{trade.qty}</td>
                <td className="py-2 pr-3 text-zinc-400">{new Date(trade.entryTime).toLocaleString()}</td>
                <td className="py-2 pr-3 text-zinc-400">{new Date(trade.exitTime).toLocaleString()}</td>
                <td className="py-2 pr-3 text-zinc-400">{trade.durationMinutes}m</td>
                <td className="py-2 pr-3">{trade.entryPrice}</td>
                <td className="py-2 pr-3">{trade.exitPrice}</td>
                <td className={`py-2 pr-3 ${trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatCurrency(trade.pnl)}</td>
                <td className="py-2 pr-3 text-zinc-400">{formatCurrency(trade.commissions)}</td>
                <td className="py-2 pr-3 text-zinc-400">{formatCurrency(trade.fees)}</td>
                <td className="py-2 pr-3 text-zinc-400">{trade.setupTag}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Journal({
  accountId,
  entries,
  onAdd,
}: {
  accountId: string;
  entries: JournalEntry[];
  onAdd: (entry: Omit<JournalEntry, "id">) => void;
}) {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<JournalEntry["mood"]>("Calm");

  const handleSubmit = () => {
    if (!content.trim()) return;
    onAdd({
      accountId,
      date: new Date().toISOString().slice(0, 10),
      content,
      tags: [],
      mood,
    });
    setContent("");
  };

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white text-lg">Journal</h3>
          <p className="text-sm text-zinc-500">Log mindset and lessons for this account.</p>
        </div>
        <button
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 text-black text-sm hover:bg-emerald-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Entry
        </button>
      </div>

      <div className="space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What did you learn from today's session?"
          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          rows={3}
        />
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-400">Mood</label>
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value as JournalEntry["mood"])}
            className="h-9 rounded-lg bg-zinc-900 border border-zinc-800 px-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {["Calm", "Focused", "Stressed", "Confident"].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {entries.length === 0 && <div className="text-sm text-zinc-500">No journal entries yet.</div>}
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-lg border border-zinc-900 bg-zinc-900/40 p-3 space-y-1">
            <div className="flex items-center justify-between text-sm text-zinc-500">
              <span>{entry.date}</span>
              <span className="text-emerald-400">{entry.mood}</span>
            </div>
            <div className="text-white text-sm">{entry.content}</div>
            {entry.notes && <div className="text-xs text-zinc-500">{entry.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function FundingCard({ rules }: { rules?: AccountRules }) {
  if (!rules) return null;
  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-3">
      <h3 className="text-white text-lg">Path to Funding</h3>
      <ul className="space-y-2 text-sm text-zinc-400">
        <li>Profit Target: <span className="text-white">{rules.profitTarget}</span></li>
        <li>Max Daily Loss: <span className="text-white">{rules.maxDailyLoss}</span></li>
        <li>Max Total Loss: <span className="text-white">{rules.maxTotalLoss}</span></li>
        <li>Min Trading Days: <span className="text-white">{rules.minTradingDays}</span></li>
        <li>Consistency: <span className="text-white">{rules.consistencyRule}</span></li>
        {rules.trailingDrawdown && <li>Trailing Drawdown: <span className="text-white">{rules.trailingDrawdown}</span></li>}
        {rules.payoutSplit && <li>Payout Split: <span className="text-white">{rules.payoutSplit}</span></li>}
      </ul>
    </div>
  );
}

function AccountInfoCard({ account, credentials }: { account: Account; credentials?: AccountCredentials[] }) {
  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-3">
      <h3 className="text-white text-lg">Account Info</h3>
      <div className="text-sm text-zinc-400 space-y-1">
        <div>ID: <span className="text-white">{account.id}</span></div>
        <div>Size: <span className="text-white">{formatCurrency(account.size, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span></div>
        <div>Start: <span className="text-white">{account.startDate}</span></div>
      </div>
      <div className="pt-2 space-y-2">
        <div className="text-sm text-zinc-500">Broker Connections</div>
        {credentials?.map((cred) => (
          <div key={cred.provider} className="flex items-center justify-between text-sm text-white bg-zinc-900/60 border border-zinc-900 rounded-lg px-3 py-2">
            <span>{cred.provider}</span>
            <span className={cred.status === "connected" ? "text-emerald-400" : "text-yellow-400"}>{cred.status}</span>
          </div>
        ))}
        {!credentials?.length && <div className="text-sm text-zinc-500">No connections yet.</div>}
      </div>
    </div>
  );
}

function RiskCard({ account, rules }: { account: Account; rules?: AccountRules }) {
  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-3">
      <h3 className="text-white text-lg">Risk Controls</h3>
      <ul className="space-y-2 text-sm text-zinc-400">
        <li>Current Balance: <span className="text-white">{formatCurrency(account.balance)}</span></li>
        <li>Daily P&L Limit: <span className="text-white">{rules?.maxDailyLoss ?? "$—"}</span></li>
        <li>Total Loss Limit: <span className="text-white">{rules?.maxTotalLoss ?? "$—"}</span></li>
        <li>Max Contracts: <span className="text-white">5</span></li>
        <li>Do not trade past: <span className="text-white">3:45 PM ET</span></li>
      </ul>
    </div>
  );
}
