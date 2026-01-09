"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BadgeCheck,
  DollarSign,
  FileText,
  LayoutDashboard,
  RefreshCw,
  Settings,
  Users,
  Wallet,
} from "lucide-react";

const primaryNavigation = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Account Lists", href: "/admin/accounts", icon: Wallet },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Verifications", href: "/admin/verifications", icon: BadgeCheck },
  { name: "Payouts", href: "/admin/payouts", icon: DollarSign },
];

const secondaryNavigation = [
  { name: "Webhook Ledger", href: "/admin/webhooks", icon: Activity },
  { name: "Reconciliation", href: "/admin/reconcile", icon: RefreshCw },
  { name: "Audit Log", href: "/admin/audit", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="bg-zinc-950 border-r border-zinc-900 flex flex-col h-screen w-72 flex-shrink-0">
      <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <img
              src="/brand/velocity-funds-orbital-icon.svg"
              alt="Velocity Funds"
              className="h-7 w-7"
            />
          </div>
          <div>
            <div className="text-white text-sm">Velocity Funds</div>
            <div className="text-xs text-zinc-500">Admin Console</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {primaryNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors border ${
                isActive
                  ? "bg-blue-500/15 text-blue-200 border-blue-500/40"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900 border-transparent"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-6 mt-6 border-t border-zinc-900 space-y-1">
          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors border ${
                  isActive
                    ? "bg-blue-500/15 text-blue-200 border-blue-500/40"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900 border-transparent"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-zinc-900">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-black font-semibold">
            VF
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm truncate">Admin Team</div>
            <div className="text-xs text-zinc-500">Operations</div>
          </div>
        </div>
      </div>
    </div>
  );
}
