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
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 rounded-2xl bg-[#f27d26] flex items-center justify-center shadow-lg shadow-orange-500/30">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
      </div>
      <Loader2 className="w-5 h-5 text-[#f27d26] animate-spin" />
      <p className="text-sm text-zinc-400 font-medium">Completing sign in...</p>
    </div>
  );
}
