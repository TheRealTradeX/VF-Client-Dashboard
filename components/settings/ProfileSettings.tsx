"use client";

import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserProfile } from "@/lib/hooks/use-user-profile";

export function ProfileSettings() {
  const { displayName, initials, profile } = useUserProfile();
  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
    [],
  );

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-950 border-zinc-900">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Review your account details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src="" alt={displayName} />
                <AvatarFallback className="bg-zinc-900 text-white">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-white">{displayName}</div>
                <div className="text-sm text-zinc-500">{profile?.email ?? "-"}</div>
              </div>
            </div>
            <div className="text-xs text-zinc-500">
              Profile updates are managed by support.
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-950 border-zinc-900">
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>Basic profile details on file.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" value={profile?.fullName ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile?.email ?? ""} disabled />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Time zone</Label>
            <Input id="timezone" value={timezone} disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
