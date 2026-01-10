"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";

type TradeNowButtonProps = {
  accountId?: string | null;
};

type LoginUrlResponse = {
  ok: boolean;
  url?: string;
  error?: string;
};

export function TradeNowButton({ accountId }: TradeNowButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/volumetrica/login-url", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ accountId: accountId ?? undefined }),
      });
      const data = (await res.json()) as LoginUrlResponse;
      if (!data.ok || !data.url) {
        setError(data.error ?? "Unable to open trading platform.");
        return;
      }
      const opened = window.open(data.url, "_blank", "noopener,noreferrer");
      if (!opened) {
        window.location.assign(data.url);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg transition-colors disabled:opacity-70"
      >
        <ExternalLink className="w-4 h-4" />
        {loading ? "Opening..." : "Trade Now"}
      </button>
      {error && <div className="text-xs text-rose-400">{error}</div>}
    </div>
  );
}
