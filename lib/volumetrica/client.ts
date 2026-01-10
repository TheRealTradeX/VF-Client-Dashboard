import { getVolumetricaConfig } from "./config";

type RequestOptions = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  responseType?: "json" | "text";
};

type VolumetricaErrorDetails = {
  status: number;
  statusText: string;
  body?: string;
};

export class VolumetricaApiError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly body?: string;

  constructor(message: string, details: VolumetricaErrorDetails) {
    super(message);
    this.name = "VolumetricaApiError";
    this.status = details.status;
    this.statusText = details.statusText;
    this.body = details.body;
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const buildUrl = (baseUrl: string, path: string, query?: RequestOptions["query"]) => {
  const url = new URL(path, baseUrl);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
};

const parseResponse = async (response: Response, responseType?: RequestOptions["responseType"]) => {
  if (responseType === "text") {
    return response.text();
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("json")) {
    return response.json();
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const shouldRetry = (status: number) => status >= 500 && status < 600;

const request = async <T>(options: RequestOptions): Promise<T> => {
  const config = getVolumetricaConfig();
  const url = buildUrl(config.baseUrl, options.path, options.query);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

    try {
      const response = await fetch(url, {
        method: options.method,
        headers: {
          "x-api-key": config.apiKey,
          ...(options.body ? { "content-type": "application/json" } : {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const body = await response.text();
        const error = new VolumetricaApiError("Volumetrica request failed.", {
          status: response.status,
          statusText: response.statusText,
          body,
        });
        if (shouldRetry(response.status) && attempt < config.maxRetries) {
          lastError = error;
          await sleep(250 * (attempt + 1));
          continue;
        }
        throw error;
      }

      return (await parseResponse(response, options.responseType)) as T;
    } catch (error) {
      clearTimeout(timeout);
      if (attempt < config.maxRetries) {
        lastError = error as Error;
        await sleep(250 * (attempt + 1));
        continue;
      }
      throw error;
    }
  }

  throw lastError ?? new Error("Volumetrica request failed without a response.");
};

export const volumetricaClient = {
  getUserAccounts: (userId: string) =>
    request<unknown[]>({
      method: "GET",
      path: "/api/Propsite/GetUserAccounts",
      query: { userId },
    }),
  getAccountInfo: (accountId: string) =>
    request<Record<string, unknown>>({
      method: "GET",
      path: "/api/Propsite/GetAccountInfo",
      query: { accountId },
    }),
  getAccountReport: (accountId: string, startDt?: string, endDt?: string) =>
    request<Record<string, unknown>>({
      method: "GET",
      path: "/api/Propsite/GetAccountReport",
      query: { accountId, startDt, endDt },
    }),
  exportAccountsTradeListCsv: (startDt: string, endDt: string, rawPositions?: boolean) =>
    request<string>({
      method: "GET",
      path: "/api/Propsite/ExportAccountsTradeListCsv",
      query: { startDt, endDt, rawPositions },
      responseType: "text",
    }),
  getEnabledAccountsId: () =>
    request<string[]>({
      method: "GET",
      path: "/api/Propsite/GetEnabledAccountsId",
    }),
  getSubscriptionStatus: (userId: string, subscriptionId: string) =>
    request<Record<string, unknown>>({
      method: "GET",
      path: "/api/Propsite/GetSubscriptionStatus",
      query: { userId, subscriptionId },
    }),
  newSubscription: (payload: Record<string, unknown>) =>
    request<Record<string, unknown>>({
      method: "POST",
      path: "/api/Propsite/NewSubscription",
      body: payload,
    }),
  updateSubscription: (subscriptionId: string, payload: Record<string, unknown>) =>
    request<Record<string, unknown>>({
      method: "POST",
      path: "/api/Propsite/UpdateSubscription",
      query: { subcriptionId: subscriptionId },
      body: payload,
    }),
  activateSubscription: (subscriptionId: string) =>
    request<unknown>({
      method: "GET",
      path: "/api/Propsite/ActiveSubscription",
      query: { subscriptionId },
    }),
  deactivateSubscription: (subscriptionId: string) =>
    request<unknown>({
      method: "GET",
      path: "/api/Propsite/DeactiveSubscription",
      query: { subscriptionId },
    }),
  deleteSubscription: (subscriptionId: string) =>
    request<unknown>({
      method: "GET",
      path: "/api/Propsite/DeleteSubscription",
      query: { subscriptionId },
    }),
  newUser: (payload: Record<string, unknown>) =>
    request<Record<string, unknown>>({
      method: "POST",
      path: "/api/Propsite/NewUser",
      body: payload,
    }),
  createTradingAccount: (payload: Record<string, unknown>) =>
    request<Record<string, unknown>>({
      method: "POST",
      path: "/api/Propsite/CreateTradingAccount",
      body: payload,
    }),
  changeTradingAccountStatus: (
    accountId: string,
    status: string,
    forceClose?: boolean,
    reason?: string,
  ) =>
    request<unknown>({
      method: "GET",
      path: "/api/Propsite/ChangeTradingAccountStatus",
      query: { accountId, status, forceClose, reason },
    }),
  enableTradingAccount: (accountId: string) =>
    request<unknown>({
      method: "GET",
      path: "/api/Propsite/EnableTradingAccount",
      query: { accountId },
    }),
  disableTradingAccount: (accountId: string, forceClose?: boolean, reason?: string) =>
    request<unknown>({
      method: "GET",
      path: "/api/Propsite/DisableTradingAccount",
      query: { accountId, forceClose, reason },
    }),
  loginUrl: (payload: Record<string, unknown>) =>
    request<string>({
      method: "POST",
      path: "/api/Propsite/LoginUrl",
      body: payload,
      responseType: "text",
    }),
};
