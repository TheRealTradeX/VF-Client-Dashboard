import { LeaderboardControls } from "@/components/admin/LeaderboardControls";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/time";

type SettingsRow = {
  is_frozen: boolean;
  frozen_snapshot_id: string | null;
  updated_at: string;
};

type SnapshotRow = {
  id: string;
  created_at: string;
  entries: unknown;
};

export default async function AdminLeaderboardPage() {
  const supabase = createSupabaseAdminClient();
  const { data: settings } = await supabase
    .from("leaderboard_settings")
    .select("is_frozen,frozen_snapshot_id,updated_at")
    .eq("id", 1)
    .maybeSingle();

  const settingsRow = (settings as SettingsRow | null) ?? null;

  const snapshotQuery = settingsRow?.frozen_snapshot_id
    ? supabase
        .from("leaderboard_snapshots")
        .select("id, created_at, entries")
        .eq("id", settingsRow.frozen_snapshot_id)
        .maybeSingle()
    : supabase
        .from("leaderboard_snapshots")
        .select("id, created_at, entries")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

  const { data: snapshot } = await snapshotQuery;
  const snapshotRow = (snapshot as SnapshotRow | null) ?? null;
  const entryCount = Array.isArray(snapshotRow?.entries) ? snapshotRow?.entries.length : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white text-2xl mb-1">Leaderboard Controls</h1>
        <p className="text-zinc-400">Freeze rankings and manage visibility for leaderboards.</p>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white text-lg mb-1">Freeze State</div>
            <div className="text-sm text-zinc-500">
              {settingsRow?.is_frozen ? "Leaderboard is frozen." : "Leaderboard is live."}
            </div>
          </div>
          <LeaderboardControls isFrozen={settingsRow?.is_frozen ?? false} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-zinc-500">
          <div className="rounded-lg border border-zinc-900 bg-zinc-950/50 px-3 py-2">
            Snapshot entries: <span className="text-zinc-300">{entryCount}</span>
          </div>
          <div className="rounded-lg border border-zinc-900 bg-zinc-950/50 px-3 py-2">
            Snapshot time:{" "}
            <span className="text-zinc-300">{formatDateTime(snapshotRow?.created_at ?? null)}</span>
          </div>
          <div className="rounded-lg border border-zinc-900 bg-zinc-950/50 px-3 py-2">
            Settings updated:{" "}
            <span className="text-zinc-300">{formatDateTime(settingsRow?.updated_at ?? null)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
