'use client';
import React from 'react';
import {
  LayoutDashboard, Sparkles, GraduationCap, Calendar,
  BookOpen, Search, MessageSquare, Newspaper, Trophy,
  Moon, Sun, Coffee, LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'ai', label: 'AI Assistant', icon: Sparkles, href: '/ai' },
  { id: 'gpa', label: 'GPA', icon: GraduationCap, href: '/gpa' },
  { id: 'planner', label: 'Planner', icon: Calendar, href: '/planner' },
  { id: 'courses', label: 'Courses', icon: BookOpen, href: '/courses' },
  { id: 'research', label: 'Research', icon: Search, href: '/research' },
  { id: 'chat', label: 'Chat', icon: MessageSquare, href: '/chat' },
  { id: 'news', label: 'News', icon: Newspaper, href: '/news' },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, href: '/leaderboard' },
] as const;

export const Sidebar = () => {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'ST';
  const displayName = (user?.user_metadata?.full_name as string) || (user?.email?.split('@')[0]) || 'Student';

  return (
    <div className="w-72 border-r border-[var(--border)] h-screen bg-[var(--card)] hidden lg:flex flex-col p-6 overflow-y-auto shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <div>
          <span className="text-xl font-black text-[var(--foreground)] tracking-tight uppercase block leading-none">Orbit</span>
          <span className="text-[9px] font-bold text-[var(--muted)] opacity-50 uppercase tracking-[0.2em] mt-0.5 block">Academic OS v1.0</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] opacity-40" />
        <input
          placeholder="Search..."
          className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:opacity-30 focus:outline-none focus:border-[var(--primary)] transition-all"
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group relative',
                active
                  ? 'bg-[var(--primary)] text-white shadow-lg'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0',
                active ? 'bg-white/15' : 'bg-[var(--border)] group-hover:scale-110'
              )}>
                <item.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold tracking-wide">{item.label}</span>
              {active && <div className="absolute right-0 top-2 bottom-2 w-0.5 bg-white/60 rounded-full" />}
            </Link>
          );
        })}
      </nav>

      {/* Theme switcher */}
      <div className="mt-6 grid grid-cols-3 gap-2">
        {[
          { value: 'light', icon: Sun },
          { value: 'dark', icon: Moon },
          { value: 'brown', icon: Coffee },
        ].map(({ value, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              'p-3 rounded-xl flex items-center justify-center transition-all',
              theme === value ? 'bg-[var(--primary)] text-white shadow-md' : 'bg-[var(--input)] text-[var(--muted)] hover:text-[var(--foreground)]'
            )}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* User */}
      <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center text-xs font-black shrink-0">
          {initials}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-bold text-[var(--foreground)] truncate">{displayName}</p>
          <p className="text-[10px] text-[var(--muted)] opacity-60 truncate uppercase tracking-wide">{user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="p-2 text-[var(--muted)] hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const MobileNav = () => {
  const pathname = usePathname();
  const mobileItems = navItems.slice(0, 5);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-[var(--card)]/90 backdrop-blur-2xl border-t border-[var(--border)] px-4 flex items-center justify-around z-50">
      {mobileItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 p-2 relative',
              active ? 'text-[var(--primary)]' : 'text-[var(--muted)]'
            )}
          >
            {active && <div className="absolute -top-2 w-1 h-1 rounded-full bg-[var(--primary)]" />}
            <item.icon className={cn('w-5 h-5 transition-all', active ? 'scale-110' : '')} />
            <span className="text-[9px] font-bold uppercase tracking-wider">{item.label.split(' ')[0]}</span>
          </Link>
        );
      })}
    </div>
  );
};
