import { NextResponse } from "next/server";

import { insertWebhookEvent } from "@/lib/volumetrica/ledger";
import { normalizeEnumValue } from "@/lib/volumetrica/normalize";
import { applyWebhookProjections } from "@/lib/volumetrica/projections";
import {
  getWebhookAuthConfig,
  resolveEventId,
  validateWebhookPayload,
  verifyWebhookRequest,
} from "@/lib/volumetrica/webhook";
import type { WebhookEventPayload } from "@/lib/volumetrica/types";

export const runtime = "nodejs";

const MAX_BODY_BYTES = Number.parseInt(process.env.WEBHOOK_MAX_BODY_BYTES ?? "", 10) || 1_000_000;

const buildSafeHeaders = (headers: Headers, mode: string, secretHeaderName?: string, signatureHeaderName?: string) => {
  if (mode === "shared_secret_header") {
    return {
      sharedSecretPresent: Boolean(secretHeaderName && headers.get(secretHeaderName)),
    };
  }
  return {
    signature: signatureHeaderName ? headers.get(signatureHeaderName) : null,
  };
};

export async function POST(request: Request) {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "Payload too large." }, { status: 413 });
  }

  const rawBody = await request.text();
  if (!rawBody) {
    return NextResponse.json({ ok: false, error: "Empty payload." }, { status: 400 });
  }

  const authConfig = getWebhookAuthConfig();
  const verification = verifyWebhookRequest(rawBody, request.headers, authConfig);
  if (!verification.valid) {
    return NextResponse.json({ ok: false, error: verification.error }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const validation = validateWebhookPayload(payload);
  if (!validation.valid) {
    return NextResponse.json({ ok: false, error: "Invalid webhook payload.", details: validation.errors }, { status: 400 });
  }

  const { eventId } = resolveEventId(payload, authConfig);
  const receivedAt = new Date().toISOString();

  const data = payload as Record<string, unknown>;
  const category = normalizeEnumValue(data.category);
  const eventType = normalizeEnumValue(data.event);
  const accountId = typeof data.accountId === "string" ? data.accountId : null;
  const userId = typeof data.userId === "string" ? data.userId : null;

  const safeHeaders = buildSafeHeaders(
    request.headers,
    authConfig.mode,
    authConfig.sharedSecretHeaderName,
    authConfig.signatureHeaderName,
  );

  const correlationId = request.headers.get("x-correlation-id");
  const sourceIp = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");

  const ledgerInsert = await insertWebhookEvent({
    eventId,
    authMode: authConfig.mode,
    signatureValid: verification.valid,
    category,
    eventType,
    accountId,
    userId,
    payload,
    headers: safeHeaders,
    correlationId,
    sourceIp,
  });

  if (ledgerInsert.error) {
    return NextResponse.json({ ok: false, error: ledgerInsert.error }, { status: 500 });
  }

  if (ledgerInsert.duplicate) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const projections = await applyWebhookProjections(payload as WebhookEventPayload, { eventId, receivedAt });

  return NextResponse.json({
    ok: true,
    eventId,
    projections,
  });
}
