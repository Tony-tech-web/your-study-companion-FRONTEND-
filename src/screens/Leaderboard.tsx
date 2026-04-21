'use client';
import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../services/leaderboard';
import { LeaderboardEntry } from '../types';
import { Trophy, Medal, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

const rankColors: Record<number, string> = { 1: '#f27d26', 2: '#94a3b8', 3: '#b45309' };

export const Leaderboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLeaderboard().then(setData).catch(() => setError('Failed to load leaderboard')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex-1 flex items-center justify-center bg-[var(--background)]"><Loader2 className="w-5 h-5 text-[var(--primary)] animate-spin" /></div>;
  if (error) return <div className="flex-1 flex items-center justify-center bg-[var(--background)]"><p className="text-sm text-[var(--muted)]">{error}</p></div>;

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);
  const myRank = data.findIndex(d => d.user_id === user?.id);

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)] text-[var(--foreground)] custom-scrollbar">
      <div className="max-w-3xl mx-auto p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Leaderboard</h1>
            <p className="text-xs text-[var(--muted)] mt-0.5">{data.length} students ranked globally</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>

        {/* Top 3 podium */}
        {top3.length > 0 && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-end justify-center gap-3">
              {/* 2nd */}
              {top3[1] && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="flex-1 flex flex-col items-center gap-2 pb-0">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl border-2 border-[var(--border)] overflow-hidden bg-[var(--input)]">
                      <img src={top3[1].avatar} alt={top3[1].name} className="w-full h-full object-cover" referrerPolicy="no-referrer"
                        onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                      <div className="absolute inset-0 flex items-center justify-center text-lg font-black text-[var(--muted)]">
                        {top3[1].name.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[10px] font-black" style={{ color: rankColors[2] }}>2</div>
                  </div>
                  <div className="text-center">
                    <p className="text-[12px] font-bold text-[var(--foreground)] truncate max-w-[80px]">{top3[1].name.split(' ')[0]}</p>
                    <p className="text-[11px] text-[var(--muted)]">{top3[1].xp.toLocaleString()} XP</p>
                  </div>
                  <div className="w-full h-16 rounded-t-lg bg-[var(--input)] border-t border-x border-[var(--border)]" />
                </motion.div>
              )}

              {/* 1st */}
              {top3[0] && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
                  className="flex-1 flex flex-col items-center gap-2">
                  <Trophy className="w-5 h-5 text-[var(--primary)]" />
                  <div className="relative">
                    <div className="w-18 h-18 rounded-2xl border-2 overflow-hidden bg-[var(--input)]" style={{ borderColor: 'var(--primary)', width: '72px', height: '72px' }}>
                      <img src={top3[0].avatar} alt={top3[0].name} className="w-full h-full object-cover" referrerPolicy="no-referrer"
                        onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                      <div className="absolute inset-0 flex items-center justify-center text-xl font-black" style={{ color: 'var(--primary)' }}>
                        {top3[0].name.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center text-[10px] font-black text-white">1</div>
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-bold text-[var(--foreground)] truncate max-w-[90px]">{top3[0].name.split(' ')[0]}</p>
                    <p className="text-[11px] font-semibold" style={{ color: 'var(--primary)' }}>{top3[0].xp.toLocaleString()} XP</p>
                  </div>
                  <div className="w-full h-24 rounded-t-lg border-t border-x flex items-center justify-center" style={{ backgroundColor: 'rgb(from var(--primary) r g b / 0.08)', borderColor: 'rgb(from var(--primary) r g b / 0.3)' }} />
                </motion.div>
              )}

              {/* 3rd */}
              {top3[2] && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="flex-1 flex flex-col items-center gap-2 pb-0">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl border-2 border-[var(--border)] overflow-hidden bg-[var(--input)]">
                      <img src={top3[2].avatar} alt={top3[2].name} className="w-full h-full object-cover" referrerPolicy="no-referrer"
                        onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                      <div className="absolute inset-0 flex items-center justify-center text-lg font-black text-[var(--muted)]">
                        {top3[2].name.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[10px] font-black" style={{ color: rankColors[3] }}>3</div>
                  </div>
                  <div className="text-center">
                    <p className="text-[12px] font-bold text-[var(--foreground)] truncate max-w-[80px]">{top3[2].name.split(' ')[0]}</p>
                    <p className="text-[11px] text-[var(--muted)]">{top3[2].xp.toLocaleString()} XP</p>
                  </div>
                  <div className="w-full h-10 rounded-t-lg bg-[var(--input)] border-t border-x border-[var(--border)]" />
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Your position (if not in top 3) */}
        {myRank >= 3 && (
          <div className="bg-[var(--primary)]/8 border border-[var(--primary)]/20 rounded-xl p-3 flex items-center gap-3">
            <span className="text-sm font-bold text-[var(--primary)] w-8">#{myRank + 1}</span>
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center text-xs font-black shrink-0">
              {user?.email?.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[var(--foreground)] truncate">You</p>
              <p className="text-[11px] text-[var(--muted)]">{data[myRank]?.xp.toLocaleString()} XP · Level {data[myRank]?.level}</p>
            </div>
            <span className="text-[11px] font-medium text-[var(--primary)]">Your rank</span>
          </div>
        )}

        {/* Full table */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--input)]">
            <div className="col-span-1 text-[11px] font-semibold text-[var(--muted)] uppercase">#</div>
            <div className="col-span-6 text-[11px] font-semibold text-[var(--muted)] uppercase">Student</div>
            <div className="col-span-3 text-[11px] font-semibold text-[var(--muted)] uppercase text-center">Level</div>
            <div className="col-span-2 text-[11px] font-semibold text-[var(--muted)] uppercase text-right">XP</div>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {data.map((student, i) => {
              const isMe = student.user_id === user?.id;
              return (
                <motion.div key={student.rank || i}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className={cn('grid grid-cols-12 items-center px-4 py-3 transition-all',
                    isMe ? 'bg-[var(--primary)]/5' : 'hover:bg-[var(--accent)]')}>
                  <div className="col-span-1">
                    {i < 3
                      ? <Medal className="w-4 h-4" style={{ color: rankColors[i + 1] }} />
                      : <span className="text-[12px] font-medium text-[var(--muted)]">{i + 1}</span>}
                  </div>
                  <div className="col-span-6 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl overflow-hidden bg-[var(--input)] border border-[var(--border)] shrink-0 relative">
                      <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" referrerPolicy="no-referrer"
                        onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-[var(--muted)]">
                        {student.name.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className={cn('text-[13px] font-semibold truncate', isMe ? 'text-[var(--primary)]' : 'text-[var(--foreground)]')}>
                        {student.name}{isMe ? ' (You)' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-3 text-center">
                    <span className="text-[12px] font-medium text-[var(--muted)]">{student.level}</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-[12px] font-semibold text-[var(--foreground)]">{student.xp.toLocaleString()}</span>
                  </div>
                </motion.div>
              );
            })}
            {data.length === 0 && (
              <div className="p-12 text-center text-sm text-[var(--muted)] opacity-40">No students ranked yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
