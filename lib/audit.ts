import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type AuditLogEntry = {
  action: string;
  actorUserId?: string | null;
  actorEmail?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function logAdminAction(entry: AuditLogEntry) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("admin_audit_log").insert({
    action: entry.action,
    actor_user_id: entry.actorUserId ?? null,
    actor_email: entry.actorEmail ?? null,
    target_type: entry.targetType ?? null,
    target_id: entry.targetId ?? null,
    metadata: entry.metadata ?? null,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
