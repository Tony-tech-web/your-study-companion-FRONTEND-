'use client';
import React, { useEffect } from 'react';

import { ThemeProvider, useTheme } from 'next-themes';
import { AuthProvider } from '../contexts/AuthContext';
import { DialogProvider } from './Dialog';

function ThemeClassBridge() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const darkLike = resolvedTheme === 'dark' || resolvedTheme === 'brown';
    document.documentElement.classList.toggle('dark', darkLike);
  }, [resolvedTheme]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false} enableColorScheme={false}>
      <ThemeClassBridge />
      <DialogProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </DialogProvider>
    </ThemeProvider>
  );
}
