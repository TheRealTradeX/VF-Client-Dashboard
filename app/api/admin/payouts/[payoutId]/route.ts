import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email/transactional";

type PayoutStatus = "requested" | "in_review" | "approved" | "paid" | "rejected";

type PayoutUpdatePayload = {
  status?: PayoutStatus;
  notes?: string | null;
  estimateAmount?: number | null;
  estimateEta?: string | null;
};

const ALLOWED_TRANSITIONS: Record<PayoutStatus, PayoutStatus[]> = {
  requested: ["in_review", "approved", "rejected"],
  in_review: ["approved", "rejected"],
  approved: ["paid"],
  paid: [],
  rejected: ["in_review"],
};
const STATUS_SET = new Set<PayoutStatus>(["requested", "in_review", "approved", "paid", "rejected"]);

const EMAIL_TEMPLATES: Partial<Record<PayoutStatus, string>> = {
  in_review: "payout_under_review",
  approved: "payout_approved",
  paid: "payout_paid",
  rejected: "payout_rejected",
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ payoutId: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  const { payoutId } = await params;
  if (!payoutId) {
    return NextResponse.json({ ok: false, error: "Payout reference is required." }, { status: 400 });
  }

  let payload: PayoutUpdatePayload;
  try {
    payload = (await request.json()) as PayoutUpdatePayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const nextStatus = payload.status;
  if (!nextStatus) {
    return NextResponse.json({ ok: false, error: "Status is required." }, { status: 400 });
  }
  if (!STATUS_SET.has(nextStatus)) {
    return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: payout } = await supabase
    .from("payout_requests")
    .select("id,user_id,status,amount,account_id,metadata")
    .eq("id", payoutId)
    .maybeSingle();

  if (!payout) {
    return NextResponse.json({ ok: false, error: "Payout request not found." }, { status: 404 });
  }

  const currentStatus = payout.status as PayoutStatus;
  if (currentStatus !== nextStatus) {
    const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(nextStatus)) {
      return NextResponse.json(
        { ok: false, error: `Invalid transition from ${currentStatus} to ${nextStatus}.` },
        { status: 400 },
      );
    }
  }

  const now = new Date().toISOString();
  const update: Record<string, unknown> = {
    status: nextStatus,
    notes: payload.notes?.trim() || null,
    updated_at: now,
  };

  if (nextStatus === "in_review") {
    update.reviewed_at = now;
  }
  if (nextStatus === "approved") {
    update.approved_at = now;
  }
  if (nextStatus === "paid") {
    update.paid_at = now;
  }

  const metadata: Record<string, unknown> = {};
  if (payload.estimateAmount !== undefined) {
    metadata.estimateAmount = payload.estimateAmount;
  }
  if (payload.estimateEta) {
    metadata.estimateEta = payload.estimateEta;
  }
  if (Object.keys(metadata).length) {
    const existing =
      payout.metadata && typeof payout.metadata === "object"
        ? (payout.metadata as Record<string, unknown>)
        : {};
    update.metadata = { ...existing, ...metadata };
  }

  const { error } = await supabase.from("payout_requests").update(update).eq("id", payoutId);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  await logAdminAction({
    action: "payout.status.update",
    actorUserId: admin.userId,
    actorEmail: admin.email,
    targetType: "payout",
    targetId: payoutId,
    metadata: { from: currentStatus, to: nextStatus, ...metadata },
  });

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", payout.user_id)
    .maybeSingle();

  const templateKey = EMAIL_TEMPLATES[nextStatus];
  if (templateKey) {
    const emailResult = await sendTransactionalEmail(templateKey, profile?.email ?? null, {
      fullName: profile?.full_name ?? "",
      amount: payout.amount ?? "",
      accountId: payout.account_id ?? "",
      estimateAmount: payload.estimateAmount ?? "",
      estimateEta: payload.estimateEta ?? "",
      status: nextStatus,
    });
    if (!emailResult.ok) {
      await logAdminAction({
        action: "email.payout.failed",
        actorUserId: admin.userId,
        actorEmail: admin.email,
        targetType: "payout",
        targetId: payoutId,
        metadata: { error: emailResult.error ?? "Email failed", templateKey },
      });
    }
  }

  return NextResponse.json({ ok: true, status: nextStatus });
}
