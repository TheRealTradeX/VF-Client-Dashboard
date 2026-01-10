import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/time";

type AuditRow = {
  id: string;
  action: string | null;
  actor_email: string | null;
  target_type: string | null;
  created_at: string;
};

const actionLabels: Record<string, string> = {
  "volumetrica.reconcile": "Reconciliation completed",
  "volumetrica.reconcile.failed": "Reconciliation failed",
};
const toTitleCase = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
const formatAction = (action: string | null) => {
  if (!action) return "Admin action";
  const known = actionLabels[action];
  if (known) return known;
  const normalized = action.replace(/^volumetrica\./, "").replace(/[_.]/g, " ").trim();
  return normalized ? toTitleCase(normalized) : "Admin action";
};
const formatTargetType = (value: string | null) => {
  if (!value) return "General";
  return toTitleCase(value.replace(/_/g, " ").trim());
};

export default async function AdminAuditLogPage() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_audit_log")
    .select("id, action, actor_email, target_type, created_at")
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
                <TableCell className="text-white">{formatAction(row.action)}</TableCell>
                <TableCell className="text-zinc-300">{row.actor_email ?? "Unknown"}</TableCell>
                <TableCell className="text-zinc-300">{formatTargetType(row.target_type)}</TableCell>
                <TableCell className="text-right text-zinc-300">
                  {row.created_at ? formatDateTime(row.created_at) : "N/A"}
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
