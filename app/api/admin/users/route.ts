import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { volumetricaClient } from "@/lib/volumetrica/client";

type UserProvisionPayload = {
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  username?: string | null;
  password?: string;
  role?: string;
};

const normalizeRole = (role?: string) => (role === "admin" ? "admin" : "trader");

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  let payload: UserProvisionPayload;
  try {
    payload = (await request.json()) as UserProvisionPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const email = payload.email?.trim();
  const firstName = payload.firstName?.trim();
  const lastName = payload.lastName?.trim();
  const country = payload.country?.trim();
  const username = payload.username?.trim() || null;
  const password = payload.password?.trim();
  const role = normalizeRole(payload.role);

  if (!email || !firstName || !lastName || !country) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
  }

  if (!payload.userId && !password) {
    return NextResponse.json({ ok: false, error: "Password is required for new users." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  let userId = payload.userId?.trim() || null;

  if (!userId) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: password ?? "",
      email_confirm: true,
      user_metadata: { firstName, lastName },
    });

    if (error || !data.user) {
      await logAdminAction({
        action: "admin.user.create.failed",
        actorUserId: admin.userId,
        actorEmail: admin.email,
        targetType: "user",
        targetId: email,
        metadata: { error: error?.message ?? "Unknown error" },
      });
      return NextResponse.json({ ok: false, error: error?.message ?? "User create failed." }, { status: 500 });
    }

    userId = data.user.id;
  } else {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      email,
      password: password || undefined,
      user_metadata: { firstName, lastName },
    });

    if (error) {
      await logAdminAction({
        action: "admin.user.update.failed",
        actorUserId: admin.userId,
        actorEmail: admin.email,
        targetType: "user",
        targetId: userId,
        metadata: { error: error.message },
      });
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
  }

  const fullName = `${firstName} ${lastName}`.trim();
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    email,
    full_name: fullName,
    role,
  });

  if (profileError) {
    await logAdminAction({
      action: "admin.user.profile.failed",
      actorUserId: admin.userId,
      actorEmail: admin.email,
      targetType: "user",
      targetId: userId,
      metadata: { error: profileError.message },
    });
    return NextResponse.json({ ok: false, error: profileError.message }, { status: 500 });
  }

  if (role === "admin") {
    await supabase.from("admin_users").upsert({ user_id: userId });
  } else {
    await supabase.from("admin_users").delete().eq("user_id", userId);
  }

  let volumetricaUserId: string | null = null;
  try {
    const result = (await volumetricaClient.newUser({
      email,
      firstName,
      lastName,
      country,
      username: username || undefined,
      extEntityId: userId,
      passwordToSet: password || undefined,
      forceNewPassword: false,
    })) as { userId?: string | null };
    volumetricaUserId = result?.userId ?? null;
  } catch (error) {
    await logAdminAction({
      action: "volumetrica.user.upsert.failed",
      actorUserId: admin.userId,
      actorEmail: admin.email,
      targetType: "user",
      targetId: userId,
      metadata: { error: (error as Error).message },
    });
    return NextResponse.json(
      { ok: false, error: "Trading platform user provisioning failed." },
      { status: 502 },
    );
  }

  if (volumetricaUserId) {
    await supabase.from("volumetrica_users").upsert(
      {
        volumetrica_user_id: volumetricaUserId,
        external_id: userId,
        raw: {
          fullName,
          email,
          username,
        },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "volumetrica_user_id" },
    );
  }

  await logAdminAction({
    action: "volumetrica.user.upsert",
    actorUserId: admin.userId,
    actorEmail: admin.email,
    targetType: "user",
    targetId: userId,
    metadata: { volumetricaUserId, role },
  });

  return NextResponse.json({
    ok: true,
    userId,
    volumetricaUserId,
  });
}
