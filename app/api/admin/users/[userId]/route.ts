import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { VolumetricaApiError, volumetricaClient } from "@/lib/volumetrica/client";

type UserUpdatePayload = {
  email?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  username?: string | null;
  password?: string;
  role?: string;
  userType?: number | null;
  systemAccess?: number | null;
  mobilePhone?: string | null;
  language?: string | null;
};

const normalizeRole = (role?: string) => (role === "admin" ? "admin" : "trader");

const parseNullableInt = (value: unknown) => {
  if (value === null || value === undefined) return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const readString = (value: unknown) => (typeof value === "string" ? value : "");

const splitName = (fullName: string | null) => {
  if (!fullName) return { first: "", last: "" };
  const parts = fullName.trim().split(/\s+/);
  const [first, ...rest] = parts;
  return { first: first ?? "", last: rest.join(" ") };
};

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  const { userId } = await params;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "User reference is required." }, { status: 400 });
  }

  let payload: UserUpdatePayload;
  try {
    payload = (await request.json()) as UserUpdatePayload;
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
  const userType = parseNullableInt(payload.userType);
  const systemAccess = parseNullableInt(payload.systemAccess);
  const mobilePhone = payload.mobilePhone?.trim() || null;
  const language = payload.language?.trim() || null;

  if (!email || !firstName || !lastName || !country) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
    email,
    password: password || undefined,
    user_metadata: { firstName, lastName },
  });

  if (authError) {
    await logAdminAction({
      action: "admin.user.update.failed",
      actorUserId: admin.userId,
      actorEmail: admin.email,
      targetType: "user",
      targetId: userId,
      metadata: { error: authError.message },
    });
    return NextResponse.json({ ok: false, error: authError.message }, { status: 500 });
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
    const payloadForPlatform: Record<string, unknown> = {
      email,
      firstName,
      lastName,
      country,
      extEntityId: userId,
      forceNewPassword: false,
    };
    if (username) payloadForPlatform.username = username;
    if (mobilePhone) payloadForPlatform.mobilePhone = mobilePhone;
    if (language) payloadForPlatform.language = language;
    if (password) payloadForPlatform.passwordToSet = password;
    if (userType !== null) payloadForPlatform.userType = userType;
    if (systemAccess !== null) payloadForPlatform.systemAccess = systemAccess;

    const result = (await volumetricaClient.newUser(payloadForPlatform)) as { userId?: string | null };
    volumetricaUserId = result?.userId ?? null;
  } catch (error) {
    const details =
      error instanceof VolumetricaApiError
        ? error.body ?? `${error.status} ${error.statusText}`
        : (error as Error).message;
    await logAdminAction({
      action: "volumetrica.user.update.failed",
      actorUserId: admin.userId,
      actorEmail: admin.email,
      targetType: "user",
      targetId: userId,
      metadata: { error: details },
    });
    return NextResponse.json({ ok: false, error: "Trading platform update failed." }, { status: 502 });
  }

  if (volumetricaUserId) {
    await supabase.from("volumetrica_users").upsert(
      {
        volumetrica_user_id: volumetricaUserId,
        external_id: userId,
        raw: {
          firstName,
          lastName,
          fullName,
          email,
          country,
          username,
          mobilePhone,
          language,
          userType,
          systemAccess,
        },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "volumetrica_user_id" },
    );
  }

  await logAdminAction({
    action: "admin.user.update",
    actorUserId: admin.userId,
    actorEmail: admin.email,
    targetType: "user",
    targetId: userId,
    metadata: { volumetricaUserId, role },
  });

  return NextResponse.json({ ok: true, volumetricaUserId });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  const { userId } = await params;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "User reference is required." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", userId)
    .maybeSingle();

  const { data: volumetricaUser } = await supabase
    .from("volumetrica_users")
    .select("volumetrica_user_id, raw")
    .or(`external_id.eq.${userId},volumetrica_user_id.eq.${userId}`)
    .maybeSingle();

  const raw = ((volumetricaUser as { raw?: Record<string, unknown> } | null)?.raw ??
    {}) as Record<string, unknown>;
  const fallbackName = splitName(profile?.full_name ?? null);
  const firstName = readString(raw.firstName) || fallbackName.first;
  const lastName = readString(raw.lastName) || fallbackName.last;
  const email = readString(raw.email) || readString(profile?.email);
  const country = readString(raw.country);
  const userType = parseNullableInt(raw.userType);
  const platformUserId = (volumetricaUser as { volumetrica_user_id?: string } | null)
    ?.volumetrica_user_id;

  let platformWarning: string | null = null;

  if (platformUserId && email && firstName && lastName && country) {
    try {
      await volumetricaClient.newUser({
        email,
        firstName,
        lastName,
        country,
        extEntityId: userId,
        forceNewPassword: false,
        systemAccess: 0,
        userType: userType ?? undefined,
      });
    } catch (error) {
      platformWarning = (error as Error).message;
      await logAdminAction({
        action: "volumetrica.user.disable.failed",
        actorUserId: admin.userId,
        actorEmail: admin.email,
        targetType: "user",
        targetId: userId,
        metadata: { error: platformWarning },
      });
    }
  }

  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
  if (deleteError) {
    await logAdminAction({
      action: "admin.user.remove.failed",
      actorUserId: admin.userId,
      actorEmail: admin.email,
      targetType: "user",
      targetId: userId,
      metadata: { error: deleteError.message },
    });
    return NextResponse.json({ ok: false, error: deleteError.message }, { status: 500 });
  }

  await supabase.from("profiles").delete().eq("id", userId);

  await logAdminAction({
    action: "admin.user.remove",
    actorUserId: admin.userId,
    actorEmail: admin.email,
    targetType: "user",
    targetId: userId,
    metadata: { platformWarning },
  });

  return NextResponse.json({ ok: true, warning: platformWarning });
}
