import React from 'react';
import '../index.css';
import { Providers } from '../components/Providers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orbit — Academic OS for Elizade University',
  description: 'AI tutoring, GPA tracking, research tools and campus social for Elizade University students.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
