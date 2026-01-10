import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type TemplatePayload = {
  templateKey?: string;
  name?: string;
  subject?: string;
  body?: string;
  isActive?: boolean;
};

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("email_templates")
    .select("id, template_key, name, subject, body, is_active, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, templates: data ?? [] });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  let payload: TemplatePayload;
  try {
    payload = (await request.json()) as TemplatePayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const templateKey = payload.templateKey?.trim();
  const name = payload.name?.trim();
  const subject = payload.subject?.trim();
  const body = payload.body?.trim();
  const isActive = payload.isActive ?? true;

  if (!templateKey || !name || !subject || !body) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("email_templates")
    .insert({
      template_key: templateKey,
      name,
      subject,
      body,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  await logAdminAction({
    action: "email.template.create",
    actorUserId: admin.userId,
    actorEmail: admin.email,
    targetType: "email_template",
    targetId: data?.id ?? null,
    metadata: { templateKey, name },
  });

  return NextResponse.json({ ok: true, id: data?.id ?? null });
}
