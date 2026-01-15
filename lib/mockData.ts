export type AccountStatus = "active" | "in-progress" | "paused";

export type Account = {
  id: string;
  label: string;
  type: string;
  size: number;
  balance: number;
  equity: number;
  dailyPnl: number;
  totalPnl: number;
  startDate: string;
  phase: string;
  status: AccountStatus;
  winRate?: number;
  profitFactor?: number;
};

export type TradeSide = "LONG" | "SHORT";

export type Trade = {
  id: string;
  accountId: string;
  symbol: string;
  side: TradeSide;
  qty: number;
  entryTime: string;
  exitTime: string;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  fees: number;
  commissions: number;
  durationMinutes: number;
  setupTag: string;
};

export type JournalEntry = {
  id: string;
  accountId: string;
  tradeId?: string;
  date: string;
  content: string;
  tags: string[];
  mood: "Calm" | "Focused" | "Stressed" | "Confident";
  notes?: string;
};

export type AccountRules = {
  profitTarget: string;
  maxDailyLoss: string;
  maxTotalLoss: string;
  minTradingDays: number;
  consistencyRule: string;
  trailingDrawdown?: string;
  payoutSplit?: string;
};

export type AccountCredentials = {
  provider: string;
  username: string;
  status: "connected" | "pending" | "disconnected";
};

export const accounts: Account[] = [
  {
    id: "VF-2025-8423",
    label: "$100k Funded",
    type: "Funded Account",
    size: 100_000,
    balance: 125_430,
    equity: 125_750.5,
    dailyPnl: 1_250.5,
    totalPnl: 25_430,
    startDate: "2025-10-15",
    phase: "Funded",
    status: "active",
    winRate: 68.5,
    profitFactor: 2.34,
  },
  {
    id: "VF-2025-8401",
    label: "$80k Challenge",
    type: "Phase 2 Challenge",
    size: 80_000,
    balance: 84_245,
    equity: 84_380.25,
    dailyPnl: 780,
    totalPnl: 4_245,
    startDate: "2025-11-20",
    phase: "Phase 2",
    status: "in-progress",
    winRate: 64.2,
    profitFactor: 1.92,
  },
  {
    id: "VF-2025-8392",
    label: "$40k Challenge",
    type: "Phase 1 Challenge",
    size: 40_000,
    balance: 40_157,
    equity: 40_245,
    dailyPnl: 88,
    totalPnl: 157,
    startDate: "2025-12-01",
    phase: "Phase 1",
    status: "in-progress",
    winRate: 57.8,
    profitFactor: 1.35,
  },
];

export const mockAccounts = accounts;

export function getAccountRouteId(a: any): string {
  return (
    a?.account_id ??
    a?.id ??
    a?.accountId ??
    a?.accountNumber ??
    a?.number ??
    a?.code ??
    ""
  ).toString();
}

export function normalizeAccounts(input: any): any[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (typeof input === "object") return Object.values(input);
  return [];
}

export const trades: Trade[] = [
  {
    id: "T-1001",
    accountId: "VF-2025-8423",
    symbol: "NQ",
    side: "LONG",
    qty: 2,
    entryTime: "2025-12-12T14:23:15Z",
    exitTime: "2025-12-12T14:45:12Z",
    entryPrice: 21450.5,
    exitPrice: 21468.25,
    pnl: 712.5,
    fees: 4.5,
    commissions: 6,
    durationMinutes: 22,
    setupTag: "Breakout",
  },
  {
    id: "T-1002",
    accountId: "VF-2025-8423",
    symbol: "ES",
    side: "SHORT",
    qty: 3,
    entryTime: "2025-12-12T13:45:22Z",
    exitTime: "2025-12-12T14:10:03Z",
    entryPrice: 6025.75,
    exitPrice: 6020.5,
    pnl: 787.5,
    fees: 6,
    commissions: 9,
    durationMinutes: 25,
    setupTag: "Reversal",
  },
  {
    id: "T-1003",
    accountId: "VF-2025-8423",
    symbol: "NQ",
    side: "LONG",
    qty: 2,
    entryTime: "2025-12-12T12:15:08Z",
    exitTime: "2025-12-12T12:25:30Z",
    entryPrice: 21425,
    exitPrice: 21421.75,
    pnl: -130,
    fees: 4.5,
    commissions: 6,
    durationMinutes: 10,
    setupTag: "Failed Breakout",
  },
  {
    id: "T-1004",
    accountId: "VF-2025-8423",
    symbol: "NQ",
    side: "SHORT",
    qty: 2,
    entryTime: "2025-12-11T15:42:18Z",
    exitTime: "2025-12-11T15:51:48Z",
    entryPrice: 21380.75,
    exitPrice: 21375.5,
    pnl: 210,
    fees: 4.5,
    commissions: 6,
    durationMinutes: 9,
    setupTag: "MA Rejection",
  },
  {
    id: "T-2001",
    accountId: "VF-2025-8401",
    symbol: "CL",
    side: "LONG",
    qty: 1,
    entryTime: "2025-12-10T14:00:00Z",
    exitTime: "2025-12-10T14:35:00Z",
    entryPrice: 78.25,
    exitPrice: 79.1,
    pnl: 850,
    fees: 2.5,
    commissions: 5,
    durationMinutes: 35,
    setupTag: "Breakout",
  },
  {
    id: "T-2002",
    accountId: "VF-2025-8401",
    symbol: "ES",
    side: "SHORT",
    qty: 1,
    entryTime: "2025-12-09T16:10:00Z",
    exitTime: "2025-12-09T16:30:00Z",
    entryPrice: 6030,
    exitPrice: 6042,
    pnl: -600,
    fees: 2,
    commissions: 4,
    durationMinutes: 20,
    setupTag: "Fade",
  },
  {
    id: "T-3001",
    accountId: "VF-2025-8392",
    symbol: "MNQ",
    side: "LONG",
    qty: 5,
    entryTime: "2025-12-08T12:30:00Z",
    exitTime: "2025-12-08T12:55:00Z",
    entryPrice: 21400,
    exitPrice: 21412,
    pnl: 600,
    fees: 6,
    commissions: 10,
    durationMinutes: 25,
    setupTag: "Pullback",
  },
];

export const journalEntries: JournalEntry[] = [
  {
    id: "J-1",
    accountId: "VF-2025-8423",
    tradeId: "T-1001",
    date: "2025-12-12",
    content: "Great breakout trade, waited for volume confirmation and scaled out near target.",
    tags: ["Breakout", "Focus"],
    mood: "Confident",
    notes: "Stay patient on entries.",
  },
  {
    id: "J-2",
    accountId: "VF-2025-8423",
    tradeId: "T-1003",
    date: "2025-12-12",
    content: "Forced a breakout in chop. Need to respect no-trade zones.",
    tags: ["Discipline"],
    mood: "Stressed",
    notes: "Add alarm for chop filter.",
  },
  {
    id: "J-3",
    accountId: "VF-2025-8401",
    date: "2025-12-09",
    content: "Took a fade against trend. Acceptable risk but late to exit.",
    tags: ["Fade", "Risk"],
    mood: "Calm",
  },
];

export const rulesByAccountId: Record<string, AccountRules> = {
  "VF-2025-8423": {
    profitTarget: "8% ($8,000)",
    maxDailyLoss: "5% ($5,000)",
    maxTotalLoss: "10% ($10,000)",
    minTradingDays: 5,
    consistencyRule: "No single day > 40% of total profit",
    payoutSplit: "90/10",
  },
  "VF-2025-8401": {
    profitTarget: "8% ($6,400)",
    maxDailyLoss: "5% ($4,000)",
    maxTotalLoss: "10% ($8,000)",
    minTradingDays: 4,
    consistencyRule: "No single day > 40% of total profit",
    trailingDrawdown: "$3,500",
  },
  "VF-2025-8392": {
    profitTarget: "8% ($3,200)",
    maxDailyLoss: "5% ($2,000)",
    maxTotalLoss: "10% ($4,000)",
    minTradingDays: 4,
    consistencyRule: "No single day > 40% of total profit",
  },
};

export const credentialsByAccountId: Record<string, AccountCredentials[]> = {
  "VF-2025-8423": [
    { provider: "Tradovate", username: "funded_trader***", status: "connected" },
    { provider: "NinjaTrader", username: "nt_live_***", status: "connected" },
  ],
  "VF-2025-8401": [
    { provider: "Tradovate", username: "phase2_user***", status: "connected" },
  ],
  "VF-2025-8392": [
    { provider: "Tradovate", username: "phase1_user***", status: "pending" },
  ],
};

export function formatCurrency(value: number, options: Intl.NumberFormatOptions = {}) {
  const normalized: Intl.NumberFormatOptions = { ...options };

  const clampDigits = (num: number | undefined) =>
    num === undefined ? undefined : Math.min(20, Math.max(0, num));

  normalized.minimumFractionDigits = clampDigits(normalized.minimumFractionDigits);
  normalized.maximumFractionDigits = clampDigits(normalized.maximumFractionDigits);

  if (normalized.maximumFractionDigits !== undefined && normalized.minimumFractionDigits === undefined) {
    normalized.minimumFractionDigits = Math.min(2, normalized.maximumFractionDigits);
  }
  if (
    normalized.minimumFractionDigits !== undefined &&
    normalized.maximumFractionDigits !== undefined &&
    normalized.minimumFractionDigits > normalized.maximumFractionDigits
  ) {
    normalized.maximumFractionDigits = normalized.minimumFractionDigits;
  }
  if (normalized.minimumFractionDigits === undefined) {
    normalized.minimumFractionDigits = 2;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    ...normalized,
  }).format(value);
}
