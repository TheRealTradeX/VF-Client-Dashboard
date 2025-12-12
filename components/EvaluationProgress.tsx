import { AccountMetrics, EvaluationRules } from '@/types/trading';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface EvaluationProgressProps {
  metrics: AccountMetrics;
  rules: EvaluationRules;
}

export function EvaluationProgress({ metrics, rules }: EvaluationProgressProps) {
  const initialBalance = metrics.balance - metrics.totalPnl;
  const profitProgress = (metrics.totalPnl / (initialBalance * (rules.profitTarget / 100))) * 100;
  const tradingDaysProgress = (metrics.tradingDays / rules.minTradingDays) * 100;

  const objectives = [
    {
      label: 'Profit Target',
      target: `$${(initialBalance * (rules.profitTarget / 100)).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      current: `$${metrics.totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      progress: Math.min(profitProgress, 100),
      completed: profitProgress >= 100,
    },
    {
      label: 'Minimum Trading Days',
      target: `${rules.minTradingDays} days`,
      current: `${metrics.tradingDays} days`,
      progress: Math.min(tradingDaysProgress, 100),
      completed: tradingDaysProgress >= 100,
    },
    {
      label: 'Max Daily Loss',
      target: `${rules.maxDailyLoss}%`,
      current: `${((Math.abs(metrics.dailyPnl) / initialBalance) * 100).toFixed(2)}%`,
      progress: 100 - Math.min(((Math.abs(metrics.dailyPnl) / initialBalance) * 100) / rules.maxDailyLoss * 100, 100),
      completed: ((Math.abs(metrics.dailyPnl) / initialBalance) * 100) < rules.maxDailyLoss,
    },
    {
      label: 'Max Total Drawdown',
      target: `${rules.maxTotalLoss}%`,
      current: `${metrics.maxDrawdown.toFixed(2)}%`,
      progress: 100 - Math.min((metrics.maxDrawdown / rules.maxTotalLoss) * 100, 100),
      completed: metrics.maxDrawdown < rules.maxTotalLoss,
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white">Evaluation Objectives</h2>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 border border-blue-600/20 rounded-lg">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-400">{rules.phase}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {objectives.map((objective) => (
          <div key={objective.label} className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-slate-400 text-sm">{objective.label}</div>
                <div className="text-white mt-1">{objective.current}</div>
                <div className="text-slate-500 text-sm">of {objective.target}</div>
              </div>
              {objective.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-600 flex-shrink-0" />
              )}
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  objective.completed ? 'bg-emerald-500' : 'bg-blue-500'
                }`}
                style={{ width: `${objective.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
