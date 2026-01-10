import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { volumetricaClient } from "@/lib/volumetrica/client";

type SubscriptionActionPayload = {
  action?: "activate" | "deactivate" | "delete";
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ subscriptionId: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  const { subscriptionId } = await params;
  if (!subscriptionId) {
    return NextResponse.json({ ok: false, error: "Subscription reference is required." }, { status: 400 });
  }

  let payload: SubscriptionActionPayload;
  try {
    payload = (await request.json()) as SubscriptionActionPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const action = payload.action;

  try {
    if (action === "activate") {
      await volumetricaClient.activateSubscription(subscriptionId);
      await logAdminAction({
        action: "volumetrica.subscription.activate",
        actorUserId: admin.userId,
        actorEmail: admin.email,
        targetType: "subscription",
        targetId: subscriptionId,
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "deactivate") {
      await volumetricaClient.deactivateSubscription(subscriptionId);
      await logAdminAction({
        action: "volumetrica.subscription.deactivate",
        actorUserId: admin.userId,
        actorEmail: admin.email,
        targetType: "subscription",
        targetId: subscriptionId,
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "delete") {
      await volumetricaClient.deleteSubscription(subscriptionId);
      await logAdminAction({
        action: "volumetrica.subscription.delete",
        actorUserId: admin.userId,
        actorEmail: admin.email,
        targetType: "subscription",
        targetId: subscriptionId,
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Unsupported action." }, { status: 400 });
  } catch (error) {
    await logAdminAction({
      action: "volumetrica.subscription.action.failed",
      actorUserId: admin.userId,
      actorEmail: admin.email,
      targetType: "subscription",
      targetId: subscriptionId,
      metadata: { error: (error as Error).message, action },
    });
    return NextResponse.json({ ok: false, error: "Subscription update failed." }, { status: 502 });
  }
}
