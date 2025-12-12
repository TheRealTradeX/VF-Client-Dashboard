"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const dailyPnL = [
  { day: "Mon", pnl: 1250 },
  { day: "Tue", pnl: -430 },
  { day: "Wed", pnl: 2100 },
  { day: "Thu", pnl: 850 },
  { day: "Fri", pnl: 1820 },
  { day: "Sat", pnl: 0 },
  { day: "Sun", pnl: 0 },
];

const instrumentData = [
  { name: "NQ", value: 45, color: "#10b981" },
  { name: "ES", value: 30, color: "#34d399" },
  { name: "YM", value: 15, color: "#6ee7b7" },
  { name: "RTY", value: 10, color: "#a7f3d0" },
];

const timeData = [
  { hour: "9AM", trades: 12 },
  { hour: "10AM", trades: 18 },
  { hour: "11AM", trades: 15 },
  { hour: "12PM", trades: 8 },
  { hour: "1PM", trades: 10 },
  { hour: "2PM", trades: 14 },
  { hour: "3PM", trades: 20 },
  { hour: "4PM", trades: 16 },
];

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white text-2xl mb-1">Analytics</h1>
        <p className="text-zinc-400">Deep dive into your trading performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6">
          <h2 className="text-white mb-6">Daily P&amp;L</h2>
          <div className="w-full h-[300px]" style={{ minHeight: "300px", minWidth: "0" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyPnL}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="day" stroke="#52525b" tick={{ fill: "#71717a" }} />
                <YAxis
                  stroke="#52525b"
                  tick={{ fill: "#71717a" }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => [`$${value}`, "P&L"]}
                />
                <Bar dataKey="pnl" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6">
          <h2 className="text-white mb-6">Instrument Distribution</h2>
          <div className="w-full h-[300px]" style={{ minHeight: "300px", minWidth: "0" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={instrumentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {instrumentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => [`${value}%`, "Trades"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {instrumentData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-zinc-400 text-sm">{item.name}</span>
                <span className="text-white text-sm ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 lg:col-span-2">
          <h2 className="text-white mb-6">Trading Activity by Hour</h2>
          <div className="w-full h-[300px]" style={{ minHeight: "300px", minWidth: "0" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="hour" stroke="#52525b" tick={{ fill: "#71717a" }} />
                <YAxis stroke="#52525b" tick={{ fill: "#71717a" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => [value, "Trades"]}
                />
                <Bar dataKey="trades" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
          <div className="text-zinc-400 text-sm mb-2">Average Win</div>
          <div className="text-white text-2xl mb-1">$487.50</div>
          <div className="text-emerald-500 text-sm">+12.3% from last week</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
          <div className="text-zinc-400 text-sm mb-2">Average Loss</div>
          <div className="text-white text-2xl mb-1">$215.00</div>
          <div className="text-red-500 text-sm">-8.5% from last week</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
          <div className="text-zinc-400 text-sm mb-2">Largest Win</div>
          <div className="text-white text-2xl mb-1">$1,245.00</div>
          <div className="text-zinc-500 text-sm">This week</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
          <div className="text-zinc-400 text-sm mb-2">Risk/Reward</div>
          <div className="text-white text-2xl mb-1">2.27</div>
          <div className="text-emerald-500 text-sm">Excellent</div>
        </div>
      </div>
    </div>
  );
}
