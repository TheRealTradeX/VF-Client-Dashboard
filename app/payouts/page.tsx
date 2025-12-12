"use client";

import { Calendar, Clock, DollarSign, TrendingUp } from "lucide-react";

const payouts = [
  {
    id: "1",
    amount: "$5,200.00",
    account: "VF-2025-8423",
    date: "2025-12-10",
    status: "completed",
    method: "Bank Transfer",
  },
  {
    id: "2",
    amount: "$3,840.00",
    account: "VF-2025-8423",
    date: "2025-11-26",
    status: "completed",
    method: "Bank Transfer",
  },
  {
    id: "3",
    amount: "$4,120.00",
    account: "VF-2025-8423",
    date: "2025-11-12",
    status: "completed",
    method: "Bank Transfer",
  },
  {
    id: "4",
    amount: "$2,900.00",
    account: "VF-2025-8392",
    date: "2025-12-15",
    status: "pending",
    method: "Bank Transfer",
  },
];

const stats = [
  {
    label: "Total Earnings",
    value: "$16,060.00",
    icon: DollarSign,
    change: "+$5,200",
  },
  {
    label: "This Month",
    value: "$5,200.00",
    icon: Calendar,
    change: "1 payout",
  },
  {
    label: "Next Payout",
    value: "$2,900.00",
    icon: Clock,
    change: "Dec 15, 2025",
  },
  {
    label: "Average Payout",
    value: "$4,015.00",
    icon: TrendingUp,
    change: "4 total",
  },
];

export default function PayoutsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white text-2xl mb-1">Payouts</h1>
        <p className="text-zinc-400">Track your earnings and withdrawal history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-zinc-400 text-sm">{stat.label}</div>
              <div className="text-white text-2xl">{stat.value}</div>
              <div className="text-zinc-500 text-xs">{stat.change}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white">Payout History</h2>
          <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg transition-colors">
            Request Payout
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-zinc-400 pb-3 px-4">Date</th>
                <th className="text-left text-zinc-400 pb-3 px-4">Account</th>
                <th className="text-left text-zinc-400 pb-3 px-4">Amount</th>
                <th className="text-left text-zinc-400 pb-3 px-4">Method</th>
                <th className="text-left text-zinc-400 pb-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr
                  key={payout.id}
                  className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors"
                >
                  <td className="py-4 px-4 text-zinc-300">{payout.date}</td>
                  <td className="py-4 px-4 text-white">{payout.account}</td>
                  <td className="py-4 px-4 text-emerald-500">{payout.amount}</td>
                  <td className="py-4 px-4 text-zinc-300">{payout.method}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs ${
                        payout.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                      }`}
                    >
                      {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6">
        <h2 className="text-white mb-4">Payout Information</h2>
        <div className="space-y-3 text-sm">
          <p className="text-zinc-400">- Payouts are processed bi-weekly on the 1st and 15th of each month</p>
          <p className="text-zinc-400">- Minimum payout amount is $100</p>
          <p className="text-zinc-400">- Bank transfers typically take 2-3 business days</p>
          <p className="text-zinc-400">
            - You can request a payout at any time if you meet the minimum threshold
          </p>
        </div>
      </div>
    </div>
  );
}
