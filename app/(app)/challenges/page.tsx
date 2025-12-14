"use client";

import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { ShoppingCart } from "lucide-react";

const challenges = [
  {
    id: "1",
    name: "$25,000 Challenge",
    price: "$175",
    profitTarget: "8%",
    maxDailyLoss: "5%",
    maxTotalLoss: "10%",
    tradingDays: 4,
    profitSplit: "80%",
    popular: false,
  },
  {
    id: "2",
    name: "$50,000 Challenge",
    price: "$299",
    profitTarget: "8%",
    maxDailyLoss: "5%",
    maxTotalLoss: "10%",
    tradingDays: 4,
    profitSplit: "80%",
    popular: true,
  },
  {
    id: "3",
    name: "$100,000 Challenge",
    price: "$549",
    profitTarget: "8%",
    maxDailyLoss: "5%",
    maxTotalLoss: "10%",
    tradingDays: 4,
    profitSplit: "85%",
    popular: false,
  },
  {
    id: "4",
    name: "$200,000 Challenge",
    price: "$999",
    profitTarget: "8%",
    maxDailyLoss: "5%",
    maxTotalLoss: "10%",
    tradingDays: 5,
    profitSplit: "90%",
    popular: false,
  },
];

export default function ChallengesPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white text-2xl mb-1">Available Challenges</h1>
        <p className="text-zinc-400">Choose your account size and start your trading journey</p>
      </div>

      <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-white text-xl mb-2">Limited Time Offer</h2>
            <p className="text-zinc-300 mb-4">
              Get 25% off on all challenges this week. Use code:{" "}
              <span className="text-emerald-500 font-mono">VELOCITY25</span>
            </p>
            <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg transition-colors">
              Learn More
            </button>
          </div>
          <div className="hidden sm:block">
            <div className="rounded-full bg-emerald-500/10 p-3 border border-emerald-500/20">
              <ShoppingCart className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {challenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6">
        <h2 className="text-white text-xl mb-4">Challenge Rules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-emerald-500 mb-2">Phase 1</h3>
            <ul className="text-zinc-400 text-sm space-y-2">
              <li>- Reach profit target</li>
              <li>- Meet minimum trading days</li>
              <li>- No rule violations</li>
            </ul>
          </div>
          <div>
            <h3 className="text-emerald-500 mb-2">Phase 2</h3>
            <ul className="text-zinc-400 text-sm space-y-2">
              <li>- Reach profit target</li>
              <li>- Meet minimum trading days</li>
              <li>- Demonstrate consistency</li>
            </ul>
          </div>
          <div>
            <h3 className="text-emerald-500 mb-2">Funded</h3>
            <ul className="text-zinc-400 text-sm space-y-2">
              <li>- Trade with real capital</li>
              <li>- Bi-weekly payouts</li>
              <li>- Keep up to 90% profits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
