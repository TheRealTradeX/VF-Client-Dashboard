import { KycCaseActions } from "@/components/admin/KycCaseActions";
import { KycCaseForm } from "@/components/admin/KycCaseForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/time";

type KycCaseRow = {
  id: string;
  user_id: string;
  status: string;
  notes: string | null;
  requested_at: string;
  updated_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
};

export default async function AdminVerificationsPage() {
  const supabase = createSupabaseAdminClient();
  const { data: casesData } = await supabase
    .from("kyc_cases")
    .select("id,user_id,status,notes,requested_at,updated_at")
    .order("updated_at", { ascending: false })
    .limit(200);

  const cases = (casesData as KycCaseRow[] | null) ?? [];
  const userIds = cases.map((row) => row.user_id);

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
        <h1 className="text-white text-2xl mb-1">Verifications</h1>
        <p className="text-zinc-400">Review KYC submissions and identity checks.</p>
      </div>

      <KycCaseForm />

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-900">
              <TableHead className="text-zinc-400">User</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Requested</TableHead>
              <TableHead className="text-zinc-400">Updated</TableHead>
              <TableHead className="text-zinc-400 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((row) => {
              const profile = profileMap.get(row.user_id);
              return (
                <TableRow key={row.id} className="border-zinc-900">
                  <TableCell>
                    <div className="text-white text-sm">{profile?.full_name ?? "Unknown user"}</div>
                    <div className="text-xs text-zinc-500">{profile?.email ?? row.user_id}</div>
                  </TableCell>
                  <TableCell className="text-zinc-300">{row.status}</TableCell>
                  <TableCell className="text-zinc-300">{formatDateTime(row.requested_at)}</TableCell>
                  <TableCell className="text-zinc-300">{formatDateTime(row.updated_at)}</TableCell>
                  <TableCell className="text-right">
                    <KycCaseActions caseId={row.id} currentStatus={row.status} currentNotes={row.notes} />
                  </TableCell>
                </TableRow>
              );
            })}
            {!cases.length && (
              <TableRow className="border-zinc-900">
                <TableCell className="text-zinc-400" colSpan={5}>
                  No KYC cases yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
