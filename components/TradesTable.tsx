import { Trade } from '@/types/trading';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TradesTableProps {
  trades: Trade[];
}

export function TradesTable({ trades }: TradesTableProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <h2 className="text-white mb-6">Recent Trades</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left text-slate-400 pb-3 px-4">Time</th>
              <th className="text-left text-slate-400 pb-3 px-4">Symbol</th>
              <th className="text-left text-slate-400 pb-3 px-4">Type</th>
              <th className="text-right text-slate-400 pb-3 px-4">Entry</th>
              <th className="text-right text-slate-400 pb-3 px-4">Exit</th>
              <th className="text-right text-slate-400 pb-3 px-4">Size</th>
              <th className="text-right text-slate-400 pb-3 px-4">P&L</th>
              <th className="text-center text-slate-400 pb-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr
                key={trade.id}
                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
              >
                <td className="py-4 px-4 text-slate-300 text-sm">
                  {trade.timestamp}
                </td>
                <td className="py-4 px-4">
                  <span className="text-white">{trade.symbol}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5">
                    {trade.type === 'LONG' ? (
                      <>
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-500">LONG</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                        <span className="text-red-500">SHORT</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4 text-right text-slate-300">
                  {trade.entry.toFixed(2)}
                </td>
                <td className="py-4 px-4 text-right text-slate-300">
                  {trade.exit ? trade.exit.toFixed(2) : '-'}
                </td>
                <td className="py-4 px-4 text-right text-slate-300">
                  {trade.size}
                </td>
                <td className="py-4 px-4 text-right">
                  <span
                    className={
                      trade.pnl >= 0
                        ? 'text-emerald-500'
                        : 'text-red-500'
                    }
                  >
                    {trade.pnl >= 0 ? '+' : ''}$
                    {trade.pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs ${
                      trade.status === 'CLOSED'
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-blue-600/20 text-blue-400'
                    }`}
                  >
                    {trade.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
