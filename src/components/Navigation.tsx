'use client';
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Sparkles, GraduationCap, Calendar,
  BookOpen, Search, MessageSquare, Newspaper, Trophy,
  Moon, Sun, Coffee, LogOut, ChevronLeft, ChevronRight,
  Menu, Activity, X, Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { id: 'dashboard', label: 'Dashboard',    icon: LayoutDashboard, href: '/dashboard' },
  { id: 'ai',        label: 'AI Assistant', icon: Sparkles,         href: '/ai' },
  { id: 'gpa',       label: 'GPA',          icon: GraduationCap,   href: '/gpa' },
  { id: 'planner',   label: 'Planner',      icon: Calendar,        href: '/planner' },
  { id: 'courses',   label: 'Courses',      icon: BookOpen,        href: '/courses' },
  { id: 'research',  label: 'Research',     icon: Search,          href: '/research' },
  { id: 'chat',      label: 'Chat',         icon: MessageSquare,   href: '/chat' },
  { id: 'news',      label: 'News',         icon: Newspaper,       href: '/news' },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy,         href: '/leaderboard' },
] as const;

const STORAGE_KEY = 'orbit-sidebar-collapsed';

// API Status Modal — global, used in sidebar
interface ApiProvider { name: string; status: string; latency: string; is_backup: boolean; }

const APIStatusModal = ({ onClose }: { onClose: () => void }) => {
  const [providers, setProviders] = React.useState<ApiProvider[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [lastChecked, setLastChecked] = React.useState<Date | null>(null);

  const fetchStatus = React.useCallback(() => {
    setLoading(true);
    import('../services/api').then(({ default: api }) => {
      api.get('/api/model-health')
        .then((r: any) => { setProviders(r.data.providers || []); setLastChecked(new Date()); })
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, []);

  React.useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const onlineCount = providers.filter(p => p.status === 'connected').length;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="w-full max-w-sm bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className={cn('w-2.5 h-2.5 rounded-full', onlineCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500')} />
            <div>
              <p className="text-[13px] font-bold text-[var(--foreground)]">API Status</p>
              <p className="text-[10px] text-[var(--muted)] opacity-60">
                {loading ? 'Checking...' : `${onlineCount} of ${providers.length} systems online`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchStatus} className="p-1.5 rounded-lg hover:bg-[var(--accent)] text-[var(--muted)] hover:text-[var(--foreground)] transition-all" title="Refresh">
              <Loader2 className={cn('w-3.5 h-3.5', loading ? 'animate-spin text-[var(--primary)]' : '')} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--accent)] text-[var(--muted)] transition-all"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Providers */}
        <div className="p-3 space-y-2">
          {loading && providers.length === 0 ? (
            <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" /></div>
          ) : providers.map((p) => {
            const online = p.status === 'connected';
            return (
              <div key={p.name} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--input)] border border-[var(--border)]">
                <div className={cn('w-2 h-2 rounded-full shrink-0 transition-all', online ? 'bg-emerald-500 animate-pulse' : 'bg-red-500')} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[var(--foreground)]">{p.name}</p>
                  <p className="text-[10px] text-[var(--muted)] opacity-50">{p.is_backup ? 'Fallback' : 'Primary'} · {p.latency} latency</p>
                </div>
                <div className={cn('text-[10px] font-bold px-2 py-0.5 rounded-lg border',
                  online
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                    : 'bg-red-500/10 border-red-500/20 text-red-500')}>
                  {online ? 'Online' : 'No Key'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border)] flex items-center justify-between">
          <p className="text-[10px] text-[var(--muted)] opacity-40">
            {lastChecked ? `Last checked ${lastChecked.toLocaleTimeString()}` : 'Not checked yet'}
          </p>
          <p className="text-[10px] text-[var(--muted)] opacity-40">Auto switches between providers</p>
        </div>
      </div>
    </div>
  );
};

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showStatus, setShowStatus] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const router = useRouter();

  // Persist collapsed state
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') setCollapsed(true);
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const displayName = (user?.user_metadata?.full_name as string)?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'Student';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <>
    {showStatus && <APIStatusModal onClose={() => setShowStatus(false)} />}
    <aside
      className={cn(
        'hidden lg:flex flex-col h-screen shrink-0 border-r border-[var(--border)]',
        'bg-[var(--card)] transition-[width] duration-200 ease-in-out overflow-hidden relative',
        collapsed ? 'w-[60px]' : 'w-[220px]'
      )}
    >
      {/* Logo row */}
      <div className={cn(
        'flex items-center h-14 px-3 border-b border-[var(--border)] shrink-0',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-[var(--primary)] flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span className="text-sm font-black tracking-tight text-[var(--foreground)] uppercase whitespace-nowrap">Orbit</span>
          </div>
        )}
        <button
          onClick={toggle}
          className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-all shrink-0"
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronLeft className="w-4 h-4" />
          }
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-0.5 p-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
          return (
            <Link
              key={item.id}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg transition-all duration-150 group relative shrink-0',
                collapsed ? 'h-9 w-9 mx-auto justify-center' : 'h-9 px-2.5',
                active
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && (
                <span className="text-[13px] font-medium whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
              {/* Tooltip when collapsed */}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 rounded-md text-xs font-medium bg-[var(--foreground)] text-[var(--background)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className={cn(
        'p-2 border-t border-[var(--border)] space-y-1 shrink-0',
      )}>
        {/* Theme toggles */}
        <div className={cn(
          'flex gap-1',
          collapsed ? 'flex-col items-center' : 'items-center'
        )}>
          {[
            { value: 'light', icon: Sun, label: 'Light' },
            { value: 'dark',  icon: Moon, label: 'Dark' },
            { value: 'brown', icon: Coffee, label: 'Warm' },
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              title={label}
              className={cn(
                'flex items-center justify-center rounded-lg transition-all duration-150',
                collapsed ? 'w-9 h-7' : 'flex-1 h-7',
                theme === value
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        {/* API Status button */}
        <button
          onClick={() => setShowStatus(true)}
          title="API Status"
          className={cn('flex items-center justify-center rounded-lg transition-all duration-150 text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--accent)]',
            collapsed ? 'w-9 h-7' : 'h-7 w-full gap-2'
          )}>
          <Activity className="w-3.5 h-3.5" />
          {!collapsed && <span className="text-[11px] font-medium">API Status</span>}
        </button>

        {/* User row */}
        <div className={cn(
          'flex items-center gap-2 rounded-lg px-1.5 py-1.5 mt-1',
          collapsed ? 'justify-center' : ''
        )}>
          <div className="w-6 h-6 rounded-md bg-[var(--primary)] text-white flex items-center justify-center text-[10px] font-black shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 overflow-hidden min-w-0">
                <p className="text-[12px] font-semibold text-[var(--foreground)] truncate leading-tight">{displayName}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1 rounded-md text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-all"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  </>
  );
};

export const MobileNav = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <>
      {/* Top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-12 bg-[var(--card)]/95 backdrop-blur-md border-b border-[var(--border)] flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[var(--primary)] flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <span className="text-sm font-black uppercase tracking-tight text-[var(--foreground)]">Orbit</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-64 h-full bg-[var(--card)] border-r border-[var(--border)] flex flex-col p-3 shadow-2xl">
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--primary)] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <span className="text-sm font-black uppercase text-[var(--foreground)]">Orbit</span>
              </div>
              <button onClick={() => setOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 flex flex-col gap-0.5 overflow-y-auto">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 h-9 px-2.5 rounded-lg transition-all',
                      active
                        ? 'bg-[var(--primary)] text-white'
                        : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]'
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="text-[13px] font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-[var(--border)] pt-3 space-y-2">
              <div className="flex gap-1">
                {[
                  { value: 'light', icon: Sun },
                  { value: 'dark',  icon: Moon },
                  { value: 'brown', icon: Coffee },
                ].map(({ value, icon: Icon }) => (
                  <button key={value} onClick={() => setTheme(value)}
                    className={cn('flex-1 h-8 rounded-lg flex items-center justify-center transition-all',
                      theme === value ? 'bg-[var(--primary)] text-white' : 'text-[var(--muted)] hover:bg-[var(--accent)]'
                    )}>
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
              <button onClick={handleSignOut}
                className="w-full flex items-center gap-2 h-9 px-2.5 rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-all text-[13px] font-medium">
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
