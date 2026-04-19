import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  Search, 
  MessageSquare, 
  Newspaper, 
  Trophy,
  Search as SearchIcon,
  Moon,
  Sun,
  Coffee,
  Menu,
  X
} from 'lucide-react';
import { Screen } from '../types';
import { cn } from '../lib/utils';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

  return (
    <div className="w-80 border-r border-[var(--border)] h-screen bg-[var(--card)] flex flex-col p-8 overflow-y-auto hidden lg:flex shrink-0">
      <div className="flex items-center gap-4 mb-12 px-2">
        <div className="w-12 h-12 rounded-[1.25rem] bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
           <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <div>
          <span className="text-2xl font-black text-[var(--foreground)] tracking-tighter uppercase block leading-none">StratoCore</span>
          <span className="text-[10px] font-black text-[var(--muted)] opacity-60 uppercase tracking-[0.2em] mt-1 block">Unified Shell v4.0</span>
        </div>
      </div>

      <div className="relative mb-10 group">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)] opacity-50 group-focus-within:text-[var(--primary)] transition-colors" />
        <input 
          placeholder="Global Search..." 
          className="w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl pl-12 pr-4 py-4 text-sm font-black text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:opacity-30 focus:outline-none focus:border-[var(--primary)] transition-all shadow-sm"
        />
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "flex items-center gap-5 px-6 py-4 rounded-[1.5rem] transition-all group relative overflow-hidden",
              pathname === item.href 
                ? "bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/20" 
                : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]/50"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              pathname === item.href ? "bg-white/10" : "bg-[var(--accent)]/50 group-hover:scale-110"
            )}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-black uppercase tracking-wider">{item.label}</span>
            {pathname === item.href && (
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-white animate-pulse" />
            )}
          </Link>
        ))}
      </nav>

      <div className="mt-8 pt-8 border-t border-[var(--border)] grid grid-cols-3 gap-3">
        <button 
          onClick={() => setTheme('light')}
          className={cn("p-4 rounded-2xl flex items-center justify-center transition-all", theme === 'light' ? "bg-[var(--primary)] text-white shadow-lg" : "bg-[var(--input)] text-[var(--muted)] hover:text-[var(--foreground)]")}
        >
          <Sun className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setTheme('dark')}
          className={cn("p-4 rounded-2xl flex items-center justify-center transition-all", theme === 'dark' ? "bg-[var(--primary)] text-white shadow-lg" : "bg-[var(--input)] text-[var(--muted)] hover:text-[var(--foreground)]")}
        >
          <Moon className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setTheme('brown')}
          className={cn("p-4 rounded-2xl flex items-center justify-center transition-all", theme === 'brown' ? "bg-[var(--primary)] text-white shadow-lg" : "bg-[var(--input)] text-[var(--muted)] hover:text-[var(--foreground)]")}
        >
          <Coffee className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export const MobileNav = () => {
  const pathname = usePathname();
  
  const mobileItems = navItems.slice(0, 5); // Main 5 items for mobile bar

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-24 bg-[var(--card)]/80 backdrop-blur-2xl border-t border-[var(--border)] px-6 flex items-center justify-around z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgb(0,0,0,0.3)]">
      {mobileItems.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={cn(
            "flex flex-col items-center gap-1.5 p-3 relative",
            pathname === item.href ? "text-[var(--primary)]" : "text-[var(--muted)]"
          )}
        >
          <item.icon className={cn("w-6 h-6 transition-all", pathname === item.href ? "scale-110 active:scale-95" : "")} />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none opacity-80">{item.label.split(' ')[0]}</span>
          {pathname === item.href && (
            <div className="absolute -top-3 w-1.5 h-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_10px_var(--primary)]" />
          )}
        </Link>
      ))}
    </div>
  );
};
