"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type UserProfile = {
  id: string;
  email: string | null;
  fullName: string | null;
  role: string | null;
};

const readString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const buildMetadataName = (metadata: Record<string, unknown>) => {
  const first =
    readString(metadata.firstName) ||
    readString(metadata.first_name) ||
    readString(metadata.given_name);
  const last =
    readString(metadata.lastName) ||
    readString(metadata.last_name) ||
    readString(metadata.family_name);
  const combined = [first, last].filter(Boolean).join(" ").trim();
  return combined || null;
};

const formatRoleLabel = (role: string | null) => {
  if (!role) return "Trader";
  return role
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const getInitials = (label: string) => {
  const trimmed = label.trim();
  if (!trimmed) return "VF";
  const parts = trimmed.split(" ").filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const first = parts[0][0] ?? "";
  const last = parts[parts.length - 1][0] ?? "";
  return `${first}${last}`.toUpperCase();
};

export function useUserProfile() {
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!isMounted) return;

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, role, email")
        .eq("id", user.id)
        .maybeSingle();

      if (!isMounted) return;

      const metadataName = buildMetadataName(
        (user.user_metadata ?? {}) as Record<string, unknown>,
      );
      const fullName = readString(profileData?.full_name) || metadataName;
      const email = readString(profileData?.email) || user.email || null;
      const role = readString(profileData?.role) || null;

      setProfile({
        id: user.id,
        email,
        fullName,
        role,
      });
      setLoading(false);
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const displayName = useMemo(() => {
    if (profile?.fullName) return profile.fullName;
    if (profile?.email) return profile.email.split("@")[0];
    return "Trader";
  }, [profile]);

  const initials = useMemo(() => getInitials(displayName), [displayName]);
  const roleLabel = useMemo(() => formatRoleLabel(profile?.role ?? null), [profile?.role]);

  return {
    profile,
    displayName,
    initials,
    roleLabel,
    isAdmin: profile?.role === "admin",
    isLoading: loading,
  };
}
