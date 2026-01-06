import { Filter, Plus, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type AccountRow = {
  id: string;
  account_number: string | null;
  program: string | null;
  status: string | null;
  verification_status: string | null;
  profiles: { full_name: string | null; email: string | null } | null;
};

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
  "KYC Pending": "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  Breached: "bg-rose-500/10 text-rose-400 border border-rose-500/30",
  Upgraded: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
};

const verificationStyles: Record<string, string> = {
  Verified: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
  Pending: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  Denied: "bg-rose-500/10 text-rose-400 border border-rose-500/30",
};

const defaultStatus = "bg-zinc-900 text-zinc-300 border border-zinc-800";

export default async function AdminAccountsPage() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("id, account_number, program, status, verification_status, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = (data as AccountRow[] | null)?.map((row) => ({
    id: row.account_number ?? row.id,
    user: row.profiles?.full_name ?? "Unknown",
    email: row.profiles?.email ?? "-",
    program: row.program ?? "-",
    status: row.status ?? "Active",
    verification: row.verification_status ?? "Pending",
  })) ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl mb-1">Account Lists</h1>
          <p className="text-zinc-400">Search, filter, and manage all trading accounts.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-black rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search user"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg text-sm">
            <Filter className="w-4 h-4" />
            User Type
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg text-sm">
            <Filter className="w-4 h-4" />
            Status
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg text-sm">
            <Filter className="w-4 h-4" />
            Date Range
          </button>
          <button className="px-3 py-2 text-sm text-zinc-500 hover:text-white">Clear Filters</button>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-900">
              <TableHead className="text-zinc-400">Account</TableHead>
              <TableHead className="text-zinc-400">User</TableHead>
              <TableHead className="text-zinc-400">Program</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Verification</TableHead>
              <TableHead className="text-zinc-400 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((account) => (
              <TableRow key={account.id} className="border-zinc-900">
                <TableCell className="text-white">{account.id}</TableCell>
                <TableCell>
                  <div className="text-white text-sm">{account.user}</div>
                  <div className="text-xs text-zinc-500">{account.email}</div>
                </TableCell>
                <TableCell className="text-zinc-300">{account.program}</TableCell>
                <TableCell>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      statusStyles[account.status] ?? defaultStatus
                    }`}
                  >
                    {account.status}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      verificationStyles[account.verification] ?? defaultStatus
                    }`}
                  >
                    {account.verification}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <button className="px-3 py-1.5 text-xs text-white border border-zinc-700 rounded-lg hover:border-blue-500/50">
                    Details
                  </button>
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow className="border-zinc-900">
                <TableCell className="text-zinc-400" colSpan={6}>
                  {error ? "Unable to load accounts. Check your Supabase connection." : "No accounts found yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
