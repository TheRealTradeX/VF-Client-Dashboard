import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./lib/supabase/config";

function withCookies(from: NextResponse, to: NextResponse): NextResponse {
  from.cookies.getAll().forEach((cookie) => {
    const { name, value, ...options } = cookie;
    to.cookies.set(name, value, options);
  });
  return to;
}

type AdminDebugReason = "no_session" | "no_profile" | "profile_error" | "not_admin" | "ok";

function withAdminDebugHeaders(
  response: NextResponse,
  shouldDebug: boolean,
  {
    allowed,
    reason,
    userId,
    role,
    profileError,
  }: {
    allowed: boolean;
    reason: AdminDebugReason;
    userId?: string | null;
    role?: string | null;
    profileError?: string | null;
  },
): NextResponse {
  if (!shouldDebug) return response;
  response.headers.set("x-vf-admin", allowed ? "allowed" : "denied");
  response.headers.set("x-vf-reason", reason);
  response.headers.set("x-vf-user", userId ?? "");
  response.headers.set("x-vf-role", role ?? "");
  if (profileError) {
    response.headers.set("x-vf-profile-error", profileError);
  }
  return response;
}

export async function proxy(req: NextRequest) {
  let res = NextResponse.next();

  const { url, anonKey } = getSupabaseConfig();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const pathname = req.nextUrl.pathname;
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/accounts");
  const isAdminRoute = pathname.startsWith("/admin");
  const shouldDebug = process.env.NODE_ENV !== "production" && isAdminRoute;

  if (!data.user && isProtected) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    const redirect = withCookies(res, NextResponse.redirect(url));
    return withAdminDebugHeaders(redirect, shouldDebug, {
      allowed: false,
      reason: "no_session",
    });
  }

  if (data.user && pathname.startsWith("/admin")) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    const role =
      profile && typeof profile === "object" && "role" in profile
        ? (profile as { role: string | null }).role
        : null;

    if (profileError || !profile) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      const redirect = withCookies(res, NextResponse.redirect(url));
      return withAdminDebugHeaders(redirect, shouldDebug, {
        allowed: false,
        reason: profileError ? "profile_error" : "no_profile",
        userId: data.user.id,
        role,
        profileError: profileError?.message,
      });
    }

    if (role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      const redirect = withCookies(res, NextResponse.redirect(url));
      return withAdminDebugHeaders(redirect, shouldDebug, {
        allowed: false,
        reason: "not_admin",
        userId: data.user.id,
        role,
      });
    }

    res = withAdminDebugHeaders(res, shouldDebug, {
      allowed: true,
      reason: "ok",
      userId: data.user.id,
      role,
    });
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/accounts/:path*"],
};
