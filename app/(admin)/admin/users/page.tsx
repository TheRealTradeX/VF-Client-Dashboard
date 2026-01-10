import Link from "next/link";
import { UserProvisionForm } from "@/components/admin/UserProvisionForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/time";

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
};

type VolumetricaUserRow = {
  volumetrica_user_id: string;
  status: string | null;
  external_id: string | null;
  invite_url: string | null;
  updated_at: string;
};


export default async function AdminUsersPage() {
  const supabase = createSupabaseAdminClient();
  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .order("email", { ascending: true })
    .limit(200);

  const { data: volumetricaData } = await supabase
    .from("volumetrica_users")
    .select("volumetrica_user_id, status, external_id, invite_url, updated_at")
    .limit(200);

  const volumetricaByExternal = new Map<string, VolumetricaUserRow>();
  (volumetricaData as VolumetricaUserRow[] | null)?.forEach((row) => {
    if (row.external_id) {
      volumetricaByExternal.set(row.external_id, row);
    }
  });

  const rows = (profilesData as ProfileRow[] | null) ?? [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white text-2xl mb-1">Users</h1>
        <p className="text-zinc-400">Provision users and sync with the trading platform.</p>
      </div>

      <UserProvisionForm />

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-900">
              <TableHead className="text-zinc-400">User</TableHead>
              <TableHead className="text-zinc-400">Role</TableHead>
              <TableHead className="text-zinc-400">Trading Platform</TableHead>
              <TableHead className="text-zinc-400">Updated</TableHead>
              <TableHead className="text-zinc-400 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((user) => {
              const linked = volumetricaByExternal.get(user.id);
              return (
                <TableRow key={user.id} className="border-zinc-900">
                  <TableCell>
                    <div className="text-white text-sm">{user.full_name ?? "Unnamed"}</div>
                    <div className="text-xs text-zinc-500">{user.email ?? "-"}</div>
                    <div className="text-[11px] text-zinc-600">{user.id}</div>
                  </TableCell>
                  <TableCell className="text-zinc-300">{user.role ?? "trader"}</TableCell>
                  <TableCell>
                    <div className="text-zinc-300 text-sm">
                      {linked?.volumetrica_user_id ?? "Not linked"}
                    </div>
                    <div className="text-xs text-zinc-500">{linked?.status ?? "-"}</div>
                  </TableCell>
                  <TableCell className="text-zinc-300">{formatDateTime(linked?.updated_at ?? null)}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="px-3 py-1.5 text-xs text-white border border-zinc-700 rounded-lg hover:border-blue-500/50"
                    >
                      Manage
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
            {!rows.length && (
              <TableRow className="border-zinc-900">
                <TableCell className="text-zinc-400" colSpan={5}>
                  {profilesError ? "Unable to load users." : "No users available yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
