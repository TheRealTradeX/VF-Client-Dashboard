import { Filter, Search } from "lucide-react";
import { AccountCreateForm, AccountRowActions } from "@/components/admin/AccountActions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type AccountRow = {
  account_id: string;
  user_id: string | null;
  status: string | null;
  trading_permission: string | null;
  enabled: boolean | null;
  rule_id: string | null;
  updated_at: string;
};

const formatTimestamp = (value: string | null) => (value ? value.replace("T", " ").slice(0, 19) : "-");

export default async function AdminAccountsPage() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("volumetrica_accounts")
    .select("account_id,user_id,status,trading_permission,enabled,rule_id,updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  const rows = (data as AccountRow[] | null) ?? [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <div>
          <h1 className="text-white text-2xl mb-1">Account Lists</h1>
          <p className="text-zinc-400">Search, filter, and manage all trading accounts.</p>
        </div>
      </div>

      <AccountCreateForm />

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
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Permission</TableHead>
              <TableHead className="text-zinc-400">Rule</TableHead>
              <TableHead className="text-zinc-400">Enabled</TableHead>
              <TableHead className="text-zinc-400">Updated</TableHead>
              <TableHead className="text-zinc-400 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((account) => (
              <TableRow key={account.account_id} className="border-zinc-900">
                <TableCell className="text-white">{account.account_id}</TableCell>
                <TableCell>
                  <div className="text-white text-sm">{account.user_id ?? "Unassigned"}</div>
                </TableCell>
                <TableCell className="text-zinc-300">{account.status ?? "-"}</TableCell>
                <TableCell className="text-zinc-300">{account.trading_permission ?? "-"}</TableCell>
                <TableCell className="text-zinc-300">{account.rule_id ?? "-"}</TableCell>
                <TableCell className="text-zinc-300">{account.enabled === null ? "-" : account.enabled ? "Yes" : "No"}</TableCell>
                <TableCell className="text-zinc-300">{formatTimestamp(account.updated_at)}</TableCell>
                <TableCell className="text-right">
                  <AccountRowActions accountId={account.account_id} />
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow className="border-zinc-900">
                <TableCell className="text-zinc-400" colSpan={8}>
                  {error ? "Unable to load accounts. Check your data connection." : "No accounts found yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
