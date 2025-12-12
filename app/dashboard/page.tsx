"use client";

import { AccountsOverview } from "@/components/dashboard/AccountsOverview";
import { LiveTrades } from "@/components/dashboard/LiveTrades";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { StatsGrid } from "@/components/dashboard/StatsGrid";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white text-2xl mb-1">Welcome back, John</h1>
        <p className="text-zinc-400">Here&apos;s what&apos;s happening with your accounts today</p>
      </div>

      <StatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>
        <div>
          <AccountsOverview />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveTrades />
        <RecentActivity />
      </div>
    </div>
  );
}
