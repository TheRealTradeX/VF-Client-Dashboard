export default function AdminPayoutsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white text-2xl mb-1">Payouts</h1>
        <p className="text-zinc-400">Track payout requests and approvals.</p>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-white text-lg mb-1">Payout Controls (Stub)</h2>
          <p className="text-sm text-zinc-500">
            Admin-controlled states only. No money movement or processor integration in MVP.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            disabled
            className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed"
          >
            Move to Review
          </button>
          <button
            disabled
            className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed"
          >
            Approve
          </button>
          <button
            disabled
            className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed"
          >
            Mark Paid
          </button>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 text-sm text-zinc-400">
        Payout requests will appear here once the payout lifecycle is enabled.
      </div>
    </div>
  );
}
