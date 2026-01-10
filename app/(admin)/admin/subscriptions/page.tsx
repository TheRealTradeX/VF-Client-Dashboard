import { SubscriptionForm, SubscriptionRowActions } from "@/components/admin/SubscriptionActions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EXECUTION_VENUE_LABEL } from "@/lib/platform-labels";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type SubscriptionRow = {
  subscription_id: string;
  user_id: string | null;
  status: string | null;
  provider_status: string | null;
  activation: string | null;
  expiration: string | null;
  platform: string | null;
  volumetrica_platform: string | null;
  updated_at: string;
};

const formatTimestamp = (value: string | null) => (value ? value.replace("T", " ").slice(0, 19) : "-");

export default async function AdminSubscriptionsPage() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("volumetrica_subscriptions")
    .select(
      "subscription_id,user_id,status,provider_status,activation,expiration,platform,volumetrica_platform,updated_at",
    )
    .order("updated_at", { ascending: false })
    .limit(100);

  const rows = (data as SubscriptionRow[] | null) ?? [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white text-2xl mb-1">Subscriptions</h1>
        <p className="text-zinc-400">Manage {EXECUTION_VENUE_LABEL} subscriptions.</p>
      </div>

      <SubscriptionForm />

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-900">
              <TableHead className="text-zinc-400">Subscription</TableHead>
              <TableHead className="text-zinc-400">User</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Provider</TableHead>
              <TableHead className="text-zinc-400">Activation</TableHead>
              <TableHead className="text-zinc-400">Expiration</TableHead>
              <TableHead className="text-zinc-400 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.subscription_id} className="border-zinc-900">
                <TableCell className="text-white">{row.subscription_id}</TableCell>
                <TableCell className="text-zinc-300">{row.user_id ?? "-"}</TableCell>
                <TableCell className="text-zinc-300">{row.status ?? "-"}</TableCell>
                <TableCell className="text-zinc-300">{row.provider_status ?? "-"}</TableCell>
                <TableCell className="text-zinc-300">{formatTimestamp(row.activation)}</TableCell>
                <TableCell className="text-zinc-300">{formatTimestamp(row.expiration)}</TableCell>
                <TableCell className="text-right">
                  <SubscriptionRowActions subscriptionId={row.subscription_id} />
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow className="border-zinc-900">
                <TableCell className="text-zinc-400" colSpan={7}>
                  {error ? "Unable to load subscriptions." : "No subscriptions available yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
