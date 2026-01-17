import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type SupabaseUserIdentity = {
  id: string;
  email: string | null;
};

export type VolumetricaAccountRow = {
  account_id: string;
  user_id: string | null;
  account_family_id: string | null;
  owner_organization_user_id: string | null;
  status: string | null;
  trading_permission: string | null;
  enabled: boolean | null;
  reason: string | null;
  end_date: string | null;
  rule_id: string | null;
  rule_name: string | null;
  snapshot: Record<string, unknown> | null;
  raw: Record<string, unknown> | null;
  updated_at: string;
  is_hidden: boolean;
  is_test: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
};

export type VolumetricaSubscriptionRow = {
  subscription_id: string;
  user_id: string | null;
  status: string | null;
  provider_status: string | null;
  activation: string | null;
  expiration: string | null;
  dx_data_products: unknown;
  dx_agreement_signed: boolean | null;
  dx_agreement_link: string | null;
  dx_self_certification: string | null;
  platform: string | null;
  volumetrica_platform: string | null;
  volumetrica_license: string | null;
  volumetrica_download_link: string | null;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
};

export type VolumetricaPositionRow = {
  position_key: string;
  account_id: string | null;
  position_id: number | null;
  contract_id: number | null;
  symbol_name: string | null;
  entry_date_utc: string | null;
  price: number | null;
  quantity: number | null;
  daily_pl: number | null;
  open_pl: number | null;
  updated_at: string;
};

export type VolumetricaTradeRow = {
  trade_key: string;
  trade_id: number | null;
  account_id: string | null;
  contract_id: number | null;
  symbol_name: string | null;
  entry_date: string | null;
  exit_date: string | null;
  quantity: number | null;
  open_price: number | null;
  close_price: number | null;
  pl: number | null;
  converted_pl: number | null;
  commission_paid: number | null;
  updated_at: string;
};

export type VolumetricaEventRow = {
  event_id: string;
  category: string | null;
  event: string | null;
  account_id: string | null;
  user_id: string | null;
  received_at: string;
};

export async function getAuthenticatedSupabaseUser(): Promise<SupabaseUserIdentity | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? null };
}

const allowEmailMatch = () => process.env.VOLUMETRICA_ALLOW_EMAIL_MATCH === "true";

const addFilter = (filters: Set<string>, value: string | null) => {
  if (value) {
    filters.add(value);
  }
};

const readString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const readRuleNameFromRaw = (raw: Record<string, unknown> | null) => {
  if (!raw) return "";
  return (
    readString(raw.ruleName) ||
    readString(raw.rule) ||
    readString(raw.tradingRuleOrganizationReferenceId) ||
    readString(raw.referenceId)
  );
};

const isAccountLinkedToUser = (account: VolumetricaAccountRow, linkedUserIds: string[]) => {
  if (!linkedUserIds.length) return false;
  const candidateIds = new Set<string>(linkedUserIds.filter(Boolean));
  const rawRecord = account.raw && typeof account.raw === "object" ? (account.raw as Record<string, unknown>) : null;
  const rawUser = rawRecord?.user && typeof rawRecord.user === "object"
    ? (rawRecord.user as Record<string, unknown>)
    : null;

  const matchesId = (value: unknown) => {
    const id = readString(value);
    return id && candidateIds.has(id);
  };

  return (
    matchesId(account.user_id) ||
    matchesId(account.owner_organization_user_id) ||
    matchesId(rawUser?.userId) ||
    matchesId(rawRecord?.userId) ||
    matchesId(rawUser?.externalId) ||
    matchesId(rawRecord?.externalId)
  );
};

const hydrateRuleNames = async (
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  accounts: VolumetricaAccountRow[],
) => {
  const missingRuleIds = new Set<string>();
  const missingReferenceIds = new Set<string>();

  accounts.forEach((account) => {
    if (account.rule_name) return;
    const rawRecord = account.raw && typeof account.raw === "object" ? (account.raw as Record<string, unknown>) : null;
    const rawRuleName = readRuleNameFromRaw(rawRecord);
    if (rawRuleName) {
      account.rule_name = rawRuleName;
      return;
    }
    if (account.rule_id) {
      missingRuleIds.add(account.rule_id);
    }
    const referenceId = readString(rawRecord?.tradingRuleOrganizationReferenceId);
    if (referenceId) {
      missingReferenceIds.add(referenceId);
    }
  });

  if (missingRuleIds.size) {
    const { data } = await supabase
      .from("volumetrica_rules")
      .select("rule_id, rule_name, reference_id")
      .in("rule_id", Array.from(missingRuleIds));

    const rules = (data ?? []) as {
      rule_id?: string | null;
      rule_name?: string | null;
      reference_id?: string | null;
    }[];
    const map = new Map<string, string>();
    rules.forEach((row) => {
      const key = readString(row.rule_id);
      const value = readString(row.rule_name) || readString(row.reference_id);
      if (key && value) {
        map.set(key, value);
      }
    });

    accounts.forEach((account) => {
      if (!account.rule_name && account.rule_id) {
        const resolved = map.get(account.rule_id);
        if (resolved) {
          account.rule_name = resolved;
        }
      }
    });
  }

  if (missingReferenceIds.size) {
    const { data } = await supabase
      .from("volumetrica_rules")
      .select("reference_id, rule_name")
      .in("reference_id", Array.from(missingReferenceIds));

    const rules = (data ?? []) as {
      reference_id?: string | null;
      rule_name?: string | null;
    }[];
    const map = new Map<string, string>();
    rules.forEach((row) => {
      const key = readString(row.reference_id);
      const value = readString(row.rule_name) || readString(row.reference_id);
      if (key && value) {
        map.set(key, value);
      }
    });

    accounts.forEach((account) => {
      if (!account.rule_name) {
        const rawRecord =
          account.raw && typeof account.raw === "object" ? (account.raw as Record<string, unknown>) : null;
        const referenceId = readString(rawRecord?.tradingRuleOrganizationReferenceId);
        const resolved = referenceId ? map.get(referenceId) : null;
        if (resolved) {
          account.rule_name = resolved;
        }
      }
    });
  }

  return accounts;
};

const uniqueStrings = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const getLinkedVolumetricaUserIds = async (
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  user: SupabaseUserIdentity,
) => {
  const filters = [`external_id.eq.${user.id}`];
  if (allowEmailMatch() && user.email) {
    filters.push(`external_id.eq.${user.email}`);
    filters.push(`raw->>email.eq.${user.email}`);
  }

  const { data: linkedUsers, error } = await supabase
    .from("volumetrica_users")
    .select("volumetrica_user_id, external_id, raw")
    .or(filters.join(","));

  if (error) {
    throw new Error(error.message);
  }

  const ids =
    (linkedUsers as { volumetrica_user_id?: string | null }[] | null)
      ?.map((row) => readString(row?.volumetrica_user_id))
      .filter(Boolean) ?? [];
  return uniqueStrings(ids);
};

const buildAccountOrFilters = (linkedUserIds: string[]) => {
  const filters = new Set<string>();

  const addUserFilters = (id: string) => {
    addFilter(filters, `user_id.eq.${id}`);
    addFilter(filters, `owner_organization_user_id.eq.${id}`);
    addFilter(filters, `raw->user->>userId.eq.${id}`);
    addFilter(filters, `raw->>userId.eq.${id}`);
    addFilter(filters, `raw->user->>externalId.eq.${id}`);
    addFilter(filters, `raw->>externalId.eq.${id}`);
  };

  linkedUserIds.forEach((id) => addUserFilters(id));

  return Array.from(filters);
};

const addIdentifier = (ids: Set<string>, value: unknown) => {
  const normalized = readString(value);
  if (normalized) {
    ids.add(normalized);
  }
};

export const getAccountIdentifiers = (
  account: Pick<VolumetricaAccountRow, "account_id" | "raw" | "snapshot">,
) => {
  const ids = new Set<string>();
  addIdentifier(ids, account.account_id);

  const rawRecord = account.raw && typeof account.raw === "object" ? (account.raw as Record<string, unknown>) : {};
  addIdentifier(ids, rawRecord.id);
  addIdentifier(ids, rawRecord.accountId);
  addIdentifier(ids, rawRecord.accountHeader);
  addIdentifier(ids, rawRecord.header);
  addIdentifier(ids, rawRecord.accountNumber);
  addIdentifier(ids, rawRecord.tradingAccountId);

  const snapshotRecord =
    account.snapshot && typeof account.snapshot === "object" ? (account.snapshot as Record<string, unknown>) : {};
  addIdentifier(ids, snapshotRecord.accountId);
  addIdentifier(ids, snapshotRecord.accountHeader);
  addIdentifier(ids, snapshotRecord.header);

  return Array.from(ids);
};

export async function listTraderAccounts(user: SupabaseUserIdentity): Promise<VolumetricaAccountRow[]> {
  const supabase = createSupabaseAdminClient();
  const linkedUserIds = await getLinkedVolumetricaUserIds(supabase, user);
  if (!linkedUserIds.length) {
    console.warn("volumetrica.accounts.list.empty-link", {
      source: "listTraderAccounts",
      user_id: user.id,
      email: user.email ?? null,
      volumetrica_user_ref: [],
    });
    return [];
  }
  const ors = buildAccountOrFilters(linkedUserIds);

  const { data, error } = await supabase
    .from("volumetrica_accounts")
    .select(
      "account_id,user_id,account_family_id,owner_organization_user_id,status,trading_permission,enabled,reason,end_date,rule_id,rule_name,snapshot,raw,updated_at,is_hidden,is_test,is_deleted,deleted_at",
    )
    .eq("is_deleted", false)
    .or(ors.join(","))
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const accounts = (data ?? []) as VolumetricaAccountRow[];
  const filtered = accounts.filter((account) => isAccountLinkedToUser(account, linkedUserIds));
  await hydrateRuleNames(supabase, filtered);
  console.info("volumetrica.accounts.list", {
    source: "listTraderAccounts",
    user_id: user.id,
    email: user.email ?? null,
    volumetrica_user_ref: linkedUserIds,
    account_ref: filtered.map((account) => account.account_id),
  });
  return filtered;
}

export async function getTraderAccountById(
  user: SupabaseUserIdentity,
  accountId: string,
): Promise<VolumetricaAccountRow | null> {
  const normalizedRoute = accountId.toLowerCase().trim();
  if (!normalizedRoute) return null;

  const account = await getAccountById(accountId);
  if (!account) return null;

  const supabase = createSupabaseAdminClient();
  const linkedUserIds = await getLinkedVolumetricaUserIds(supabase, user);
  if (!isAccountLinkedToUser(account, linkedUserIds)) {
    console.warn("volumetrica.accounts.detail.denied", {
      source: "getTraderAccountById",
      user_id: user.id,
      email: user.email ?? null,
      volumetrica_user_ref: linkedUserIds,
      account_ref: accountId,
    });
    return null;
  }

  await hydrateRuleNames(supabase, [account]);
  console.info("volumetrica.accounts.detail", {
    source: "getTraderAccountById",
    user_id: user.id,
    email: user.email ?? null,
    volumetrica_user_ref: linkedUserIds,
    account_ref: account.account_id,
  });
  return account;
}

export async function getAccountById(accountId: string): Promise<VolumetricaAccountRow | null> {
  const normalized = accountId.trim();
  if (!normalized) return null;
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("volumetrica_accounts")
    .select(
      "account_id,user_id,account_family_id,owner_organization_user_id,status,trading_permission,enabled,reason,end_date,rule_id,rule_name,snapshot,raw,updated_at,is_hidden,is_test,is_deleted,deleted_at",
    )
    .eq("is_deleted", false)
    .or(
      [
        `account_id.eq.${normalized}`,
        `raw->>id.eq.${normalized}`,
        `raw->>accountId.eq.${normalized}`,
        `raw->>accountHeader.eq.${normalized}`,
        `raw->>header.eq.${normalized}`,
        `raw->>accountNumber.eq.${normalized}`,
        `raw->>tradingAccountId.eq.${normalized}`,
        `snapshot->>accountId.eq.${normalized}`,
        `snapshot->>accountHeader.eq.${normalized}`,
        `snapshot->>header.eq.${normalized}`,
        `snapshot->>accountNumber.eq.${normalized}`,
      ].join(","),
    )
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const account = (data ?? null) as VolumetricaAccountRow | null;
  if (account) {
    await hydrateRuleNames(supabase, [account]);
  }
  return account;
}

export async function listPositionsByAccountIds(accountIds: string[]): Promise<VolumetricaPositionRow[]> {
  if (!accountIds.length) return [];
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("volumetrica_positions")
    .select(
      "position_key,account_id,position_id,contract_id,symbol_name,entry_date_utc,price,quantity,daily_pl,open_pl,updated_at",
    )
    .in("account_id", accountIds)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as VolumetricaPositionRow[];
}

export async function listTradesByAccountIds(
  accountIds: string[],
  options?: { startDateUtc?: string; limit?: number },
): Promise<VolumetricaTradeRow[]> {
  if (!accountIds.length) return [];
  const supabase = createSupabaseAdminClient();
  const limit = options?.limit ?? 200;

  let query = supabase
    .from("volumetrica_trades")
    .select(
      "trade_key,trade_id,account_id,contract_id,symbol_name,entry_date,exit_date,quantity,open_price,close_price,pl,converted_pl,commission_paid,updated_at",
    )
    .in("account_id", accountIds)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (options?.startDateUtc) {
    query = query.gte("exit_date", options.startDateUtc);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as VolumetricaTradeRow[];
}

export async function listSubscriptionsByUserIds(userIds: string[]): Promise<VolumetricaSubscriptionRow[]> {
  if (!userIds.length) return [];
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("volumetrica_subscriptions")
    .select(
      "subscription_id,user_id,status,provider_status,activation,expiration,dx_data_products,dx_agreement_signed,dx_agreement_link,dx_self_certification,platform,volumetrica_platform,volumetrica_license,volumetrica_download_link,updated_at,is_deleted,deleted_at",
    )
    .in("user_id", userIds)
    .eq("is_deleted", false)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as VolumetricaSubscriptionRow[];
}

export async function listRecentEventsByAccountIds(
  accountIds: string[],
  options?: { limit?: number },
): Promise<VolumetricaEventRow[]> {
  if (!accountIds.length) return [];
  const supabase = createSupabaseAdminClient();
  const limit = options?.limit ?? 12;

  const { data, error } = await supabase
    .from("volumetrica_events")
    .select("event_id,category,event,account_id,user_id,received_at")
    .in("account_id", accountIds)
    .order("received_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as VolumetricaEventRow[];
}

type TradeNetPnlInput = {
  pl: number | null;
  commission_paid: number | null;
};

export function computeTradeNetPnl(trade: TradeNetPnlInput) {
  const pl = typeof trade.pl === "number" ? trade.pl : 0;
  const commission = typeof trade.commission_paid === "number" ? trade.commission_paid : 0;
  return pl - commission;
}

export function getSnapshotNumber(snapshot: Record<string, unknown> | null, key: string) {
  const value = snapshot?.[key];
  return typeof value === "number" ? value : null;
}
