'use client';
import React, { useEffect, useState } from 'react';
import { DashboardSkeleton } from '../components/Skeleton';
import { getFullDashboardStats, getTasks, getActivity, FullStats } from '../services/dashboard';
import { Task, StudyActivity } from '../types';
import { Plus, TrendingUp, Brain, Clock, Target, Play, Search, BookOpen, GraduationCap, Trophy, Sparkles, Calendar } from 'lucide-react';
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

  const studyTime = stats.studyMinutes >= 60 ? `${Math.floor(stats.studyMinutes / 60)}h ${stats.studyMinutes % 60}m` : `${stats.studyMinutes}m`;
  const focusTask = tasks.find(task => !task.completed) || tasks[0];
  const quickActions = [
    { label: 'Research', href: '/research', Icon: Search, tone: 'text-[var(--primary)]' },
    { label: 'Materials', href: '/courses', Icon: BookOpen, tone: 'text-[var(--tertiary)]' },
    { label: 'GPA Tracker', href: '/gpa', Icon: GraduationCap, tone: 'text-[var(--success)]' },
    { label: 'Leaderboard', href: '/leaderboard', Icon: Trophy, tone: 'text-[var(--info)]' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)] custom-scrollbar">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 p-5 pb-28 md:grid-cols-12 md:p-10 lg:pb-10">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-12">
          <div className="stitch-glass-card relative overflow-hidden rounded-[32px] p-8 md:p-12 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--primary)]/5 blur-2xl" />
            <div className="relative z-10">
              <h1 className="font-display text-[34px] font-semibold leading-[41px] tracking-[-0.02em] text-[var(--foreground)]">
                Good morning, {stats.user.name !== 'Student' ? stats.user.name.split(' ')[0] : 'Scholar'}.
              </h1>
              <p className="mt-2 text-[17px] leading-6 text-[var(--muted)]">
                Your trajectory is set. Let&apos;s focus on {focusTask?.title || 'your strongest study block'} today.
              </p>
            </div>
            <button onClick={() => router.push('/gpa')} className="stitch-neo-raised relative z-10 flex min-w-[220px] items-center gap-6 rounded-[32px] p-6 text-left">
              <div>
                <p className="mb-1 text-[12px] font-bold uppercase tracking-[0.05em] text-[var(--muted)]">Cumulative GPA</p>
                <p className="font-display text-[34px] font-semibold leading-[41px] text-[var(--primary)]">{stats.currentGpa}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
            </button>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="md:col-span-4">
          <div className="stitch-glass-card flex h-full flex-col items-center justify-between rounded-[32px] p-8 text-center">
            <div className="mb-6 w-full text-left">
              <h2 className="flex items-center gap-2 text-[24px] font-semibold leading-[30px] tracking-[-0.01em] text-[var(--foreground)]">
                <Target className="h-6 w-6 text-[var(--primary)]" />
                Current Focus
              </h2>
            </div>
            <div className="relative mb-6 h-48 w-48">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="var(--border)" strokeWidth="8" fill="none" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="var(--primary)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: 283 - 283 * (xpPct / 100) }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-[34px] font-semibold leading-[41px] text-[var(--foreground)]">{xpPct}%</span>
                <span className="text-[12px] font-bold uppercase tracking-[0.05em] text-[var(--muted)]">Completed</span>
              </div>
            </div>
            <div>
              <p className="text-[20px] font-medium leading-[25px] text-[var(--foreground)]">{focusTask?.title || `Level ${stats.user.level}`}</p>
              <p className="text-[15px] leading-5 text-[var(--muted)]">{focusTask?.category || `${stats.user.xp}/${stats.user.maxXp} XP`}</p>
            </div>
            <button onClick={() => router.push(focusTask ? '/planner' : '/ai')} className="stitch-neo-button mt-6 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-[20px] font-medium leading-[25px] text-[var(--primary)]">
              Resume Study
              <Play className="h-5 w-5" />
            </button>
          </div>
        </motion.section>

        <section className="flex flex-col gap-8 md:col-span-8">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {quickActions.map(({ label, href, Icon, tone }) => (
              <button key={label} onClick={() => router.push(href)} className="stitch-glass-card group flex min-h-[150px] flex-col items-center justify-center gap-4 rounded-[32px] p-6 transition-colors hover:bg-white/50">
                <div className="stitch-neo-raised flex h-14 w-14 items-center justify-center rounded-full transition-transform group-active:scale-95">
                  <Icon className={`h-7 w-7 ${tone}`} />
                </div>
                <span className="text-[20px] font-medium leading-[25px] text-[var(--foreground)]">{label}</span>
              </button>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stitch-glass-card flex-1 rounded-[32px] p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10">
                <Brain className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <h2 className="text-[24px] font-semibold leading-[30px] tracking-[-0.01em] text-[var(--foreground)]">Daily Insight</h2>
            </div>
            <div className="stitch-neo-raised relative overflow-hidden rounded-2xl border-l-4 border-[var(--primary)] bg-[var(--surface)]/50 p-6">
              <Sparkles className="absolute right-4 top-4 h-16 w-16 text-[var(--primary)]/10" />
              <p className="relative z-10 text-[17px] leading-6 text-[var(--muted)]">
                Based on your real activity, Orbit sees {stats.aiInteractions} AI interactions, {studyTime} tracked study time, and {stats.researchMinutes}m of research. Move dense reading to the time blocks where you already complete sessions fastest.
              </p>
              <div className="relative z-10 mt-6 flex justify-end">
                <button onClick={() => router.push('/planner')} className="flex items-center gap-2 text-[20px] font-medium leading-[25px] text-[var(--primary)] hover:underline">
                  View Planner
                  <Calendar className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }} className="md:col-span-12">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="stitch-glass-card rounded-[32px] p-6">
              <p className="text-[12px] font-bold uppercase tracking-[0.05em] text-[var(--muted)]">Study Time</p>
              <p className="mt-2 text-[24px] font-semibold leading-[30px] text-[var(--foreground)]">{studyTime}</p>
              <p className="mt-1 text-[12px] font-bold uppercase tracking-[0.05em] text-emerald-500">Tracked</p>
            </div>
            <div className="stitch-glass-card rounded-[32px] p-6">
              <p className="text-[12px] font-bold uppercase tracking-[0.05em] text-[var(--muted)]">AI Sessions</p>
              <p className="mt-2 text-[24px] font-semibold leading-[30px] text-[var(--foreground)]">{stats.aiInteractions}</p>
              <p className="mt-1 text-[12px] font-bold uppercase tracking-[0.05em] text-[var(--primary)]">Live usage</p>
            </div>
            <div className="stitch-glass-card rounded-[32px] p-6">
              <p className="text-[12px] font-bold uppercase tracking-[0.05em] text-[var(--muted)]">Study Plans</p>
              <p className="mt-2 text-[24px] font-semibold leading-[30px] text-[var(--foreground)]">{tasks.length}</p>
              <button onClick={() => router.push('/planner')} className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2 text-xs font-black text-[var(--primary-foreground)]">
                <Plus className="h-3.5 w-3.5" />
                Add plan
              </button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};
