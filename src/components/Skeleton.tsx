import React from 'react';
import { cn } from '../lib/utils';

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('skeleton', className)} />
);

export const DashboardSkeleton = () => (
  <div className="flex-1 overflow-y-auto bg-[var(--background)]">
    <div className="max-w-5xl mx-auto p-6 space-y-6 pt-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-6 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-2.5 w-24" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4 flex flex-col items-center">
          <Skeleton className="h-28 w-28 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
    </div>
  </div>
);

export const ListSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="flex-1 overflow-y-auto bg-[var(--background)]">
    <div className="max-w-4xl mx-auto p-6 space-y-5 pt-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]">
          <Skeleton className="h-3 w-32" />
        </div>
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)] last:border-0">
            <Skeleton className="h-8 w-8 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="h-2.5 w-32" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const ChatSkeleton = () => (
  <div className="flex-1 flex flex-col bg-[var(--background)]">
    <div className="px-5 py-3.5 border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between">
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-2.5 w-28" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
    <div className="flex-1 p-4 space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 1 ? 'flex-row-reverse' : ''}`}>
          <Skeleton className="h-8 w-8 rounded-xl shrink-0" />
          <Skeleton className={`h-16 rounded-2xl ${i % 2 === 1 ? 'w-48' : 'w-64'}`} />
        </div>
      ))}
    </div>
  </div>
);
