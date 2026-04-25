'use client';
import React from 'react';
import '../index.css';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from 'next-themes';
import { DialogProvider } from '../components/Dialog';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <DialogProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </DialogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
