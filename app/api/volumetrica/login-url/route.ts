import { NextResponse } from "next/server";

import { volumetricaClient } from "@/lib/volumetrica/client";
import { getAuthenticatedSupabaseUser, listTraderAccounts } from "@/lib/volumetrica/trader-data";

export const runtime = "nodejs";

type LoginUrlRequest = {
  accountId?: string;
};

const getAccountUserId = (account: { user_id: string | null; raw: Record<string, unknown> | null }) => {
  if (account.user_id) return account.user_id;
  const raw = account.raw;
  if (!raw || typeof raw !== "object") return null;
  const user = (raw as Record<string, unknown>).user;
  if (!user || typeof user !== "object") return null;
  const userRecord = user as Record<string, unknown>;
  return typeof userRecord.userId === "string" ? userRecord.userId : null;
};

export async function POST(request: Request) {
  const user = await getAuthenticatedSupabaseUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }

  let body: LoginUrlRequest = {};
  try {
    body = (await request.json()) as LoginUrlRequest;
  } catch {
    body = {};
  }

  const accounts = await listTraderAccounts(user);
  const requestedAccountId = typeof body.accountId === "string" ? body.accountId : null;
  const selectedAccount =
    (requestedAccountId ? accounts.find((acct) => acct.account_id === requestedAccountId) : null) ??
    accounts.find((acct) => acct.enabled) ??
    accounts[0];

  if (!selectedAccount) {
    return NextResponse.json({ ok: false, error: "No eligible account found." }, { status: 404 });
  }

  const volumetricaUserId = getAccountUserId({
    user_id: selectedAccount.user_id,
    raw: selectedAccount.raw,
  });

  if (!volumetricaUserId) {
    return NextResponse.json({ ok: false, error: "Missing trading platform user id." }, { status: 400 });
  }

  const payload = {
    userId: volumetricaUserId,
    accountId: selectedAccount.account_id,
  };

  try {
    const url = await volumetricaClient.loginUrl(payload);
    return NextResponse.json({ ok: true, url }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login URL request failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
