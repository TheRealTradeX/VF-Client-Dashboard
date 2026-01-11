import { PayoutActions } from "@/components/admin/PayoutActions";
import { PayoutRequestForm } from "@/components/admin/PayoutRequestForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/mockData";
import { formatDateTime } from "@/lib/time";

type PayoutRow = {
  id: string;
  user_id: string;
  account_id: string | null;
  amount: number | null;
  currency: string | null;
  status: string;
  requested_at: string;
  updated_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
};

export default async function AdminPayoutsPage() {
  const supabase = createSupabaseAdminClient();
  const { data: payoutData } = await supabase
    .from("payout_requests")
    .select("id,user_id,account_id,amount,currency,status,requested_at,updated_at")
    .order("updated_at", { ascending: false })
    .limit(200);

  const payouts = (payoutData as PayoutRow[] | null) ?? [];
  const userIds = payouts.map((row) => row.user_id);

  const { data: profileData } = userIds.length
    ? await supabase.from("profiles").select("id, full_name, email").in("id", userIds)
    : { data: [] as ProfileRow[] };

  const profileMap = new Map<string, ProfileRow>();
  (profileData as ProfileRow[] | null)?.forEach((profile) => {
    profileMap.set(profile.id, profile);
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white text-2xl mb-1">Payouts</h1>
        <p className="text-zinc-400">Track payout requests and approvals.</p>
      </div>

      <PayoutRequestForm />

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-900">
              <TableHead className="text-zinc-400">User</TableHead>
              <TableHead className="text-zinc-400">Account</TableHead>
              <TableHead className="text-zinc-400">Amount</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Requested</TableHead>
              <TableHead className="text-zinc-400">Updated</TableHead>
              <TableHead className="text-zinc-400 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.map((row) => {
              const profile = profileMap.get(row.user_id);
              const amount = typeof row.amount === "number" ? formatCurrency(row.amount) : "-";
              return (
                <TableRow key={row.id} className="border-zinc-900">
                  <TableCell>
                    <div className="text-white text-sm">{profile?.full_name ?? "Unknown user"}</div>
                    <div className="text-xs text-zinc-500">{profile?.email ?? row.user_id}</div>
                  </TableCell>
                  <TableCell className="text-zinc-300">{row.account_id ?? "-"}</TableCell>
                  <TableCell className="text-zinc-300">{amount}</TableCell>
                  <TableCell className="text-zinc-300">{row.status}</TableCell>
                  <TableCell className="text-zinc-300">{formatDateTime(row.requested_at)}</TableCell>
                  <TableCell className="text-zinc-300">{formatDateTime(row.updated_at)}</TableCell>
                  <TableCell className="text-right">
                    <PayoutActions payoutId={row.id} currentStatus={row.status} />
                  </TableCell>
                </TableRow>
              );
            })}
            {!payouts.length && (
              <TableRow className="border-zinc-900">
                <TableCell className="text-zinc-400" colSpan={7}>
                  No payout requests yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
