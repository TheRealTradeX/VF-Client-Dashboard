import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { volumetricaClient } from "@/lib/volumetrica/client";

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

  const userId = payload.userId?.trim();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "User reference is required." }, { status: 400 });
  }

  try {
    const result = (await volumetricaClient.createTradingAccount({
      userId,
      balance: payload.balance,
      maximumBalance: payload.maximumBalance,
      currency: payload.currency,
      header: payload.header?.trim() || undefined,
      description: payload.description?.trim() || undefined,
      accountRuleId: payload.accountRuleId?.trim() || undefined,
      enabled: payload.enabled ?? true,
    })) as { accountId?: string | null };

    await logAdminAction({
      action: "volumetrica.account.create",
      actorUserId: admin.userId,
      actorEmail: admin.email,
      targetType: "account",
      targetId: result?.accountId ?? userId,
      metadata: { userId, accountId: result?.accountId ?? null },
    });

    return NextResponse.json({ ok: true, accountId: result?.accountId ?? null });
  } catch (error) {
    await logAdminAction({
      action: "volumetrica.account.create.failed",
      actorUserId: admin.userId,
      actorEmail: admin.email,
      targetType: "account",
      targetId: userId,
      metadata: { error: (error as Error).message },
    });
    return NextResponse.json({ ok: false, error: "Account creation failed." }, { status: 502 });
  }
}
