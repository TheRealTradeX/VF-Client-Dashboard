import { Award, Medal, Trophy } from "lucide-react";
import { formatCurrency } from "@/lib/mockData";
import { getAuthenticatedSupabaseUser } from "@/lib/volumetrica/trader-data";
import { buildLeaderboard } from "@/lib/volumetrica/leaderboard";

const medalStyles = [
  {
    border: "border-emerald-500",
    iconBg: "bg-emerald-500/10",
    iconText: "text-emerald-500",
    rankText: "text-emerald-500",
  },
  {
    border: "border-zinc-900",
    iconBg: "bg-zinc-500/10",
    iconText: "text-zinc-400",
    rankText: "text-zinc-400",
  },
  {
    border: "border-zinc-900",
    iconBg: "bg-amber-500/10",
    iconText: "text-amber-500",
    rankText: "text-zinc-400",
  },
];

const formatPct = (value: number | null) => {
  if (value === null || !Number.isFinite(value)) return "-";
  return `${value.toFixed(1)}%`;
};

const formatDate = (value: string | null) => {
  if (!value) return "-";
  return value.slice(0, 10);
};

export default async function LeaderboardPage() {
  const user = await getAuthenticatedSupabaseUser();
  let entries: Awaited<ReturnType<typeof buildLeaderboard>> = [];
  let loadError: string | null = null;
  try {
    entries = await buildLeaderboard(user?.id ?? null);
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unable to load leaderboard.";
  }
  const topEntries = entries.slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white text-2xl mb-1">Leaderboard</h1>
        <p className="text-zinc-400">Month-to-date rankings by realized net P&amp;L</p>
      </div>

      {loadError ? (
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 text-zinc-300">
          <div className="text-white mb-2">Unable to load leaderboard.</div>
          <div className="text-sm text-zinc-500">{loadError}</div>
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 text-zinc-300">
          <div className="text-white mb-2">No rankings yet.</div>
          <div className="text-sm text-zinc-500">Rankings appear after closed trades are reported this month.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topEntries.map((entry, index) => {
            const icons = [Trophy, Medal, Award];
            const Icon = icons[index];
            const style = medalStyles[index];

            return (
              <div
                key={entry.accountId}
                className={`bg-zinc-950 border rounded-xl p-6 text-center ${style?.border ?? "border-zinc-900"}`}
              >
                <div className="flex justify-center mb-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${style?.iconBg ?? ""}`}>
                    <Icon className={`w-8 h-8 ${style?.iconText ?? "text-zinc-400"}`} />
                  </div>
                </div>
                <div className={`text-3xl mb-2 ${style?.rankText ?? "text-zinc-400"}`}>#{entry.rank}</div>
                <div className="text-white mb-1">{entry.displayName}</div>
                <div className="text-sm text-zinc-500 mb-4">Trading days: {entry.tradingDays}</div>
                <div className={`text-2xl mb-2 ${entry.netPnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {entry.netPnl >= 0 ? "+" : ""}
                  {formatCurrency(entry.netPnl)}
                </div>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div>
                    <div className="text-zinc-500">Progress</div>
                    <div className="text-white">{formatPct(entry.progressPct)}</div>
                  </div>
                  <div>
                    <div className="text-zinc-500">First Trade</div>
                    <div className="text-white">{formatDate(entry.firstTradeAt)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white">Full Rankings</h2>
          <div className="text-sm text-zinc-500">MTD</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-zinc-400 pb-3 px-4">Rank</th>
                <th className="text-left text-zinc-400 pb-3 px-4">Trader</th>
                <th className="text-right text-zinc-400 pb-3 px-4">Net P&amp;L</th>
                <th className="text-right text-zinc-400 pb-3 px-4">Progress</th>
                <th className="text-right text-zinc-400 pb-3 px-4">Trading Days</th>
                <th className="text-right text-zinc-400 pb-3 px-4">First Trade</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.accountId}
                  className={`border-b border-zinc-800/50 transition-colors ${
                    entry.isCurrentUser ? "bg-emerald-500/5 border-emerald-500/20" : "hover:bg-zinc-900/30"
                  }`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg ${entry.rank <= 3 ? "text-emerald-500" : "text-zinc-400"}`}>
                        #{entry.rank}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-black text-sm">
                        {entry.displayName
                          .split(" ")
                          .map((part) => part.charAt(0))
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <span className="text-white">{entry.displayName}</span>
                      {entry.isCurrentUser && (
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded">
                          You
                        </span>
                      )}
                    </div>
                  </td>
                  <td
                    className={`py-4 px-4 text-right ${
                      entry.netPnl >= 0 ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {entry.netPnl >= 0 ? "+" : ""}
                    {formatCurrency(entry.netPnl)}
                  </td>
                  <td className="py-4 px-4 text-right text-zinc-300">{formatPct(entry.progressPct)}</td>
                  <td className="py-4 px-4 text-right text-zinc-300">{entry.tradingDays}</td>
                  <td className="py-4 px-4 text-right text-zinc-300">{formatDate(entry.firstTradeAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
