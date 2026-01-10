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

export async function listTraderAccounts(user: SupabaseUserIdentity): Promise<VolumetricaAccountRow[]> {
  const supabase = createSupabaseAdminClient();

  const ors: string[] = [`user_id.eq.${user.id}`, `raw->user->>extEntityId.eq.${user.id}`];
  if (allowEmailMatch() && user.email) {
    ors.push(`raw->user->>email.eq.${user.email}`);
  }

  const { data, error } = await supabase
    .from("volumetrica_accounts")
    .select(
      "account_id,user_id,status,trading_permission,enabled,reason,end_date,rule_id,rule_name,snapshot,raw,updated_at,is_hidden,is_test,is_deleted,deleted_at",
    )
    .eq("is_deleted", false)
    .eq("is_hidden", false)
    .eq("is_test", false)
    .or(ors.join(","))
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as VolumetricaAccountRow[];
}

export async function getTraderAccountById(
  user: SupabaseUserIdentity,
  accountId: string,
): Promise<VolumetricaAccountRow | null> {
  const supabase = createSupabaseAdminClient();

  const ors: string[] = [`user_id.eq.${user.id}`, `raw->user->>extEntityId.eq.${user.id}`];
  if (allowEmailMatch() && user.email) {
    ors.push(`raw->user->>email.eq.${user.email}`);
  }

  const { data, error } = await supabase
    .from("volumetrica_accounts")
    .select(
      "account_id,user_id,status,trading_permission,enabled,reason,end_date,rule_id,rule_name,snapshot,raw,updated_at,is_hidden,is_test,is_deleted,deleted_at",
    )
    .eq("account_id", accountId)
    .eq("is_deleted", false)
    .eq("is_hidden", false)
    .eq("is_test", false)
    .or(ors.join(","))
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as VolumetricaAccountRow | null;
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
