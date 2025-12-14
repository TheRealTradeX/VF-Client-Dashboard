import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const type = request.nextUrl.searchParams.get("type");

  if (!code) {
    return NextResponse.redirect(new URL("/login", request.nextUrl.origin));
  }

  const redirectTo = type === "recovery" ? "/reset-password" : "/dashboard";
  const response = NextResponse.redirect(new URL(redirectTo, request.nextUrl.origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set(name, value, options);
        },
        remove(name, options) {
          response.cookies.delete(name, options);
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login", request.nextUrl.origin));
  }

  return response;
}
