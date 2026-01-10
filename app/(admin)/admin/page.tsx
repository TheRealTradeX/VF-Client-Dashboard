import Link from "next/link";
import { ArrowUpRight, Clock, RefreshCw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/time";

type AccountRow = {
  account_id: string;
  user_id: string | null;
  status: string | null;
  enabled: boolean | null;
  updated_at: string;
};


export default async function AdminOverviewPage() {
  const supabase = createSupabaseAdminClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [{ count: activeAccounts }, { count: totalUsers }, { count: activeSubscriptions }, { count: eventCount }] =
    await Promise.all([
      supabase
        .from("volumetrica_accounts")
        .select("account_id", { count: "exact", head: true })
        .eq("enabled", true)
        .eq("is_deleted", false)
        .eq("is_hidden", false)
        .eq("is_test", false),
      supabase.from("volumetrica_users").select("volumetrica_user_id", { count: "exact", head: true }),
      supabase
        .from("volumetrica_subscriptions")
        .select("subscription_id", { count: "exact", head: true })
        .eq("is_deleted", false),
      supabase.from("volumetrica_events").select("id", { count: "exact", head: true }).gte("received_at", since),
    ]);

  const { data: recentAccounts } = await supabase
    .from("volumetrica_accounts")
    .select("account_id,user_id,status,enabled,updated_at")
    .order("updated_at", { ascending: false })
    .limit(6);

  const metrics = [
    { label: "Active Accounts", value: String(activeAccounts ?? 0) },
    { label: "Total Users", value: String(totalUsers ?? 0) },
    { label: "Active Subscriptions", value: String(activeSubscriptions ?? 0) },
    { label: "Events (24h)", value: String(eventCount ?? 0) },
  ];

  const rows = (recentAccounts as AccountRow[] | null) ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl mb-1">Admin Overview</h1>
          <p className="text-zinc-400">Operational snapshot and recent platform activity.</p>
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
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-zinc-950 border border-zinc-900 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white">Recent Accounts</h2>
            <Link href="/admin/accounts" className="text-sm text-blue-400 hover:text-blue-300">
              Review all
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-900">
                <TableHead className="text-zinc-400">Account</TableHead>
                <TableHead className="text-zinc-400">User</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400 text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.account_id} className="border-zinc-900">
                  <TableCell className="text-white">{row.account_id}</TableCell>
                  <TableCell className="text-zinc-300">{row.user_id ?? "-"}</TableCell>
                  <TableCell className="text-zinc-300">{row.status ?? "-"}</TableCell>
                  <TableCell className="text-right text-zinc-300">
                    {formatDateTime(row.updated_at)}
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length && (
                <TableRow className="border-zinc-900">
                  <TableCell className="text-zinc-400" colSpan={4}>
                    No recent accounts.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4">
          <h2 className="text-white">Operational Notes</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-zinc-900 p-3">
              <div>
                <div className="text-sm text-white">Recent events</div>
                <div className="text-xs text-zinc-500">Last 24 hours</div>
              </div>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-zinc-900 p-3">
              <div>
                <div className="text-sm text-white">Reconciliation</div>
                <div className="text-xs text-zinc-500">Manual trigger available</div>
              </div>
              <RefreshCw className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="rounded-lg border border-zinc-900 p-4">
            <div className="text-sm text-white mb-2">Quick Actions</div>
            <div className="grid grid-cols-1 gap-2">
              <Link href="/admin/reconcile" className="text-sm text-blue-400 hover:text-blue-300">
                Run reconciliation
              </Link>
              <Link href="/admin/users" className="text-sm text-blue-400 hover:text-blue-300">
                Provision users
              </Link>
              <Link href="/admin/emails" className="text-sm text-blue-400 hover:text-blue-300">
                Manage email templates
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
