type VolumetricaConfig = {
  baseUrl: string;
  apiKey: string;
  timeoutMs: number;
  maxRetries: number;
};

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_RETRIES = 2;

export function getVolumetricaConfig(): VolumetricaConfig {
  const baseUrl =
    process.env.VOLUMETRICA_API_BASE_URL?.trim() ?? "https://dxfeed.volumetricaprop.com";
  const apiKey = process.env.VOLUMETRICA_API_KEY?.trim() ?? "";
  const timeoutMs = Number.parseInt(process.env.VOLUMETRICA_API_TIMEOUT_MS ?? "", 10);
  const maxRetries = Number.parseInt(process.env.VOLUMETRICA_API_RETRIES ?? "", 10);

  if (!baseUrl) {
    throw new Error("Missing VOLUMETRICA_API_BASE_URL.");
  }
  if (!apiKey) {
    throw new Error("Missing VOLUMETRICA_API_KEY.");
  }

  return {
    baseUrl,
    apiKey,
    timeoutMs: Number.isFinite(timeoutMs) ? timeoutMs : DEFAULT_TIMEOUT_MS,
    maxRetries: Number.isFinite(maxRetries) ? maxRetries : DEFAULT_MAX_RETRIES,
  };
}

export type { VolumetricaConfig };
