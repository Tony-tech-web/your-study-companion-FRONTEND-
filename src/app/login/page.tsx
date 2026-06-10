'use client';
import React, { useEffect } from 'react';
import { Login } from '../../screens/Login';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function Page() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If already authenticated, skip login
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  // Show spinner while checking — don't flash login form
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center text-[var(--foreground)]">
        <div className="premium-card flex h-12 w-12 items-center justify-center rounded-[22px]">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      </div>
    );
  }

  // Already logged in — redirecting
  if (user) return null;

  return <Login />;
}
