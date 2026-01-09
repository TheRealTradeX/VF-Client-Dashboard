import { ReconcilePanel } from "@/components/admin/ReconcilePanel";
import { PLATFORM_API_LABEL } from "@/lib/platform-labels";

export default function AdminReconcilePage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white text-2xl mb-1">Reconciliation</h1>
        <p className="text-zinc-400">On-demand checks against the {PLATFORM_API_LABEL}.</p>
      </div>

      <ReconcilePanel />
    </div>
  );
}
