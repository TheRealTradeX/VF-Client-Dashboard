"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, FileText, LogOut, MessageSquare, Receipt, Shield, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { BillingHistory } from "@/components/settings/BillingHistory";
import { NotificationsSettings } from "@/components/settings/NotificationsSettings";
import { DocumentsPanel } from "@/components/settings/DocumentsPanel";
import { SupportTicketsPanel } from "@/components/settings/SupportTicketsPanel";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleLogout = async () => {
    setLogoutError(null);
    setIsLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    setIsLoggingOut(false);

    if (error) {
      setLogoutError(error.message);
      return;
    }

    router.push("/login");
    router.refresh();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-white text-2xl font-semibold">Settings</h1>
          <p className="text-zinc-400">Manage your account preferences and security.</p>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          {logoutError && <div className="text-xs text-red-400">{logoutError}</div>}
          <Button variant="outline" onClick={handleLogout} disabled={isLoggingOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 gap-2 rounded-xl border border-zinc-900 bg-zinc-950 p-2 md:grid-cols-3 lg:grid-cols-6">
          <TabsTrigger
            value="profile"
            className="gap-2 text-zinc-400 data-[state=active]:bg-emerald-500 data-[state=active]:text-black"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="gap-2 text-zinc-400 data-[state=active]:bg-emerald-500 data-[state=active]:text-black"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="gap-2 text-zinc-400 data-[state=active]:bg-emerald-500 data-[state=active]:text-black"
          >
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="gap-2 text-zinc-400 data-[state=active]:bg-emerald-500 data-[state=active]:text-black"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="gap-2 text-zinc-400 data-[state=active]:bg-emerald-500 data-[state=active]:text-black"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Documents</span>
          </TabsTrigger>
          <TabsTrigger
            value="support"
            className="gap-2 text-zinc-400 data-[state=active]:bg-emerald-500 data-[state=active]:text-black"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Support</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>
        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
        <TabsContent value="billing">
          <BillingHistory />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsSettings />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsPanel />
        </TabsContent>
        <TabsContent value="support">
          <SupportTicketsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
