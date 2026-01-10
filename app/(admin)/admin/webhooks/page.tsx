import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EVENT_LEDGER_LABEL, EXECUTION_VENUE_LABEL } from "@/lib/platform-labels";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/time";

type WebhookEventRow = {
  event_id: string;
  category: string | null;
  event: string | null;
  account_id: string | null;
  user_id: string | null;
  received_at: string;
  payload: Record<string, unknown> | null;
  headers: Record<string, unknown> | null;
};


const redactSensitive = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(redactSensitive);
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(([key, val]) => {
      const lower = key.toLowerCase();
      if (["secret", "token", "signature", "api", "key", "password"].some((frag) => lower.includes(frag))) {
        return [key, "[redacted]"];
      }
      return [key, redactSensitive(val)];
    });
    return Object.fromEntries(entries);
  }
  return value;
};

const toPrettyJson = (value: unknown) => {
  const text = JSON.stringify(redactSensitive(value), null, 2);
  return text.length > 2000 ? `${text.slice(0, 2000)}\n...` : text;
};

export default async function AdminWebhookLedgerPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const supabase = createSupabaseAdminClient();
  const query = typeof searchParams?.q === "string" ? searchParams.q.trim() : "";

  let request = supabase
    .from("volumetrica_events")
    .select("event_id, category, event, account_id, user_id, received_at, payload, headers")
    .order("received_at", { ascending: false })
    .limit(100);

  if (query) {
    const like = `%${query}%`;
    request = request.or(
      [
        `event_id.ilike.${like}`,
        `category.ilike.${like}`,
        `event.ilike.${like}`,
        `account_id.ilike.${like}`,
        `user_id.ilike.${like}`,
      ].join(","),
    );
  }

  const { data, error } = await request;

  const rows = (data as WebhookEventRow[] | null) ?? [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white text-2xl mb-1">{EVENT_LEDGER_LABEL}</h1>
        <p className="text-zinc-400">Latest {EXECUTION_VENUE_LABEL} event updates (append-only).</p>
      </div>

      <form className="flex flex-col md:flex-row md:items-center gap-3">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search by event, account, or user"
          className="w-full md:max-w-md rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-500 text-black hover:bg-blue-600 text-sm"
        >
          Search
        </button>
      </form>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-900">
              <TableHead className="text-zinc-400">Category</TableHead>
              <TableHead className="text-zinc-400">Event</TableHead>
              <TableHead className="text-zinc-400">Account</TableHead>
              <TableHead className="text-zinc-400">User</TableHead>
              <TableHead className="text-zinc-400 text-right">Received</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.event_id} className="border-zinc-900">
                <TableCell className="text-zinc-300">{row.category ?? "-"}</TableCell>
                <TableCell className="text-zinc-300">{row.event ?? "-"}</TableCell>
                <TableCell className="text-zinc-300">{row.account_id ?? "-"}</TableCell>
                <TableCell className="text-zinc-300">{row.user_id ?? "-"}</TableCell>
                <TableCell className="text-right text-zinc-300">
                  {row.received_at ? formatDateTime(row.received_at) : "-"}
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow className="border-zinc-900">
                <TableCell className="text-zinc-400" colSpan={5}>
                  {error ? "Unable to load events. Check data connection." : "No event updates yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {rows.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm text-zinc-400">Latest payloads (redacted)</div>
          <div className="space-y-3">
            {rows.slice(0, 6).map((row) => (
              <details key={`${row.event_id}-payload`} className="rounded-lg border border-zinc-900 bg-zinc-950 p-4">
                <summary className="cursor-pointer text-sm text-white">
                  {row.event ?? "Event"} · {row.account_id ?? "-"} · {formatDateTime(row.received_at)}
                </summary>
                <pre className="mt-3 text-xs text-zinc-400 whitespace-pre-wrap break-all max-h-72 overflow-auto">
                  {toPrettyJson(row.payload ?? {})}
                </pre>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
