'use client';
import React, { useEffect, useState } from 'react';
import { Card, Button, Badge } from '../components/UI';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getFullDashboardStats, getTasks, getActivity, FullStats } from '../services/dashboard';
import { Task, StudyActivity } from '../types';
import { cn } from '../lib/utils';
import { Plus, CheckCircle2, Loader2, TrendingUp, Zap, Brain, Clock } from 'lucide-react';
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
    return <div className="flex-1 flex items-center justify-center bg-[var(--background)]"><Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" /></div>;
  }

  const xpPercent = Math.round((stats.user.xp / stats.user.maxXp) * 100);
  const researchDisplay = stats.researchMinutes >= 60
    ? `${Math.floor(stats.researchMinutes / 60)}h ${stats.researchMinutes % 60}m`
    : `${stats.researchMinutes}m`;
  const studyDisplay = stats.studyMinutes >= 60
    ? `${Math.floor(stats.studyMinutes / 60)}h`
    : `${stats.studyMinutes}m`;

  const statCards = [
    { label: 'Neural Progress', value: `${xpPercent}%`, sub: `Lvl ${stats.user.level} · ${stats.user.xp}/${stats.user.maxXp} XP`, icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10', href: null },
    { label: 'Current GPA', value: stats.currentGpa, sub: 'Latest semester', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', href: '/gpa' },
    { label: 'AI Interactions', value: stats.aiInteractions.toString(), sub: 'Total sessions', icon: Brain, color: 'text-blue-500', bg: 'bg-blue-500/10', href: '/ai' },
    { label: 'Study Time', value: studyDisplay, sub: 'Total tracked', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10', href: null },
  ];

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[var(--background)] text-[var(--foreground)] custom-scrollbar pb-28 lg:pb-8">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Dashboard</h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            Neural synergy status: <span className="text-[var(--primary)] font-bold">OPTIMIZED</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold text-xs py-1.5 px-3 rounded-lg">● Online</Badge>
          <span className="text-[var(--muted)] text-xs">
            {stats.user.name !== 'Student' ? `Welcome, ${stats.user.name.split(' ')[0]}` : ''}
          </span>
        </div>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div
              onClick={() => card.href && router.push(card.href)}
              className={cn(
                'bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 transition-all hover:border-[var(--primary)]/40 hover:shadow-md',
                card.href ? 'cursor-pointer' : ''
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">{card.label}</span>
                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', card.bg)}>
                  <card.icon className={cn('w-4 h-4', card.color)} />
                </div>
              </div>
              <p className="text-3xl font-black text-[var(--foreground)] tracking-tight">{card.value}</p>
              <p className="text-xs text-[var(--muted)] mt-1 opacity-70">{card.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Activity Chart */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="hover:border-[var(--primary)]/30 transition-all">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black tracking-tight">Activity Analytics</h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">Learning intensity over the last cycle</p>
              </div>
              <Badge className="bg-[var(--accent)] text-[var(--primary)] font-bold text-[10px] tracking-wider">NEURAL FEED</Badge>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activity} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 800 }} dy={8} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', color: 'var(--foreground)', fontSize: '11px' }}
                    itemStyle={{ color: 'var(--primary)', fontWeight: 700 }}
                    cursor={{ fill: 'var(--accent)', opacity: 0.5 }}
                  />
                  <Bar dataKey="hours" fill="var(--primary)" radius={[6, 6, 3, 3]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* XP Ring */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="h-full flex flex-col items-center justify-center hover:border-[var(--primary)]/30 transition-all">
            <div className="relative w-40 h-40 flex items-center justify-center mb-4">
              <svg className="w-full h-full -rotate-90">
                <circle cx="50%" cy="50%" r="42%" stroke="var(--border)" strokeWidth="14" fill="transparent" opacity="0.3" />
                <motion.circle
                  cx="50%" cy="50%" r="42%"
                  stroke="var(--primary)" strokeWidth="14" fill="transparent"
                  strokeDasharray="100 100"
                  strokeDashoffset={100 - xpPercent}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: stats.user.xp / stats.user.maxXp }}
                  transition={{ duration: 1.5, ease: 'circOut' }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-[var(--foreground)]">{xpPercent}%</span>
              </div>
            </div>
            <p className="font-black text-sm text-[var(--foreground)] uppercase tracking-tight">Level {stats.user.level}</p>
            <p className="text-xs text-[var(--muted)] mt-1">{stats.user.xp} / {stats.user.maxXp} XP</p>
            <button
              onClick={() => router.push('/ai')}
              className="mt-4 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Earn XP
            </button>
          </Card>
        </div>

        {/* Study Roadmap */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="h-full hover:border-[var(--primary)]/30 transition-all">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black tracking-tight">Study Roadmap</h3>
              <button onClick={() => router.push('/planner')} className="text-xs font-bold text-[var(--primary)] hover:opacity-80">Full view</button>
            </div>
            <div className="space-y-3">
              {tasks.slice(0, 4).map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--input)] border border-[var(--border)] hover:border-[var(--primary)]/40 transition-all">
                  <div className="w-7 h-7 rounded-lg border-2 border-[var(--border)] flex items-center justify-center shrink-0">
                    {task.completed && <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-[var(--foreground)] truncate">{task.title}</p>
                    <p className="text-[10px] text-[var(--muted)] opacity-60">{task.category}</p>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-xs text-[var(--muted)] opacity-50 mb-3">No study plans yet</p>
                  <button
                    onClick={() => router.push('/planner')}
                    className="flex items-center gap-1.5 mx-auto px-4 py-2 rounded-xl text-xs font-bold text-white"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Plan
                  </button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="hover:border-[var(--primary)]/30 transition-all">
            <h3 className="text-lg font-black tracking-tight mb-5">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'AI Tutor', sub: 'Start session', href: '/ai', color: 'bg-blue-500/10 text-blue-500' },
                { label: 'Log GPA', sub: 'Add semester', href: '/gpa', color: 'bg-emerald-500/10 text-emerald-500' },
                { label: 'Upload PDF', sub: 'Add course doc', href: '/courses', color: 'bg-purple-500/10 text-purple-500' },
                { label: 'Research', sub: 'Scholar search', href: '/research', color: 'bg-orange-500/10 text-orange-500' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => router.push(action.href)}
                  className={cn(
                    'p-4 rounded-2xl border border-[var(--border)] hover:border-[var(--primary)]/40 hover:shadow-md transition-all text-left',
                    'bg-[var(--input)]'
                  )}
                >
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', action.color)}>
                    <Plus className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-black text-[var(--foreground)]">{action.label}</p>
                  <p className="text-[10px] text-[var(--muted)] opacity-60 mt-0.5">{action.sub}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
