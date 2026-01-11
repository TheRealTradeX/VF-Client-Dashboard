import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createLeaderboardSnapshot } from "@/lib/volumetrica/leaderboard";

type LeaderboardActionPayload = {
  action?: "freeze" | "unfreeze";
};

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  let payload: LeaderboardActionPayload;
  try {
    payload = (await request.json()) as LeaderboardActionPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const action = payload.action;
  if (!action) {
    return NextResponse.json({ ok: false, error: "Action is required." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (action === "freeze") {
    const snapshot = await createLeaderboardSnapshot(admin.userId);
    const { error } = await supabase.from("leaderboard_settings").upsert({
      id: 1,
      is_frozen: true,
      frozen_snapshot_id: snapshot.id,
      updated_at: new Date().toISOString(),
      updated_by: admin.userId,
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    await logAdminAction({
      action: "leaderboard.freeze",
      actorUserId: admin.userId,
      actorEmail: admin.email,
      targetType: "leaderboard",
      targetId: snapshot.id ?? null,
      metadata: { entryCount: snapshot.entries.length },
    });

    return NextResponse.json({ ok: true, frozen: true, snapshotId: snapshot.id });
  }

  if (action === "unfreeze") {
    const { error } = await supabase.from("leaderboard_settings").upsert({
      id: 1,
      is_frozen: false,
      frozen_snapshot_id: null,
      updated_at: new Date().toISOString(),
      updated_by: admin.userId,
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    await logAdminAction({
      action: "leaderboard.unfreeze",
      actorUserId: admin.userId,
      actorEmail: admin.email,
      targetType: "leaderboard",
      targetId: "settings",
    });

    return NextResponse.json({ ok: true, frozen: false });
  }

  return NextResponse.json({ ok: false, error: "Unsupported action." }, { status: 400 });
}
