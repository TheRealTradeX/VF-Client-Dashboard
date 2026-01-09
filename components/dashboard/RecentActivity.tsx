import { DollarSign, Trophy, TrendingUp, Award, Clock } from 'lucide-react';

export type RecentActivityItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: any;
  color: "emerald" | "yellow" | "purple";
};

const fallbackActivities: RecentActivityItem[] = [
  {
    id: '1',
    type: 'payout',
    title: 'Payout Processed',
    description: '$5,200.00 sent to your account',
    time: '2 hours ago',
    icon: DollarSign,
    color: 'emerald',
  },
  {
    id: '2',
    type: 'milestone',
    title: 'Phase 2 Completed',
    description: 'Account VF-2025-8401 passed evaluation',
    time: '1 day ago',
    icon: Trophy,
    color: 'yellow',
  },
  {
    id: '3',
    type: 'achievement',
    title: 'New Personal Best',
    description: 'Highest daily profit: $3,247.50',
    time: '2 days ago',
    icon: TrendingUp,
    color: 'emerald',
  },
  {
    id: '4',
    type: 'badge',
    title: 'Consistency Badge Earned',
    description: '10 consecutive profitable days',
    time: '3 days ago',
    icon: Award,
    color: 'purple',
  },
];

const colorClasses = {
  emerald: 'bg-emerald-500/10 text-emerald-500',
  yellow: 'bg-yellow-500/10 text-yellow-500',
  purple: 'bg-purple-500/10 text-purple-500',
};

export function RecentActivity({ activities }: { activities?: RecentActivityItem[] }) {
  const rows = activities ?? fallbackActivities;
  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white">Recent Activity</h2>
        <button className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors">
          View all
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="text-sm text-zinc-500">No recent activity.</div>
      ) : (
        <div className="space-y-4">
          {rows.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-emerald-500/30 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  colorClasses[activity.color as keyof typeof colorClasses]
                }`}
              >
                <activity.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white mb-1">{activity.title}</div>
                <div className="text-sm text-zinc-400 mb-2">{activity.description}</div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <Clock className="w-3 h-3" />
                  <span>{activity.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
