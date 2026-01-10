import Link from "next/link";
import { AccountBulkCreateForm, AccountCreateForm, AccountRowActions } from "@/components/admin/AccountActions";
import { UserDetailForm } from "@/components/admin/UserDetailForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/time";
import {
  resolveAccountHeader,
  resolveBalance,
  resolveCreatedAt,
  resolveMode,
  resolvePermission,
  resolveStatus,
} from "@/lib/volumetrica/admin-format";

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
  raw: Record<string, unknown> | null;
  updated_at: string;
};

type AccountRow = {
  account_id: string;
  user_id: string | null;
  status: string | null;
  trading_permission: string | null;
  enabled: boolean | null;
  rule_id: string | null;
  rule_name: string | null;
  snapshot: Record<string, unknown> | null;
  raw: Record<string, unknown> | null;
  updated_at: string;
};

type RuleRow = {
  rule_id: string;
  rule_name: string | null;
  reference_id: string | null;
  is_active: boolean;
};

const readString = (value: unknown) => (typeof value === "string" ? value : "");

const readNumber = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const splitName = (fullName: string | null) => {
  if (!fullName) return { first: "", last: "" };
  const parts = fullName.trim().split(/\s+/);
  if (!parts.length) return { first: "", last: "" };
  const [first, ...rest] = parts;
  return { first, last: rest.join(" ") };
};

export default async function AdminUserDetailPage({ params }: { params: { userId: string } }) {
  const userId = params.userId;
  const supabase = createSupabaseAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", userId)
    .maybeSingle();

  const { data: volumetricaUser } = await supabase
    .from("volumetrica_users")
    .select("volumetrica_user_id, status, external_id, invite_url, raw, updated_at")
    .or(`external_id.eq.${userId},volumetrica_user_id.eq.${userId}`)
    .maybeSingle();

  const platformUserId = (volumetricaUser as VolumetricaUserRow | null)?.volumetrica_user_id ?? null;

  const ors = [
    platformUserId ? `user_id.eq.${platformUserId}` : null,
    `raw->user->>extEntityId.eq.${userId}`,
    profile?.email ? `raw->user->>email.eq.${profile.email}` : null,
  ]
    .filter(Boolean)
    .join(",");

  const { data: accountsData } = ors
    ? await supabase
        .from("volumetrica_accounts")
        .select(
          "account_id,user_id,status,trading_permission,enabled,rule_id,rule_name,snapshot,raw,updated_at",
        )
        .or(ors)
        .order("updated_at", { ascending: false })
    : { data: [] as AccountRow[] | null };

  const { data: rulesData } = await supabase
    .from("volumetrica_rules")
    .select("rule_id,rule_name,reference_id,is_active")
    .order("rule_name", { ascending: true });

  const rules = (rulesData as RuleRow[] | null)?.filter((rule) => rule.is_active) ?? [];
  const ruleMap = new Map<string, RuleRow>();
  const ruleRefMap = new Map<string, RuleRow>();
  rules.forEach((rule) => {
    ruleMap.set(rule.rule_id, rule);
    if (rule.reference_id) {
      ruleRefMap.set(rule.reference_id, rule);
    }
    if (rule.rule_name) {
      ruleRefMap.set(rule.rule_name, rule);
    }
  });

  const rawUser = ((volumetricaUser as VolumetricaUserRow | null)?.raw ?? {}) as Record<
    string,
    unknown
  >;
  const fallbackName = splitName((profile as ProfileRow | null)?.full_name ?? null);
  const firstName = readString(rawUser.firstName) || fallbackName.first;
  const lastName = readString(rawUser.lastName) || fallbackName.last;
  const email = readString(rawUser.email) || readString((profile as ProfileRow | null)?.email);
  const country = readString(rawUser.country);
  const username = readString(rawUser.username);
  const mobilePhone = readString(rawUser.mobilePhone);
  const language = readString(rawUser.language);
  const userType = readNumber(rawUser.userType);
  const systemAccess = readNumber(rawUser.systemAccess);
  const role = readString((profile as ProfileRow | null)?.role) || "trader";

  const userReference = platformUserId ?? userId;

  const accounts = (accountsData as AccountRow[] | null) ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs text-zinc-500 mb-2">
            <Link href="/admin/users" className="hover:text-white">
              Users
            </Link>
            <span className="mx-2">/</span>
            <span className="text-zinc-300">{profile?.full_name ?? profile?.email ?? userId}</span>
          </div>
          <h1 className="text-white text-2xl mb-1">User Details</h1>
          <p className="text-zinc-400">Review accounts and manage access for this user.</p>
        </div>
        <div className="text-xs text-zinc-500">
          Platform updated {formatDateTime((volumetricaUser as VolumetricaUserRow | null)?.updated_at ?? null)}
        </div>
      </div>

      <UserDetailForm
        userId={userId}
        initial={{
          email,
          firstName,
          lastName,
          country,
          username,
          mobilePhone,
          language,
          role,
          userType,
          systemAccess,
          platformUserId,
          platformStatus: (volumetricaUser as VolumetricaUserRow | null)?.status ?? null,
          inviteUrl: (volumetricaUser as VolumetricaUserRow | null)?.invite_url ?? null,
        }}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AccountCreateForm rules={rules} defaultUserId={userReference} lockUserId />
        <AccountBulkCreateForm rules={rules} defaultUserId={userReference} lockUserId />
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-900">
              <TableHead className="text-zinc-400">Account</TableHead>
              <TableHead className="text-zinc-400">Mode</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Permission</TableHead>
              <TableHead className="text-zinc-400">Balance</TableHead>
              <TableHead className="text-zinc-400">Rule</TableHead>
              <TableHead className="text-zinc-400">Enabled</TableHead>
              <TableHead className="text-zinc-400">Created</TableHead>
              <TableHead className="text-zinc-400 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => {
              const rule =
                (account.rule_id ? ruleMap.get(account.rule_id) : null) ??
                (account.rule_name ? ruleRefMap.get(account.rule_name) : null) ??
                null;
              const ruleLabel =
                account.rule_name ??
                rule?.rule_name ??
                rule?.reference_id ??
                account.rule_id ??
                "-";

              return (
                <TableRow key={account.account_id} className="border-zinc-900">
                  <TableCell>
                    <div className="text-white text-sm">{resolveAccountHeader(account)}</div>
                    <div className="text-xs text-zinc-500">{account.account_id}</div>
                  </TableCell>
                  <TableCell className="text-zinc-300">{resolveMode(account)}</TableCell>
                  <TableCell className="text-zinc-300">{resolveStatus(account.status)}</TableCell>
                  <TableCell className="text-zinc-300">
                    {resolvePermission(account.trading_permission)}
                  </TableCell>
                  <TableCell className="text-zinc-300">{resolveBalance(account.snapshot)}</TableCell>
                  <TableCell className="text-zinc-300">{ruleLabel}</TableCell>
                  <TableCell className="text-zinc-300">
                    {account.enabled === null ? "-" : account.enabled ? "Enabled" : "Disabled"}
                  </TableCell>
                  <TableCell className="text-zinc-300">{resolveCreatedAt(account)}</TableCell>
                  <TableCell className="text-right">
                    <AccountRowActions accountId={account.account_id} />
                  </TableCell>
                </TableRow>
              );
            })}
            {!accounts.length && (
              <TableRow className="border-zinc-900">
                <TableCell className="text-zinc-400" colSpan={9}>
                  No trading accounts found for this user yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
