"use client";

import { useState } from "react";
import { PLATFORM_API_LABEL } from "@/lib/platform-labels";

type ReconcileResult = {
  ok: boolean;
  result?: Record<string, unknown>;
  error?: string;
  details?: string;
};

type ReconcileSummary = {
  user?: {
    apiCount?: number;
    projectionCount?: number;
    missingInProjection?: unknown[];
    missingInApi?: unknown[];
    backfilled?: number;
    resolvedUserId?: string;
  };
  account?: {
    api?: {
      status?: string | null;
      tradingPermission?: string | null;
      enabled?: boolean | null;
      ruleId?: string | null;
    };
    projection?: {
      status?: string | null;
      trading_permission?: string | null;
      enabled?: boolean | null;
      rule_id?: string | null;
    };
  };
};

const formatCount = (value?: number) => (typeof value === "number" ? value : "N/A");
const formatStatus = (value?: string | null) => (value ? value : "N/A");
const formatBool = (value?: boolean | null) => (value === true ? "Yes" : value === false ? "No" : "N/A");
const formatListCount = (value?: unknown[]) => (Array.isArray(value) ? value.length : "N/A");

export function ReconcilePanel() {
  const [userId, setUserId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ReconcileResult | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId && !accountId) {
      setResponse({ ok: false, error: "Provide a user or account reference." });
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/volumetrica/reconcile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          userId: userId || undefined,
          accountId: accountId || undefined,
        }),
      });

      const data = (await res.json()) as ReconcileResult;
      setResponse(data);
    } catch (error) {
      setResponse({ ok: false, error: "Request failed.", details: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const summary = (response?.result ?? null) as ReconcileSummary | null;
  const userSummary = summary?.user;
  const accountSummary = summary?.account;
  const apiRuleAssigned = Boolean(accountSummary?.api?.ruleId);
  const projectionRuleAssigned = Boolean(accountSummary?.projection?.rule_id);

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-white text-lg mb-1">Manual Reconciliation</h2>
        <p className="text-zinc-500 text-sm">Compare {PLATFORM_API_LABEL} vs projection state.</p>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">User reference</label>
          <input
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="User reference"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Account reference</label>
          <input
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Account reference"
          />
        </div>
        <div className="md:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-500 text-black hover:bg-blue-600 disabled:opacity-60"
          >
            {loading ? "Reconciling..." : "Run Reconcile"}
          </button>
          <button
            type="button"
            onClick={() => {
              setUserId("");
              setAccountId("");
              setResponse(null);
            }}
            className="px-4 py-2 rounded-lg border border-zinc-800 text-zinc-300 hover:text-white"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="rounded-lg border border-zinc-900 bg-zinc-900/60 p-4 text-sm text-zinc-300 min-h-[120px]">
        {response ? (
          response.ok ? (
            <div className="space-y-4">
              {userSummary && (
                <div className="space-y-2">
                  <div className="text-white text-sm">User reconciliation</div>
                  <div className="grid grid-cols-2 gap-3 text-xs text-zinc-300">
                    <div>
                      Resolved user id:{" "}
                      <span className="text-white">{userSummary.resolvedUserId ?? "N/A"}</span>
                    </div>
                    <div>
                      API accounts: <span className="text-white">{formatCount(userSummary.apiCount)}</span>
                    </div>
                    <div>
                      Projected accounts: <span className="text-white">{formatCount(userSummary.projectionCount)}</span>
                    </div>
                    <div>
                      Missing in projections:{" "}
                      <span className="text-white">{formatListCount(userSummary.missingInProjection)}</span>
                    </div>
                    <div>
                      Missing in API: <span className="text-white">{formatListCount(userSummary.missingInApi)}</span>
                    </div>
                    <div>
                      Backfilled now: <span className="text-white">{formatCount(userSummary.backfilled)}</span>
                    </div>
                  </div>
                </div>
              )}
              {accountSummary && (
                <div className="space-y-2">
                  <div className="text-white text-sm">Account reconciliation</div>
                  <div className="grid grid-cols-2 gap-3 text-xs text-zinc-300">
                    <div>
                      API status: <span className="text-white">{formatStatus(accountSummary.api?.status)}</span>
                    </div>
                    <div>
                      Projection status:{" "}
                      <span className="text-white">{formatStatus(accountSummary.projection?.status)}</span>
                    </div>
                    <div>
                      API trading permission:{" "}
                      <span className="text-white">{formatStatus(accountSummary.api?.tradingPermission)}</span>
                    </div>
                    <div>
                      Projection trading permission:{" "}
                      <span className="text-white">{formatStatus(accountSummary.projection?.trading_permission)}</span>
                    </div>
                    <div>
                      API enabled: <span className="text-white">{formatBool(accountSummary.api?.enabled)}</span>
                    </div>
                    <div>
                      Projection enabled:{" "}
                      <span className="text-white">{formatBool(accountSummary.projection?.enabled)}</span>
                    </div>
                    <div>
                      API rule assigned: <span className="text-white">{formatBool(apiRuleAssigned)}</span>
                    </div>
                    <div>
                      Projection rule assigned:{" "}
                      <span className="text-white">{formatBool(projectionRuleAssigned)}</span>
                    </div>
                  </div>
                </div>
              )}
              {!userSummary && !accountSummary && <div className="text-zinc-500">No results returned.</div>}
            </div>
          ) : (
            <div>
              <div className="text-white text-sm">{response.error ?? "Request failed."}</div>
              <div className="text-xs text-zinc-500">Review inputs and try again.</div>
            </div>
          )
        ) : (
          <div className="text-zinc-500">Results will appear here.</div>
        )}
      </div>
    </div>
  );
}
