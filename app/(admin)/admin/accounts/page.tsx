import Link from "next/link";
import { Filter, Search } from "lucide-react";
import { AccountCreateForm, AccountRowActions } from "@/components/admin/AccountActions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getUserDetailsFromAccountRaw,
  getUserDetailsFromUserRaw,
  resolveAccountHeader,
  resolveBalance,
  resolveCreatedAt,
  resolveMode,
  resolvePermission,
  resolveStatus,
} from "@/lib/volumetrica/admin-format";

type AccountRow = {
  account_id: string;
  user_id: string | null;
  status: string | null;
  trading_permission: string | null;
  enabled: boolean | null;
  rule_id: string | null;
  rule_name: string | null;
  account_family_id: string | null;
  is_hidden: boolean;
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

type UserRow = {
  volumetrica_user_id: string;
  external_id: string | null;
  raw: Record<string, unknown> | null;
};

const normalizeQuery = (value: string | string[] | undefined) =>
  typeof value === "string" ? value.trim() : "";

export default async function AdminAccountsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const supabase = createSupabaseAdminClient();
  const { data: accountsData, error } = await supabase
    .from("volumetrica_accounts")
    .select(
      "account_id,user_id,status,trading_permission,enabled,rule_id,rule_name,account_family_id,is_hidden,snapshot,raw,updated_at",
    )
    .order("updated_at", { ascending: false })
    .limit(100);

  const { data: rulesData } = await supabase
    .from("volumetrica_rules")
    .select("rule_id,rule_name,reference_id,is_active")
    .order("rule_name", { ascending: true });

  const { data: usersData } = await supabase
    .from("volumetrica_users")
    .select("volumetrica_user_id,external_id,raw");

  const rows = (accountsData as AccountRow[] | null) ?? [];
  const rules = (rulesData as RuleRow[] | null)?.filter((rule) => rule.is_active) ?? [];

  const userMap = new Map<string, UserRow>();
  (usersData as UserRow[] | null)?.forEach((user) => {
    userMap.set(user.volumetrica_user_id, user);
  });

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

  const query = normalizeQuery(searchParams?.q);
  const selectedMode = normalizeQuery(searchParams?.mode) || "all";
  const selectedFamily = normalizeQuery(searchParams?.family) || "all";
  const selectedUniverse = normalizeQuery(searchParams?.universe) || "all";
  const selectedRule = normalizeQuery(searchParams?.rule) || "all";
  const selectedStatus = normalizeQuery(searchParams?.status) || "all";
  const selectedPermission = normalizeQuery(searchParams?.permission) || "all";
  const perPage = Math.max(10, Number.parseInt(normalizeQuery(searchParams?.perPage) || "10", 10));
  const page = Math.max(1, Number.parseInt(normalizeQuery(searchParams?.page) || "1", 10));

  const accountsView = rows.map((account) => {
    const rawUser = getUserDetailsFromAccountRaw(account.raw);
    const mappedUser = account.user_id ? getUserDetailsFromUserRaw(userMap.get(account.user_id)?.raw ?? null) : null;
    const displayName = rawUser?.name ?? mappedUser?.name ?? account.user_id ?? "Unassigned";
    const displayEmail = rawUser?.email ?? mappedUser?.email ?? "-";
    const ruleRow =
      (account.rule_id ? ruleMap.get(account.rule_id) : null) ??
      (account.rule_name ? ruleRefMap.get(account.rule_name) : null) ??
      null;
    const ruleLabel =
      account.rule_name ??
      ruleRow?.rule_name ??
      ruleRow?.reference_id ??
      account.rule_id ??
      "-";
    const modeLabel = resolveMode(account);
    const statusLabel = resolveStatus(account.status);
    const permissionLabel = resolvePermission(account.trading_permission);
    const balance = resolveBalance(account.snapshot);
    const createdAt = resolveCreatedAt(account);
    const header = resolveAccountHeader(account);
    const universe =
      (typeof account.raw?.["groupUniverseId"] === "string" && account.raw?.["groupUniverseId"]) ||
      (typeof account.raw?.["groupUniverseReference"] === "string" && account.raw?.["groupUniverseReference"]) ||
      "-";

    return {
      account,
      header,
      displayName,
      displayEmail,
      ruleLabel,
      modeLabel,
      statusLabel,
      permissionLabel,
      balance,
      createdAt,
      family: account.account_family_id ?? "-",
      universe,
      isHidden: account.is_hidden,
    };
  });

  const filtered = accountsView.filter((row) => {
    if (selectedMode !== "all" && row.modeLabel !== selectedMode) return false;
    if (selectedFamily !== "all" && row.family !== selectedFamily) return false;
    if (selectedUniverse !== "all" && row.universe !== selectedUniverse) return false;
    if (selectedRule !== "all" && row.ruleLabel !== selectedRule && row.account.rule_id !== selectedRule) return false;
    if (selectedStatus !== "all" && row.statusLabel !== selectedStatus) return false;
    if (selectedPermission !== "all" && row.permissionLabel !== selectedPermission) return false;
    if (query) {
      const haystack = [
        row.header,
        row.account.account_id,
        row.displayName,
        row.displayEmail,
        row.account.user_id ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query.toLowerCase())) return false;
    }
    return true;
  });

  const uniqueValues = (values: string[]) => Array.from(new Set(values.filter((value) => value && value !== "-")));

  const modeOptions = uniqueValues(accountsView.map((row) => row.modeLabel));
  const familyOptions = uniqueValues(accountsView.map((row) => row.family));
  const universeOptions = uniqueValues(accountsView.map((row) => row.universe));
  const statusOptions = uniqueValues(accountsView.map((row) => row.statusLabel));
  const permissionOptions = uniqueValues(accountsView.map((row) => row.permissionLabel));
  const ruleOptions = uniqueValues(
    rules
      .map((rule) => rule.rule_name ?? rule.reference_id ?? rule.rule_id)
      .concat(accountsView.map((row) => row.ruleLabel)),
  );

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, total);
  const paged = filtered.slice(startIndex, endIndex);

  const buildPageLink = (nextPage: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedMode !== "all") params.set("mode", selectedMode);
    if (selectedFamily !== "all") params.set("family", selectedFamily);
    if (selectedUniverse !== "all") params.set("universe", selectedUniverse);
    if (selectedRule !== "all") params.set("rule", selectedRule);
    if (selectedStatus !== "all") params.set("status", selectedStatus);
    if (selectedPermission !== "all") params.set("permission", selectedPermission);
    if (perPage !== 10) params.set("perPage", String(perPage));
    params.set("page", String(nextPage));
    return `/admin/accounts?${params.toString()}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <div>
          <h1 className="text-white text-2xl mb-1">Account Lists</h1>
          <p className="text-zinc-400">Search, filter, and manage all trading accounts.</p>
        </div>
      </div>

      <AccountCreateForm rules={rules} />

      <form id="account-filters" className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Filter className="w-4 h-4" />
            Filters
          </div>
          <select
            name="mode"
            defaultValue={selectedMode}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
          >
            <option value="all">Mode: All</option>
            {modeOptions.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
          <select
            name="family"
            defaultValue={selectedFamily}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
          >
            <option value="all">Family: All</option>
            {familyOptions.map((family) => (
              <option key={family} value={family}>
                {family}
              </option>
            ))}
          </select>
          <select
            name="universe"
            defaultValue={selectedUniverse}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
          >
            <option value="all">Universe: All</option>
            {universeOptions.map((universe) => (
              <option key={universe} value={universe}>
                {universe}
              </option>
            ))}
          </select>
          <select
            name="rule"
            defaultValue={selectedRule}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
          >
            <option value="all">Rule: All</option>
            {ruleOptions.map((rule) => (
              <option key={rule} value={rule}>
                {rule}
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={selectedStatus}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
          >
            <option value="all">Status: All</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            name="permission"
            defaultValue={selectedPermission}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
          >
            <option value="all">Permission: All</option>
            {permissionOptions.map((permission) => (
              <option key={permission} value={permission}>
                {permission}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-3 py-2 text-sm text-white bg-zinc-900 border border-zinc-800 rounded-lg hover:border-blue-500/50"
          >
            Apply
          </button>
          <a href="/admin/accounts" className="px-3 py-2 text-sm text-zinc-500 hover:text-white">
            Clear Filters
          </a>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search accounts or users"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 text-sm text-white bg-blue-500/20 border border-blue-500/40 rounded-lg hover:bg-blue-500/30"
          >
            Search
          </button>
        </div>
      </form>

      <div className="flex items-center justify-between text-xs text-zinc-500">
        <div>
          Showing {total ? startIndex + 1 : 0} to {endIndex} of {total} entries
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-400">Entries per page</label>
          <select
            name="perPage"
            form="account-filters"
            defaultValue={String(perPage)}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-white"
          >
            {[10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-900">
              <TableHead className="text-zinc-400">Account</TableHead>
              <TableHead className="text-zinc-400">User</TableHead>
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
            {paged.map((row) => {
              return (
                <TableRow key={row.account.account_id} className="border-zinc-900">
                  <TableCell>
                    <div className="text-white text-sm">{row.header}</div>
                    <div className="text-xs text-zinc-500">{row.account.account_id}</div>
                    {row.isHidden ? (
                      <div className="text-[11px] text-amber-400">Hidden from leaderboard</div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <div className="text-white text-sm">{row.displayName}</div>
                    <div className="text-xs text-zinc-500">{row.displayEmail}</div>
                  </TableCell>
                  <TableCell className="text-zinc-300">{row.modeLabel}</TableCell>
                  <TableCell className="text-zinc-300">{row.statusLabel}</TableCell>
                  <TableCell className="text-zinc-300">{row.permissionLabel}</TableCell>
                  <TableCell className="text-zinc-300">{row.balance}</TableCell>
                  <TableCell className="text-zinc-300">{row.ruleLabel}</TableCell>
                  <TableCell className="text-zinc-300">
                    {row.account.enabled === null ? "-" : row.account.enabled ? "Enabled" : "Disabled"}
                  </TableCell>
                  <TableCell className="text-zinc-300">{row.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <AccountRowActions accountId={row.account.account_id} isHidden={row.isHidden} />
                  </TableCell>
                </TableRow>
              );
            })}
            {!paged.length && (
              <TableRow className="border-zinc-900">
                <TableCell className="text-zinc-400" colSpan={10}>
                  {error ? "Unable to load accounts. Check your data connection." : "No accounts found yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2 text-sm text-zinc-400">
        <Link
          href={buildPageLink(Math.max(1, currentPage - 1))}
          className={`px-3 py-1 rounded-lg border border-zinc-800 ${
            currentPage === 1 ? "opacity-50 pointer-events-none" : "hover:border-blue-500/50"
          }`}
        >
          Prev
        </Link>
        <div className="px-3 py-1 rounded-lg border border-zinc-800 text-white">
          {currentPage}
        </div>
        <Link
          href={buildPageLink(Math.min(totalPages, currentPage + 1))}
          className={`px-3 py-1 rounded-lg border border-zinc-800 ${
            currentPage === totalPages ? "opacity-50 pointer-events-none" : "hover:border-blue-500/50"
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
