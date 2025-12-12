import { MetricsGrid } from '@/components/MetricsGrid';
import { EvaluationProgress } from '@/components/EvaluationProgress';
import { PerformanceChart } from '@/components/PerformanceChart';
import { TradesTable } from '@/components/TradesTable';
import { RulesPanel } from '@/components/RulesPanel';
import { accountMetrics, evaluationRules, performanceData, recentTrades } from '@/data/mockData';
import { TrendingUp } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white">PropTrader Evaluations</h1>
                <p className="text-sm text-slate-400">Account #PT-2025-8472</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-slate-400">Current Phase</div>
                <div className="text-white">{evaluationRules.phase}</div>
              </div>
              <div className="px-4 py-2 bg-emerald-600 rounded-lg">
                <div className="text-sm text-emerald-100">Active</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Top Metrics */}
          <MetricsGrid metrics={accountMetrics} />

          {/* Evaluation Progress */}
          <EvaluationProgress 
            metrics={accountMetrics} 
            rules={evaluationRules} 
          />

          {/* Charts and Rules */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PerformanceChart data={performanceData} />
            </div>
            <div>
              <RulesPanel rules={evaluationRules} metrics={accountMetrics} />
            </div>
          </div>

          {/* Recent Trades */}
          <TradesTable trades={recentTrades} />
        </div>
      </div>
    </div>
  );
}
