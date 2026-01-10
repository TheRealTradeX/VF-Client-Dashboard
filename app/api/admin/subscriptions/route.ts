import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { volumetricaClient } from "@/lib/volumetrica/client";

type SubscriptionPayload = {
  subscriptionId?: string;
  userId?: string;
  dataFeedProducts?: number[];
  platform?: number;
  startDate?: string;
  durationMonths?: number;
  durationDays?: number;
  enabled?: boolean;
  volumetricaPlatform?: number;
  redirectUrl?: string;
};

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  let payload: SubscriptionPayload;
  try {
    payload = (await request.json()) as SubscriptionPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const userId = payload.userId?.trim();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "User reference is required." }, { status: 400 });
  }

  try {
    const result = await volumetricaClient.newSubscription({
      userId,
      dataFeedProducts: payload.dataFeedProducts,
      platform: payload.platform,
      startDate: payload.startDate,
      durationMonths: payload.durationMonths,
      durationDays: payload.durationDays,
      enabled: payload.enabled ?? true,
      volumetricaPlatform: payload.volumetricaPlatform,
      redirectUrl: payload.redirectUrl?.trim() || undefined,
    });

    await logAdminAction({
      action: "volumetrica.subscription.create",
      actorUserId: admin.userId,
      actorEmail: admin.email,
      targetType: "subscription",
      targetId: userId,
      metadata: { userId, result },
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    await logAdminAction({
      action: "volumetrica.subscription.create.failed",
      actorUserId: admin.userId,
      actorEmail: admin.email,
      targetType: "subscription",
      targetId: userId,
      metadata: { error: (error as Error).message },
    });
    return NextResponse.json({ ok: false, error: "Subscription creation failed." }, { status: 502 });
  }
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  let payload: SubscriptionPayload;
  try {
    payload = (await request.json()) as SubscriptionPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const subscriptionId = payload.subscriptionId?.trim();
  if (!subscriptionId) {
    return NextResponse.json({ ok: false, error: "Subscription reference is required." }, { status: 400 });
  }

  try {
    await volumetricaClient.updateSubscription(subscriptionId, {
      userId: payload.userId?.trim() || undefined,
      dataFeedProducts: payload.dataFeedProducts,
      platform: payload.platform,
      startDate: payload.startDate,
      durationMonths: payload.durationMonths,
      durationDays: payload.durationDays,
      enabled: payload.enabled,
      volumetricaPlatform: payload.volumetricaPlatform,
      redirectUrl: payload.redirectUrl?.trim() || undefined,
    });

    await logAdminAction({
      action: "volumetrica.subscription.update",
      actorUserId: admin.userId,
      actorEmail: admin.email,
      targetType: "subscription",
      targetId: subscriptionId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    await logAdminAction({
      action: "volumetrica.subscription.update.failed",
      actorUserId: admin.userId,
      actorEmail: admin.email,
      targetType: "subscription",
      targetId: subscriptionId,
      metadata: { error: (error as Error).message },
    });
    return NextResponse.json({ ok: false, error: "Subscription update failed." }, { status: 502 });
  }
}
