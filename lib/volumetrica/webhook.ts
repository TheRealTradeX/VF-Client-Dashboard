import crypto from "crypto";

import type { WebhookEventPayload } from "./types";

type WebhookAuthMode = "shared_secret_header" | "hmac_signature";

type WebhookAuthConfig = {
  mode: WebhookAuthMode;
  sharedSecretHeaderName?: string;
  sharedSecretValue?: string;
  signatureHeaderName?: string;
  signatureAlgorithm?: string;
  signatureEncoding?: "hex" | "base64";
  signingSecret?: string;
  eventIdPath?: string;
};

const DEFAULT_EVENT_ID_PATH = "id";

const normalizeHeaderValue = (value: string) => value.trim();

const normalizeSignature = (signature: string, algorithm?: string) => {
  const value = signature.trim();
  const parts = value.split("=");
  if (parts.length === 2 && algorithm && parts[0].toLowerCase() === algorithm.toLowerCase()) {
    return parts[1];
  }
  return value;
};

const safeEqual = (a: string, b: string) => {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
};

export function getWebhookAuthConfig(): WebhookAuthConfig {
  const mode = (process.env.WEBHOOK_AUTH_MODE ?? "shared_secret_header") as WebhookAuthMode;
  return {
    mode,
    sharedSecretHeaderName: process.env.WEBHOOK_SHARED_SECRET_HEADER_NAME ?? "x-webhook-secret",
    sharedSecretValue: process.env.WEBHOOK_SHARED_SECRET_VALUE ?? "",
    signatureHeaderName: process.env.WEBHOOK_SIGNATURE_HEADER_NAME ?? "x-webhook-signature",
    signatureAlgorithm: process.env.WEBHOOK_SIGNATURE_ALGORITHM ?? "sha256",
    signatureEncoding: (process.env.WEBHOOK_SIGNATURE_ENCODING ?? "hex") as "hex" | "base64",
    signingSecret: process.env.WEBHOOK_SIGNING_SECRET ?? "",
    eventIdPath: process.env.WEBHOOK_EVENT_ID_PATH ?? DEFAULT_EVENT_ID_PATH,
  };
}

export function stableStringify(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  }

  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const entries = keys
    .filter((key) => obj[key] !== undefined)
    .map((key) => `${JSON.stringify(key)}:${stableStringify(obj[key])}`);
  return `{${entries.join(",")}}`;
}

export function getByPath(value: unknown, path: string): unknown {
  if (!path) return undefined;
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, value);
}

export function computeEventId(payload: unknown): string {
  const canonical = stableStringify(payload);
  const hash = crypto.createHash("sha256").update(canonical).digest("hex");
  return `computed:${hash}`;
}

export function resolveEventId(payload: unknown, config: WebhookAuthConfig) {
  const path = config.eventIdPath ?? DEFAULT_EVENT_ID_PATH;
  const candidate = getByPath(payload, path);
  if (typeof candidate === "string" && candidate.trim()) {
    return { eventId: candidate.trim(), computed: false };
  }
  return { eventId: computeEventId(payload), computed: true };
}

export function validateWebhookPayload(payload: unknown) {
  const errors: string[] = [];
  if (!payload || typeof payload !== "object") {
    return { valid: false, errors: ["Payload must be an object."] };
  }

  const event = payload as WebhookEventPayload;
  if (event.dtUtc !== undefined && typeof event.dtUtc !== "string") {
    errors.push("dtUtc must be a string.");
  }
  if (event.category !== undefined && typeof event.category !== "string" && typeof event.category !== "number") {
    errors.push("category must be a string or number.");
  }
  if (event.event !== undefined && typeof event.event !== "string" && typeof event.event !== "number") {
    errors.push("event must be a string or number.");
  }
  if (event.userId !== undefined && event.userId !== null && typeof event.userId !== "string") {
    errors.push("userId must be a string or null.");
  }
  if (event.accountId !== undefined && event.accountId !== null && typeof event.accountId !== "string") {
    errors.push("accountId must be a string or null.");
  }
  if (event.tradingAccount !== undefined && event.tradingAccount !== null && typeof event.tradingAccount !== "object") {
    errors.push("tradingAccount must be an object.");
  }
  if (
    event.subscription !== undefined &&
    event.subscription !== null &&
    typeof event.subscription !== "object"
  ) {
    errors.push("subscription must be an object.");
  }
  if (event.tradeReport !== undefined && event.tradeReport !== null) {
    const isValid =
      typeof event.tradeReport === "object" || Array.isArray(event.tradeReport);
    if (!isValid) {
      errors.push("tradeReport must be an object or array.");
    }
  }
  if (event.tradingPosition !== undefined && event.tradingPosition !== null) {
    const isValid =
      typeof event.tradingPosition === "object" || Array.isArray(event.tradingPosition);
    if (!isValid) {
      errors.push("tradingPosition must be an object or array.");
    }
  }
  if (event.tradingPortfolio !== undefined && event.tradingPortfolio !== null) {
    const isValid =
      typeof event.tradingPortfolio === "object" || Array.isArray(event.tradingPortfolio);
    if (!isValid) {
      errors.push("tradingPortfolio must be an object or array.");
    }
  }
  if (
    event.organizationUser !== undefined &&
    event.organizationUser !== null &&
    typeof event.organizationUser !== "object"
  ) {
    errors.push("organizationUser must be an object.");
  }

  return { valid: errors.length === 0, errors };
}

export function verifyWebhookRequest(rawBody: string, headers: Headers, config: WebhookAuthConfig) {
  if (config.mode === "shared_secret_header") {
    const headerName = config.sharedSecretHeaderName ?? "x-webhook-secret";
    const received = headers.get(headerName) ?? "";
    const expected = config.sharedSecretValue ?? "";
    const isValid = received && expected && safeEqual(normalizeHeaderValue(received), normalizeHeaderValue(expected));
    return {
      mode: config.mode,
      valid: Boolean(isValid),
      signature: received || null,
      error: isValid ? null : "Shared secret header mismatch.",
    };
  }

  const headerName = config.signatureHeaderName ?? "x-webhook-signature";
  const received = headers.get(headerName) ?? "";
  const algorithm = config.signatureAlgorithm ?? "sha256";
  const encoding = config.signatureEncoding ?? "hex";
  const secret = config.signingSecret ?? "";
  if (!received || !secret) {
    return {
      mode: config.mode,
      valid: false,
      signature: received || null,
      error: "Missing signature or signing secret.",
    };
  }

  const computed = crypto.createHmac(algorithm, secret).update(rawBody).digest(encoding);
  const normalizedReceived = normalizeSignature(received, algorithm);
  const normalizedComputed = normalizeSignature(computed, algorithm);
  const isValid = safeEqual(normalizedReceived, normalizedComputed);

  return {
    mode: config.mode,
    valid: Boolean(isValid),
    signature: received,
    error: isValid ? null : "Signature verification failed.",
  };
}

export type { WebhookAuthConfig, WebhookAuthMode };
