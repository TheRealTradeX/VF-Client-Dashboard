"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResetMessage(null);
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setError(null);
    setResetMessage(null);

    if (!email) {
      setError("Please enter your email to reset your password.");
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setResetMessage("Password reset email sent. Check your inbox.");
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_45%)]">
        <div className="flex min-h-screen items-center justify-center px-4 py-12">
          <div className="w-full max-w-md space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl border border-emerald-500/30 bg-zinc-950/70 p-2">
                <img
                  src="/brand/velocity-funds-orbital-icon.svg"
                  alt="Velocity Funds"
                  className="h-full w-full"
                />
              </div>
              <div>
                <div className="text-white text-xl font-semibold">Velocity Funds</div>
                <div className="text-sm text-zinc-400">Trader access</div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-900 bg-zinc-950/90 p-8 shadow-[0_0_60px_rgba(0,0,0,0.35)]">
              <div>
                <h1 className="text-2xl font-semibold text-white">Sign in</h1>
                <p className="mt-2 text-sm text-zinc-400">Access your trading dashboard.</p>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-300" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    placeholder="you@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-zinc-300" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="text-sm text-emerald-400 hover:text-emerald-300"
                  >
                    Forgot password?
                  </button>
                </div>

                {error ? <p className="text-sm text-red-400">{error}</p> : null}
                {resetMessage ? <p className="text-sm text-emerald-400">{resetMessage}</p> : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/60"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>
            </div>

            <p className="text-center text-xs text-zinc-500">
              By continuing you agree to the Velocity Funds terms and policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
