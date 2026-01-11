import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logEmailOutbox } from "@/lib/email/outbox";
import { sendEmail } from "@/lib/email/provider";
import { renderTemplate, type TemplateVariables } from "@/lib/email/render";

type TransactionalEmailResult = {
  ok: boolean;
  error?: string;
};

export async function sendTransactionalEmail(
  templateKey: string,
  toEmail: string | null,
  variables: TemplateVariables = {},
): Promise<TransactionalEmailResult> {
  if (!toEmail) {
    return { ok: false, error: "Recipient email is required." };
  }

  const supabase = createSupabaseAdminClient();
  const { data: template, error } = await supabase
    .from("email_templates")
    .select("id, subject, body, is_active")
    .eq("template_key", templateKey)
    .maybeSingle();

  if (error || !template || !template.is_active) {
    return { ok: false, error: "Email template not found or inactive." };
  }

  const subject = renderTemplate(template.subject, variables);
  const body = renderTemplate(template.body, variables);

  const sendResult = await sendEmail({ to: toEmail, subject, html: body });

  await logEmailOutbox({
    templateId: template.id,
    toEmail,
    subject,
    body,
    variables,
    status: sendResult.ok ? (sendResult.provider === "test" ? "test" : "sent") : "failed",
    provider: sendResult.provider,
    error: sendResult.ok ? null : sendResult.error,
    sentAt: sendResult.ok && sendResult.provider !== "test" ? new Date().toISOString() : null,
  });

  if (!sendResult.ok) {
    return { ok: false, error: sendResult.error };
  }

  return { ok: true };
}
