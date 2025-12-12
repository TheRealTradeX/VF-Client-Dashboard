import { Check, Star } from 'lucide-react';

interface Challenge {
  id: string;
  name: string;
  price: string;
  profitTarget: string;
  maxDailyLoss: string;
  maxTotalLoss: string;
  tradingDays: number;
  profitSplit: string;
  popular: boolean;
}

interface ChallengeCardProps {
  challenge: Challenge;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  return (
    <div className={`bg-zinc-950 rounded-xl p-6 relative ${
      challenge.popular 
        ? 'border-2 border-emerald-500' 
        : 'border border-zinc-900'
    }`}>
      {challenge.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-black text-xs rounded-full">
            <Star className="w-3 h-3" fill="currentColor" />
            <span>Most Popular</span>
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-white text-xl mb-2">{challenge.name}</h3>
        <div className="text-3xl text-emerald-500">{challenge.price}</div>
        <div className="text-zinc-500 text-sm">one-time fee</div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Profit Target</span>
          <span className="text-white">{challenge.profitTarget}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Max Daily Loss</span>
          <span className="text-white">{challenge.maxDailyLoss}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Max Total Loss</span>
          <span className="text-white">{challenge.maxTotalLoss}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Min Trading Days</span>
          <span className="text-white">{challenge.tradingDays}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Profit Split</span>
          <span className="text-emerald-500">{challenge.profitSplit}</span>
        </div>
      </div>

      <div className="space-y-2 mb-6 pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>Unlimited trading days</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>1-step or 2-step program</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>Bi-weekly payouts</span>
        </div>
      </div>

      <button className={`w-full py-2.5 rounded-lg transition-colors ${
        challenge.popular
          ? 'bg-emerald-500 hover:bg-emerald-600 text-black'
          : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white'
      }`}>
        Get Started
      </button>
    </div>
  );
}
