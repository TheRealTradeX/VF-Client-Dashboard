import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { volumetricaClient } from "@/lib/volumetrica/client";

type AccountActionPayload = {
  action?: "enable" | "disable" | "status";
  status?: number;
  forceClose?: boolean;
  reason?: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ accountId: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
  }

  const { accountId } = await params;
  if (!accountId) {
    return NextResponse.json({ ok: false, error: "Account reference is required." }, { status: 400 });
  }

  let payload: AccountActionPayload;
  try {
    payload = (await request.json()) as AccountActionPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const action = payload.action;
  const reason = payload.reason?.trim();

  try {
    if (action === "enable") {
      await volumetricaClient.enableTradingAccount(accountId);
      await logAdminAction({
        action: "volumetrica.account.enable",
        actorUserId: admin.userId,
        actorEmail: admin.email,
        targetType: "account",
        targetId: accountId,
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "disable") {
      await volumetricaClient.disableTradingAccount(accountId, payload.forceClose, reason);
      await logAdminAction({
        action: "volumetrica.account.disable",
        actorUserId: admin.userId,
        actorEmail: admin.email,
        targetType: "account",
        targetId: accountId,
        metadata: { forceClose: payload.forceClose ?? false, reason: reason ?? null },
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "status") {
      if (typeof payload.status !== "number") {
        return NextResponse.json({ ok: false, error: "Status code is required." }, { status: 400 });
      }
      await volumetricaClient.changeTradingAccountStatus(accountId, String(payload.status), payload.forceClose, reason);
      await logAdminAction({
        action: "volumetrica.account.status",
        actorUserId: admin.userId,
        actorEmail: admin.email,
        targetType: "account",
        targetId: accountId,
        metadata: { status: payload.status, forceClose: payload.forceClose ?? false, reason: reason ?? null },
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Unsupported action." }, { status: 400 });
  } catch (error) {
    await logAdminAction({
      action: "volumetrica.account.action.failed",
      actorUserId: admin.userId,
      actorEmail: admin.email,
      targetType: "account",
      targetId: accountId,
      metadata: { error: (error as Error).message, action },
    });
    return NextResponse.json({ ok: false, error: "Account update failed." }, { status: 502 });
  }
}
