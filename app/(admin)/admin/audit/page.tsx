import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type AuditRow = {
  id: string;
  action: string;
  actor_user_id: string | null;
  actor_email: string | null;
  target_type: string | null;
  target_id: string | null;
  created_at: string;
};

const formatTimestamp = (value: string) => value.replace("T", " ").slice(0, 19);

export default async function AdminAuditLogPage() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_audit_log")
    .select("id, action, actor_user_id, actor_email, target_type, target_id, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = (data as AuditRow[] | null) ?? [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white text-2xl mb-1">Audit Log</h1>
        <p className="text-zinc-400">Admin actions and reconciliation events.</p>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-900">
              <TableHead className="text-zinc-400">Action</TableHead>
              <TableHead className="text-zinc-400">Actor</TableHead>
              <TableHead className="text-zinc-400">Target</TableHead>
              <TableHead className="text-zinc-400 text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} className="border-zinc-900">
                <TableCell className="text-white">{row.action}</TableCell>
                <TableCell className="text-zinc-300">
                  <div>{row.actor_email ?? "—"}</div>
                  <div className="text-xs text-zinc-500">{row.actor_user_id ?? ""}</div>
                </TableCell>
                <TableCell className="text-zinc-300">
                  {row.target_type ?? "—"} {row.target_id ? `(${row.target_id})` : ""}
                </TableCell>
                <TableCell className="text-right text-zinc-300">
                  {row.created_at ? formatTimestamp(row.created_at) : "—"}
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow className="border-zinc-900">
                <TableCell className="text-zinc-400" colSpan={4}>
                  {error ? "Unable to load audit log." : "No admin actions recorded yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

