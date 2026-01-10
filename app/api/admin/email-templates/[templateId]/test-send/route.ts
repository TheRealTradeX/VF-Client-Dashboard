import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { logEmailOutbox } from "@/lib/email/outbox";
import { sendEmail } from "@/lib/email/provider";
import { renderTemplate } from "@/lib/email/render";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type TestSendPayload = {
  toEmail?: string;
  variables?: Record<string, unknown>;
};

const isProd = process.env.VERCEL_ENV === "production";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ templateId: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  if (isProd) {
    return NextResponse.json({ ok: false, error: "Test send is disabled in production." }, { status: 403 });
  }

  const { templateId } = await params;
  let payload: TestSendPayload;
  try {
    payload = (await request.json()) as TestSendPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const toEmail = payload.toEmail?.trim();
  if (!toEmail) {
    return NextResponse.json({ ok: false, error: "Recipient email is required." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: template, error: templateError } = await supabase
    .from("email_templates")
    .select("id, template_key, name, subject, body")
    .eq("id", templateId)
    .single();

  if (templateError || !template) {
    return NextResponse.json({ ok: false, error: "Template not found." }, { status: 404 });
  }

  const variables = (payload.variables ?? {}) as Record<
    string,
    string | number | boolean | null | undefined
  >;
  const subject = renderTemplate(template.subject ?? "", variables);
  const body = renderTemplate(template.body ?? "", variables);

  const sendResult = await sendEmail({ to: toEmail, subject, html: body });
  const status = sendResult.ok ? "test" : "failed";

  await logEmailOutbox({
    templateId,
    toEmail,
    subject,
    body,
    variables,
    status,
    provider: sendResult.provider,
    error: sendResult.ok ? null : sendResult.error,
    sentAt: sendResult.ok ? new Date().toISOString() : null,
  });

  await logAdminAction({
    action: sendResult.ok ? "email.test_send" : "email.test_send.failed",
    actorUserId: admin.userId,
    actorEmail: admin.email,
    targetType: "email_template",
    targetId: templateId,
    metadata: { toEmail, provider: sendResult.provider },
  });

  if (!sendResult.ok) {
    return NextResponse.json({ ok: false, error: sendResult.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
