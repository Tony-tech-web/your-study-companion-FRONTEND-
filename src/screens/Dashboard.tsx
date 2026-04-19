import React, { useState } from 'react';
import { Card, Button, Input, Badge } from '../components/UI';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  mockActivity, 
  mockUser, 
  mockTasks 
} from '../mockData';
import { cn } from '../lib/utils';
import { 
  Plus, 
  Upload, 
  CheckCircle2, 
  MoreHorizontal,
  Search
} from 'lucide-react';
import { motion } from 'motion/react';

export const Dashboard = () => {
  return (
    <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-[var(--background)] text-[var(--foreground)] custom-scrollbar pb-32 lg:pb-10">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">Command Center</h1>
          <p className="text-[var(--muted)] text-xs font-black uppercase tracking-[0.2em] mt-3 opacity-60">Authentication Node: <span className="text-[var(--primary)] font-black">Aman_7x</span></p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-[var(--accent)] text-[var(--primary)] border-[var(--border)] py-2 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm">Cluster: US-NORTH-1</Badge>
          <div className="w-10 h-10 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--primary)] transition-colors cursor-pointer shadow-sm">
            <Search className="w-5 h-5" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Orbital XP Gauge */}
        <div className="col-span-12 lg:col-span-4 lg:row-span-2">
          <Card className="h-full group hover:border-[var(--primary)] transition-all overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6">
               <Badge className="bg-[var(--primary)]/10 text-[var(--primary)] font-black">LVL {mockUser.level}</Badge>
            </div>
            <div className="flex flex-col items-center justify-center pt-10 pb-12 h-full">
              <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    stroke="var(--border)"
                    strokeWidth="24"
                    fill="transparent"
                    className="opacity-20"
                  />
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    stroke="var(--primary)"
                    strokeWidth="24"
                    fill="transparent"
                    strokeDasharray="100 100"
                    strokeDashoffset={100 - (mockUser.xp / mockUser.maxXp * 100)}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: mockUser.xp / mockUser.maxXp }}
                    transition={{ duration: 2, ease: "circOut" }}
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_15px_rgba(242,125,38,0.5)]"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[var(--muted)] text-[10px] font-black uppercase tracking-[0.3em] mb-1 opacity-50">SYNC STATUS</span>
                  <span className="text-6xl md:text-8xl font-black text-[var(--foreground)] tracking-tight leading-none">{Math.round((mockUser.xp / mockUser.maxXp) * 100)}%</span>
                  <div className="w-12 h-1 bg-[var(--primary)] mt-4 rounded-full" />
                </div>
              </div>
              <div className="mt-12 text-center">
                <span className="text-[var(--foreground)] text-lg font-black uppercase tracking-tight block">Orbital XP Engine</span>
                <span className="text-[var(--muted)] text-[10px] font-black uppercase tracking-widest mt-2 block opacity-60">
                   {mockUser.xp.toLocaleString()} / {mockUser.maxXp.toLocaleString()} QUANTUM UNITS
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Neural Activity Chart */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="hover:border-[var(--primary)] transition-all">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--muted)] opacity-60">Neural Activity</h3>
                <span className="text-2xl font-black tracking-tight uppercase">Productivity Waveform</span>
              </div>
              <Badge className="bg-[var(--accent)] text-[var(--primary)] border-[var(--border)] font-black text-[10px] tracking-widest">+12% Peak Surge</Badge>
            </div>
            <div className="h-[300px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockActivity} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 800 }} 
                    dy={10}
                    style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', color: 'var(--foreground)' }}
                    itemStyle={{ color: 'var(--primary)', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                    cursor={{ fill: 'var(--accent)', opacity: 0.5 }}
                  />
                  <Bar 
                    dataKey="hours" 
                    fill="var(--primary)" 
                    radius={[8, 8, 4, 4]}
                    className="opacity-20 hover:opacity-100 transition-opacity cursor-pointer shadow-[0_0_30px_var(--primary)]"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Task Nodes */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="hover:border-[var(--primary)] transition-all">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-black tracking-tighter uppercase">Protocol Stack</h3>
               <button className="w-10 h-10 rounded-xl bg-[var(--accent)] text-[var(--primary)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                  <Plus className="w-5 h-5" />
               </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {mockTasks.map((task) => (
                 <motion.div 
                    whileHover={{ x: 5 }}
                    key={task.id} 
                    className="group relative h-24 bg-[var(--input)] border border-[var(--border)] rounded-2xl p-5 flex items-center gap-5 hover:border-[var(--primary)] transition-all cursor-pointer overflow-hidden"
                  >
                   <div className={cn(
                     "w-12 h-12 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all shadow-sm",
                     task.completed ? "bg-[var(--primary)] border-[var(--primary)] text-white" : "border-[var(--border)] bg-[var(--card)]"
                   )}>
                     {task.completed && <CheckCircle2 className="w-6 h-6" />}
                   </div>
                   <div className="flex-1 overflow-hidden">
                     <h4 className="text-sm font-black uppercase tracking-tight text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition-colors">{task.title}</h4>
                     <div className="flex items-center gap-3 mt-1.5 opacity-60">
                        <span className="text-[10px] font-black uppercase text-[var(--muted)]">{task.dueDate}</span>
                        <div className="w-1 h-1 rounded-full bg-[var(--muted)]" />
                        <span className="text-[10px] font-black uppercase text-[var(--primary)] truncate">{task.category}</span>
                     </div>
                   </div>
                   <div className="absolute right-0 top-0 bottom-0 w-1 bg-[var(--primary)] translate-x-full group-hover:translate-x-0 transition-transform" />
                 </motion.div>
               ))}
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
