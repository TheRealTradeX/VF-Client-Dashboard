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

const respondOk = (payload: Record<string, unknown>) => NextResponse.json(payload, { status: 200 });

const logWebhookFailure = async (metadata: Record<string, unknown>) => {
  await logAdminAction({
    action: "webhook.ingest.failed",
    targetType: "event",
    targetId: typeof metadata.eventId === "string" ? metadata.eventId : null,
    metadata,
  });
};

export async function POST(request: Request) {
  const contentLength = request.headers.get("content-length");
  const authConfig = getWebhookAuthConfig();
  const safeHeaders = buildSafeHeaders(
    request.headers,
    authConfig.mode,
    authConfig.sharedSecretHeaderName,
    authConfig.signatureHeaderName,
  );
  const correlationId = request.headers.get("x-correlation-id");
  const sourceIp = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");
  const receivedAt = new Date().toISOString();

  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    const errorPayload = { error: "Payload too large.", contentLength, receivedAt };
    const eventId = computeEventId(errorPayload);
    const ledgerInsert = await insertWebhookEvent({
      eventId,
      authMode: authConfig.mode,
      signatureValid: false,
      payload: errorPayload,
      headers: safeHeaders,
      correlationId,
      sourceIp,
    });
    if (ledgerInsert.error) {
      await logWebhookFailure({ eventId, reason: "ledger_insert_failed", error: ledgerInsert.error });
    }
    await logWebhookFailure({ eventId, reason: "payload_too_large", contentLength });
    return respondOk({ ok: false, error: "Payload too large.", eventId });
  }

  const rawBody = await request.text();
  if (!rawBody) {
    const errorPayload = { error: "Empty payload.", receivedAt };
    const eventId = computeEventId(errorPayload);
    const ledgerInsert = await insertWebhookEvent({
      eventId,
      authMode: authConfig.mode,
      signatureValid: false,
      payload: errorPayload,
      headers: safeHeaders,
      correlationId,
      sourceIp,
    });
    if (ledgerInsert.error) {
      await logWebhookFailure({ eventId, reason: "ledger_insert_failed", error: ledgerInsert.error });
    }
    await logWebhookFailure({ eventId, reason: "empty_payload" });
    return respondOk({ ok: false, error: "Empty payload.", eventId });
  }

  const verification = verifyWebhookRequest(rawBody, request.headers, authConfig);

  let payload: unknown;
  let parseError: string | null = null;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    payload = { error: "Invalid JSON payload.", raw: rawBody };
    parseError = "Invalid JSON payload.";
  }

  const { eventId } =
    parseError === null ? resolveEventId(payload, authConfig) : { eventId: computeEventId(rawBody), computed: true };
  const receivedPayload = payload as Record<string, unknown>;
  const category = parseError === null ? normalizeEnumValue(receivedPayload.category) : null;
  const eventType = parseError === null ? normalizeEnumValue(receivedPayload.event) : null;
  const accountId = parseError === null && typeof receivedPayload.accountId === "string" ? receivedPayload.accountId : null;
  const userId = parseError === null && typeof receivedPayload.userId === "string" ? receivedPayload.userId : null;

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
    await logWebhookFailure({ eventId, reason: "ledger_insert_failed", error: ledgerInsert.error });
    return respondOk({ ok: false, error: "Ledger insert failed.", eventId });
  }

  if (!verification.valid) {
    await logWebhookFailure({ eventId, reason: "auth_failed", error: verification.error });
    return respondOk({ ok: false, error: verification.error ?? "Unauthorized.", eventId });
  }

  if (parseError) {
    await logWebhookFailure({ eventId, reason: "invalid_json", error: parseError });
    return respondOk({ ok: false, error: parseError, eventId });
  }

  const validation = validateWebhookPayload(payload);
  if (!validation.valid) {
    await logWebhookFailure({ eventId, reason: "invalid_payload", errors: validation.errors });
    return respondOk({ ok: false, error: "Invalid webhook payload.", details: validation.errors, eventId });
  }

  if (ledgerInsert.duplicate) {
    return respondOk({ ok: true, duplicate: true, eventId });
  }

  let projections: Awaited<ReturnType<typeof applyWebhookProjections>>;
  try {
    projections = await applyWebhookProjections(payload as WebhookEventPayload, { eventId, receivedAt });
  } catch (error) {
    await logWebhookFailure({
      eventId,
      reason: "projection_failed",
      error: (error as Error).message,
    });
    return respondOk({ ok: false, error: "Projection failed.", eventId });
  }

  return respondOk({
    ok: true,
    eventId,
    projections,
  });
}
