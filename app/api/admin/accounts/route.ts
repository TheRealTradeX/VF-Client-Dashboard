import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { VolumetricaApiError, volumetricaClient } from "@/lib/volumetrica/client";

type AccountCreatePayload = {
  userId?: string;
  balance?: number;
  maximumBalance?: number;
  currency?: number;
  header?: string;
  description?: string;
  accountRuleId?: string;
  enabled?: boolean;
};

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  let payload: AccountCreatePayload;
  try {
    payload = (await request.json()) as AccountCreatePayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const userRef = payload.userId?.trim();
  if (!userRef) {
    return NextResponse.json({ ok: false, error: "User reference is required." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userRef);
  const isEmail = userRef.includes("@");
  const { data: userRow } = await supabase
    .from("volumetrica_users")
    .select("volumetrica_user_id, external_id, raw")
    .or(
      [
        `volumetrica_user_id.eq.${userRef}`,
        `external_id.eq.${userRef}`,
        isEmail ? `raw->>email.eq.${userRef}` : null,
      ]
        .filter(Boolean)
        .join(","),
    )
    .maybeSingle();

  const resolvedUserId = userRow?.volumetrica_user_id ?? userRef;

  if (!userRow && (isUuid || isEmail)) {
    return NextResponse.json(
      {
        ok: false,
        error: "User is not linked to the trading platform yet.",
        details: "Provision the user first or wait for the user webhook sync.",
      },
      { status: 400 },
    );
  }

  const ruleInput = payload.accountRuleId?.trim() || null;
  let resolvedRuleId = ruleInput;
  if (ruleInput && !/^[0-9a-f-]{36}$/i.test(ruleInput)) {
    const { data: ruleRow } = await supabase
      .from("volumetrica_rules")
      .select("rule_id")
      .or(`reference_id.eq.${ruleInput},rule_name.eq.${ruleInput}`)
      .maybeSingle();
    resolvedRuleId = ruleRow?.rule_id ?? null;
  }

  try {
    const result = (await volumetricaClient.createTradingAccount({
      userId: resolvedUserId,
      balance: payload.balance,
      maximumBalance: payload.maximumBalance,
      currency: payload.currency,
      header: payload.header?.trim() || undefined,
      description: payload.description?.trim() || undefined,
      accountRuleId: resolvedRuleId || undefined,
      enabled: payload.enabled ?? true,
    })) as { accountId?: string | null };

    await logAdminAction({
      action: "volumetrica.account.create",
      actorUserId: admin.userId,
      actorEmail: admin.email,
      targetType: "account",
      targetId: result?.accountId ?? resolvedUserId,
      metadata: { userRef, userId: resolvedUserId, accountId: result?.accountId ?? null },
    });

    return NextResponse.json({ ok: true, accountId: result?.accountId ?? null });
  } catch (error) {
    const details =
      error instanceof VolumetricaApiError
        ? error.body ?? `${error.status} ${error.statusText}`
        : (error as Error).message;
    await logAdminAction({
      action: "volumetrica.account.create.failed",
      actorUserId: admin.userId,
      actorEmail: admin.email,
      targetType: "account",
      targetId: resolvedUserId,
      metadata: { error: details, userRef, userId: resolvedUserId },
    });
    return NextResponse.json(
      { ok: false, error: "Account creation failed.", details },
      { status: 502 },
    );
  }
}
