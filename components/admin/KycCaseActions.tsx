"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statusOptions = [
  { value: "required", label: "Required" },
  { value: "in_review", label: "In Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

type KycCaseActionsProps = {
  caseId: string;
  currentStatus: string;
  currentNotes?: string | null;
};

export function KycCaseActions({ caseId, currentStatus, currentNotes }: KycCaseActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState(currentNotes ?? "");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/kyc", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          caseId,
          status,
          notes: notes.trim() || null,
        }),
      });

      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "KYC update failed.");
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
