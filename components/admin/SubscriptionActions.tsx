"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SubscriptionRowActionsProps = {
  subscriptionId: string;
};

export function SubscriptionRowActions({ subscriptionId }: SubscriptionRowActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const runAction = async (action: "activate" | "deactivate" | "delete") => {
    if (action === "delete" && !window.confirm("Delete this subscription?")) return;
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/subscriptions/${subscriptionId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
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
    <div className="flex flex-wrap items-center gap-2 justify-end">
      <button
        type="button"
        onClick={() => runAction("activate")}
        disabled={loading !== null}
        className="px-3 py-1.5 text-xs text-white border border-zinc-700 rounded-lg hover:border-blue-500/50 disabled:opacity-60"
      >
        {loading === "activate" ? "Activating..." : "Activate"}
      </button>
      <button
        type="button"
        onClick={() => runAction("deactivate")}
        disabled={loading !== null}
        className="px-3 py-1.5 text-xs text-white border border-zinc-700 rounded-lg hover:border-amber-500/50 disabled:opacity-60"
      >
        {loading === "deactivate" ? "Deactivating..." : "Deactivate"}
      </button>
      <button
        type="button"
        onClick={() => runAction("delete")}
        disabled={loading !== null}
        className="px-3 py-1.5 text-xs text-white border border-zinc-700 rounded-lg hover:border-rose-500/50 disabled:opacity-60"
      >
        {loading === "delete" ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}

export function SubscriptionForm() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [subscriptionId, setSubscriptionId] = useState("");
  const [dataFeedProducts, setDataFeedProducts] = useState("");
  const [platform, setPlatform] = useState("");
  const [volumetricaPlatform, setVolumetricaPlatform] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [startDate, setStartDate] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const parseNumber = (value: string) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const parseProducts = () => {
    if (!dataFeedProducts.trim()) return undefined;
    const items = dataFeedProducts
      .split(",")
      .map((item) => Number.parseInt(item.trim(), 10))
      .filter((item) => Number.isFinite(item));
    return items.length ? items : undefined;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      subscriptionId: subscriptionId.trim() || undefined,
      userId: userId.trim() || undefined,
      dataFeedProducts: parseProducts(),
      platform: platform ? parseNumber(platform) : undefined,
      volumetricaPlatform: volumetricaPlatform ? parseNumber(volumetricaPlatform) : undefined,
      durationMonths: durationMonths ? parseNumber(durationMonths) : undefined,
      durationDays: durationDays ? parseNumber(durationDays) : undefined,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      enabled,
      redirectUrl: redirectUrl.trim() || undefined,
    };

    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: subscriptionId.trim() ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Request failed.");
      }

      setSubscriptionId("");
      setUserId("");
      setDataFeedProducts("");
      setPlatform("");
      setVolumetricaPlatform("");
      setDurationMonths("");
      setDurationDays("");
      setStartDate("");
      setRedirectUrl("");
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
        <h2 className="text-white text-lg mb-1">Subscription Controls</h2>
        <p className="text-sm text-zinc-500">
          Create or update subscriptions. Use the subscription id to update existing records.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">User reference</label>
          <input
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="Volumetrica user id"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Subscription id (optional)</label>
          <input
            value={subscriptionId}
            onChange={(event) => setSubscriptionId(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="Use to update"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Data feed products</label>
          <input
            value={dataFeedProducts}
            onChange={(event) => setDataFeedProducts(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="Comma-separated IDs"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Platform (optional)</label>
          <input
            value={platform}
            onChange={(event) => setPlatform(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="Enum value"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Volumetrica platform (optional)</label>
          <input
            value={volumetricaPlatform}
            onChange={(event) => setVolumetricaPlatform(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="1 or 2"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Start date (optional)</label>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Duration (months)</label>
          <input
            value={durationMonths}
            onChange={(event) => setDurationMonths(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="Months"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Duration (days)</label>
          <input
            value={durationDays}
            onChange={(event) => setDurationDays(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="Days"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-zinc-400">Redirect URL (optional)</label>
          <input
            value={redirectUrl}
            onChange={(event) => setRedirectUrl(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="https://..."
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
          {loading ? "Saving..." : subscriptionId.trim() ? "Update Subscription" : "Create Subscription"}
        </button>
      </div>
    </form>
  );
}
