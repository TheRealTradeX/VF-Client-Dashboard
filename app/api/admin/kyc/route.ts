import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail } from "@/lib/email/transactional";

type KycStatus = "required" | "in_review" | "approved" | "rejected";

type KycPayload = {
  userRef?: string;
  caseId?: string;
  status?: KycStatus;
  notes?: string | null;
};

const ALLOWED_TRANSITIONS: Record<KycStatus, KycStatus[]> = {
  required: ["in_review", "rejected"],
  in_review: ["approved", "rejected"],
  approved: [],
  rejected: ["in_review", "required"],
};
const STATUS_SET = new Set<KycStatus>(["required", "in_review", "approved", "rejected"]);

const EMAIL_TEMPLATES: Partial<Record<KycStatus, string>> = {
  required: "kyc_required",
  approved: "kyc_approved",
  rejected: "kyc_rejected",
};

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  let payload: KycPayload;
  try {
    payload = (await request.json()) as KycPayload;
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

  let userId: string | null = null;
  let caseId = payload.caseId?.trim() || null;

  if (caseId) {
    const { data: existingCase } = await supabase
      .from("kyc_cases")
      .select("id,user_id,status")
      .eq("id", caseId)
      .maybeSingle();

    if (!existingCase) {
      return NextResponse.json({ ok: false, error: "KYC case not found." }, { status: 404 });
    }

    userId = existingCase.user_id;
  } else {
    const userRef = payload.userRef?.trim() || "";
    if (!userRef) {
      return NextResponse.json({ ok: false, error: "User reference is required." }, { status: 400 });
    }

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
  }

  if (!userId) {
    return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("kyc_cases")
    .select("id,status")
    .eq("user_id", userId)
    .maybeSingle();

  const currentStatus = (existing?.status as KycStatus | undefined) ?? null;
  if (currentStatus && currentStatus !== nextStatus) {
    const allowed = ALLOWED_TRANSITIONS[currentStatus];
    if (!allowed.includes(nextStatus)) {
      return NextResponse.json(
        { ok: false, error: `Invalid transition from ${currentStatus} to ${nextStatus}.` },
        { status: 400 },
      );
    }
  }

  const now = new Date().toISOString();
  const update = {
    user_id: userId,
    status: nextStatus,
    notes: payload.notes?.trim() || null,
    reviewed_by: admin.userId,
    reviewed_at: nextStatus === "approved" || nextStatus === "rejected" ? now : null,
    updated_at: now,
  };

  const { data: saved, error } = await supabase
    .from("kyc_cases")
    .upsert(update, { onConflict: "user_id" })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  await logAdminAction({
    action: "kyc.status.update",
    actorUserId: admin.userId,
    actorEmail: admin.email,
    targetType: "kyc",
    targetId: saved?.id ?? null,
    metadata: { userId, from: currentStatus, to: nextStatus },
  });

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .maybeSingle();

  const templateKey = EMAIL_TEMPLATES[nextStatus];
  if (templateKey) {
    const emailResult = await sendTransactionalEmail(templateKey, profile?.email ?? null, {
      fullName: profile?.full_name ?? "",
      status: nextStatus,
    });
    if (!emailResult.ok) {
      await logAdminAction({
        action: "email.kyc.failed",
        actorUserId: admin.userId,
        actorEmail: admin.email,
        targetType: "kyc",
        targetId: saved?.id ?? null,
        metadata: { error: emailResult.error ?? "Email failed", templateKey },
      });
    }
  }

  return NextResponse.json({ ok: true, caseId: saved?.id ?? null, status: nextStatus });
}
