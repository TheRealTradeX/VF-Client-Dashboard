import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const metrics = [
  { label: "Active Accounts", value: "1,284", change: "+4.1%" },
  { label: "KYC Pending", value: "96", change: "-2.5%" },
  { label: "Open Payouts", value: "$214,320", change: "+8.3%" },
  { label: "New Users (7d)", value: "312", change: "+12.0%" },
];

const queue = [
  {
    id: "492123",
    user: "Arlene McCoy",
    program: "Program 1",
    status: "Active",
    verification: "Verified",
  },
  {
    id: "492124",
    user: "Kathryn Murphy",
    program: "Program 1",
    status: "KYC Pending",
    verification: "Pending",
  },
  {
    id: "492125",
    user: "Jerome Bell",
    program: "Program 2",
    status: "Active",
    verification: "Verified",
  },
  {
    id: "492126",
    user: "Robert Fox",
    program: "Program 1",
    status: "Breached",
    verification: "Denied",
  },
];

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
  "KYC Pending": "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  Breached: "bg-rose-500/10 text-rose-400 border border-rose-500/30",
};

const verificationStyles: Record<string, string> = {
  Verified: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
  Pending: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  Denied: "bg-rose-500/10 text-rose-400 border border-rose-500/30",
};

export default function AdminOverviewPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl mb-1">Admin Overview</h1>
          <p className="text-zinc-400">Manage accounts, verifications, and payouts.</p>
        </div>
        <Link
          href="/admin/accounts"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-black rounded-lg transition-colors"
        >
          View Accounts
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
            <div className="text-sm text-zinc-400 mb-2">{metric.label}</div>
            <div className="text-2xl text-white mb-1">{metric.value}</div>
            <div className="text-xs text-blue-400">{metric.change} vs last week</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-zinc-950 border border-zinc-900 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white">Account Queue</h2>
            <Link href="/admin/accounts" className="text-sm text-blue-400 hover:text-blue-300">
              Review all
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-900">
                <TableHead className="text-zinc-400">Account</TableHead>
                <TableHead className="text-zinc-400">User</TableHead>
                <TableHead className="text-zinc-400">Program</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Verification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.map((row) => (
                <TableRow key={row.id} className="border-zinc-900">
                  <TableCell className="text-white">{row.id}</TableCell>
                  <TableCell className="text-zinc-300">{row.user}</TableCell>
                  <TableCell className="text-zinc-300">{row.program}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusStyles[row.status]}`}>{row.status}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${verificationStyles[row.verification]}`}>
                      {row.verification}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4">
          <h2 className="text-white">Today</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-zinc-900 p-3">
              <div>
                <div className="text-sm text-white">KYC Review</div>
                <div className="text-xs text-zinc-500">12 submissions waiting</div>
              </div>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-zinc-900 p-3">
              <div>
                <div className="text-sm text-white">Risk Alerts</div>
                <div className="text-xs text-zinc-500">3 accounts flagged</div>
              </div>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-zinc-900 p-3">
              <div>
                <div className="text-sm text-white">Payouts Approved</div>
                <div className="text-xs text-zinc-500">18 requests ready</div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="rounded-lg border border-zinc-900 p-4">
            <div className="text-sm text-white mb-2">Quick Actions</div>
            <div className="grid grid-cols-1 gap-2">
              <Link href="/admin/verifications" className="text-sm text-blue-400 hover:text-blue-300">
                Review KYC queue
              </Link>
              <Link href="/admin/payouts" className="text-sm text-blue-400 hover:text-blue-300">
                Process payouts
              </Link>
              <Link href="/admin/users" className="text-sm text-blue-400 hover:text-blue-300">
                Invite new admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
