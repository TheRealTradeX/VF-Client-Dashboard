"use client";

import { Award, Medal, Trophy, TrendingUp } from "lucide-react";

const topTraders = [
  {
    rank: 1,
    name: "Alex Thompson",
    country: "USA",
    profit: "$47,832.00",
    winRate: "78.5%",
    trades: 234,
    avatar: "AT",
  },
  {
    rank: 2,
    name: "Sarah Chen",
    country: "Singapore",
    profit: "$42,190.00",
    winRate: "75.2%",
    trades: 198,
    avatar: "SC",
  },
  {
    rank: 3,
    name: "Marcus Rodriguez",
    country: "Spain",
    profit: "$38,520.00",
    winRate: "72.8%",
    trades: 215,
    avatar: "MR",
  },
  {
    rank: 4,
    name: "Emma Williams",
    country: "UK",
    profit: "$35,240.00",
    winRate: "71.4%",
    trades: 189,
    avatar: "EW",
  },
  {
    rank: 5,
    name: "Liam O'Connor",
    country: "Ireland",
    profit: "$32,890.00",
    winRate: "69.8%",
    trades: 176,
    avatar: "LO",
  },
  {
    rank: 6,
    name: "You (John Doe)",
    country: "USA",
    profit: "$25,430.00",
    winRate: "72.4%",
    trades: 123,
    avatar: "JD",
    isCurrentUser: true,
  },
];

export default function LeaderboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white text-2xl mb-1">Leaderboard</h1>
        <p className="text-zinc-400">Top performing traders this month</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topTraders.slice(0, 3).map((trader, index) => {
          const icons = [Trophy, Medal, Award];
          const Icon = icons[index];
          const colors = ["emerald", "zinc", "amber"] as const;
          const color = colors[index];

          return (
            <div
              key={trader.rank}
              className={`bg-zinc-950 border rounded-xl p-6 text-center ${
                index === 0 ? "border-emerald-500" : "border-zinc-900"
              }`}
            >
              <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 bg-${color}-500/10 rounded-full flex items-center justify-center`}>
                  <Icon className={`w-8 h-8 text-${color}-500`} />
                </div>
              </div>
              <div className={`text-3xl mb-2 ${index === 0 ? "text-emerald-500" : "text-zinc-400"}`}>
                #{trader.rank}
              </div>
              <div className="text-white mb-1">{trader.name}</div>
              <div className="text-sm text-zinc-500 mb-4">{trader.country}</div>
              <div className="text-2xl text-emerald-500 mb-2">{trader.profit}</div>
              <div className="flex items-center justify-center gap-4 text-sm">
                <div>
                  <div className="text-zinc-500">Win Rate</div>
                  <div className="text-white">{trader.winRate}</div>
                </div>
                <div>
                  <div className="text-zinc-500">Trades</div>
                  <div className="text-white">{trader.trades}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white">Full Rankings</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-emerald-500 text-black text-sm rounded-lg">This Month</button>
            <button className="px-3 py-1.5 bg-zinc-900 text-zinc-400 text-sm rounded-lg hover:text-white transition-colors">
              All Time
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-zinc-400 pb-3 px-4">Rank</th>
                <th className="text-left text-zinc-400 pb-3 px-4">Trader</th>
                <th className="text-left text-zinc-400 pb-3 px-4">Country</th>
                <th className="text-right text-zinc-400 pb-3 px-4">Profit</th>
                <th className="text-right text-zinc-400 pb-3 px-4">Win Rate</th>
                <th className="text-right text-zinc-400 pb-3 px-4">Trades</th>
              </tr>
            </thead>
            <tbody>
              {topTraders.map((trader) => (
                <tr
                  key={trader.rank}
                  className={`border-b border-zinc-800/50 transition-colors ${
                    trader.isCurrentUser ? "bg-emerald-500/5 border-emerald-500/20" : "hover:bg-zinc-900/30"
                  }`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg ${trader.rank <= 3 ? "text-emerald-500" : "text-zinc-400"}`}>
                        #{trader.rank}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-black text-sm">
                        {trader.avatar}
                      </div>
                      <span className="text-white">{trader.name}</span>
                      {trader.isCurrentUser && (
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded">
                          You
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-zinc-300">{trader.country}</td>
                  <td className="py-4 px-4 text-right text-emerald-500">{trader.profit}</td>
                  <td className="py-4 px-4 text-right text-white">{trader.winRate}</td>
                  <td className="py-4 px-4 text-right text-zinc-300">{trader.trades}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
