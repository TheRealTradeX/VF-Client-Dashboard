import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { date: '12/01', balance: 225000, equity: 225000 },
  { date: '12/02', balance: 227500, equity: 227800 },
  { date: '12/03', balance: 231000, equity: 231200 },
  { date: '12/04', balance: 228500, equity: 228800 },
  { date: '12/05', balance: 233000, equity: 233400 },
  { date: '12/06', balance: 236500, equity: 236900 },
  { date: '12/07', balance: 235000, equity: 235200 },
  { date: '12/08', balance: 238500, equity: 239100 },
  { date: '12/09', balance: 241000, equity: 241600 },
  { date: '12/10', balance: 239500, equity: 239800 },
  { date: '12/11', balance: 243000, equity: 243700 },
  { date: '12/12', balance: 245832, equity: 246150 },
];

export function PerformanceChart() {
  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white mb-1">Portfolio Performance</h2>
          <p className="text-sm text-zinc-500">Last 30 days</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-emerald-500 text-black text-sm rounded-lg">30D</button>
          <button className="px-3 py-1.5 bg-zinc-900 text-zinc-400 text-sm rounded-lg hover:text-white transition-colors">90D</button>
          <button className="px-3 py-1.5 bg-zinc-900 text-zinc-400 text-sm rounded-lg hover:text-white transition-colors">1Y</button>
        </div>
      </div>

      <div className="w-full h-[350px]" style={{ minHeight: '350px', minWidth: '0' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis 
              dataKey="date" 
              stroke="#52525b"
              tick={{ fill: '#71717a' }}
              tickLine={{ stroke: '#27272a' }}
            />
            <YAxis 
              stroke="#52525b"
              tick={{ fill: '#71717a' }}
              tickLine={{ stroke: '#27272a' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: number) => [`$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, '']}
              labelStyle={{ color: '#a1a1aa' }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorBalance)"
              name="Balance"
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="#34d399"
              strokeWidth={2}
              fill="url(#colorEquity)"
              name="Equity"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}