type AccountRouteSource = {
  account_id?: unknown;
  id?: unknown;
  accountId?: unknown;
  accountNumber?: unknown;
  number?: unknown;
  code?: unknown;
  raw?: Record<string, unknown> | null;
  snapshot?: Record<string, unknown> | null;
};

const readString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const readFromRecord = (record: Record<string, unknown> | null | undefined, keys: string[]) => {
  if (!record) return "";
  for (const key of keys) {
    const value = readString(record[key]);
    if (value) return value;
  }
  return "";
};

export const resolveAccountRouteId = (account: AccountRouteSource | null | undefined) => {
  if (!account) return "";
  const direct =
    readString(account.account_id) ||
    readString(account.id) ||
    readString(account.accountId) ||
    readString(account.accountNumber) ||
    readString(account.number) ||
    readString(account.code);
  if (direct) return direct;

  const raw = account.raw && typeof account.raw === "object" ? (account.raw as Record<string, unknown>) : null;
  const snapshot =
    account.snapshot && typeof account.snapshot === "object" ? (account.snapshot as Record<string, unknown>) : null;

  return (
    readFromRecord(raw, ["accountId", "accountHeader", "header", "accountNumber", "tradingAccountId", "id"]) ||
    readFromRecord(snapshot, ["accountId", "accountHeader", "header", "accountNumber"])
  );
};
