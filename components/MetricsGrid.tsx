import { AccountMetrics } from '@/types/trading';
import { TrendingUp, TrendingDown, DollarSign, Target, Activity, Award } from 'lucide-react';

interface MetricsGridProps {
  metrics: AccountMetrics;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const metricsConfig = [
    {
      label: 'Account Balance',
      value: `$${metrics.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      trend: metrics.totalPnl >= 0 ? 'up' : 'down',
      trendValue: `$${Math.abs(metrics.totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      color: 'blue',
    },
    {
      label: 'Daily P&L',
      value: `$${metrics.dailyPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: Activity,
      trend: metrics.dailyPnl >= 0 ? 'up' : 'down',
      trendValue: `${((metrics.dailyPnl / (metrics.balance - metrics.totalPnl)) * 100).toFixed(2)}%`,
      color: metrics.dailyPnl >= 0 ? 'emerald' : 'red',
    },
    {
      label: 'Win Rate',
      value: `${metrics.winRate.toFixed(1)}%`,
      icon: Target,
      trend: 'neutral',
      trendValue: `${metrics.totalTrades} trades`,
      color: 'purple',
    },
    {
      label: 'Profit Factor',
      value: metrics.profitFactor.toFixed(2),
      icon: Award,
      trend: 'neutral',
      trendValue: `Max DD: ${metrics.maxDrawdown.toFixed(1)}%`,
      color: 'amber',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricsConfig.map((metric) => (
        <div
          key={metric.label}
          className="bg-slate-900 border border-slate-800 rounded-lg p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-slate-400 text-sm mb-1">{metric.label}</div>
              <div className="text-white text-2xl mb-2">{metric.value}</div>
              <div className="flex items-center gap-1">
                {metric.trend === 'up' && (
                  <>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-emerald-500">{metric.trendValue}</span>
                  </>
                )}
                {metric.trend === 'down' && (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-500">{metric.trendValue}</span>
                  </>
                )}
                {metric.trend === 'neutral' && (
                  <span className="text-sm text-slate-400">{metric.trendValue}</span>
                )}
              </div>
            </div>
            <div className={`w-12 h-12 bg-${metric.color}-600/10 rounded-lg flex items-center justify-center`}>
              <metric.icon className={`w-6 h-6 text-${metric.color}-500`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
