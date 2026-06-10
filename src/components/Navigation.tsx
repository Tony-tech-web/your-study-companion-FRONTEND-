'use client';
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Sparkles, GraduationCap, Calendar,
  BookOpen, Search, MessageSquare, Newspaper, Trophy,
  Moon, Sun, Coffee, LogOut, ChevronLeft, ChevronRight,
  Menu, Activity, X, Loader2, Zap, Settings, CreditCard, Shield
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { ADMIN_SESSION_EVENT, hasStoredAdminToken } from '../services/admin';

const navItems = [
  { id: 'dashboard',   label: 'Dashboard',    icon: LayoutDashboard, href: '/dashboard' },
  { id: 'ai',          label: 'AI Assistant', icon: Sparkles,        href: '/ai' },
  { id: 'gpa',         label: 'GPA',          icon: GraduationCap,   href: '/gpa' },
  { id: 'planner',     label: 'Planner',      icon: Calendar,        href: '/planner' },
  { id: 'courses',     label: 'Courses',      icon: BookOpen,        href: '/courses' },
  { id: 'research',    label: 'Research',     icon: Search,          href: '/research' },
  { id: 'chat',        label: 'Chat',         icon: MessageSquare,   href: '/chat' },
  { id: 'news',        label: 'News',         icon: Newspaper,       href: '/news' },
  { id: 'leaderboard', label: 'Leaderboard',  icon: Trophy,          href: '/leaderboard' },
  { id: 'billing',     label: 'Billing',      icon: CreditCard,      href: '/billing' },
  { id: 'admin',       label: 'Admin',        icon: Shield,          href: '/admin' },
  { id: 'settings',    label: 'Settings',     icon: Settings,        href: '/settings' },
] as const;

const STORAGE_KEY = 'orbit-sidebar-collapsed';
const themeOptions = [{ v: 'light', I: Sun }, { v: 'dark', I: Moon }, { v: 'brown', I: Coffee }] as const;

// ── API Status Modal ──────────────────────────────────────────────────────────
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

  const online = providers.filter(p => p.status === 'connected').length;

  return (
    <div className="fixed inset-0 z-[100] bg-black/35 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="w-full max-w-sm glass-panel rounded-[28px] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className={cn('w-2.5 h-2.5 rounded-full', online > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500')} />
            <div>
              <p className="text-[13px] font-bold text-[var(--foreground)]">API Status</p>
              <p className="text-[10px] text-zinc-400">{loading ? 'Checking...' : `${online}/${providers.length} providers online`}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={fetchStatus} className="p-1.5 rounded-lg hover:bg-[var(--accent)] text-[var(--muted)] transition-all">
              <Loader2 className={cn('w-3.5 h-3.5', loading ? 'animate-spin text-[var(--foreground)]' : '')} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--accent)] text-[var(--muted)] transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-3 space-y-1.5">
          {loading && providers.length === 0
            ? <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-[var(--foreground)]" /></div>
            : providers.map(p => {
                const isOnline = p.status === 'connected';
                return (
                  <div key={p.name} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--input)] border border-[var(--border)]">
                    <div className={cn('w-2 h-2 rounded-full shrink-0', isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[var(--foreground)]">{p.name}</p>
                      <p className="text-[10px] text-[var(--muted)]">{p.is_backup ? 'Fallback' : 'Primary'} - {p.latency}</p>
                    </div>
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-lg border',
                      isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                               : 'bg-red-500/10 border-red-500/20 text-red-500')}>
                      {isOnline ? 'Online' : 'No Key'}
                    </span>
                  </div>
                );
              })
          }
        </div>

        <div className="px-5 py-3 border-t border-[var(--border)]">
          <p className="text-[10px] text-[var(--muted)] text-center">
            {lastChecked ? `Checked ${lastChecked.toLocaleTimeString()}` : 'Auto switches between providers'}
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') setCollapsed(true);
  }, []);

  const toggle = () => { const n = !collapsed; setCollapsed(n); localStorage.setItem(STORAGE_KEY, String(n)); };
  const handleSignOut = async () => { await signOut(); router.push('/login'); };
  const displayName = (user?.user_metadata?.full_name as string)?.split(' ')[0] || user?.email?.split('@')[0] || 'Student';
  const initials = displayName.slice(0, 2).toUpperCase();
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  useEffect(() => {
    const syncAdmin = () => setAdminUnlocked(hasStoredAdminToken());
    syncAdmin();
    window.addEventListener(ADMIN_SESSION_EVENT, syncAdmin);
    window.addEventListener('storage', syncAdmin);
    return () => {
      window.removeEventListener(ADMIN_SESSION_EVENT, syncAdmin);
      window.removeEventListener('storage', syncAdmin);
    };
  }, []);

  const visibleNavItems = navItems.filter(item => item.id !== 'admin' || adminUnlocked);

  return (
    <>
      {showStatus && <APIStatusModal onClose={() => setShowStatus(false)} />}
      <aside className={cn(
        'hidden lg:flex flex-col my-4 ml-4 h-[calc(100dvh-2rem)] shrink-0 rounded-[32px] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[30px] transition-[width] duration-200 ease-in-out overflow-hidden shadow-[var(--shadow-floating)]',
        collapsed ? 'w-[72px]' : 'w-[248px]'
      )}>
        {/* Logo row */}
        <div className={cn('flex items-center h-16 px-4 border-b border-[var(--border)] shrink-0', collapsed ? 'justify-center' : 'justify-between')}>
          {!collapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-2xl bg-[var(--primary)] flex items-center justify-center shrink-0 shadow-[var(--shadow-soft)]">
                <Zap className="w-3.5 h-3.5 text-[var(--primary-foreground)]" />
              </div>
              <span className="text-[16px] font-black tracking-tight text-[var(--foreground)] uppercase">Orbit</span>
            </div>
          )}
          <button onClick={toggle} className="w-8 h-8 rounded-full border border-[var(--border)] bg-[var(--input)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-all">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1.5 p-3 overflow-y-auto custom-scrollbar">
          {visibleNavItems.map(item => {
            const active = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
            return (
              <Link key={item.id} href={item.href} title={collapsed ? item.label : undefined}
                className={cn('flex items-center gap-3 rounded-2xl transition-all duration-200 group relative premium-button',
                  collapsed ? 'h-11 w-11 mx-auto justify-center' : 'h-11 px-3',
                  active
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-soft)]'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]')}>
                <item.icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="text-[13px] font-semibold">{item.label}</span>}
                {collapsed && (
                  <span className="absolute left-full ml-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[var(--foreground)] text-[var(--background)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-[var(--border)] space-y-2 shrink-0">
          {/* Theme */}
          <div className={cn('flex gap-1 rounded-full border border-[var(--border)] bg-[var(--input)] p-1', collapsed ? 'flex-col items-center' : '')}>
            {themeOptions.map(({ v, I }) => (
              <button key={v} onClick={() => setTheme(v)} title={v}
                className={cn('flex items-center justify-center rounded-full transition-all',
                  collapsed ? 'w-7 h-7' : 'flex-1 h-7',
                  theme === v ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-soft)]' : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]')}>
                <I className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          {/* API Status */}
          <button onClick={() => setShowStatus(true)} title="API Status"
            className={cn('flex items-center gap-2 rounded-2xl h-10 transition-all text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]',
              collapsed ? 'w-11 mx-auto justify-center' : 'w-full px-3')}>
            <Activity className="w-3.5 h-3.5 shrink-0" />
            {!collapsed && <span className="text-[11px] font-semibold">API Status</span>}
          </button>

          {/* User */}
          <div className={cn('flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--input)] px-2 py-2', collapsed ? 'justify-center' : '')}>
            <div className="w-8 h-8 rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center text-[11px] font-black shrink-0 shadow-sm">
              {initials}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 overflow-hidden min-w-0">
                  <p className="text-[11px] font-semibold text-[var(--foreground)] truncate">{displayName}</p>
                </div>
                <button onClick={handleSignOut} title="Sign out"
                  className="p-1 rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-all">
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

// ── Mobile nav ────────────────────────────────────────────────────────────────
export const MobileNav = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [showStatus, setShowStatus] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  useEffect(() => {
    const syncAdmin = () => setAdminUnlocked(hasStoredAdminToken());
    syncAdmin();
    window.addEventListener(ADMIN_SESSION_EVENT, syncAdmin);
    window.addEventListener('storage', syncAdmin);
    return () => {
      window.removeEventListener(ADMIN_SESSION_EVENT, syncAdmin);
      window.removeEventListener('storage', syncAdmin);
    };
  }, []);

  const visibleNavItems = navItems.filter(item => item.id !== 'admin' || adminUnlocked);

  return (
    <>
      {showStatus && <APIStatusModal onClose={() => setShowStatus(false)} />}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[var(--glass-bg)] backdrop-blur-[30px] border-b border-[var(--border)] flex items-center justify-between px-4 z-40" style={{ paddingTop: "env(safe-area-inset-top, 0px)", minHeight: "calc(3rem + env(safe-area-inset-top, 0px))" }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[var(--primary)] flex items-center justify-center shadow-sm">
            <Zap className="w-3.5 h-3.5 text-[var(--primary-foreground)]" />
          </div>
          <span className="text-[13px] font-black text-[var(--foreground)] uppercase tracking-tight">Orbit</span>
        </div>
        <button onClick={() => setOpen(true)} className="w-8 h-8 flex items-center justify-center rounded-xl text-[var(--muted)] hover:bg-[var(--accent)] transition-all">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 400, damping: 36 }}
              className="relative w-64 h-full bg-[var(--glass-bg)] backdrop-blur-[30px] border-r border-[var(--border)] flex flex-col shadow-2xl" style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top, 0px))", paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))", paddingLeft: "0.75rem", paddingRight: "0.75rem" }}>
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[var(--primary)] flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-[var(--primary-foreground)]" />
                  </div>
                  <span className="text-[13px] font-black text-[var(--foreground)] uppercase">Orbit</span>
                </div>
                <button onClick={() => setOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--accent)] transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="flex-1 flex flex-col gap-0.5 overflow-y-auto custom-scrollbar">
                {visibleNavItems.map(item => {
                  const active = pathname === item.href;
                  return (
                    <Link key={item.id} href={item.href} onClick={() => setOpen(false)}
                      className={cn('flex items-center gap-3 h-9 px-2.5 rounded-xl transition-all',
                        active ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]')}>
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="text-[13px] font-semibold">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="border-t border-[var(--border)] pt-3 space-y-2">
                <div className="flex gap-1 rounded-full border border-[var(--border)] bg-[var(--input)] p-1">
                  {themeOptions.map(({ v, I }) => (
                    <button key={v} onClick={() => setTheme(v)}
                      className={cn('flex-1 h-8 rounded-full flex items-center justify-center transition-all',
                        theme === v ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-soft)]' : 'text-[var(--muted)] hover:bg-[var(--accent)]')}>
                      <I className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
                <button onClick={() => { setShowStatus(true); setOpen(false); }}
                  className="w-full flex items-center gap-2 h-9 px-2.5 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-all text-[13px] font-semibold">
                  <Activity className="w-4 h-4" /><span>API Status</span>
                </button>
                <button onClick={async () => { await signOut(); router.push('/login'); }}
                  className="w-full flex items-center gap-2 h-9 px-2.5 rounded-xl text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-all text-[13px] font-semibold">
                  <LogOut className="w-4 h-4" /><span>Sign out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
