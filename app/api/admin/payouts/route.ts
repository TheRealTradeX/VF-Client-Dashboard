import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email/transactional";

type PayoutStatus = "requested" | "in_review" | "approved" | "paid" | "rejected";

type PayoutCreatePayload = {
  userRef?: string;
  accountId?: string | null;
  amount?: number | null;
  currency?: string | null;
  notes?: string | null;
};

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  let payload: PayoutCreatePayload;
  try {
    payload = (await request.json()) as PayoutCreatePayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const userRef = payload.userRef?.trim() || "";
  if (!userRef) {
    return NextResponse.json({ ok: false, error: "User reference is required." }, { status: 400 });
  }

  const amount = payload.amount ?? null;
  if (!amount || Number.isNaN(Number(amount))) {
    return NextResponse.json({ ok: false, error: "Amount is required." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  let userId: string | null = null;

  if (isUuid(userRef)) {
    userId = userRef;
  } else if (userRef.includes("@")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", userRef)
      .maybeSingle();
    userId = profile?.id ?? null;
  }

  if (!userId) {
    return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
  }

  const accountId = payload.accountId?.trim() || null;
  if (accountId) {
    const { data: account } = await supabase
      .from("volumetrica_accounts")
      .select("account_id")
      .eq("account_id", accountId)
      .maybeSingle();
    if (!account) {
      return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });
    }
  }

  const now = new Date().toISOString();
  const { data: payout, error } = await supabase
    .from("payout_requests")
    .insert({
      user_id: userId,
      account_id: accountId,
      amount,
      currency: payload.currency?.trim() || "USD",
      status: "requested",
      requested_at: now,
      notes: payload.notes?.trim() || null,
      updated_at: now,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  await logAdminAction({
    action: "payout.request.create",
    actorUserId: admin.userId,
    actorEmail: admin.email,
    targetType: "payout",
    targetId: payout?.id ?? null,
    metadata: { userId, accountId, amount },
  });

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .maybeSingle();

  const emailResult = await sendTransactionalEmail("payout_requested", profile?.email ?? null, {
    fullName: profile?.full_name ?? "",
    amount,
    accountId: accountId ?? "",
  });

  if (!emailResult.ok) {
    await logAdminAction({
      action: "email.payout.failed",
      actorUserId: admin.userId,
      actorEmail: admin.email,
      targetType: "payout",
      targetId: payout?.id ?? null,
      metadata: { error: emailResult.error ?? "Email failed", templateKey: "payout_requested" },
    });
  }

  return NextResponse.json({ ok: true, payoutId: payout?.id ?? null });
}
