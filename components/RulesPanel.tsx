import { EvaluationRules, AccountMetrics } from '@/types/trading';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface RulesPanelProps {
  rules: EvaluationRules;
  metrics: AccountMetrics;
}

export function RulesPanel({ rules, metrics }: RulesPanelProps) {
  const initialBalance = metrics.balance - metrics.totalPnl;

  const rulesList = [
    {
      label: 'Profit Target',
      value: `${rules.profitTarget}%`,
      detail: `$${(initialBalance * (rules.profitTarget / 100)).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      status: 'info',
    },
    {
      label: 'Max Daily Loss',
      value: `${rules.maxDailyLoss}%`,
      detail: `$${(initialBalance * (rules.maxDailyLoss / 100)).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      status: ((Math.abs(metrics.dailyPnl) / initialBalance) * 100) > (rules.maxDailyLoss * 0.7) ? 'warning' : 'info',
    },
    {
      label: 'Max Total Loss',
      value: `${rules.maxTotalLoss}%`,
      detail: `$${(initialBalance * (rules.maxTotalLoss / 100)).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      status: metrics.maxDrawdown > (rules.maxTotalLoss * 0.7) ? 'warning' : 'info',
    },
    {
      label: 'Minimum Trading Days',
      value: `${rules.minTradingDays} days`,
      detail: `Currently: ${metrics.tradingDays} days`,
      status: 'info',
    },
  ];

  if (rules.consistencyRule) {
    rulesList.push({
      label: 'Consistency Rule',
      value: `${rules.consistencyRule}%`,
      detail: 'Max profit in single day',
      status: 'info',
    });
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="w-5 h-5 text-blue-400" />
        <h2 className="text-white">Trading Rules</h2>
      </div>

      <div className="space-y-4">
        {rulesList.map((rule) => (
          <div
            key={rule.label}
            className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="text-slate-300">{rule.label}</div>
              {rule.status === 'warning' && (
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              )}
            </div>
            <div className="text-white text-xl mb-1">{rule.value}</div>
            <div className="text-slate-500 text-sm">{rule.detail}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg">
        <div className="text-blue-400 text-sm">
          <strong>Important:</strong> Violating any rule will result in immediate evaluation failure. 
          Trade responsibly and within the guidelines.
        </div>
      </div>
    </div>
  );
}
