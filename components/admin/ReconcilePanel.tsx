"use client";

import { useState } from "react";

type ReconcileResult = {
  ok: boolean;
  result?: Record<string, unknown>;
  error?: string;
  details?: string;
};

export function ReconcilePanel() {
  const [userId, setUserId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ReconcileResult | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId && !accountId) {
      setResponse({ ok: false, error: "Provide a userId or accountId." });
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

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-white text-lg mb-1">Manual Reconciliation</h2>
        <p className="text-zinc-500 text-sm">Compare Volumetrica API vs projection state.</p>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">User ID</label>
          <input
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Supabase user id or Volumetrica extEntityId"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Account ID</label>
          <input
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Account id"
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
          <pre className="whitespace-pre-wrap text-xs text-zinc-200">
            {JSON.stringify(response, null, 2)}
          </pre>
        ) : (
          <div className="text-zinc-500">Results will appear here.</div>
        )}
      </div>
    </div>
  );
}

