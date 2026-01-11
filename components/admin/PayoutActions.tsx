"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statusOptions = [
  { value: "requested", label: "Requested" },
  { value: "in_review", label: "In Review" },
  { value: "approved", label: "Approved" },
  { value: "paid", label: "Paid" },
  { value: "rejected", label: "Rejected" },
];

type PayoutActionsProps = {
  payoutId: string;
  currentStatus: string;
};

export function PayoutActions({ payoutId, currentStatus }: PayoutActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState("");
  const [estimateAmount, setEstimateAmount] = useState("");
  const [estimateEta, setEstimateEta] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    const estimateValue = estimateAmount ? Number.parseFloat(estimateAmount) : null;

    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status,
          notes: notes.trim() || null,
          estimateAmount: Number.isNaN(estimateValue) ? null : estimateValue,
          estimateEta: estimateEta.trim() || null,
        }),
      });

      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "Payout update failed.");
      }

      router.refresh();
    } catch (error) {
      window.alert((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-white"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <input
        value={estimateAmount}
        onChange={(event) => setEstimateAmount(event.target.value)}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-white"
        placeholder="Estimate amount"
      />
      <input
        value={estimateEta}
        onChange={(event) => setEstimateEta(event.target.value)}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-white"
        placeholder="ETA (optional)"
      />
      <input
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-white"
        placeholder="Notes"
      />
      <button
        type="button"
        onClick={handleUpdate}
        disabled={loading}
        className="w-full px-3 py-1.5 text-xs text-white border border-zinc-700 rounded-lg hover:border-blue-500/50 disabled:opacity-60"
      >
        {loading ? "Updating..." : "Update"}
      </button>
    </div>
  );
}
