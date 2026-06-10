'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { Loader2 } from 'lucide-react';

// This page handles the OAuth callback from Supabase
// URL format: /auth/callback#access_token=...&refresh_token=...
export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase automatically picks up the tokens from the URL hash
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth callback error:', error);
        router.push('/login?error=auth_failed');
        return;
      }

      if (session) {
        router.push('/dashboard');
      } else {
        // Session not ready yet — wait for onAuthStateChange
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            subscription.unsubscribe();
            router.push('/dashboard');
          } else if (event === 'SIGNED_OUT') {
            subscription.unsubscribe();
            router.push('/login');
          }
        });
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center gap-4 px-6">
      <div className="premium-card flex w-full max-w-xs flex-col items-center gap-4 p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-[var(--shadow-soft)]">
          <svg className="w-6 h-6 text-[var(--primary-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <Loader2 className="w-5 h-5 text-[var(--foreground)] animate-spin" />
        <p className="text-sm text-[var(--muted)] font-semibold">Completing sign in...</p>
      </div>
    </div>
  );
}
