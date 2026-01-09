import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

export type LiveTradeItem = {
  id: string;
  time: string;
  symbol: string;
  entry: number | null;
  current: number | null;
  size: number | null;
  pnl: number | null;
  status: "open" | "closed";
};

const fallbackTrades: LiveTradeItem[] = [
  {
    id: '1',
    time: '14:32:18',
    symbol: 'NQ',
    entry: 21450.50,
    current: 21468.25,
    size: 2,
    pnl: 712.50,
    status: 'open',
  },
  {
    id: '2',
    time: '14:15:42',
    symbol: 'ES',
    entry: 6025.75,
    current: 6020.50,
    size: 3,
    pnl: 787.50,
    status: 'closed',
  },
  {
    id: '3',
    time: '13:48:09',
    symbol: 'YM',
    entry: 44125.00,
    current: 44142.50,
    size: 1,
    pnl: 175.00,
    status: 'open',
  },
  {
    id: '4',
    time: '13:22:55',
    symbol: 'ES',
    entry: 6015.25,
    current: 6018.00,
    size: 2,
    pnl: 275.00,
    status: 'closed',
  },
];

export function LiveTrades({ trades }: { trades?: LiveTradeItem[] }) {
  const rows = trades ?? fallbackTrades;
  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-500" />
          <h2 className="text-white">Recent Trades</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">Latest activity</span>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="text-sm text-zinc-500">No trades yet.</div>
      ) : (
        <div className="space-y-3">
          {rows.map((trade) => (
            <div
              key={trade.id}
              className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      (trade.pnl ?? 0) >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"
                    }`}
                  >
                    {(trade.pnl ?? 0) >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div>
                    <div className="text-white">{trade.symbol}</div>
                    <div className="text-xs text-zinc-500">{trade.time}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm ${(trade.pnl ?? 0) >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {trade.pnl === null || trade.pnl === undefined
                      ? "-"
                      : `${trade.pnl >= 0 ? "+" : ""}$${trade.pnl.toFixed(2)}`}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {trade.size === null || trade.size === undefined ? "-" : `${trade.size} contracts`}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="text-zinc-400">
                  Entry: <span className="text-white">{trade.entry === null ? "-" : trade.entry.toFixed(2)}</span>
                </div>
                <div className="text-zinc-400">
                  Exit: <span className="text-white">{trade.current === null ? "-" : trade.current.toFixed(2)}</span>
                </div>
                <div
                  className={`px-2 py-0.5 rounded text-xs ${
                    trade.status === "open"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {trade.status.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
