import React from 'react';
import type { Metadata } from 'next';
import '../index.css';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
  title: 'Orbit',
  description: 'AI Education Neural Link',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
