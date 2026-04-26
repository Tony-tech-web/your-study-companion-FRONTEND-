'use client';
import React from 'react';

import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '../contexts/AuthContext';
import { DialogProvider } from './Dialog';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
      <DialogProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </DialogProvider>
    </ThemeProvider>
  );
}
