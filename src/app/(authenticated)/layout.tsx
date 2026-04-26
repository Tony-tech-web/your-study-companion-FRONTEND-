'use client';
import React, { useEffect, useRef } from 'react';
import { Sidebar, MobileNav } from '../../components/Navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const redirected = useRef(false);

  useEffect(() => {
    // Only redirect if:
    // 1. Auth check is complete (not loading)
    // 2. No user found
    // 3. We haven't already redirected (prevents loop)
    if (!loading && !user && !redirected.current) {
      redirected.current = true;
      router.replace('/login');
    }
    // Reset redirect flag when user logs in
    if (user) {
      redirected.current = false;
    }
  }, [user, loading, router]);

  // Show spinner while checking auth — never flash redirect
  if (loading) {
    return (
      <div className="flex items-center justify-center bg-[var(--background)]" style={{ height: "100dvh" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <Loader2 className="w-4 h-4 text-[var(--primary)] animate-spin" />
        </div>
      </div>
    );
  }

  // Don't render children until user is confirmed
  if (!user) return null;

  return (
    <div className="flex bg-[var(--background)] text-[var(--foreground)] overflow-hidden" style={{ height: "100dvh" }}>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden pt-[calc(3rem+env(safe-area-inset-top))] lg:pt-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
