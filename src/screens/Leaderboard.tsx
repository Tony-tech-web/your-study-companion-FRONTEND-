import React from 'react';
import { Card, Badge, Button } from '../components/UI';
import { mockLeaderboard } from '../mockData';
import { Trophy, TrendingUp, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';

export const Leaderboard = () => {
  return (
    <div className="flex-1 p-6 md:p-10 bg-[var(--background)] text-[var(--foreground)] flex flex-col overflow-y-auto custom-scrollbar pb-32 lg:pb-10">
      <header className="mb-12 shrink-0">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">Global Ranking</h1>
        <p className="text-[var(--muted)] text-xs font-black uppercase tracking-[0.2em] mt-3 opacity-60">Status: <span className="text-[var(--primary)] font-black">Online_Cluster_7</span></p>
        <div className="mt-8 flex gap-3 overflow-x-auto scrollbar-hide">
            <Badge className="bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/20 py-3 px-8 uppercase text-[10px] font-black tracking-[0.2em] border-none transition-all rounded-xl">Global Sync</Badge>
            <Badge className="bg-[var(--card)] text-[var(--muted)] py-3 px-8 uppercase text-[10px] font-black tracking-[0.2em] border border-[var(--border)] hover:border-[var(--primary)] cursor-pointer transition-all rounded-xl">Cluster Local</Badge>
        </div>
      </header>

      {/* Podium */}
      <div className="flex flex-col lg:flex-row gap-8 mb-12 items-end px-4 shrink-0">
        {/* 2nd Place */}
        <div className="w-full lg:flex-1 lg:order-1">
           <Card className="bg-[var(--card)] border-[var(--border)] p-8 flex flex-col items-center shadow-lg relative overflow-hidden group hover:border-[var(--primary)]/50 transition-all rounded-[2rem]">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-400 opacity-20" />
              <span className="text-5xl font-black text-[var(--muted)] absolute top-6 right-8 italic opacity-10">02</span>
              <img src={mockLeaderboard[1].avatar} className="w-20 h-20 rounded-[1.5rem] mb-6 border-4 border-[var(--border)] shadow-md group-hover:scale-110 transition-transform referrer-policy-no-referrer" />
              <h3 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)]">{mockLeaderboard[1].name}</h3>
              <p className="text-[10px] text-[var(--muted)] font-black uppercase tracking-widest mt-2 opacity-60">NODE LVL {mockLeaderboard[1].level} • {mockLeaderboard[1].xp.toLocaleString()} XP</p>
              <div className="mt-6 px-5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+{mockLeaderboard[1].weeklyGain} XP WAVE</span>
              </div>
           </Card>
        </div>

        {/* 1st Place */}
        <div className="w-full lg:flex-1 lg:order-2 z-10 lg:-translate-y-8">
            <Card className="bg-[var(--card)] border-[var(--primary)] p-10 flex flex-col items-center shadow-[0_30px_60px_-15px_rgba(242,125,38,0.3)] relative overflow-hidden group animate-pulse-slow rounded-[2.5rem]">
              <div className="absolute top-0 left-0 w-full h-2 bg-[var(--primary)]" />
              <span className="text-6xl font-black text-[var(--primary)] absolute top-8 right-10 italic opacity-20">01</span>
              <div className="relative mb-6">
                  <img src={mockLeaderboard[0].avatar} className="w-28 h-28 rounded-[2rem] border-4 border-[var(--primary)] shadow-2xl group-hover:scale-110 transition-transform referrer-policy-no-referrer" />
                  <Trophy className="absolute -top-8 -left-8 w-14 h-14 text-[var(--primary)] drop-shadow-[0_0_15px_var(--primary)] rotate-12" />
              </div>
              <h3 className="text-2xl font-black text-[var(--foreground)] uppercase tracking-tighter">{mockLeaderboard[0].name}</h3>
              <p className="text-[11px] text-[var(--primary)] font-black uppercase tracking-[0.2em] mt-2">SUPREME NODE • {mockLeaderboard[0].xp.toLocaleString()} XP</p>
              <div className="mt-8 px-8 py-3 rounded-2xl bg-[var(--primary)] shadow-2xl shadow-[var(--primary)]/40 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                <span className="text-xs font-black text-white uppercase tracking-[0.2em]">GLOBAL CHAMPION</span>
              </div>
            </Card>
        </div>

        {/* 3rd Place */}
        <div className="w-full lg:flex-1 lg:order-3">
            <Card className="bg-[var(--card)] border-[var(--border)] p-8 flex flex-col items-center shadow-lg relative overflow-hidden group hover:border-[var(--primary)]/50 transition-all rounded-[2rem]">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-400 opacity-20" />
              <span className="text-5xl font-black text-[var(--muted)] absolute top-6 right-8 italic opacity-10">03</span>
              <img src={mockLeaderboard[2].avatar} className="w-20 h-20 rounded-[1.5rem] mb-6 border-4 border-[var(--border)] shadow-md group-hover:scale-110 transition-transform referrer-policy-no-referrer" />
              <h3 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)]">{mockLeaderboard[2].name}</h3>
              <p className="text-[10px] text-[var(--muted)] font-black uppercase tracking-widest mt-2 opacity-60">NODE LVL {mockLeaderboard[2].level} • {mockLeaderboard[2].xp.toLocaleString()} XP</p>
              <div className="mt-6 px-5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+{mockLeaderboard[2].weeklyGain} XP WAVE</span>
              </div>
           </Card>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col p-0 shadow-2xl border-[var(--border)] rounded-[2.5rem] bg-[var(--card)]/50 backdrop-blur-sm">
        <div className="grid grid-cols-12 px-10 py-6 border-b border-[var(--border)] text-[10px] uppercase font-black text-[var(--muted)] tracking-[0.3em] bg-[var(--accent)]/30 shrink-0">
            <div className="col-span-1">Pos</div>
            <div className="col-span-4 md:col-span-5">Identity Node</div>
            <div className="col-span-3 hidden md:block text-center">Sync Progress</div>
            <div className="col-span-4 md:col-span-3 text-right">Total XP Units</div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 p-6 custom-scrollbar pb-32">
            {mockLeaderboard.slice(3).map((student, i) => (
                <div key={student.rank} className="grid grid-cols-12 items-center px-6 py-5 rounded-2xl border border-transparent hover:border-[var(--primary)]/30 hover:bg-[var(--accent)]/30 transition-all group cursor-pointer relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-[var(--primary)] translate-x-full group-hover:translate-x-0 transition-transform" />
                    <div className="col-span-1 text-sm font-black text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors">#{student.rank}</div>
                    <div className="col-span-11 md:col-span-8 grid grid-cols-12 items-center gap-4">
                        <div className="col-span-12 md:col-span-6 flex items-center gap-5">
                            <img src={student.avatar} className="w-11 h-11 rounded-xl bg-[var(--input)] border border-[var(--border)] shadow-inner group-hover:border-[var(--primary)] transition-all referrer-policy-no-referrer" />
                            <span className="text-sm font-black text-[var(--foreground)] uppercase tracking-tight">{student.name}</span>
                        </div>
                        <div className="col-span-6 hidden md:flex items-center gap-5">
                            <span className="text-[9px] font-black text-[var(--muted)] uppercase w-16 tracking-widest opacity-60">Lvl {student.level}</span>
                            <div className="flex-1 h-2 bg-[var(--input)] rounded-full overflow-hidden shadow-inner border border-[var(--border)]">
                                <div className="h-full bg-[var(--primary)] shadow-[0_0_10px_var(--primary)]" style={{ width: '65%' }} />
                            </div>
                        </div>
                    </div>
                    <div className="col-span-4 md:col-span-3 text-right text-xs font-black text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{student.xp.toLocaleString()}</div>
                </div>
            ))}
        </div>
        
        {/* Sticky Global Status Bar */}
        <div className="bg-[var(--foreground)] text-[var(--background)] p-8 flex flex-col md:flex-row items-center justify-between px-12 z-20 shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-[var(--primary)]/5 animate-pulse" />
            <div className="flex items-center gap-12 relative z-10 w-full md:w-auto mb-6 md:mb-0">
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-[var(--background)] opacity-40 uppercase tracking-[0.3em]">User Position Index</span>
                  <div className="flex items-center gap-3 mt-1">
                     <span className="text-3xl font-black text-[var(--primary)] tracking-tighter">#12</span>
                     <div className="w-1 h-10 bg-[var(--background)] opacity-10 rounded-full" />
                     <div className="flex items-center gap-3">
                        <img src="https://picsum.photos/seed/aman/100/100" className="w-11 h-11 rounded-xl border border-[var(--background)] opacity-90" referrerPolicy="no-referrer" />
                        <div className="flex flex-col">
                           <span className="text-sm font-black uppercase tracking-tight">Aman Sharma</span>
                           <span className="text-[8px] font-black opacity-40 uppercase tracking-[0.2em]">Verified Alpha Tester</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-12 relative z-10">
               <div className="flex flex-col items-center md:items-end">
                  <span className="text-[9px] uppercase font-black opacity-40 tracking-[0.3em]">Aggregate Units</span>
                  <span className="text-xl font-black text-[var(--primary)]">15,420 XP</span>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase font-black opacity-40 tracking-[0.3em]">Growth Waveform</span>
                  <div className="flex items-center gap-1 text-xl font-black text-emerald-400">
                    <span className="tracking-tighter">+250</span> <ChevronUp className="w-5 h-5" />
                  </div>
               </div>
            </div>
        </div>
      </Card>
    </div>
  );
};
