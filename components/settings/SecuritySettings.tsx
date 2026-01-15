"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import { useUserProfile } from "@/lib/hooks/use-user-profile";

type StatusState = {
  type: "success" | "error";
  message: string;
};

export function SecuritySettings() {
  const supabase = useMemo(() => createClient(), []);
  const { profile } = useUserProfile();
  const [status, setStatus] = useState<StatusState | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handlePasswordReset = async () => {
    setStatus(null);
    if (!profile?.email) {
      setStatus({ type: "error", message: "No email address on file." });
      return;
    }

    setIsSending(true);
    const redirectTo = `${window.location.origin}/auth/callback?type=recovery`;
    const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
      redirectTo,
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
    } else {
      setStatus({ type: "success", message: "Password reset email sent." });
    }
    setIsSending(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-950 border-zinc-900">
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Send yourself a password reset link.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handlePasswordReset} disabled={isSending}>
            {isSending ? "Sending..." : "Send reset email"}
          </Button>
          {status && (
            <div className={`text-sm ${status.type === "error" ? "text-red-400" : "text-emerald-400"}`}>
              {status.message}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-zinc-950 border-zinc-900">
        <CardHeader>
          <CardTitle>Two-factor authentication</CardTitle>
          <CardDescription>Extra sign-in protection (coming soon).</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <div className="text-white text-sm">2FA</div>
            <div className="text-xs text-zinc-500">Enable an authenticator app.</div>
          </div>
          <Switch checked={false} disabled />
        </CardContent>
      </Card>

      <Card className="bg-zinc-950 border-zinc-900">
        <CardHeader>
          <CardTitle>Security alerts</CardTitle>
          <CardDescription>Email notifications for unusual activity.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <div className="text-white text-sm">Email alerts</div>
            <div className="text-xs text-zinc-500">Get notified of new logins.</div>
          </div>
          <Switch checked={false} disabled />
        </CardContent>
      </Card>
    </div>
  );
}
