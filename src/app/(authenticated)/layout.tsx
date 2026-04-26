'use client';
import React, { useEffect, useState } from 'react';
import { Sidebar, MobileNav } from '../../components/Navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (!mounted || loading) {
    return (
      <div style={{ height: '100dvh' }} className="flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-lg">
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          </div>
          <p className="text-xs text-[var(--muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      className="flex bg-[var(--background)] text-[var(--foreground)] overflow-hidden"
      style={{ height: '100dvh' }}
    >
      <Sidebar />
      <main
        className="flex-1 flex flex-col overflow-hidden"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
