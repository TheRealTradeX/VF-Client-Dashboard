export interface Trade {
  id: string;
  timestamp: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entry: number;
  exit: number | null;
  size: number;
  pnl: number;
  status: 'OPEN' | 'CLOSED';
}

export interface AccountMetrics {
  balance: number;
  equity: number;
  dailyPnl: number;
  totalPnl: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  currentDrawdown: number;
  tradingDays: number;
  totalTrades: number;
}

export interface EvaluationRules {
  phase: 'Phase 1' | 'Phase 2' | 'Funded';
  profitTarget: number;
  maxDailyLoss: number;
  maxTotalLoss: number;
  minTradingDays: number;
  consistencyRule?: number;
}

export interface PerformanceData {
  date: string;
  balance: number;
  equity: number;
  pnl: number;
}
