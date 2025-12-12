"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Trophy,
  DollarSign,
  TrendingUp,
  BarChart3,
  Settings,
  FileText,
  Users,
  Zap,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'My Accounts', href: '/accounts', icon: Wallet },
  { name: 'Trading Journal', href: '/journal', icon: BookOpen },
  { name: 'Challenges', href: '/challenges', icon: Trophy },
  { name: 'Payouts', href: '/payouts', icon: DollarSign },
  { name: 'Leaderboard', href: '/leaderboard', icon: TrendingUp },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

const secondaryNavigation = [
  { name: 'Resources', href: '#', icon: FileText },
  { name: 'Community', href: '#', icon: Users },
  { name: 'Settings', href: '#', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className={`bg-zinc-950 border-r border-zinc-900 flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-900">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" fill="currentColor" />
            </div>
            <div>
              <div className="text-white tracking-tight">Velocity Funds</div>
              <div className="text-xs text-emerald-500">Prop Trading</div>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto">
            <Zap className="w-5 h-5 text-black" fill="currentColor" />
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-20 -right-3 w-6 h-6 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-emerald-500 text-black'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        <div className="pt-6 mt-6 border-t border-zinc-900 space-y-1">
          {secondaryNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all"
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </div>
      </nav>

      {/* Account Info */}
      {!isCollapsed && (
        <div className="p-4 border-t border-zinc-900">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-black">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm truncate">John Doe</div>
              <div className="text-xs text-zinc-500">Funded Trader</div>
            </div>
          </div>
        </div>
      )}
      {isCollapsed && (
        <div className="p-4 border-t border-zinc-900">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <span className="text-black text-sm">JD</span>
          </div>
        </div>
      )}
    </div>
  );
}
