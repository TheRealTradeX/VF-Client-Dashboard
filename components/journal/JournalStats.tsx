import { TrendingUp, Target, Brain, Award } from 'lucide-react';

interface JournalEntry {
  pnl: number;
  pnlPercent: number;
  mistakes: string[];
  setup: string;
}

interface JournalStatsProps {
  entries: JournalEntry[];
}

export function JournalStats({ entries }: JournalStatsProps) {
  const totalTrades = entries.length;
  const winningTrades = entries.filter(e => e.pnl > 0).length;
  const winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) : '0';
  const totalPnL = entries.reduce((sum, e) => sum + e.pnl, 0);
  const avgWin = entries.filter(e => e.pnl > 0).reduce((sum, e) => sum + e.pnl, 0) / (winningTrades || 1);
  const avgLoss = Math.abs(entries.filter(e => e.pnl < 0).reduce((sum, e) => sum + e.pnl, 0) / (totalTrades - winningTrades || 1));
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;
  const mistakeCount = entries.reduce((sum, e) => sum + e.mistakes.length, 0);

  const setupPerformance = entries.reduce((acc, entry) => {
    if (!acc[entry.setup]) {
      acc[entry.setup] = { wins: 0, total: 0 };
    }
    acc[entry.setup].total++;
    if (entry.pnl > 0) acc[entry.setup].wins++;
    return acc;
  }, {} as Record<string, { wins: number; total: number }>);

  const bestSetup = Object.entries(setupPerformance).sort(
    (a, b) => (b[1].wins / b[1].total) - (a[1].wins / a[1].total)
  )[0];

  const stats = [
    {
      label: 'Total P&L',
      value: `$${totalPnL.toFixed(2)}`,
      subtext: `${totalTrades} trades`,
      icon: TrendingUp,
      color: totalPnL >= 0 ? 'emerald' : 'red',
    },
    {
      label: 'Win Rate',
      value: `${winRate}%`,
      subtext: `${winningTrades}/${totalTrades} winning`,
      icon: Target,
      color: 'emerald',
    },
    {
      label: 'Best Setup',
      value: bestSetup ? bestSetup[0] : 'N/A',
      subtext: bestSetup ? `${((bestSetup[1].wins / bestSetup[1].total) * 100).toFixed(0)}% win rate` : '',
      icon: Award,
      color: 'emerald',
    },
    {
      label: 'Mistakes Tracked',
      value: mistakeCount.toString(),
      subtext: 'Learn and improve',
      icon: Brain,
      color: 'amber',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-zinc-950 border border-zinc-900 rounded-xl p-5"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 bg-${stat.color}-500/10 rounded-lg flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-zinc-400 text-sm">{stat.label}</div>
            <div className={`text-2xl ${stat.color === 'red' ? 'text-red-500' : 'text-white'}`}>
              {stat.value}
            </div>
            <div className="text-zinc-500 text-xs">{stat.subtext}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
