import React, { useEffect, useState } from 'react';
import { Card, Badge, Button } from '../components/UI';
import { getLeaderboard } from '../services/leaderboard';
import { LeaderboardEntry } from '../types';
import { Trophy, TrendingUp, ChevronUp, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const Leaderboard = () => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const result = await getLeaderboard();
        setData(result);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        setError('Failed to load ranking data');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-(--background)">
        <Loader2 className="w-10 h-10 text-(--primary) animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-(--background) p-6 text-center">
        <h2 className="text-2xl font-black uppercase tracking-tight text-red-500 mb-4">Error</h2>
        <p className="text-(--muted) mb-8">{error}</p>
        <Button onClick={() => window.location.reload()} className="bg-(--primary) text-white">Retry Connection</Button>
      </div>
    );
  }

  const topThree = data.slice(0, 3);
  const others = data.slice(3);

  return (
    <div className="flex-1 p-6 md:p-10 bg-(--background) text-(--foreground) flex flex-col overflow-y-auto custom-scrollbar pb-32 lg:pb-10">
      <header className="mb-12 shrink-0">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">Global Ranking</h1>
        <p className="text-(--muted) text-xs font-black uppercase tracking-[0.2em] mt-3 opacity-60">Status: <span className="text-(--primary) font-black">Online_Cluster_7</span></p>
        <div className="mt-8 flex gap-3 overflow-x-auto scrollbar-hide">
            <Badge className="bg-(--primary) text-white shadow-xl shadow-(--primary)/20 py-3 px-8 uppercase text-[10px] font-black tracking-[0.2em] border-none transition-all rounded-xl">Global Sync</Badge>
            <Badge className="bg-(--card) text-(--muted) py-3 px-8 uppercase text-[10px] font-black tracking-[0.2em] border border-(--border) hover:border-(--primary) cursor-pointer transition-all rounded-xl">Cluster Local</Badge>
        </div>
      </header>

      {/* Podium */}
      <div className="flex flex-col lg:flex-row gap-8 mb-12 items-end px-4 shrink-0">
        {/* 2nd Place */}
        {topThree[1] && (
          <div className="w-full lg:flex-1 lg:order-1">
            <Card className="bg-(--card) border-(--border) p-8 flex flex-col items-center shadow-lg relative overflow-hidden group hover:border-(--primary)/50 transition-all rounded-4xl">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-400 opacity-20" />
                <span className="text-5xl font-black text-(--muted) absolute top-6 right-8 italic opacity-10">02</span>
                <img src={topThree[1].avatar} className="w-20 h-20 rounded-3xl mb-6 border-4 border-(--border) shadow-md group-hover:scale-110 transition-transform referrer-policy-no-referrer" />
                <h3 className="text-xl font-black uppercase tracking-tight text-(--foreground) text-center">{topThree[1].name}</h3>
                <p className="text-[10px] text-(--muted) font-black uppercase tracking-widest mt-2 opacity-60 text-center">NODE LVL {topThree[1].level}  {topThree[1].xp.toLocaleString()} XP</p>
                {topThree[1].weeklyGain > 0 && (
                  <div className="mt-6 px-5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+{topThree[1].weeklyGain} XP WAVE</span>
                  </div>
                )}
            </Card>
          </div>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <div className="w-full lg:flex-1 lg:order-2 z-10 lg:-translate-y-8">
              <Card className="bg-(--card) border-(--primary) p-10 flex flex-col items-center shadow-[0_30px_60px_-15px_rgba(242,125,38,0.3)] relative overflow-hidden group animate-pulse-slow rounded-5xl">
                <div className="absolute top-0 left-0 w-full h-2 bg-(--primary)" />
                <span className="text-6xl font-black text-(--primary) absolute top-8 right-10 italic opacity-20">01</span>
                <div className="relative mb-6">
                    <img src={topThree[0].avatar} className="w-28 h-28 rounded-4xl border-4 border-(--primary) shadow-2xl group-hover:scale-110 transition-transform referrer-policy-no-referrer" />
                    <Trophy className="absolute -top-8 -left-8 w-14 h-14 text-(--primary) drop-shadow-[0_0_15px_var(--primary)] rotate-12" />
                </div>
                <h3 className="text-2xl font-black text-(--foreground) uppercase tracking-tighter text-center">{topThree[0].name}</h3>
                <p className="text-[11px] text-(--primary) font-black uppercase tracking-[0.2em] mt-2 text-center">SUPREME NODE  {topThree[0].xp.toLocaleString()} XP</p>
                <div className="mt-8 px-8 py-3 rounded-2xl bg-(--primary) shadow-2xl shadow-[var(--primary)]/40 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                  <span className="text-xs font-black text-white uppercase tracking-[0.2em]">GLOBAL CHAMPION</span>
                </div>
              </Card>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div className="w-full lg:flex-1 lg:order-3">
              <Card className="bg-(--card) border-(--border) p-8 flex flex-col items-center shadow-lg relative overflow-hidden group hover:border-(--primary)/50 transition-all rounded-4xl">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-400 opacity-20" />
                <span className="text-5xl font-black text-(--muted) absolute top-6 right-8 italic opacity-10">03</span>
                <img src={topThree[2].avatar} className="w-20 h-20 rounded-3xl mb-6 border-4 border-(--border) shadow-md group-hover:scale-110 transition-transform referrer-policy-no-referrer" />
                <h3 className="text-xl font-black uppercase tracking-tight text-(--foreground) text-center">{topThree[2].name}</h3>
                <p className="text-[10px] text-(--muted) font-black uppercase tracking-widest mt-2 opacity-60 text-center">NODE LVL {topThree[2].level}  {topThree[2].xp.toLocaleString()} XP</p>
                {topThree[2].weeklyGain > 0 && (
                  <div className="mt-6 px-5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+{topThree[2].weeklyGain} XP WAVE</span>
                  </div>
                )}
            </Card>
          </div>
        )}
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col p-0 shadow-2xl border-(--border) rounded-5xl bg-(--card)/50 backdrop-blur-sm">
        <div className="grid grid-cols-12 px-10 py-6 border-b border-(--border) text-[10px] uppercase font-black text-(--muted) tracking-[0.3em] bg-(--accent)/30 shrink-0">
            <div className="col-span-1">Pos</div>
            <div className="col-span-4 md:col-span-5">Identity Node</div>
            <div className="col-span-3 hidden md:block text-center">Sync Progress</div>
            <div className="col-span-4 md:col-span-3 text-right">Total XP Units</div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 p-6 custom-scrollbar pb-32">
            {others.map((student) => (
                <div key={student.rank} className="grid grid-cols-12 items-center px-6 py-5 rounded-2xl border border-transparent hover:border-(--primary)/30 hover:bg-(--accent)/30 transition-all group cursor-pointer relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-(--primary) translate-x-full group-hover:translate-x-0 transition-transform" />
                    <div className="col-span-1 text-sm font-black text-(--muted) group-hover:text-(--primary) transition-colors">#{student.rank}</div>
                    <div className="col-span-11 md:col-span-8 grid grid-cols-12 items-center gap-4">
                        <div className="col-span-12 md:col-span-6 flex items-center gap-5">
                            <img src={student.avatar} className="w-11 h-11 rounded-xl bg-(--input) border border-(--border) shadow-inner group-hover:border-(--primary) transition-all referrer-policy-no-referrer" />
                            <span className="text-sm font-black text-(--foreground) uppercase tracking-tight">{student.name}</span>
                        </div>
                        <div className="col-span-6 hidden md:flex items-center gap-5">
                            <span className="text-[9px] font-black text-(--muted) uppercase w-16 tracking-widest opacity-60">Lvl {student.level}</span>
                            <div className="flex-1 h-2 bg-(--input) rounded-full overflow-hidden shadow-inner border border-(--border)">
                                <div className="h-full bg-(--primary) shadow-[0_0_10px_var(--primary)]" style={{ width: '65%' }} />
                            </div>
                        </div>
                    </div>
                    <div className="col-span-4 md:col-span-3 text-right text-xs font-black text-(--foreground) group-hover:text-(--primary) transition-colors">{student.xp.toLocaleString()}</div>
                </div>
            ))}
            {data.length === 0 && (
              <div className="p-20 text-center">
                <p className="text-(--muted) uppercase font-black tracking-widest text-xs opacity-40">No active nodes in this cluster</p>
              </div>
            )}
        </div>
        
        {/* Sticky Global Status Bar */}
        <div className="bg-[var(--foreground)] text-[var(--background)] p-8 flex flex-col md:flex-row items-center justify-between px-12 z-20 shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-(--primary)/5 animate-pulse" />
            <div className="flex items-center gap-12 relative z-10 w-full md:w-auto mb-6 md:mb-0">
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-[var(--background)] opacity-40 uppercase tracking-[0.3em]">User Position Index</span>
                  <div className="flex items-center gap-3 mt-1">
                     <span className="text-3xl font-black text-(--primary) tracking-tighter">#??</span>
                     <div className="w-1 h-10 bg-(--background) opacity-10 rounded-full" />
                     <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl border border-[var(--background)] opacity-90 bg-(--background)/20" />
                        <div className="flex flex-col">
                           <span className="text-sm font-black uppercase tracking-tight">Syncing...</span>
                           <span className="text-[8px] font-black opacity-40 uppercase tracking-[0.2em]">Authenticating Local Node</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
        </div>
      </Card>
    </div>
  );
};
