"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Account,
  AccountCredentials,
  AccountRules,
  JournalEntry,
  Trade,
  formatCurrency,
} from "@/lib/mockData";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  NotebookPen,
  Sparkles,
} from "lucide-react";

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
  pnl: number;
  tradeCount: number;
  winPct: number;
};

type DurationBucket = { label: string; min: number; max: number };

const durationBuckets: DurationBucket[] = [
  { label: "0-5m", min: 0, max: 5 },
  { label: "5-15m", min: 5, max: 15 },
  { label: "15-30m", min: 15, max: 30 },
  { label: "30-60m", min: 30, max: 60 },
  { label: "1h+", min: 60, max: Number.POSITIVE_INFINITY },
];

const toDateKey = (date: Date) => {
  const normalized = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  return normalized.toISOString().slice(0, 10);
};

const formatRange = (start: Date, end: Date) =>
  `${start.toLocaleString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleString("en-US", { month: "short", day: "numeric" })}`;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function AccountDetailsView({
  account,
  trades,
  journalEntries,
  rules,
  credentials,
}: AccountDetailsViewProps) {
  const storageKey = useMemo(() => `vf-journal-${account.id}`, [account.id]);
  const [month, setMonth] = useState(() => {
    const latest = trades[0]?.entryTime ? new Date(trades[0].entryTime) : new Date();
    return new Date(latest.getFullYear(), latest.getMonth(), 1);
  });
  const [altMonth, setAltMonth] = useState(() => new Date(month));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalContent, setJournalContent] = useState("");
  const [journalTradeId, setJournalTradeId] = useState(trades[0]?.id ?? "");
  const [journal, setJournal] = useState<JournalEntry[]>([]);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
    const parsed = stored ? (JSON.parse(stored) as JournalEntry[]) : [];
    setJournal([...journalEntries, ...parsed]);
  }, [journalEntries, storageKey]);

  const persistJournal = (entries: JournalEntry[]) => {
    if (typeof window === "undefined") return;
    const baseIds = new Set(journalEntries.map((j) => j.id));
    const custom = entries.filter((e) => !baseIds.has(e.id));
    window.localStorage.setItem(storageKey, JSON.stringify(custom));
  };

  const handleSaveJournal = () => {
    if (!journalContent.trim()) return;
    const newEntry: JournalEntry = {
      id: `J-${Date.now()}`,
      accountId: account.id,
      tradeId: journalTradeId || undefined,
      date: new Date().toISOString().slice(0, 10),
      content: journalContent,
      tags: [],
      mood: "Focused",
    };
    const updated = [newEntry, ...journal];
    setJournal(updated);
    persistJournal(updated);
    setJournalContent("");
    setJournalOpen(false);
  };

  const dayGroups = useMemo(() => {
    const map = new Map<string, { trades: Trade[]; pnl: number; wins: number; losses: number }>();
    trades.forEach((trade) => {
      const key = toDateKey(new Date(trade.entryTime));
      const group = map.get(key) ?? { trades: [], pnl: 0, wins: 0, losses: 0 };
      group.trades.push(trade);
      group.pnl += trade.pnl;
      if (trade.pnl > 0) group.wins += 1;
      if (trade.pnl < 0) group.losses += 1;
      map.set(key, group);
    });
    return map;
  }, [trades]);

  const dailyData = useMemo(
    () =>
      Array.from(dayGroups.entries())
        .map(([date, value]) => {
          const winPct = value.trades.length ? (value.wins / value.trades.length) * 100 : 0;
          return { date, pnl: value.pnl, tradeCount: value.trades.length, winPct, wins: value.wins, losses: value.losses };
        })
        .sort((a, b) => a.date.localeCompare(b.date)),
    [dayGroups],
  );

  const derived = useMemo(() => {
    const totalTrades = trades.length;
    const wins = trades.filter((t) => t.pnl > 0);
    const losses = trades.filter((t) => t.pnl < 0);
    const netPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
    const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : wins.length ? Number.POSITIVE_INFINITY : 0;
    const tradeWinRate = totalTrades ? (wins.length / totalTrades) * 100 : 0;
    const dayWinRate = dailyData.length ? (dailyData.filter((d) => d.pnl > 0).length / dailyData.length) * 100 : 0;
    const avgWin = wins.length ? grossProfit / wins.length : 0;
    const avgLoss = losses.length ? losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length : 0;
    const avgDuration = totalTrades ? trades.reduce((sum, t) => sum + (t.durationMinutes ?? 0), 0) / totalTrades : 0;
    const avgWinDuration = wins.length ? wins.reduce((sum, t) => sum + (t.durationMinutes ?? 0), 0) / wins.length : 0;
    const avgLossDuration = losses.length ? losses.reduce((sum, t) => sum + (t.durationMinutes ?? 0), 0) / losses.length : 0;
    const bestTrade = trades.reduce<Trade | null>((best, trade) => (!best || trade.pnl > best.pnl ? trade : best), null);
    const worstTrade = trades.reduce<Trade | null>((worst, trade) => (!worst || trade.pnl < worst.pnl ? trade : worst), null);
    const bestDay = dailyData.reduce<(typeof dailyData)[0] | null>((best, day) => (!best || day.pnl > best.pnl ? day : best), null);
    const worstDay = dailyData.reduce<(typeof dailyData)[0] | null>((worst, day) => (!worst || day.pnl < worst.pnl ? day : worst), null);
    const baseBalance = Math.max(0, account.balance - account.totalPnl);
    const equityDelta = account.equity - account.balance;
    let runningBalance = baseBalance;
    let runningPnL = 0;
    const seriesSource = dailyData.length
      ? dailyData
      : [{ date: toDateKey(new Date()), pnl: 0, tradeCount: 0, winPct: 0, wins: 0, losses: 0 }];
    const balanceSeries = seriesSource.map((day) => {
      runningBalance += day.pnl;
      runningPnL += day.pnl;
      return {
        date: day.date,
        balance: runningBalance,
        equity: runningBalance + equityDelta,
        pnl: day.pnl,
        cumulative: runningPnL,
      };
    });
    const cumulativeSeries = seriesSource.reduce<{ date: string; pnl: number }[]>((arr, day) => {
      const prev = arr[arr.length - 1]?.pnl ?? 0;
      arr.push({ date: day.date, pnl: prev + day.pnl });
      return arr;
    }, []);
    const netDailySeries = seriesSource.map((day) => ({ date: day.date, pnl: day.pnl }));
    const direction = trades.reduce(
      (acc, trade) => {
        if (trade.side === "LONG") acc.long += 1;
        if (trade.side === "SHORT") acc.short += 1;
        return acc;
      },
      { long: 0, short: 0 },
    );
    const directionPct = {
      long: totalTrades ? (direction.long / totalTrades) * 100 : 0,
      short: totalTrades ? (direction.short / totalTrades) * 100 : 0,
    };
    const totalLots = trades.reduce((sum, t) => sum + (t.qty ?? 0), 0);
    const bestDayProfitPct = grossProfit > 0 && bestDay ? (bestDay.pnl / grossProfit) * 100 : 0;
    const zellaScore =
      totalTrades >= 3
        ? clamp(
            tradeWinRate * 0.35 +
              (Math.min(profitFactor, 4) / 4) * 25 +
              dayWinRate * 0.2 +
              (Math.min(avgWin / (Math.abs(avgLoss) || 1), 3) / 3) * 20,
            0,
            100,
          )
        : null;
    const radarData = [
      { label: "Consistency", value: Math.round(dayWinRate) },
      { label: "SL usage", value: Math.round(clamp(70 - avgLossDuration + avgDuration * 0.2, 15, 95)) },
      { label: "WR", value: Math.round(tradeWinRate) },
      { label: "RR", value: Math.round(clamp((avgWin / (Math.abs(avgLoss) || 1)) * 33, 10, 95)) },
    ];

    return {
      netPnl,
      tradeWinRate,
      profitFactor,
      dayWinRate,
      avgWin,
      avgLoss,
      avgDuration,
      avgWinDuration,
      avgLossDuration,
      bestTrade,
      worstTrade,
      bestDay,
      worstDay,
      balanceSeries,
      cumulativeSeries,
      netDailySeries,
      totalLots,
      directionPct,
      direction,
      bestDayProfitPct,
      zellaScore,
      radarData,
    };
  }, [account.balance, account.equity, account.totalPnl, dailyData, trades]);

  const calendarDays = useMemo<CalendarDay[]>(() => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const startOffset = start.getDay();
    const gridStart = new Date(start);
    gridStart.setDate(start.getDate() - startOffset);

    return Array.from({ length: 42 }).map((_, idx) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + idx);
      const dateKey = toDateKey(date);
      const dayData = dayGroups.get(dateKey);
      const pnl = dayData?.pnl ?? 0;
      const tradeCount = dayData?.trades.length ?? 0;
      const winPct = tradeCount ? ((dayData?.wins ?? 0) / tradeCount) * 100 : 0;
      return {
        date,
        label: date.getDate(),
        inCurrentMonth: date.getMonth() === month.getMonth(),
        pnl,
        tradeCount,
        winPct,
      };
    });
  }, [dayGroups, month]);

  const altCalendarDays = useMemo<CalendarDay[]>(() => {
    const start = new Date(altMonth.getFullYear(), altMonth.getMonth(), 1);
    const startOffset = start.getDay();
    const gridStart = new Date(start);
    gridStart.setDate(start.getDate() - startOffset);

    return Array.from({ length: 42 }).map((_, idx) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + idx);
      const dateKey = toDateKey(date);
      const dayData = dayGroups.get(dateKey);
      const pnl = dayData?.pnl ?? 0;
      const tradeCount = dayData?.trades.length ?? 0;
      const winPct = tradeCount ? ((dayData?.wins ?? 0) / tradeCount) * 100 : 0;
      return {
        date,
        label: date.getDate(),
        inCurrentMonth: date.getMonth() === altMonth.getMonth(),
        pnl,
        tradeCount,
        winPct,
      };
    });
  }, [altMonth, dayGroups]);

  const monthlyPnl = useMemo(
    () => calendarDays.filter((d) => d.inCurrentMonth).reduce((sum, d) => sum + d.pnl, 0),
    [calendarDays],
  );

  const weeklySummaries = useMemo(() => {
    const weeks: { label: string; pnl: number; activeDays: number }[] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      const slice = calendarDays.slice(i, i + 7);
      const active = slice.filter((d) => d.inCurrentMonth && d.tradeCount > 0);
      const pnl = slice.filter((d) => d.inCurrentMonth).reduce((sum, d) => sum + d.pnl, 0);
      weeks.push({
        label: formatRange(slice[0].date, slice[slice.length - 1].date),
        pnl,
        activeDays: active.length,
      });
    }
    return weeks;
  }, [calendarDays]);

  const balanceStats = useMemo(() => {
    if (!derived.balanceSeries.length) {
      return { min: account.balance, max: account.balance, latest: account.balance };
    }
    const values = derived.balanceSeries.map((d) => d.balance);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      latest: values[values.length - 1],
    };
  }, [account.balance, derived.balanceSeries]);

  const durationData = useMemo(() => {
    return durationBuckets.map((bucket) => {
      const bucketTrades = trades.filter(
        (t) => (t.durationMinutes ?? 0) >= bucket.min && (t.durationMinutes ?? 0) < bucket.max,
      );
      const wins = bucketTrades.filter((t) => t.pnl > 0);
      const losses = bucketTrades.filter((t) => t.pnl < 0);
      const winRate = bucketTrades.length ? (wins.length / bucketTrades.length) * 100 : 0;
      return {
        label: bucket.label,
        trades: bucketTrades.length,
        winRate,
        pnl: bucketTrades.reduce((sum, t) => sum + t.pnl, 0),
        avgDuration: bucketTrades.length
          ? bucketTrades.reduce((sum, t) => sum + (t.durationMinutes ?? 0), 0) / bucketTrades.length
          : 0,
        wins: wins.length,
        losses: losses.length,
      };
    });
  }, [trades]);

  const selectedTrade = trades.find((t) => t.id === journalTradeId) ?? trades[0];

  const summaryCards = [
    { label: "Net P&L", value: formatCurrency(derived.netPnl), tone: derived.netPnl >= 0 ? "positive" : "negative" },
    { label: "Trade Win %", value: `${derived.tradeWinRate.toFixed(1)}%` },
    {
      label: "Profit Factor",
      value: Number.isFinite(derived.profitFactor) ? derived.profitFactor.toFixed(2) : "Infinity",
    },
    { label: "Day Win %", value: `${derived.dayWinRate.toFixed(1)}%` },
    {
      label: "Avg Win / Loss Trade",
      value: `${formatCurrency(derived.avgWin)} / ${formatCurrency(Math.abs(derived.avgLoss))}`,
    },
  ];

  const performanceOverview = [
    { label: "Total P&L", value: formatCurrency(derived.netPnl), tone: derived.netPnl >= 0 ? "positive" : "negative" },
    { label: "Trade Win %", value: `${derived.tradeWinRate.toFixed(1)}%` },
    { label: "Avg Win / Avg Loss", value: `${formatCurrency(derived.avgWin)} / ${formatCurrency(Math.abs(derived.avgLoss))}` },
    { label: "Day Win %", value: `${derived.dayWinRate.toFixed(1)}%` },
    {
      label: "Profit Factor",
      value: Number.isFinite(derived.profitFactor) ? derived.profitFactor.toFixed(2) : "Infinity",
    },
    { label: "Best Day % of Total Profit", value: `${derived.bestDayProfitPct.toFixed(1)}%` },
  ];

  const activityBreakdown = [
    {
      label: "Most Active Day",
      value: derived.bestDay ? new Date(derived.bestDay.date).toLocaleDateString("en-US", { weekday: "long" }) : "-",
      helper: derived.bestDay ? `${derived.bestDay.tradeCount} trades` : "",
    },
    {
      label: "Most Profitable Day",
      value: derived.bestDay ? formatCurrency(derived.bestDay.pnl) : "-",
      helper: derived.bestDay ? new Date(derived.bestDay.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
      tone: "positive",
    },
    {
      label: "Least Profitable Day",
      value: derived.worstDay ? formatCurrency(derived.worstDay.pnl) : "-",
      helper: derived.worstDay ? new Date(derived.worstDay.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
      tone: "negative",
    },
  ];

  const tradeStats = [
    { label: "Total Trades", value: trades.length.toString() },
    { label: "Total Lots Traded", value: derived.totalLots.toString() },
    { label: "Average Trade Duration", value: `${derived.avgDuration.toFixed(1)}m` },
    { label: "Average Win Duration", value: `${derived.avgWinDuration.toFixed(1)}m` },
    { label: "Average Loss Duration", value: `${derived.avgLossDuration.toFixed(1)}m` },
  ];

  const tradeValueMetrics = [
    { label: "Average Winning Trade", value: formatCurrency(derived.avgWin), tone: "positive" },
    { label: "Average Losing Trade", value: formatCurrency(derived.avgLoss), tone: "negative" },
    {
      label: "Trade Direction %",
      value: `Long ${derived.directionPct.long.toFixed(0)}% / Short ${derived.directionPct.short.toFixed(0)}%`,
    },
  ];

  const bestWorst = [
    {
      label: "Best Trade",
      trade: derived.bestTrade,
      tone: "positive" as const,
    },
    {
      label: "Worst Trade",
      trade: derived.worstTrade,
      tone: "negative" as const,
    },
  ];

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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl text-white flex items-center gap-2">
            {account.label}
            <span className="text-sm text-zinc-500 font-normal">{account.id}</span>
          </h1>
          <p className="text-sm text-zinc-400">{account.type}</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
              account.status === "active"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
            }`}
          >
            {account.phase}
          </div>
          <div className="px-3 py-1.5 rounded-lg text-xs border border-zinc-800 bg-zinc-900/60 text-zinc-300">
            Start {account.startDate}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-zinc-950 border border-zinc-900 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">{card.label}</div>
            <div
              className={`text-xl ${
                card.tone === "positive" ? "text-emerald-400" : card.tone === "negative" ? "text-red-400" : "text-white"
              }`}
            >
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-white text-lg">Monthly Calendar</div>
                <div className="text-sm text-zinc-500">
                  {month.toLocaleString("default", { month: "long", year: "numeric" })} - Monthly P&L{" "}
                  <span className={monthlyPnl >= 0 ? "text-emerald-400" : "text-red-400"}>{formatCurrency(monthlyPnl)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const next = new Date(month);
                    next.setMonth(month.getMonth() - 1);
                    setMonth(next);
                    setSelectedDate(null);
                  }}
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
                  onClick={() => {
                    const next = new Date(month);
                    next.setMonth(month.getMonth() + 1);
                    setMonth(next);
                    setSelectedDate(null);
                  }}
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
                const dateKey = toDateKey(day.date);
                const isSelected = selectedDate === dateKey;
                const pnlClass = day.pnl > 0 ? "text-emerald-400" : day.pnl < 0 ? "text-red-400" : "text-zinc-500";
                const highlight =
                  day.pnl > 0 ? "border-emerald-500/50 bg-emerald-500/5" : day.pnl < 0 ? "border-red-500/40 bg-red-500/5" : "border-zinc-900 bg-zinc-900/40";
                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                    className={`p-2 rounded-lg border text-left transition-colors ${highlight} ${
                      isSelected ? "ring-2 ring-emerald-500/50" : ""
                    } ${day.inCurrentMonth ? "opacity-100" : "opacity-50"}`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>{day.label}</span>
                      {day.tradeCount > 0 && <span className={pnlClass}>{formatCurrency(day.pnl, { maximumFractionDigits: 0 })}</span>}
                    </div>
                    {day.tradeCount > 0 && (
                      <div className="mt-1 text-[11px] text-zinc-500 leading-tight">
                        {day.tradeCount} trades
                        <div className="text-[10px]">{day.winPct.toFixed(0)}% win</div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
              {weeklySummaries.map((week) => (
                <div key={week.label} className="rounded-lg border border-zinc-900 bg-zinc-900/40 px-3 py-2 text-sm text-white">
                  <div className="text-xs text-zinc-500 flex items-center gap-2">
                    <span>Weekly Summary</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800">{week.label}</span>
                  </div>
                  <div className={`text-lg ${week.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatCurrency(week.pnl)}</div>
                  <div className="text-xs text-zinc-500">{week.activeDays} active days</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white text-lg">Daily Account Balance</h3>
                <p className="text-sm text-zinc-500">Balance & equity progression</p>
              </div>
              <button className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300">
                Pick date range
              </button>
            </div>
            <div className="w-full h-[320px]" style={{ minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={derived.balanceSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#1f1f1f" vertical={false} />
                  <XAxis dataKey="date" stroke="#52525b" tick={{ fill: "#71717a", fontSize: 12 }} />
                  <YAxis
                    stroke="#52525b"
                    tick={{ fill: "#71717a", fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0c0c0f", border: "1px solid #27272a", borderRadius: 8 }}
                    labelStyle={{ color: "#a1a1aa" }}
                    formatter={(value: number) => formatCurrency(value)}
                    cursor={{ fill: "transparent" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2.5} dot={{ r: 2.5, fill: "#10b981" }} name="Balance" />
                  <Line type="monotone" dataKey="equity" stroke="#9ca3af" strokeWidth={2} dot={false} strokeDasharray="4 4" name="Equity" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {performanceOverview.map((item) => (
                <div key={item.label} className="rounded-lg border border-zinc-900 bg-zinc-900/40 p-3">
                  <div className="text-xs text-zinc-500">{item.label}</div>
                  <div
                    className={`text-lg ${
                      item.tone === "positive" ? "text-emerald-400" : item.tone === "negative" ? "text-red-400" : "text-white"
                    }`}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-lg">P&L Charts</h3>
                <div className="text-xs text-zinc-500">Daily Net & Cumulative</div>
              </div>
              <div className="w-full h-[260px]" style={{ minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={derived.cumulativeSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke="#1f1f1f" vertical={false} />
                    <XAxis dataKey="date" stroke="#52525b" tick={{ fill: "#71717a", fontSize: 12 }} />
                    <YAxis stroke="#52525b" tick={{ fill: "#71717a", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0c0c0f", border: "1px solid #27272a", borderRadius: 8 }}
                      labelStyle={{ color: "#a1a1aa" }}
                      formatter={(value: number) => formatCurrency(value)}
                      cursor={{ fill: "transparent" }}
                    />
                    <Line type="monotone" dataKey="pnl" stroke="#10b981" strokeWidth={2} dot={false} name="Cumulative P&L" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full h-[180px]" style={{ minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={derived.netDailySeries} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke="#1f1f1f" vertical={false} />
                    <XAxis dataKey="date" stroke="#52525b" tick={{ fill: "#71717a", fontSize: 12 }} />
                    <YAxis stroke="#52525b" tick={{ fill: "#71717a", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0c0c0f", border: "1px solid #27272a", borderRadius: 8 }}
                      labelStyle={{ color: "#a1a1aa" }}
                      formatter={(value: number) => formatCurrency(value)}
                      cursor={{ fill: "transparent" }}
                    />
                    <Bar dataKey="pnl" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-white text-lg">Activity & Performance Breakdown</h3>
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activityBreakdown.map((item) => (
                    <div key={item.label} className="rounded-lg border border-zinc-900 bg-zinc-900/40 p-3">
                      <div className="text-xs text-zinc-500">{item.label}</div>
                      <div
                        className={`text-lg ${
                          item.tone === "positive"
                            ? "text-emerald-400"
                            : item.tone === "negative"
                              ? "text-red-400"
                              : "text-white"
                        }`}
                      >
                        {item.value}
                      </div>
                      {item.helper && <div className="text-xs text-zinc-500">{item.helper}</div>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-3">
                <div className="text-white text-lg">Trade Statistics</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tradeStats.map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-zinc-900 bg-zinc-900/40 p-3">
                      <div className="text-xs text-zinc-500">{stat.label}</div>
                      <div className="text-lg text-white">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-3">
                <div className="text-white text-lg">Trade Value Metrics</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {tradeValueMetrics.map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-zinc-900 bg-zinc-900/40 p-3">
                      <div className="text-xs text-zinc-500">{stat.label}</div>
                      <div
                        className={`text-lg ${
                          stat.tone === "positive"
                            ? "text-emerald-400"
                            : stat.tone === "negative"
                              ? "text-red-400"
                              : "text-white"
                        }`}
                      >
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white text-lg">Trade Duration Analysis</div>
                  <div className="text-sm text-zinc-500">Trade counts by duration range</div>
                </div>
              </div>
              <div className="w-full h-[240px]" style={{ minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={durationData} margin={{ top: 0, right: 10, left: -10, bottom: 20 }}>
                    <CartesianGrid stroke="#1f1f1f" vertical={false} />
                    <XAxis dataKey="label" stroke="#52525b" tick={{ fill: "#71717a" }} />
                    <YAxis stroke="#52525b" tick={{ fill: "#71717a" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0c0c0f", border: "1px solid #27272a", borderRadius: 8 }}
                      labelStyle={{ color: "#a1a1aa" }}
                      cursor={{ fill: "transparent" }}
                    />
                    <Bar dataKey="trades" fill="#10b981" radius={[4, 4, 0, 0]} name="Trades" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white text-lg">Win Rate Analysis</div>
                  <div className="text-sm text-zinc-500">Win percentage by duration</div>
                </div>
              </div>
              <div className="w-full h-[240px]" style={{ minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={durationData} margin={{ top: 0, right: 10, left: -10, bottom: 20 }}>
                    <CartesianGrid stroke="#1f1f1f" vertical={false} />
                    <XAxis dataKey="label" stroke="#52525b" tick={{ fill: "#71717a" }} />
                    <YAxis stroke="#52525b" tick={{ fill: "#71717a" }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0c0c0f", border: "1px solid #27272a", borderRadius: 8 }}
                      labelStyle={{ color: "#a1a1aa" }}
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                    />
                    <Bar dataKey="winRate" fill="#10b981" radius={[4, 4, 0, 0]} name="Win %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg">Trades Table</h3>
              <button
                onClick={() => setJournalOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 text-black text-sm hover:bg-emerald-600 transition-colors"
              >
                <NotebookPen className="h-4 w-4" />
                Trade Journal
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="text-left text-zinc-500 border-b border-zinc-800">
                    <th className="py-2 pr-3">Trade ID</th>
                    <th className="py-2 pr-3">Symbol</th>
                    <th className="py-2 pr-3">Size</th>
                    <th className="py-2 pr-3">Entry Time</th>
                    <th className="py-2 pr-3">Exit Time</th>
                    <th className="py-2 pr-3">Duration</th>
                    <th className="py-2 pr-3">Entry</th>
                    <th className="py-2 pr-3">Exit</th>
                    <th className="py-2 pr-3">P&L</th>
                    <th className="py-2 pr-3">Commissions</th>
                    <th className="py-2 pr-3">Fees</th>
                    <th className="py-2 pr-3">Direction</th>
                    <th className="py-2 pr-3">Setup</th>
                    <th className="py-2 pr-3">Journal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {trades.map((trade) => (
                    <tr key={trade.id} className="text-white">
                      <td className="py-2 pr-3 text-zinc-400">{trade.id}</td>
                      <td className="py-2 pr-3">{trade.symbol}</td>
                      <td className="py-2 pr-3">{trade.qty}</td>
                      <td className="py-2 pr-3 text-zinc-400">{new Date(trade.entryTime).toLocaleString()}</td>
                      <td className="py-2 pr-3 text-zinc-400">{new Date(trade.exitTime).toLocaleString()}</td>
                      <td className="py-2 pr-3 text-zinc-400">{trade.durationMinutes}m</td>
                      <td className="py-2 pr-3">{trade.entryPrice}</td>
                      <td className="py-2 pr-3">{trade.exitPrice}</td>
                      <td className={`py-2 pr-3 ${trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatCurrency(trade.pnl)}</td>
                      <td className="py-2 pr-3 text-zinc-400">{formatCurrency(trade.commissions)}</td>
                      <td className="py-2 pr-3 text-zinc-400">{formatCurrency(trade.fees)}</td>
                      <td className="py-2 pr-3 text-zinc-400">{trade.side}</td>
                      <td className="py-2 pr-3 text-zinc-400">{trade.setupTag}</td>
                      <td className="py-2 pr-3">
                        <button
                          onClick={() => {
                            setJournalTradeId(trade.id);
                            setJournalOpen(true);
                          }}
                          className="text-xs px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40"
                        >
                          Add Note
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-zinc-500">Saved Journal Entries</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {journal.map((entry) => (
                  <div key={entry.id} className="rounded-lg border border-zinc-900 bg-zinc-900/40 p-3 space-y-1">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>{entry.date}</span>
                      <span className="text-emerald-400">{entry.mood}</span>
                    </div>
                    <div className="text-white text-sm leading-snug">{entry.content}</div>
                    {entry.tradeId && <div className="text-xs text-zinc-500">Trade: {entry.tradeId}</div>}
                  </div>
                ))}
                {journal.length === 0 && (
                  <div className="text-sm text-zinc-500">No journal entries yet. Add your first note from the table.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {derived.zellaScore !== null && (
            <div className="bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-transparent border border-emerald-500/30 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white text-lg flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    Velocity Score
                  </div>
                  <div className="text-sm text-zinc-700">Performance score from trading activity</div>
                </div>
                <div className="text-4xl text-white font-semibold">{Math.round(derived.zellaScore)}</div>
              </div>
              <div className="w-full h-[220px]" style={{ minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={derived.radarData}>
                    <PolarGrid stroke="#1f1f1f" />
                    <PolarAngleAxis dataKey="label" stroke="#a1a1aa" />
                    <Radar name="Score" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white text-lg">Account Balance Panel</div>
                <div className="text-sm text-zinc-500">Min/Max balance overview</div>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Balance", value: balanceStats.latest, min: balanceStats.min, max: balanceStats.max },
                { label: "Equity", value: balanceStats.latest + (account.equity - account.balance), min: balanceStats.min, max: balanceStats.max },
              ].map((item) => {
                const span = item.max - item.min || 1;
                const pct = clamp(((item.value - item.min) / span) * 100, 0, 100);
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm text-zinc-400">
                      <span>{item.label}</span>
                      <span className="text-white">{formatCurrency(item.value)}</span>
                    </div>
                    <div className="h-3 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>Min {formatCurrency(item.min)}</span>
                      <span className="text-emerald-400">Max {formatCurrency(item.max)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white text-lg">Performance Overview</div>
                <div className="text-sm text-zinc-500">Key ratios at a glance</div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {performanceOverview.map((item) => (
                <div key={item.label} className="rounded-lg border border-zinc-900 bg-zinc-900/40 p-3">
                  <div className="text-xs text-zinc-500">{item.label}</div>
                  <div
                    className={`text-lg ${
                      item.tone === "positive" ? "text-emerald-400" : item.tone === "negative" ? "text-red-400" : "text-white"
                    }`}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-3">
            <div className="text-white text-lg">Best & Worst Trades</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bestWorst.map((item) => (
                <div key={item.label} className="rounded-lg border border-zinc-900 bg-zinc-900/40 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">{item.label}</span>
                    {item.trade && (
                      <span className={`text-xs px-2 py-1 rounded-full border ${
                        item.tone === "positive" ? "text-emerald-400 border-emerald-500/30" : "text-red-400 border-red-500/30"
                      }`}>
                        {item.trade.side}
                      </span>
                    )}
                  </div>
                  {item.trade ? (
                    <>
                      <div className={`text-xl ${item.tone === "positive" ? "text-emerald-400" : "text-red-400"}`}>
                        {formatCurrency(item.trade.pnl)}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {item.trade.symbol} | {item.trade.qty} contracts | {new Date(item.trade.entryTime).toLocaleString()}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-zinc-500">No trades yet.</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white text-lg">Monthly P&L Calendar (Alt View)</div>
                <div className="text-sm text-zinc-500">
                  {altMonth.toLocaleString("default", { month: "long", year: "numeric" })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAltMonth(new Date(altMonth.getFullYear(), altMonth.getMonth() - 1, 1))}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setAltMonth(new Date(altMonth.getFullYear(), altMonth.getMonth() + 1, 1))}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-[11px] text-zinc-500">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {altCalendarDays.map((day) => {
                const pnlClass = day.pnl > 0 ? "text-emerald-400" : day.pnl < 0 ? "text-red-400" : "text-zinc-500";
                return (
                  <div
                    key={toDateKey(day.date)}
                    className={`p-2 rounded-md border ${day.inCurrentMonth ? "border-zinc-900 bg-zinc-900/40" : "border-zinc-900/50 bg-zinc-900/20"}`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>{day.label}</span>
                      {day.tradeCount > 0 && <span className={pnlClass}>{formatCurrency(day.pnl, { maximumFractionDigits: 0 })}</span>}
                    </div>
                    {day.tradeCount > 0 && <div className="text-[10px] text-zinc-500">{day.tradeCount} trades</div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-3">
            <div className="text-white text-lg">Account Info</div>
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
            {rules && (
              <div className="pt-4 space-y-2">
                <div className="text-sm text-zinc-500">Funding Rules</div>
                <ul className="space-y-1 text-sm text-zinc-400">
                  <li>Profit Target: <span className="text-white">{rules.profitTarget}</span></li>
                  <li>Max Daily Loss: <span className="text-white">{rules.maxDailyLoss}</span></li>
                  <li>Max Total Loss: <span className="text-white">{rules.maxTotalLoss}</span></li>
                  <li>Min Trading Days: <span className="text-white">{rules.minTradingDays}</span></li>
                  <li>Consistency: <span className="text-white">{rules.consistencyRule}</span></li>
                  {rules.trailingDrawdown && <li>Trailing Drawdown: <span className="text-white">{rules.trailingDrawdown}</span></li>}
                  {rules.payoutSplit && <li>Payout Split: <span className="text-white">{rules.payoutSplit}</span></li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {journalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 w-full max-w-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg">Trade Journal</h3>
              <button
                onClick={() => setJournalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Select Trade</label>
                <select
                  value={journalTradeId}
                  onChange={(e) => setJournalTradeId(e.target.value)}
                  className="w-full h-10 rounded-lg bg-zinc-900 border border-zinc-800 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {trades.map((trade) => (
                    <option key={trade.id} value={trade.id}>
                      {trade.id} | {trade.symbol} | {formatCurrency(trade.pnl)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Trade Snapshot</label>
                <div className="rounded-lg border border-zinc-900 bg-zinc-900/40 p-3 text-sm text-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span>{selectedTrade?.symbol}</span>
                    <span className={selectedTrade?.pnl && selectedTrade.pnl > 0 ? "text-emerald-400" : "text-red-400"}>
                      {selectedTrade ? formatCurrency(selectedTrade.pnl) : "-"}
                    </span>
                  </div>
                  {selectedTrade && (
                    <>
                      <div className="text-xs text-zinc-500">
                        {selectedTrade.side} | {selectedTrade.qty} contracts | {selectedTrade.durationMinutes}m
                      </div>
                      <div className="text-xs text-zinc-500">Entry {selectedTrade.entryPrice} / Exit {selectedTrade.exitPrice}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Notes</label>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900">
                <textarea
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  placeholder="Rich text friendly - add reflections, execution notes, and follow-ups."
                  className="w-full p-3 text-sm text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg"
                  rows={4}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setJournalOpen(false)}
                className="px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveJournal}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-black hover:bg-emerald-600"
              >
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
