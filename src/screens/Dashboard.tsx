'use client';
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardSkeleton } from '../components/Skeleton';
import { getFullDashboardStats, getTasks, getActivity, FullStats } from '../services/dashboard';
import { Task, StudyActivity } from '../types';
import { cn } from '../lib/utils';
import { Plus, CheckCircle2, TrendingUp, Zap, Brain, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';

export const Dashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState<FullStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activity, setActivity] = useState<StudyActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getFullDashboardStats(), getTasks(), getActivity()])
      .then(([s, t, a]) => { setStats(s); setTasks(t); setActivity(a); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return <DashboardSkeleton />;
  }

  const xpPct = Math.round((stats.user.xp / stats.user.maxXp) * 100);

  const cards = [
    { label: 'Neural Progress', value: `${xpPct}%`, sub: `Lvl ${stats.user.level}`, icon: Zap, color: 'var(--primary)' },
    { label: 'Current GPA', value: stats.currentGpa, sub: 'Latest semester', icon: TrendingUp, color: '#10b981', href: '/gpa' },
    { label: 'AI Sessions', value: String(stats.aiInteractions), sub: 'Total', icon: Brain, color: '#6366f1', href: '/ai' },
    { label: 'Study Time', value: stats.studyMinutes >= 60 ? `${Math.floor(stats.studyMinutes/60)}h` : `${stats.studyMinutes}m`, sub: 'Tracked', icon: Clock, color: '#8b5cf6' },
  ];
  const workspaceCards = [
    { label: 'AI Assistant', sub: 'Chat, teach, test', href: '/ai', image: '/dashboard/ai-card.png', wide: true },
    { label: 'Planner', sub: `${tasks.length} active`, href: '/planner', image: '/dashboard/planner-card.png' },
    { label: 'Research', sub: `${stats.researchMinutes}m logged`, href: '/research', image: '/dashboard/research-card.png' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)] custom-scrollbar">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5 pb-28 lg:pb-8">

        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Dashboard</h1>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              {stats.user.name !== 'Student' ? `Welcome back, ${stats.user.name.split(' ')[0]}` : 'Welcome back'}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </span>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {cards.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              onClick={() => c.href && router.push(c.href)}
              className={cn(
                'bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 transition-all duration-150',
                c.href ? 'cursor-pointer hover:border-[var(--primary)]/40 hover:shadow-sm' : ''
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wide">{c.label}</p>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.color}18` }}>
                  <c.icon className="w-3.5 h-3.5" style={{ color: c.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--foreground)] tracking-tight">{c.value}</p>
              <p className="text-[11px] text-[var(--muted)] mt-0.5">{c.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Chart + XP ring */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Activity chart */}
          <div className="lg:col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-[var(--foreground)]">AI-Assisted Activity</p>
              <span className="text-[11px] text-[var(--muted)]">Last 7 days</span>
            </div>
            <div className="h-40" style={{ minHeight: 160 }}>
              <ResponsiveContainer width="100%" height="100%" minHeight={160}>
                <BarChart data={activity} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--foreground)' }}
                    itemStyle={{ color: 'var(--primary)' }}
                    cursor={{ fill: 'var(--accent)' }}
                  />
                  <Bar dataKey="hours" fill="var(--primary)" radius={[4, 4, 2, 2]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* XP ring */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 flex flex-col items-center justify-center gap-3">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" stroke="var(--border)" strokeWidth="8" fill="none" />
                <motion.circle
                  cx="50" cy="50" r="38"
                  stroke="var(--primary)" strokeWidth="8" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - xpPct / 100)}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 38 * (1 - xpPct / 100) }}
                  transition={{ duration: 1.2, ease: 'circOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-[var(--foreground)]">{xpPct}%</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[var(--foreground)]">Level {stats.user.level}</p>
              <p className="text-[11px] text-[var(--muted)]">{stats.user.xp}/{stats.user.maxXp} XP</p>
            </div>
            <button
              onClick={() => router.push('/ai')}
              className="text-[11px] font-semibold px-4 py-1.5 rounded-lg text-[var(--primary-foreground)] transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Earn XP
            </button>
          </div>
        </div>

        {/* Tasks + Quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Study plans */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-[var(--foreground)]">Study Plans</p>
              <button onClick={() => router.push('/planner')} className="text-[11px] text-[var(--primary)] font-medium hover:opacity-80">View all</button>
            </div>
            <div className="space-y-2">
              {tasks.slice(0, 4).map(task => (
                <div key={task.id} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
                  <div className={cn(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
                    task.completed ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-[var(--border)]'
                  )}>
                    {task.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[var(--foreground)] truncate">{task.title}</p>
                    <p className="text-[11px] text-[var(--muted)]">{task.category}</p>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="py-6 text-center">
                  <p className="text-[12px] text-[var(--muted)] mb-3">No plans yet</p>
                  <button
                    onClick={() => router.push('/planner')}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg text-[var(--primary-foreground)]"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Create plan
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Workspace cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--foreground)]">Workspace</p>
              <span className="text-[11px] font-semibold text-[var(--muted)]">Live tools</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {workspaceCards.map((a, i) => (
                <motion.button
                  key={a.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + i * 0.05, duration: 0.28 }}
                  onClick={() => router.push(a.href)}
                  className={cn(
                    'group relative min-h-[154px] overflow-hidden rounded-[24px] border border-white/10 p-4 text-left shadow-[0_18px_50px_rgba(0,0,0,0.26)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 active:scale-[0.99]',
                    a.wide && 'col-span-2 min-h-[184px]'
                  )}
                  style={{
                    backgroundImage: `url(${a.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.54)_34%,rgba(0,0,0,0.14)_100%)]" />
                  <div className="relative z-10 flex h-full min-h-[122px] flex-col justify-between">
                    <span className="ml-auto inline-flex h-8 items-center rounded-full bg-white px-4 text-[11px] font-black text-black shadow-[0_10px_30px_rgba(0,0,0,0.24)]">
                      Open
                    </span>
                    <div>
                      <p className="max-w-[72%] truncate text-base font-black text-white">{a.label}</p>
                      <p className="mt-1 max-w-[72%] truncate text-xs font-bold text-white/65">{a.sub}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
