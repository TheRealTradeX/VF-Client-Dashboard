import { createSupabaseAdminClient } from "@/lib/supabase/admin";

import { normalizeEnumValue } from "./normalize";
import type {
  OrganizationUserWebhookViewModel,
  SubscriptionViewModel,
  TradingAccountWebhookViewModel,
  TradingPositionViewModel,
  TradingTradeInfoModel,
  WebhookEventPayload,
} from "./types";

const toNullableNumber = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};
const toNullableString = (value: unknown) => (typeof value === "string" ? value : null);
const asArray = (value: unknown) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const positionKey = (position: TradingPositionViewModel, accountId?: string | null) => {
  if (position.positionId !== null && position.positionId !== undefined) {
    return `pos:${position.positionId}`;
  }
  const contractId = position.contractId ?? "unknown";
  const symbol = position.symbolName ?? "unknown";
  const entryDate = position.entryDateUtc ?? "unknown";
  return `pos:${accountId ?? "unknown"}:${contractId}:${symbol}:${entryDate}`;
};

const tradeKey = (trade: TradingTradeInfoModel, accountId?: string | null) => {
  if (trade.tradeId !== null && trade.tradeId !== undefined) {
    return `trade:${trade.tradeId}`;
  }
  const contractId = trade.contractId ?? "unknown";
  const entryDate = trade.entryDate ?? "unknown";
  const exitDate = trade.exitDate ?? "unknown";
  const qty = trade.quantity ?? "unknown";
  return `trade:${accountId ?? "unknown"}:${contractId}:${entryDate}:${exitDate}:${qty}`;
};

type ProjectionResult = {
  updates: string[];
  errors: string[];
};

export async function applyWebhookProjections(
  payload: WebhookEventPayload,
  meta: { eventId: string; receivedAt: string },
): Promise<ProjectionResult> {
  const supabase = createSupabaseAdminClient();
  const updates: string[] = [];
  const errors: string[] = [];

  const normalizedEvent = normalizeEnumValue(payload.event);
  const accountId = payload.accountId ?? payload.tradingAccount?.id ?? null;
  const userId = payload.userId ?? payload.tradingAccount?.user?.userId ?? null;

  if (accountId && userId) {
    const { data: existingAccount, error: existingError } = await supabase
      .from("volumetrica_accounts")
      .select("user_id, raw")
      .eq("account_id", accountId)
      .maybeSingle();

    if (existingError) {
      errors.push(`accounts: ${existingError.message}`);
    } else if (existingAccount && !existingAccount.user_id) {
      const rawRecord =
        existingAccount.raw && typeof existingAccount.raw === "object"
          ? { ...(existingAccount.raw as Record<string, unknown>) }
          : {};
      if (!("userId" in rawRecord)) {
        rawRecord.userId = userId;
      }
      if (!("user" in rawRecord)) {
        rawRecord.user = { userId };
      }

      const { error: linkError } = await supabase
        .from("volumetrica_accounts")
        .update({ user_id: userId, raw: rawRecord })
        .eq("account_id", accountId);
      if (linkError) {
        errors.push(`accounts: ${linkError.message}`);
      } else {
        updates.push("volumetrica_accounts");
      }
    }
  }

  if (payload.tradingAccount && (payload.tradingAccount as TradingAccountWebhookViewModel).id) {
    const account = payload.tradingAccount as TradingAccountWebhookViewModel;
    const accountRecord = {
      account_id: account.id ?? accountId,
      user_id: userId,
      status: normalizeEnumValue(account.status),
      trading_permission: normalizeEnumValue(account.tradingPermission),
      enabled: account.enabled ?? null,
      reason: account.reason ?? null,
      end_date: account.endDate ?? null,
      rule_id: account.ruleId ?? null,
      rule_name: account.ruleName ?? null,
      account_family_id: account.accountFamilyId ?? null,
      owner_organization_user_id: account.ownerOrganizationUserId ?? null,
      snapshot: account.snapshot ?? null,
      raw: account,
      last_event_id: meta.eventId,
      updated_at: meta.receivedAt,
      is_deleted: normalizedEvent === "Deleted",
      deleted_at: normalizedEvent === "Deleted" ? meta.receivedAt : null,
    };

    const { error } = await supabase
      .from("volumetrica_accounts")
      .upsert(accountRecord, { onConflict: "account_id" });
    if (error) {
      errors.push(`accounts: ${error.message}`);
    } else {
      updates.push("volumetrica_accounts");
    }
  }

  if (!payload.tradingAccount && accountId) {
    const { data: existingAccount, error: existingError } = await supabase
      .from("volumetrica_accounts")
      .select("account_id")
      .eq("account_id", accountId)
      .maybeSingle();
    if (existingError) {
      errors.push(`accounts: ${existingError.message}`);
    } else if (!existingAccount) {
      const placeholderRecord = {
        account_id: accountId,
        user_id: userId ?? null,
        raw: { accountId, userId, user: userId ? { userId } : null },
        last_event_id: meta.eventId,
        updated_at: meta.receivedAt,
        is_deleted: normalizedEvent === "Deleted",
        deleted_at: normalizedEvent === "Deleted" ? meta.receivedAt : null,
      };

      const { error } = await supabase
        .from("volumetrica_accounts")
        .insert(placeholderRecord);
      if (error) {
        errors.push(`accounts: ${error.message}`);
      } else {
        updates.push("volumetrica_accounts");
      }
    }
  }

  if (payload.subscription && (payload.subscription as SubscriptionViewModel).subscriptionId) {
    const subscription = payload.subscription as SubscriptionViewModel;
    const record = {
      subscription_id: subscription.subscriptionId ?? null,
      user_id: subscription.userId ?? userId,
      status: normalizeEnumValue(subscription.status),
      provider_status: normalizeEnumValue(subscription.providerStatus),
      activation: subscription.activation ?? null,
      expiration: subscription.expiration ?? null,
      dx_data_products: subscription.dxDataProducts ?? null,
      dx_agreement_signed: subscription.dxAgreementSigned ?? null,
      dx_agreement_link: subscription.dxAgreementLink ?? null,
      dx_self_certification: subscription.dxSelfCertification ?? null,
      platform: normalizeEnumValue(subscription.platform),
      volumetrica_platform: subscription.volumetricaPlatform ?? null,
      volumetrica_license: subscription.volumetricaLicense ?? null,
      volumetrica_download_link: subscription.volumetricaDownloadLink ?? null,
      raw: subscription,
      last_event_id: meta.eventId,
      updated_at: meta.receivedAt,
      is_deleted: normalizedEvent === "Deleted",
      deleted_at: normalizedEvent === "Deleted" ? meta.receivedAt : null,
    };

    const { error } = await supabase
      .from("volumetrica_subscriptions")
      .upsert(record, { onConflict: "subscription_id" });
    if (error) {
      errors.push(`subscriptions: ${error.message}`);
    } else {
      updates.push("volumetrica_subscriptions");
    }
  }

  const positionPayload = payload.tradingPosition ?? payload.tradingPortfolio;
  const positionRecords = asArray(positionPayload)
    .filter((item): item is TradingPositionViewModel => Boolean(item && typeof item === "object"))
    .map((position) => ({
      position_key: positionKey(position, accountId),
      account_id: accountId,
      position_id: position.positionId ?? null,
      contract_id: position.contractId ?? null,
      symbol_name: position.symbolName ?? null,
      entry_date_utc: position.entryDateUtc ?? null,
      price: toNullableNumber(position.price),
      quantity: toNullableNumber(position.quantity),
      daily_pl: toNullableNumber(position.dailyPl),
      open_pl: toNullableNumber(position.openPl),
      raw: position,
      last_event_id: meta.eventId,
      updated_at: meta.receivedAt,
    }));

  if (positionRecords.length) {
    const { error } = await supabase
      .from("volumetrica_positions")
      .upsert(positionRecords, { onConflict: "position_key" });
    if (error) {
      errors.push(`positions: ${error.message}`);
    } else {
      updates.push("volumetrica_positions");
    }
  }

  const tradeRecords = asArray(payload.tradeReport)
    .filter((item): item is TradingTradeInfoModel => Boolean(item && typeof item === "object"))
    .map((trade) => ({
      trade_key: tradeKey(trade, accountId),
      trade_id: trade.tradeId ?? null,
      account_id: accountId,
      contract_id: trade.contractId ?? null,
      symbol_name: trade.symbolName ?? null,
      entry_date: trade.entryDate ?? null,
      exit_date: trade.exitDate ?? null,
      quantity: toNullableNumber(trade.quantity),
      open_price: toNullableNumber(trade.openPrice),
      close_price: toNullableNumber(trade.closePrice),
      pl: toNullableNumber(trade.pl),
      converted_pl: toNullableNumber(trade.convertedPL),
      commission_paid: toNullableNumber(trade.commissionPaid),
      raw: trade,
      last_event_id: meta.eventId,
      updated_at: meta.receivedAt,
    }));

  if (tradeRecords.length) {
    const { error } = await supabase
      .from("volumetrica_trades")
      .upsert(tradeRecords, { onConflict: "trade_key" });
    if (error) {
      errors.push(`trades: ${error.message}`);
    } else {
      updates.push("volumetrica_trades");
    }
  }

  if (payload.organizationUser && typeof payload.organizationUser === "object") {
    const orgUser = payload.organizationUser as OrganizationUserWebhookViewModel;
    const record = {
      volumetrica_user_id: orgUser.id ?? userId,
      status: normalizeEnumValue(orgUser.status),
      external_id: orgUser.externalId ?? null,
      invite_url: orgUser.inviteUrl ?? null,
      creation_utc: orgUser.creationUtc ?? null,
      update_utc: orgUser.updateUtc ?? null,
      raw: orgUser,
      last_event_id: meta.eventId,
      updated_at: meta.receivedAt,
    };

    if (record.volumetrica_user_id) {
      const { error } = await supabase
        .from("volumetrica_users")
        .upsert(record, { onConflict: "volumetrica_user_id" });
      if (error) {
        errors.push(`users: ${error.message}`);
      } else {
        updates.push("volumetrica_users");
      }
    }
  }

  return { updates, errors };
}
