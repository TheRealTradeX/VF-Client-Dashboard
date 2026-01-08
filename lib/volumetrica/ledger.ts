import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type LedgerInsertInput = {
  eventId: string;
  authMode: string;
  signatureValid: boolean;
  category?: string | null;
  eventType?: string | null;
  accountId?: string | null;
  userId?: string | null;
  payload: unknown;
  headers?: Record<string, unknown> | null;
  correlationId?: string | null;
  sourceIp?: string | null;
};

type LedgerInsertResult = {
  inserted: boolean;
  duplicate: boolean;
  error?: string;
};

const DUPLICATE_CODES = new Set(["23505"]);

export async function insertWebhookEvent(input: LedgerInsertInput): Promise<LedgerInsertResult> {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("volumetrica_events").insert({
    event_id: input.eventId,
    auth_mode: input.authMode,
    signature_valid: input.signatureValid,
    category: input.category ?? null,
    event: input.eventType ?? null,
    account_id: input.accountId ?? null,
    user_id: input.userId ?? null,
    payload: input.payload,
    headers: input.headers ?? null,
    correlation_id: input.correlationId ?? null,
    source_ip: input.sourceIp ?? null,
  });

  if (!error) {
    return { inserted: true, duplicate: false };
  }

  if (DUPLICATE_CODES.has(error.code ?? "")) {
    return { inserted: false, duplicate: true };
  }

  return { inserted: false, duplicate: false, error: error.message };
}
