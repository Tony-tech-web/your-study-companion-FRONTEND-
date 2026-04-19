import React from 'react';
import { Card, Badge, Button } from '../components/UI';
import { mockLeaderboard } from '../mockData';
import { Trophy, TrendingUp, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';

export const Leaderboard = () => {
  return (
    <div className="flex-1 p-8 bg-slate-50 text-slate-900 flex flex-col overflow-y-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 leading-tight tracking-tight">Academic Leaderboard</h1>
        <div className="mt-6 flex gap-2">
            <Badge className="bg-blue-600 text-white shadow-md shadow-blue-100 py-2.5 px-8 normal-case text-sm font-bold border-none transition-all">Global Ranking</Badge>
            <Badge className="bg-white text-slate-500 py-2.5 px-8 normal-case text-sm font-bold border border-slate-100 hover:bg-slate-50 cursor-pointer transition-all">Class Ranking</Badge>
        </div>
      </header>

      {/* Podium */}
      <div className="grid grid-cols-12 gap-6 mb-12 items-end px-4">
        {/* 2nd Place */}
        <div className="col-span-4 translate-y-4">
           <Card className="bg-white border-slate-100 p-8 flex flex-col items-center shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-200" />
              <span className="text-4xl font-black text-slate-200 absolute top-6 right-6 italic">2nd</span>
              <img src={mockLeaderboard[1].avatar} className="w-20 h-20 rounded-2xl mb-4 border-4 border-slate-50 shadow-md group-hover:scale-105 transition-transform" />
              <h3 className="text-xl font-bold text-slate-800">{mockLeaderboard[1].name}</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Level {mockLeaderboard[1].level} • {mockLeaderboard[1].xp.toLocaleString()} XP</p>
              <div className="mt-4 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                <span className="text-xs font-black text-emerald-600">+{mockLeaderboard[1].weeklyGain} XP</span>
              </div>
           </Card>
        </div>

        {/* 1st Place */}
        <div className="col-span-4 z-10">
            <Card className="bg-white border-blue-100 p-10 flex flex-col items-center shadow-2xl relative overflow-hidden group scale-105">
              <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
              <span className="text-5xl font-black text-blue-50 absolute top-8 right-8 italic drop-shadow-sm">1st</span>
              <div className="relative mb-4">
                  <img src={mockLeaderboard[0].avatar} className="w-24 h-24 rounded-3xl border-4 border-blue-50 shadow-xl group-hover:scale-105 transition-transform" />
                  <Trophy className="absolute -top-6 -left-6 w-12 h-12 text-blue-600 drop-shadow-md rotate-12" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">{mockLeaderboard[0].name}</h3>
              <p className="text-xs text-blue-600 font-black uppercase tracking-widest mt-1">Level {mockLeaderboard[0].level} • {mockLeaderboard[0].xp.toLocaleString()} XP</p>
              <div className="mt-5 px-6 py-2 rounded-full bg-blue-600 shadow-lg shadow-blue-200">
                <span className="text-xs font-black text-white uppercase tracking-widest">🏆 Leader</span>
              </div>
            </Card>
        </div>

        {/* 3rd Place */}
        <div className="col-span-4 translate-y-8">
            <Card className="bg-white border-slate-100 p-8 flex flex-col items-center shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-200/50" />
              <span className="text-4xl font-black text-slate-200 absolute top-6 right-6 italic">3rd</span>
              <img src={mockLeaderboard[2].avatar} className="w-20 h-20 rounded-2xl mb-4 border-4 border-slate-50 shadow-md group-hover:scale-105 transition-transform" />
              <h3 className="text-xl font-bold text-slate-800">{mockLeaderboard[2].name}</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Level {mockLeaderboard[2].level} • {mockLeaderboard[2].xp.toLocaleString()} XP</p>
              <div className="mt-4 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                <span className="text-xs font-black text-emerald-600">+{mockLeaderboard[2].weeklyGain} XP</span>
              </div>
           </Card>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col p-0 shadow-xl border-slate-100">
        <div className="grid grid-cols-12 px-8 py-5 border-b border-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] bg-slate-50/50">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Student</div>
            <div className="col-span-3">Level Progression</div>
            <div className="col-span-2">Total XP</div>
            <div className="col-span-2 text-right">Weekly Gain</div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 p-4 custom-scrollbar">
            {mockLeaderboard.slice(3).map((student, i) => (
                <div key={student.rank} className="grid grid-cols-12 items-center px-4 py-4 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all group">
                    <div className="col-span-1 text-sm font-black text-slate-400 group-hover:text-blue-600 transition-colors">#{student.rank}</div>
                    <div className="col-span-4 flex items-center gap-4">
                        <img src={student.avatar} className="w-9 h-9 rounded-xl bg-slate-100 shadow-sm" />
                        <span className="text-sm font-bold text-slate-800">{student.name}</span>
                    </div>
                    <div className="col-span-3 flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase w-12 tracking-tighter">Lvl {student.level}</span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[120px] shadow-inner">
                            <div className="h-full bg-blue-600 rounded-full shadow-sm" style={{ width: '60%' }} />
                        </div>
                    </div>
                    <div className="col-span-2 text-xs font-black text-slate-900">{student.xp.toLocaleString()} XP</div>
                    <div className="col-span-2 flex items-center justify-end gap-2 text-xs font-black text-emerald-600">
                        <TrendingUp className="w-3.5 h-3.5" />
                        +{student.weeklyGain}
                    </div>
                </div>
            ))}
        </div>
        {/* Floating Rank Footer */}
        <div className="bg-slate-900 p-5 flex items-center justify-between px-12 text-white rounded-b-2xl shadow-inner">
            <div className="flex items-center gap-8">
               <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">My Current Position</span>
                  <div className="flex items-center gap-2 mt-0.5">
                     <span className="text-xl font-black text-blue-400">#12</span>
                     <span className="text-[10px] font-bold text-slate-400">Total contributors</span>
                  </div>
               </div>
               <div className="w-px h-10 bg-slate-800/50" />
               <div className="flex items-center gap-3">
                  <img src={mockLeaderboard[0].avatar} className="w-9 h-9 rounded-xl border border-slate-700" />
                  <div className="flex flex-col">
                     <span className="text-sm font-black text-white leading-tight">Aman Sharma</span>
                     <span className="text-[9px] font-bold text-slate-500 uppercase">Beta User</span>
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-16">
               <div className="flex flex-col items-center">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Current XP</span>
                  <span className="text-sm font-black text-blue-400">15,420</span>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Growth Factor</span>
                  <div className="flex items-center gap-1 text-sm font-black text-emerald-400">
                    +250 <ChevronUp className="w-4 h-4" />
                  </div>
               </div>
            </div>
        </div>
      </Card>
    </div>
  );
};
