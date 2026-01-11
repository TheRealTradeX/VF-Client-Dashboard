"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type LeaderboardControlsProps = {
  isFrozen: boolean;
};

export function LeaderboardControls({ isFrozen }: LeaderboardControlsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleAction = async (action: "freeze" | "unfreeze") => {
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/leaderboard", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "Update failed.");
      }

      setNotice(action === "freeze" ? "Leaderboard frozen." : "Leaderboard unfrozen.");
      router.refresh();
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => handleAction(isFrozen ? "unfreeze" : "freeze")}
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-blue-500 text-black hover:bg-blue-600 disabled:opacity-60"
      >
        {loading ? "Updating..." : isFrozen ? "Unfreeze Leaderboard" : "Freeze Leaderboard"}
      </button>
      {notice ? <span className="text-xs text-zinc-400">{notice}</span> : null}
    </div>
  );
}
