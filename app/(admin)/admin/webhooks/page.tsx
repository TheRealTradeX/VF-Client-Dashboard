import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EVENT_LEDGER_LABEL, EXECUTION_VENUE_LABEL } from "@/lib/platform-labels";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type WebhookEventRow = {
  event_id: string;
  category: string | null;
  event: string | null;
  received_at: string;
};

const formatTimestamp = (value: string) => value.replace("T", " ").slice(0, 19);

export default async function AdminWebhookLedgerPage() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("volumetrica_events")
    .select("event_id, category, event, received_at")
    .order("received_at", { ascending: false })
    .limit(100);

  const rows = (data as WebhookEventRow[] | null) ?? [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white text-2xl mb-1">{EVENT_LEDGER_LABEL}</h1>
        <p className="text-zinc-400">Latest {EXECUTION_VENUE_LABEL} event updates (append-only).</p>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-900">
              <TableHead className="text-zinc-400">Category</TableHead>
              <TableHead className="text-zinc-400">Event</TableHead>
              <TableHead className="text-zinc-400 text-right">Received</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.event_id} className="border-zinc-900">
                <TableCell className="text-zinc-300">{row.category ?? "-"}</TableCell>
                <TableCell className="text-zinc-300">{row.event ?? "-"}</TableCell>
                <TableCell className="text-right text-zinc-300">
                  {row.received_at ? formatTimestamp(row.received_at) : "-"}
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow className="border-zinc-900">
                <TableCell className="text-zinc-400" colSpan={3}>
                  {error ? "Unable to load events. Check data connection." : "No event updates yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
