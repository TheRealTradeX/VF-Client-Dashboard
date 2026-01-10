"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const statusOptions = [
  { label: "Initialized", value: 0 },
  { label: "Enabled", value: 1 },
  { label: "Challenge Success", value: 2 },
  { label: "Challenge Failed", value: 4 },
  { label: "Disabled", value: 8 },
];

const parseNumber = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
};

type AccountRowActionsProps = {
  accountId: string;
};

export function AccountRowActions({ accountId }: AccountRowActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(statusOptions[0]?.value ?? 0);
  const [reason, setReason] = useState("");
  const [forceClose, setForceClose] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const runAction = async (action: "enable" | "disable" | "status") => {
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/accounts/${accountId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action,
          status: action === "status" ? status : undefined,
          forceClose,
          reason: reason.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Request failed.");
      }

      router.refresh();
    } catch (error) {
      window.alert((error as Error).message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 justify-end">
        <button
          type="button"
          onClick={() => runAction("enable")}
          disabled={loading !== null}
          className="px-3 py-1.5 text-xs text-white border border-zinc-700 rounded-lg hover:border-emerald-500/50 disabled:opacity-60"
        >
          {loading === "enable" ? "Enabling..." : "Enable"}
        </button>
        <button
          type="button"
          onClick={() => runAction("disable")}
          disabled={loading !== null}
          className="px-3 py-1.5 text-xs text-white border border-zinc-700 rounded-lg hover:border-rose-500/50 disabled:opacity-60"
        >
          {loading === "disable" ? "Disabling..." : "Disable"}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 justify-end">
        <select
          value={status}
          onChange={(event) => setStatus(Number(event.target.value))}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-white"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => runAction("status")}
          disabled={loading !== null}
          className="px-3 py-1.5 text-xs text-white border border-zinc-700 rounded-lg hover:border-blue-500/50 disabled:opacity-60"
        >
          {loading === "status" ? "Updating..." : "Update Status"}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 justify-end">
        <input
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="w-40 rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-white"
          placeholder="Reason (optional)"
        />
        <label className="flex items-center gap-2 text-xs text-zinc-300">
          <input
            type="checkbox"
            checked={forceClose}
            onChange={(event) => setForceClose(event.target.checked)}
            className="h-3.5 w-3.5 rounded border-zinc-700 bg-zinc-900"
          />
          Force close
        </label>
      </div>
    </div>
  );
}

type RuleOption = {
  rule_id: string;
  rule_name: string | null;
  reference_id: string | null;
};

type AccountCreateFormProps = {
  rules: RuleOption[];
  defaultUserId?: string;
  lockUserId?: boolean;
};

export function AccountCreateForm({ rules, defaultUserId, lockUserId }: AccountCreateFormProps) {
  const router = useRouter();
  const initialUserId = defaultUserId ?? "";
  const [userId, setUserId] = useState(initialUserId);
  const [balance, setBalance] = useState("");
  const [maxBalance, setMaxBalance] = useState("");
  const [header, setHeader] = useState("");
  const [description, setDescription] = useState("");
  const [ruleId, setRuleId] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          userId: userId.trim(),
          balance: balance ? parseNumber(balance) : undefined,
          maximumBalance: maxBalance ? parseNumber(maxBalance) : undefined,
          header: header.trim() || undefined,
          description: description.trim() || undefined,
          accountRuleId: ruleId.trim() || undefined,
          enabled,
        }),
      });

      const body = (await res.json()) as { error?: string; details?: string };
      if (!res.ok) {
        const message = body.details ? `${body.error ?? "Request failed."}\n${body.details}` : body.error;
        throw new Error(message ?? "Request failed.");
      }

      setUserId(initialUserId);
      setBalance("");
      setMaxBalance("");
      setHeader("");
      setDescription("");
      setRuleId("");
      setEnabled(true);
      router.refresh();
    } catch (error) {
      window.alert((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
      <div>
        <h2 className="text-white text-lg mb-1">Account Lifecycle</h2>
        <p className="text-sm text-zinc-500">Create accounts and manage trading status.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">User reference (platform id, Supabase id, or email)</label>
          <input
            value={userId}
            onChange={(event) => (lockUserId ? null : setUserId(event.target.value))}
            readOnly={lockUserId}
            className={`w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white ${
              lockUserId ? "opacity-70" : ""
            }`}
            placeholder="User id or email"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Account header</label>
          <input
            value={header}
            onChange={(event) => setHeader(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="Account label"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Starting balance</label>
          <input
            value={balance}
            onChange={(event) => setBalance(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="Balance"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Maximum balance (optional)</label>
          <input
            value={maxBalance}
            onChange={(event) => setMaxBalance(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="Max balance"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-zinc-400">Account rule (optional)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={ruleId}
              onChange={(event) => setRuleId(event.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            >
              <option value="">Select rule</option>
              {rules.map((rule) => (
                <option key={rule.rule_id} value={rule.rule_id}>
                  {rule.rule_name ?? rule.reference_id ?? rule.rule_id}
                </option>
              ))}
            </select>
            <input
              value={ruleId}
              onChange={(event) => setRuleId(event.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
              placeholder="Rule id (manual)"
            />
          </div>
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-zinc-400">Description (optional)</label>
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="Notes for this account"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900"
          />
          Enabled
        </label>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-500 text-black hover:bg-blue-600 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </div>
    </form>
  );
}

type AccountBulkCreateFormProps = {
  rules: RuleOption[];
  defaultUserId?: string;
  lockUserId?: boolean;
};

export function AccountBulkCreateForm({
  rules,
  defaultUserId,
  lockUserId,
}: AccountBulkCreateFormProps) {
  const router = useRouter();
  const initialUserId = defaultUserId ?? "";
  const [userId, setUserId] = useState(initialUserId);
  const [entries, setEntries] = useState("");
  const [balance, setBalance] = useState("");
  const [maxBalance, setMaxBalance] = useState("");
  const [ruleId, setRuleId] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setNotice(null);

    const userRef = userId.trim();
    if (!userRef) {
      setNotice("User reference is required.");
      setLoading(false);
      return;
    }

    const headers = entries
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (!headers.length) {
      setNotice("Enter at least one account header.");
      setLoading(false);
      return;
    }

    const payloadBase = {
      userId: userRef,
      balance: balance ? parseNumber(balance) : undefined,
      maximumBalance: maxBalance ? parseNumber(maxBalance) : undefined,
      accountRuleId: ruleId.trim() || undefined,
      enabled,
    };

    let successCount = 0;
    const failures: string[] = [];

    for (const header of headers) {
      try {
        const res = await fetch("/api/admin/accounts", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...payloadBase, header }),
        });

        const body = (await res.json()) as { error?: string; details?: string };
        if (!res.ok) {
          const message = body.details ? `${body.error ?? "Request failed."}\n${body.details}` : body.error;
          throw new Error(message ?? "Request failed.");
        }

        successCount += 1;
      } catch (error) {
        failures.push(`${header}: ${(error as Error).message}`);
      }
    }

    setNotice(
      failures.length
        ? `Created ${successCount} of ${headers.length}. ${failures[0]}`
        : `Created ${successCount} account${successCount === 1 ? "" : "s"}.`,
    );

    if (!failures.length) {
      setEntries("");
    }

    setUserId(initialUserId);
    router.refresh();
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
      <div>
        <h2 className="text-white text-lg mb-1">Bulk Account Create</h2>
        <p className="text-sm text-zinc-500">
          Create multiple accounts at once. Enter one account header per line.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-zinc-400">User reference (platform id, Supabase id, or email)</label>
          <input
            value={userId}
            onChange={(event) => (lockUserId ? null : setUserId(event.target.value))}
            readOnly={lockUserId}
            className={`w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white ${
              lockUserId ? "opacity-70" : ""
            }`}
            placeholder="User id or email"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Starting balance</label>
          <input
            value={balance}
            onChange={(event) => setBalance(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="Balance"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Maximum balance (optional)</label>
          <input
            value={maxBalance}
            onChange={(event) => setMaxBalance(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="Max balance"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-zinc-400">Account rule (optional)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={ruleId}
              onChange={(event) => setRuleId(event.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            >
              <option value="">Select rule</option>
              {rules.map((rule) => (
                <option key={rule.rule_id} value={rule.rule_id}>
                  {rule.rule_name ?? rule.reference_id ?? rule.rule_id}
                </option>
              ))}
            </select>
            <input
              value={ruleId}
              onChange={(event) => setRuleId(event.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
              placeholder="Rule id (manual)"
            />
          </div>
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-zinc-400">Account headers</label>
          <textarea
            value={entries}
            onChange={(event) => setEntries(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white min-h-[120px]"
            placeholder="Velocity Starter - 50K&#10;Velocity Starter - 100K"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900"
          />
          Enabled
        </label>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-500 text-black hover:bg-blue-600 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Accounts"}
        </button>
        {notice ? <span className="text-xs text-zinc-400">{notice}</span> : null}
      </div>
    </form>
  );
}
