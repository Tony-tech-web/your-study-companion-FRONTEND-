'use client';
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Sparkles, GraduationCap, Calendar,
  BookOpen, Search, MessageSquare, Newspaper, Trophy,
  Moon, Sun, Coffee, LogOut, ChevronLeft, ChevronRight,
  Menu, Activity, X, Loader2, Zap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

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
] as const;

const STORAGE_KEY = 'orbit-sidebar-collapsed';

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
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="w-full max-w-sm bg-white dark:bg-[#111113] border border-zinc-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className={cn('w-2.5 h-2.5 rounded-full', online > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500')} />
            <div>
              <p className="text-[13px] font-bold text-zinc-900 dark:text-white">API Status</p>
              <p className="text-[10px] text-zinc-400">{loading ? 'Checking...' : `${online}/${providers.length} providers online`}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={fetchStatus} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-400 transition-all">
              <Loader2 className={cn('w-3.5 h-3.5', loading ? 'animate-spin text-[#f27d26]' : '')} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-400 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-3 space-y-1.5">
          {loading && providers.length === 0
            ? <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-[#f27d26]" /></div>
            : providers.map(p => {
                const isOnline = p.status === 'connected';
                return (
                  <div key={p.name} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-white/3 border border-zinc-100 dark:border-white/5">
                    <div className={cn('w-2 h-2 rounded-full shrink-0', isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-zinc-900 dark:text-white">{p.name}</p>
                      <p className="text-[10px] text-zinc-400">{p.is_backup ? 'Fallback' : 'Primary'} · {p.latency}</p>
                    </div>
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-lg border',
                      isOnline ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                               : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-500')}>
                      {isOnline ? 'Online' : 'No Key'}
                    </span>
                  </div>
                );
              })
          }
        </div>

        <div className="px-5 py-3 border-t border-zinc-100 dark:border-white/5">
          <p className="text-[10px] text-zinc-400 text-center">
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

  return (
    <>
      {showStatus && <APIStatusModal onClose={() => setShowStatus(false)} />}
      <aside className={cn(
        'hidden lg:flex flex-col h-screen shrink-0 border-r border-zinc-200 dark:border-white/5 bg-white dark:bg-[#111113] transition-[width] duration-200 ease-in-out overflow-hidden',
        collapsed ? 'w-[60px]' : 'w-[220px]'
      )}>
        {/* Logo row */}
        <div className={cn('flex items-center h-14 px-3 border-b border-zinc-100 dark:border-white/5 shrink-0', collapsed ? 'justify-center' : 'justify-between')}>
          {!collapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-xl bg-[#f27d26] flex items-center justify-center shrink-0 shadow-md shadow-orange-500/30">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[13px] font-black tracking-tight text-zinc-900 dark:text-white uppercase">Orbit</span>
            </div>
          )}
          <button onClick={toggle} className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-0.5 p-2 overflow-y-auto custom-scrollbar">
          {navItems.map(item => {
            const active = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
            return (
              <Link key={item.id} href={item.href} title={collapsed ? item.label : undefined}
                className={cn('flex items-center gap-3 rounded-xl transition-all duration-150 group relative',
                  collapsed ? 'h-9 w-9 mx-auto justify-center' : 'h-9 px-2.5',
                  active
                    ? 'bg-[#f27d26] text-white shadow-md shadow-orange-500/20'
                    : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5')}>
                <item.icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="text-[13px] font-semibold">{item.label}</span>}
                {collapsed && (
                  <span className="absolute left-full ml-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-zinc-100 dark:border-white/5 space-y-1 shrink-0">
          {/* Theme */}
          <div className={cn('flex gap-1', collapsed ? 'flex-col items-center' : '')}>
            {[{ v: 'light', I: Sun }, { v: 'dark', I: Moon }, { v: 'brown', I: Coffee }].map(({ v, I }) => (
              <button key={v} onClick={() => setTheme(v)} title={v}
                className={cn('flex items-center justify-center rounded-lg transition-all',
                  collapsed ? 'w-9 h-7' : 'flex-1 h-7',
                  theme === v ? 'bg-[#f27d26] text-white' : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5')}>
                <I className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          {/* API Status */}
          <button onClick={() => setShowStatus(true)} title="API Status"
            className={cn('flex items-center gap-2 rounded-xl h-8 transition-all text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5',
              collapsed ? 'w-9 mx-auto justify-center' : 'w-full px-2.5')}>
            <Activity className="w-3.5 h-3.5 shrink-0" />
            {!collapsed && <span className="text-[11px] font-semibold">API Status</span>}
          </button>

          {/* User */}
          <div className={cn('flex items-center gap-2 rounded-xl px-1.5 py-1.5', collapsed ? 'justify-center' : '')}>
            <div className="w-6 h-6 rounded-lg bg-[#f27d26] text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm">
              {initials}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 overflow-hidden min-w-0">
                  <p className="text-[11px] font-semibold text-zinc-900 dark:text-white truncate">{displayName}</p>
                </div>
                <button onClick={handleSignOut} title="Sign out"
                  className="p-1 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
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

  return (
    <>
      {showStatus && <APIStatusModal onClose={() => setShowStatus(false)} />}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/90 dark:bg-[#111113]/90 backdrop-blur-xl border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-4 z-40" style={{ paddingTop: "env(safe-area-inset-top, 0px)", minHeight: "calc(3rem + env(safe-area-inset-top, 0px))", height: "auto" }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#f27d26] flex items-center justify-center shadow-sm">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[13px] font-black text-zinc-900 dark:text-white uppercase tracking-tight">Orbit</span>
        </div>
        <button onClick={() => setOpen(true)} className="w-8 h-8 flex items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all">
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
              className="relative w-64 h-full bg-white dark:bg-[#111113] border-r border-zinc-200 dark:border-white/5 flex flex-col shadow-2xl" style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 12px)", paddingLeft: 12, paddingRight: 12, paddingBottom: "max(env(safe-area-inset-bottom, 0px), 12px)" }}>
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#f27d26] flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[13px] font-black text-zinc-900 dark:text-white uppercase">Orbit</span>
                </div>
                <button onClick={() => setOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="flex-1 flex flex-col gap-0.5 overflow-y-auto custom-scrollbar">
                {navItems.map(item => {
                  const active = pathname === item.href;
                  return (
                    <Link key={item.id} href={item.href} onClick={() => setOpen(false)}
                      className={cn('flex items-center gap-3 h-9 px-2.5 rounded-xl transition-all',
                        active ? 'bg-[#f27d26] text-white' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5')}>
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="text-[13px] font-semibold">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="border-t border-zinc-100 dark:border-white/5 pt-3 space-y-2">
                <div className="flex gap-1">
                  {[{ v: 'light', I: Sun }, { v: 'dark', I: Moon }, { v: 'brown', I: Coffee }].map(({ v, I }) => (
                    <button key={v} onClick={() => setTheme(v)}
                      className={cn('flex-1 h-8 rounded-xl flex items-center justify-center transition-all',
                        theme === v ? 'bg-[#f27d26] text-white' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5')}>
                      <I className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
                <button onClick={() => { setShowStatus(true); setOpen(false); }}
                  className="w-full flex items-center gap-2 h-9 px-2.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all text-[13px] font-semibold">
                  <Activity className="w-4 h-4" /><span>API Status</span>
                </button>
                <button onClick={async () => { await signOut(); router.push('/login'); }}
                  className="w-full flex items-center gap-2 h-9 px-2.5 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-[13px] font-semibold">
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
