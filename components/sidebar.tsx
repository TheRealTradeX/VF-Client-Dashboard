"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  CreditCard,
  DollarSign,
  FileText,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Shield,
  Trophy,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Accounts", href: "/accounts", icon: Wallet },
  { name: "Subscriptions", href: "/subscriptions", icon: CreditCard },
  { name: "Trading Journal", href: "/journal", icon: BookOpen },
  { name: "Challenges", href: "/challenges", icon: Trophy },
  { name: "Payouts", href: "/payouts", icon: DollarSign },
  { name: "Leaderboard", href: "/leaderboard", icon: TrendingUp },
];

const secondaryNavigation = [
  { name: "Resources", href: "/resources", icon: FileText },
  { name: "Community", href: "/community", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

const STORAGE_KEY = "vf-sidebar-collapsed";

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    const loadRole = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      if (isMounted) {
        setIsAdmin(profile?.role === "admin");
      }
    };

    void loadRole();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      }
      return next;
    });
  };

  return (
    <div
      className={`bg-zinc-950 border-r border-zinc-900 flex flex-col transition-all duration-300 sticky top-0 h-screen flex-shrink-0 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-900 gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative flex items-center justify-center w-9 h-9 shrink-0 rounded-md bg-zinc-900 border border-zinc-800">
            <img
              src="/brand/velocity-funds-orbital-icon.svg"
              alt="Velocity Funds"
              className="h-8 w-8"
            />
          </div>
          {!isCollapsed && (
            <div className="leading-tight">
              <div className="text-white tracking-tight">Velocity Funds</div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-pressed={isCollapsed}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive ? "bg-emerald-500 text-black" : "text-zinc-400 hover:text-white hover:bg-zinc-900"
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                pathname === item.href
                  ? "bg-emerald-500 text-black"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                pathname.startsWith("/admin")
                  ? "bg-blue-500 text-black"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
              title={isCollapsed ? "Admin Console" : undefined}
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>Admin Console</span>}
            </Link>
          )}
        </div>
      </nav>

      {!isCollapsed && (
        <div className="p-4 border-t border-zinc-900">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-black">JP</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm truncate">Jefrey Peralta</div>
              <div className="text-xs text-zinc-500">Funded Trader</div>
            </div>
          </div>
        </div>
      )}
      {isCollapsed && (
        <div className="p-4 border-t border-zinc-900">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <span className="text-black text-sm">JP</span>
          </div>
        </div>
      )}
    </div>
  );
}
