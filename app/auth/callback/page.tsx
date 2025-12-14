'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      // Supabase may return either a code (query param) or access/refresh tokens in the hash.
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');

      const hashParams = new URLSearchParams(url.hash.replace('#', ''));
      const type = url.searchParams.get('type') ?? hashParams.get('type');
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      let error: { message: string } | null = null;

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        error = exchangeError;
      } else if (accessToken && refreshToken) {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        error = setSessionError;
      } else {
        error = { message: 'Missing authentication parameters.' };
      }

      if (error) {
        router.replace('/login');
        return;
      }

      if (type === 'recovery') {
        router.replace('/reset-password');
        return;
      }

      router.replace('/dashboard');
    };

    void handleRedirect();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        <p className="text-center text-sm text-gray-700">Completing sign-in...</p>
      </div>
    </div>
  );
}
