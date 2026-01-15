"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export function NotificationsSettings() {
  return (
    <div className="space-y-6">
      <Card className="bg-zinc-950 border-zinc-900">
        <CardHeader>
          <CardTitle>Email notifications</CardTitle>
          <CardDescription>Notification preferences will be available soon.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white text-sm">Trade updates</div>
              <div className="text-xs text-zinc-500">Receipts for trade activity.</div>
            </div>
            <Switch checked={false} disabled />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white text-sm">Payout updates</div>
              <div className="text-xs text-zinc-500">Status changes and approvals.</div>
            </div>
            <Switch checked={false} disabled />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-950 border-zinc-900">
        <CardHeader>
          <CardTitle>Push notifications</CardTitle>
          <CardDescription>Browser alerts are coming soon.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white text-sm">Account alerts</div>
              <div className="text-xs text-zinc-500">Risk and drawdown warnings.</div>
            </div>
            <Switch checked={false} disabled />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white text-sm">Announcements</div>
              <div className="text-xs text-zinc-500">Platform updates and news.</div>
            </div>
            <Switch checked={false} disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
