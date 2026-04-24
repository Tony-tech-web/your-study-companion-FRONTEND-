'use client';
import React from 'react';

import { Sidebar, MobileNav } from '../../components/Navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-5 h-5 text-[var(--primary)] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[var(--background)] text-[var(--foreground)] overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden pt-12 lg:pt-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
