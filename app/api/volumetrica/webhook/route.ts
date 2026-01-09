import { NextResponse } from "next/server";

import { logAdminAction } from "@/lib/audit";
import { insertWebhookEvent } from "@/lib/volumetrica/ledger";
import { normalizeEnumValue } from "@/lib/volumetrica/normalize";
import { applyWebhookProjections } from "@/lib/volumetrica/projections";
import {
  computeEventId,
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
  const authConfig = getWebhookAuthConfig();
  const receivedAt = new Date().toISOString();
  const safeHeaders = buildSafeHeaders(
    request.headers,
    authConfig.mode,
    authConfig.sharedSecretHeaderName,
    authConfig.signatureHeaderName,
  );
  const correlationId = request.headers.get("x-correlation-id");
  const sourceIp = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");
  const contentLengthHeader = request.headers.get("content-length");
  const contentLength = contentLengthHeader ? Number.parseInt(contentLengthHeader, 10) : null;
  let eventId = "";

  if (contentLength && contentLength > MAX_BODY_BYTES) {
    eventId = computeEventId(`payload_too_large:${contentLength}`);
    await logAdminAction({
      action: "webhook.payload.too_large",
      targetType: "event",
      targetId: eventId,
      metadata: { contentLength, maxBodyBytes: MAX_BODY_BYTES },
    });
    return NextResponse.json({ ok: false, eventId, error: "Payload too large." }, { status: 413 });
  }

  const rawBody = await request.text();
  if (!rawBody) {
    eventId = computeEventId("empty_payload");
    await logAdminAction({
      action: "webhook.payload.empty",
      targetType: "event",
      targetId: eventId,
      metadata: { receivedAt },
    });
    return NextResponse.json({ ok: false, eventId, error: "Empty payload." }, { status: 400 });
  }

  const verification = verifyWebhookRequest(rawBody, request.headers, authConfig);
  if (!verification.valid) {
    eventId = computeEventId(rawBody);
    await logAdminAction({
      action: "webhook.auth.failed",
      targetType: "event",
      targetId: eventId,
      metadata: { error: verification.error ?? "Unauthorized." },
    });
    const isProd = process.env.VERCEL_ENV === "production";
    const expectedHeaderName = authConfig.sharedSecretHeaderName ?? "x-webhook-secret";
    const headerPresent = request.headers.get(expectedHeaderName) !== null;
    if (!isProd) {
      const response = NextResponse.json(
        {
          ok: false,
          error: "unauthorized",
          debug: {
            mode: authConfig.mode,
            expectedHeaderName,
            headerPresent,
          },
        },
        { status: 200 },
      );
      response.headers.set(
        "X-VF-Webhook-Auth",
        `${authConfig.mode}|${expectedHeaderName}|present=${headerPresent}`,
      );
      return response;
    }
    return NextResponse.json(
      { ok: false, eventId, error: verification.error ?? "Unauthorized." },
      { status: 401 },
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    eventId = computeEventId(rawBody);
    await logAdminAction({
      action: "webhook.json.invalid",
      targetType: "event",
      targetId: eventId,
      metadata: { error: "Malformed JSON payload." },
    });
    return NextResponse.json({ ok: false, eventId, error: "Malformed JSON payload." }, { status: 400 });
  }

  const validation = validateWebhookPayload(payload);
  eventId = resolveEventId(payload, authConfig).eventId;

  const data = payload as Record<string, unknown>;
  const category = normalizeEnumValue(data.category);
  const eventType = normalizeEnumValue(data.event);
  const accountId = typeof data.accountId === "string" ? data.accountId : null;
  const userId = typeof data.userId === "string" ? data.userId : null;

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

  let ok = true;
  let error: string | null = null;

  if (!validation.valid) {
    ok = false;
    error = "Invalid webhook payload.";
    await logAdminAction({
      action: "webhook.payload.invalid",
      targetType: "event",
      targetId: eventId,
      metadata: { errors: validation.errors },
    });
  }

  if (ledgerInsert.error) {
    ok = false;
    if (!error) {
      error = "Ledger insert failed.";
    }
    await logAdminAction({
      action: "webhook.ledger.failed",
      targetType: "event",
      targetId: eventId,
      metadata: { error: ledgerInsert.error },
    });
  }

  if (validation.valid && !ledgerInsert.error && !ledgerInsert.duplicate) {
    try {
      await applyWebhookProjections(payload as WebhookEventPayload, { eventId, receivedAt });
    } catch (projectionError) {
      ok = false;
      if (!error) {
        error = "Projection failed.";
      }
      await logAdminAction({
        action: "webhook.projection.failed",
        targetType: "event",
        targetId: eventId,
        metadata: { error: (projectionError as Error).message },
      });
    }
  }

  const response: Record<string, unknown> = { ok, eventId };
  if (error) {
    response.error = error;
  }

  return NextResponse.json(response, { status: 200 });
}
