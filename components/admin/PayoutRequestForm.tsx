"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PayoutRequestForm() {
  const router = useRouter();
  const [userRef, setUserRef] = useState("");
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setNotice(null);

    const amountValue = Number.parseFloat(amount);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          userRef: userRef.trim(),
          accountId: accountId.trim() || null,
          amount: Number.isNaN(amountValue) ? null : amountValue,
          currency,
          notes: notes.trim() || null,
        }),
      });

      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "Payout request failed.");
      }

      setUserRef("");
      setAccountId("");
      setAmount("");
      setCurrency("USD");
      setNotes("");
      setNotice("Payout request created.");
      router.refresh();
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
      <div>
        <h2 className="text-white text-lg mb-1">Payout Intake</h2>
        <p className="text-sm text-zinc-500">Create a payout request for review and approval.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-zinc-400">User reference (Supabase id or email)</label>
          <input
            value={userRef}
            onChange={(event) => setUserRef(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="user@company.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Account id (optional)</label>
          <input
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="Account id"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Amount</label>
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="Amount"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Currency</label>
          <select
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
          >
            <option value="USD">USD</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Notes</label>
          <input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
            placeholder="Optional notes"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-500 text-black hover:bg-blue-600 disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
        {notice ? <span className="text-xs text-zinc-400">{notice}</span> : null}
      </div>
    </form>
  );
}
