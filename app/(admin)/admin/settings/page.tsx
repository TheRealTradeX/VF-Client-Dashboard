export default function AdminSettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white text-2xl mb-1">Settings</h1>
        <p className="text-zinc-400">Configure admin preferences and alerts.</p>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4">
        <div>
          <div className="text-white text-sm mb-1">Notifications</div>
          <div className="text-zinc-500 text-xs">Email and in-app alerts for risk events.</div>
        </div>
        <div>
          <div className="text-white text-sm mb-1">Access Control</div>
          <div className="text-zinc-500 text-xs">Roles and admin permissions (coming soon).</div>
        </div>
        <div>
          <div className="text-white text-sm mb-1">Audit Logs</div>
          <div className="text-zinc-500 text-xs">Track admin actions across the platform.</div>
        </div>
      </div>
    </div>
  );
}
