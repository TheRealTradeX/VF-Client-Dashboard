import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type OutboxEntry = {
  templateId?: string | null;
  toEmail: string;
  subject: string;
  body: string;
  variables?: Record<string, unknown> | null;
  status: "queued" | "sent" | "failed" | "test";
  provider: string;
  error?: string | null;
  sentAt?: string | null;
};

export async function logEmailOutbox(entry: OutboxEntry) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("email_outbox")
    .insert({
      template_id: entry.templateId ?? null,
      to_email: entry.toEmail,
      subject: entry.subject,
      body: entry.body,
      variables: entry.variables ?? null,
      status: entry.status,
      provider: entry.provider,
      error: entry.error ?? null,
      sent_at: entry.sentAt ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, id: data?.id ?? null };
}
