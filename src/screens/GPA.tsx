import React, { useEffect, useState } from 'react';
import { Card, Button, Input, Badge } from '../components/UI';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Plus, MoreHorizontal, TrendingUp, Calculator, Bell, Loader2, Trash2, GraduationCap } from 'lucide-react';
import { getGPARecords, deleteGPARecord } from '../services/gpa';
import { GPARecord } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const GPA = () => {
  const [records, setRecords] = useState<GPARecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const data = await getGPARecords();
      setRecords(data);
    } catch (err) {
      console.error('Failed to fetch GPA records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await deleteGPARecord(id);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert('Failed to delete record');
    }
  };

  const gpaData = records.map((r, i) => ({
    sem: r.semester || `Sem ${i + 1}`,
    gpa: r.gpa,
    trend: r.gpa + (Math.random() * 0.2 - 0.1) // Placeholder for trend
  })).reverse();

  const cumulativeGPA = records.length > 0 
    ? (records.reduce((acc, r) => acc + r.gpa, 0) / records.length).toFixed(2)
    : "0.00";

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-(--background)">
        <Loader2 className="w-10 h-10 text-(--primary) animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-10 bg-(--background) text-(--foreground) overflow-y-auto custom-scrollbar pb-32 lg:pb-10">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">Scholar Matrix</h1>
          <p className="text-(--muted) text-xs font-black uppercase tracking-[0.2em] mt-3 opacity-60">Status: <span className="text-(--primary) font-black">Sync_Success_A1</span></p>
        </div>
        <div className="flex items-center gap-3">
           <Badge className="bg-(--accent) text-(--primary) border-(--border) font-black text-[10px] tracking-widest py-2 px-4 rounded-xl uppercase">REAL-TIME ACADEMIC SYNC</Badge>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card className="p-8 bg-(--primary) border-none text-white shadow-2xl shadow-(--primary)/20 relative overflow-hidden group">
           <div className="absolute right-[-10%] top-[-10%] opacity-10 group-hover:scale-110 transition-transform duration-700">
             <GraduationCap className="w-40 h-40" />
           </div>
           <div className="relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-4 block">Cumulative GPA</span>
              <h2 className="text-6xl md:text-7xl font-black tracking-tighter mb-4">{cumulativeGPA}</h2>
              <Badge className="bg-white/20 text-white border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-lg">Level: High Command</Badge>
           </div>
        </Card>
        
        <Card className="p-8 flex flex-col justify-center border-(--border) hover:border-(--primary) transition-all">
           <span className="text-[10px] font-black text-(--muted) uppercase tracking-[0.3em] opacity-60 mb-4 block">Total Credits Earned</span>
           <div className="flex items-center gap-4">
              <h2 className="text-5xl font-black tracking-tighter text-(--foreground)">{records.reduce((acc, r) => acc + r.totalCredits, 0)}</h2>
              <TrendingUp className="w-8 h-8 text-emerald-500" />
           </div>
        </Card>

        <Card className="p-8 flex flex-col justify-center border-(--border) hover:border-(--primary) transition-all">
           <span className="text-[10px] font-black text-(--muted) uppercase tracking-[0.3em] opacity-60 mb-4 block">Active Semesters</span>
           <div className="flex items-center gap-4">
              <h2 className="text-5xl font-black tracking-tighter text-(--foreground)">{records.length}</h2>
              <Badge className="bg-(--accent) text-(--primary) border-none font-black text-[10px] px-3 py-1 uppercase rounded">Active</Badge>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-12 gap-10">
        {/* Historical GPA Trend */}
        <div className="col-span-12 lg:col-span-7">
          <Card className="hover:border-(--primary) transition-all shadow-2xl p-8 rounded-5xl bg-(--card)/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-10">
                <div>
                   <h3 className="text-2xl font-black tracking-tighter uppercase mb-1">GPA Propagation</h3>
                   <p className="text-[10px] font-black uppercase tracking-widest text-(--muted) opacity-60">Academic growth trajectory analysis</p>
                </div>
                <TrendingUp className="w-8 h-8 text-(--primary) opacity-50" />
            </div>
            <div className="h-[400px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gpaData} margin={{ left: -20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
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
                    domain={[0, 4.0]}
                    ticks={[1.0, 2.0, 3.0, 4.0]}
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
          </Card>
        </div>

        {/* Semester History */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-10">
           <Card className="p-8 border-(--border) bg-(--accent)/10 shadow-xl rounded-5xl group hover:border-(--primary) transition-all">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-black tracking-tighter uppercase">Academic History</h3>
               <Button className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest"><Plus className="w-4 h-4 mr-2" /> Add</Button>
            </div>
            <div className="space-y-4 overflow-y-auto max-h-[500px] custom-scrollbar pr-2">
              {records.map((record, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={record.id}
                  className="p-6 rounded-3xl bg-(--card) border border-(--border) hover:border-(--primary) transition-all group/item"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-sm font-black uppercase text-(--foreground)">{record.semester}</h4>
                      <p className="text-[9px] font-black uppercase text-(--muted) opacity-60">{record.totalCredits} Credits • {record.class}</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-lg font-black text-(--primary)">{record.gpa.toFixed(2)}</span>
                       <button 
                         onClick={() => handleDelete(record.id)}
                         className="p-2 text-(--muted) hover:text-red-500 transition-colors opacity-0 group-hover/item:opacity-100"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {records.length === 0 && (
                <div className="py-10 text-center opacity-40">
                  <p className="text-[10px] font-black uppercase tracking-widest">No logs detected</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-8 shadow-2xl rounded-5xl border-(--border) bg-(--primary) text-white overflow-hidden relative">
             <div className="absolute right-[-20px] bottom-[-20px] opacity-20">
                <Calculator className="w-40 h-40" />
             </div>
             <h3 className="text-2xl font-black tracking-tighter uppercase mb-4 relative z-10">Predictive Node</h3>
             <p className="text-xs font-black uppercase tracking-tight opacity-80 mb-8 relative z-10">
               Maintain a 3.8+ GPA in the next sequence to secure Scholarship Level Alpha.
             </p>
             <Button className="bg-white text-(--primary) hover:bg-white/90 border-none relative z-10 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest w-full">Initialize Simulator</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
