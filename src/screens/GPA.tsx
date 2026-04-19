import React from 'react';
import { Card, Button, Input, Badge } from '../components/UI';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Plus, MoreHorizontal, TrendingUp, Calculator, Bell } from 'lucide-react';
import { cn } from '../lib/utils';

const gpaData = [
  { sem: 'Sem 1', gpa: 2.8, trend: 3.1 },
  { sem: 'Sem 2', gpa: 3.2, trend: 3.3 },
  { sem: 'Sem 3', gpa: 3.1, trend: 3.5 },
  { sem: 'Sem 4', gpa: 3.4, trend: 3.8 },
];

export const GPA = () => {
  return (
    <div className="flex-1 p-6 md:p-10 bg-[var(--background)] text-[var(--foreground)] overflow-y-auto custom-scrollbar pb-32 lg:pb-10">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">Performance Matrix</h1>
          <p className="text-[var(--muted)] text-xs font-black uppercase tracking-[0.2em] mt-3 opacity-60">Status: <span className="text-[var(--primary)] font-black">Sync_Success_A1</span></p>
        </div>
        <div className="flex items-center gap-3">
           <Badge className="bg-[var(--accent)] text-[var(--primary)] border-[var(--border)] font-black text-[10px] tracking-widest py-2 px-4 rounded-xl uppercase">Academic Cycle: 2026-B</Badge>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-10">
        {/* Historical GPA Trend */}
        <div className="col-span-12 lg:col-span-7">
          <Card className="hover:border-[var(--primary)] transition-all shadow-2xl p-8 rounded-[2.5rem] bg-[var(--card)]/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-10">
                <div>
                   <h3 className="text-2xl font-black tracking-tighter uppercase mb-1">GPA Propagation</h3>
                   <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] opacity-60">Linear growth trajectory detected</p>
                </div>
                <TrendingUp className="w-8 h-8 text-[var(--primary)] opacity-50" />
            </div>
            <div className="h-[400px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gpaData} margin={{ left: -20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.3} />
                  <XAxis 
                    dataKey="sem" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: '900' }} 
                    domain={[2.0, 4.0]}
                    ticks={[2.5, 3.0, 3.5, 4.0]}
                  />
                  <Tooltip 
                    cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '20px', 
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                        textTransform: 'uppercase',
                        fontSize: '10px',
                        fontWeight: '900'
                    }}
                    itemStyle={{ color: 'var(--primary)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="trend" 
                    stroke="var(--primary)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorTrend)" 
                    strokeDasharray="5 5"
                    opacity={0.3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="gpa" 
                    stroke="var(--primary)" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorGpa)" 
                    activeDot={{ r: 8, fill: 'var(--primary)', stroke: 'var(--card)', strokeWidth: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-8 pt-8 border-t border-[var(--border)] overflow-x-auto scrollbar-hide">
                {['Projection', 'Actual', 'Delta'].map(m => (
                    <div key={m} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--accent)] border border-[var(--border)]">
                        <div className={cn("w-2.5 h-2.5 rounded-full shadow-[0_0_8px_var(--primary)]", m === 'Actual' ? "bg-[var(--primary)]" : "bg-[var(--muted)] opacity-30")} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{m}</span>
                    </div>
                ))}
            </div>
          </Card>
        </div>

        {/* GPA Calculator / Planner */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-10">
          <Card className="p-8 border-[var(--border)] bg-[var(--accent)]/10 shadow-xl rounded-[2.5rem] group hover:border-[var(--primary)] transition-all">
            <h3 className="text-2xl font-black tracking-tighter uppercase mb-10 flex items-center gap-4">
               <Calculator className="w-8 h-8 text-[var(--primary)] group-hover:scale-110 transition-transform" />
               Impact Analysis
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-[var(--muted)] mb-3 block uppercase tracking-[0.2em] opacity-60 px-1">Source Module</label>
                <input 
                  placeholder="Query Course ID..." 
                  className="w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl px-6 py-4 text-sm font-black text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:opacity-30 focus:outline-none focus:border-[var(--primary)] transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-[var(--muted)] mb-3 block uppercase tracking-[0.2em] opacity-60 px-1">Grade Level</label>
                  <select className="w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl px-6 py-4 text-sm font-black text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] appearance-none transition-all uppercase cursor-pointer">
                    <option>Alpha (A)</option>
                    <option>Beta (B)</option>
                    <option>Gamma (C)</option>
                    <option>Delta (D)</option>
                    <option>Epsilon (F)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-[var(--muted)] mb-3 block uppercase tracking-[0.2em] opacity-60 px-1">Power Units</label>
                  <input 
                    placeholder="3.0" 
                    type="number" 
                    className="w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl px-6 py-4 text-sm font-black text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:opacity-30 focus:outline-none focus:border-[var(--primary)] transition-all"
                  />
                </div>
              </div>
              <Button className="w-full mt-6 h-16 text-xs font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-[var(--primary)]/20">Initialize Projection</Button>
            </div>
          </Card>

          <Card className="p-8 shadow-2xl rounded-[2.5rem] border-[var(--border)] group hover:border-[var(--primary)] transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
                <Bell className="w-6 h-6 text-[var(--primary)] animate-pulse" />
            </div>
            <h3 className="text-2xl font-black tracking-tighter uppercase mb-8">Temporal Ops</h3>
            <div className="grid grid-cols-7 gap-3 mt-2 border-b border-[var(--border)] pb-8 mb-8 overflow-x-auto scrollbar-hide">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={day} className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all min-w-[70px]",
                    i === 1 ? "bg-[var(--primary)] border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20" : "bg-[var(--accent)] border-[var(--border)]"
                )}>
                  <span className={cn("text-[9px] font-black uppercase tracking-tighter mb-1", i === 1 ? "text-white" : "text-[var(--muted)]")}>{day}</span>
                  <span className={cn("text-base font-black", i === 1 ? "text-white" : "text-[var(--foreground)]")}>{10 + i}</span>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[
                { title: "Bio Midterm Pulse", color: "var(--primary)", time: "10:00 T_SYNC" },
                { title: "Hist Node Archive", color: "var(--muted)", time: "23:59 T_SYNC" },
              ].map((task, i) => (
                <div key={i} className="group/task flex items-center gap-6 p-6 rounded-[1.5rem] bg-[var(--input)] border border-[var(--border)] hover:border-[var(--primary)] transition-all cursor-pointer relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--primary)] shadow-[2px_0_10px_var(--primary)] opacity-60" />
                    <div className="flex-1">
                        <span className="text-xs font-black text-[var(--foreground)] uppercase tracking-tight block group-hover/task:text-[var(--primary)] transition-colors">{task.title}</span>
                        <span className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest mt-1 block opacity-60">{task.time}</span>
                    </div>
                </div>
              ))}
              <Button variant="outline" className="w-full h-14 rounded-2xl mt-4 border-dashed border-2 border-[var(--border)] text-[var(--muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] hover:bg-[var(--accent)]">
                 <Plus className="w-4 h-4" />
                 Map New Op
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
