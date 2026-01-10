export default function AdminVerificationsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white text-2xl mb-1">Verifications</h1>
        <p className="text-zinc-400">Review KYC submissions and identity checks.</p>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-white text-lg mb-1">KYC Controls (Stub)</h2>
          <p className="text-sm text-zinc-500">
            Manual status changes only. No vendor automation is enabled for MVP.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            disabled
            className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed"
          >
            Mark In Review
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
            Reject
          </button>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 text-sm text-zinc-400">
        KYC queue data will appear here once the compliance workflow is enabled.
      </div>
    </div>
  );
}
