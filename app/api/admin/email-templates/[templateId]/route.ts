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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ templateId: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  const { templateId } = await params;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("email_templates")
    .select("id, template_key, name, subject, body, is_active, created_at, updated_at")
    .eq("id", templateId)
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, template: data });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ templateId: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  const { templateId } = await params;
  let payload: TemplatePayload;
  try {
    payload = (await request.json()) as TemplatePayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (payload.templateKey !== undefined) update.template_key = payload.templateKey.trim();
  if (payload.name !== undefined) update.name = payload.name.trim();
  if (payload.subject !== undefined) update.subject = payload.subject.trim();
  if (payload.body !== undefined) update.body = payload.body;
  if (payload.isActive !== undefined) update.is_active = payload.isActive;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("email_templates").update(update).eq("id", templateId);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  await logAdminAction({
    action: "email.template.update",
    actorUserId: admin.userId,
    actorEmail: admin.email,
    targetType: "email_template",
    targetId: templateId,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ templateId: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  const { templateId } = await params;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("email_templates").delete().eq("id", templateId);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  await logAdminAction({
    action: "email.template.delete",
    actorUserId: admin.userId,
    actorEmail: admin.email,
    targetType: "email_template",
    targetId: templateId,
  });

  return NextResponse.json({ ok: true });
}
