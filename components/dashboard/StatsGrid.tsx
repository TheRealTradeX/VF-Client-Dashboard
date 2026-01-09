import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, DollarSign, Activity, Target, Percent } from "lucide-react";

export type StatsGridItem = {
  label: string;
  value: string;
  change: string;
  changePercent: string;
  trend: "up" | "down";
  icon: LucideIcon;
};

const fallbackStats: StatsGridItem[] = [
  {
    label: 'Total Balance',
    value: '$245,832.00',
    change: '+$12,453',
    changePercent: '+5.3%',
    trend: 'up',
    icon: DollarSign,
  },
  {
    label: 'Today\'s P&L',
    value: '+$3,247.50',
    change: 'Across 3 accounts',
    changePercent: '+1.32%',
    trend: 'up',
    icon: Activity,
  },
  {
    label: 'Win Rate',
    value: '72.4%',
    change: '89 / 123 trades',
    changePercent: '+2.1%',
    trend: 'up',
    icon: Target,
  },
  {
    label: 'Profit Factor',
    value: '2.87',
    change: 'Last 30 days',
    changePercent: '+0.23',
    trend: 'up',
    icon: Percent,
  },
];

export function StatsGrid({ stats }: { stats?: StatsGridItem[] }) {
  const rows = stats ?? fallbackStats;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {rows.map((stat) => (
        <div
          key={stat.label}
          className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 hover:border-emerald-500/30 transition-colors"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <stat.icon className="w-5 h-5 text-emerald-500" />
            </div>
            {stat.trend === 'up' ? (
              <div className="flex items-center gap-1 text-emerald-500 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>{stat.changePercent}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-500 text-sm">
                <TrendingDown className="w-4 h-4" />
                <span>{stat.changePercent}</span>
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-zinc-400 text-sm">{stat.label}</div>
            <div className="text-white text-2xl">{stat.value}</div>
            <div className="text-zinc-500 text-xs">{stat.change}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
