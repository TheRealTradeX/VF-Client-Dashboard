import { formatCurrency } from "@/lib/mockData";
import { formatDateTime } from "@/lib/time";
import { getSnapshotNumber } from "@/lib/volumetrica/trader-data";

type AccountLike = {
  account_id?: string | null;
  raw?: Record<string, unknown> | null;
  snapshot?: Record<string, unknown> | null;
  updated_at?: string | null;
};

type UserDisplay = {
  name: string | null;
  email: string | null;
};

const normalizeLabel = (value: string | null, map: Record<string, string>) => {
  if (!value) return "-";
  const trimmed = value.trim();
  const normalized = trimmed.toLowerCase();
  return map[trimmed] ?? map[normalized] ?? trimmed;
};

const readString = (value: unknown) => (typeof value === "string" ? value : null);

export const STATUS_LABELS: Record<string, string> = {
  "0": "Initialized",
  "1": "Enabled",
  "2": "Challenge Success",
  "4": "Challenge Failed",
  "8": "Disabled",
  initialized: "Initialized",
  enabled: "Enabled",
  challengesuccess: "Challenge Success",
  "challenge success": "Challenge Success",
  challengefailed: "Challenge Failed",
  "challenge failed": "Challenge Failed",
  disabled: "Disabled",
};

export const PERMISSION_LABELS: Record<string, string> = {
  "0": "Trading",
  "1": "Read Only",
  "2": "Risk Pause",
  "3": "Liquidate Only",
  trading: "Trading",
  readonly: "Read Only",
  "read only": "Read Only",
  riskpause: "Risk Pause",
  "risk pause": "Risk Pause",
  liquidateonly: "Liquidate Only",
  "liquidate only": "Liquidate Only",
};

export const MODE_LABELS: Record<string, string> = {
  "0": "Evaluation",
  "1": "Sim Funded",
  "2": "Funded",
  "3": "Live",
  "4": "Trial",
  "5": "Contest",
  "100": "Training",
  evaluation: "Evaluation",
  simfunded: "Sim Funded",
  funded: "Funded",
  live: "Live",
  trial: "Trial",
  contest: "Contest",
  training: "Training",
};

export const getUserDetailsFromAccountRaw = (raw: Record<string, unknown> | null): UserDisplay | null => {
  const user = raw?.user;
  if (!user || typeof user !== "object") return null;
  const record = user as Record<string, unknown>;
  const fullName = readString(record.fullName);
  const username = readString(record.username);
  const email = readString(record.email);
  return { name: fullName ?? username ?? email ?? null, email };
};

export const getUserDetailsFromUserRaw = (raw: Record<string, unknown> | null): UserDisplay | null => {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const fullName = readString(record.fullName);
  const username = readString(record.username);
  const email = readString(record.email);
  return { name: fullName ?? username ?? email ?? null, email };
};

export const resolveMode = (account: AccountLike) => {
  const snapshot = account.snapshot ?? {};
  const raw = account.raw ?? {};
  const candidates = [
    snapshot["mode"],
    snapshot["accountMode"],
    snapshot["phase"],
    raw["mode"],
    raw["accountMode"],
    raw["phase"],
  ];
  const mode = candidates.find((value) => typeof value === "string" || typeof value === "number");
  if (mode === undefined || mode === null) return "-";
  return normalizeLabel(String(mode), MODE_LABELS);
};

export const resolveBalance = (snapshot: Record<string, unknown> | null) => {
  const balance =
    getSnapshotNumber(snapshot, "balance") ??
    getSnapshotNumber(snapshot, "equity") ??
    getSnapshotNumber(snapshot, "startBalance");
  return balance === null ? "-" : formatCurrency(balance);
};

export const resolveCreatedAt = (account: AccountLike) => {
  const raw = account.raw ?? {};
  const snapshot = account.snapshot ?? {};
  const candidate =
    readString(raw["creationUtc"]) ||
    readString(raw["creationDate"]) ||
    readString(raw["startDate"]) ||
    readString(snapshot["startDate"]) ||
    account.updated_at ||
    null;
  return formatDateTime(candidate ?? null);
};

export const resolveAccountHeader = (account: AccountLike) => {
  const raw = account.raw ?? {};
  const header = readString(raw["header"]) || readString(raw["displayId"]);
  return header ?? account.account_id ?? "-";
};

export const resolveStatus = (value: string | null) => normalizeLabel(value, STATUS_LABELS);

export const resolvePermission = (value: string | null) => normalizeLabel(value, PERMISSION_LABELS);
