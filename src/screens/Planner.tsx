import React, { useEffect, useState } from 'react';
import { Card, Badge, Button } from '../components/UI';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Calendar as CalendarIcon, Clock, ChevronRight, Filter, Plus, Loader2, Trash2, BookOpen } from 'lucide-react';
import { getStudyPlans, deleteStudyPlan } from '../services/planner';
import { StudyPlan } from '../types';

export const Planner = () => {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await getStudyPlans();
      setPlans(data);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this protocol?')) return;
    try {
      await deleteStudyPlan(id);
      setPlans(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete protocol');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-(--background)">
        <Loader2 className="w-10 h-10 text-(--primary) animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-(--background) p-6 md:p-10 overflow-hidden">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">Protocol Stack</h1>
          <p className="text-(--muted) text-xs font-black uppercase tracking-[0.2em] mt-3 opacity-60">Status: <span className="text-(--primary) font-black">Optimization_Engaged</span></p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 shadow-xl shadow-(--primary)/40">
            <Plus className="w-5 h-5" />
            Append Protocol
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row gap-8 overflow-hidden">
        {/* Main List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-32">
          <div className="space-y-6">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="p-8 group hover:border-(--primary) transition-all cursor-pointer relative overflow-hidden">
                   <div className="absolute right-0 top-0 bottom-0 w-1 bg-(--primary) translate-x-full group-hover:translate-x-0 transition-transform" />
                   <div className="flex justify-between items-start mb-6">
                      <div>
                        <Badge className="bg-(--accent) text-(--primary) border-(--border) font-black text-[9px] uppercase tracking-widest py-1.5 px-4 rounded-lg mb-3">SYNC: ACTIVE</Badge>
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-(--foreground) group-hover:text-(--primary) transition-colors">{plan.name}</h3>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(plan.id); }}
                        className="p-3 text-(--muted) hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-(--muted) uppercase tracking-widest opacity-60">Allocation</span>
                        <div className="flex items-center gap-2 text-(--foreground) font-black uppercase">
                          <Clock className="w-4 h-4 text-(--primary)" />
                          <span>{plan.totalHours}H</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-(--muted) uppercase tracking-widest opacity-60">Structure</span>
                        <div className="flex items-center gap-2 text-(--foreground) font-black uppercase">
                          <BookOpen className="w-4 h-4 text-(--primary)" />
                          <span>{plan.subjects.length} Subjects</span>
                        </div>
                      </div>
                      <div className="col-span-2 md:col-span-1 space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                           <span className="text-(--muted) opacity-60">Completion</span>
                           <span className="text-(--primary)">{plan.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-(--accent) rounded-full overflow-hidden border border-(--border)">
                           <div 
                             className="h-full bg-(--primary) shadow-[0_0_10px_var(--primary)]/40 transition-all duration-1000" 
                             style={{ width: `${plan.progress}%` }} 
                           />
                        </div>
                      </div>
                   </div>
                </Card>
              </motion.div>
            ))}
            {plans.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-(--border) rounded-5xl opacity-40">
                 <p className="text-[10px] font-black uppercase tracking-widest">No active protocols detected in this sector</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-80 shrink-0">
          <Card className="p-8 h-fit shadow-xl border-(--primary)/20">
             <h4 className="text-[10px] font-black text-(--muted) uppercase tracking-[0.3em] opacity-60 mb-8 px-1">Sector Metrics</h4>
             <div className="space-y-6">
                {[
                  { label: "Total Protocols", value: plans.length },
                  { label: "Avg Completion", value: `${Math.round(plans.reduce((acc, p) => acc + p.progress, 0) / (plans.length || 1))}%` },
                  { label: "Hours Allocated", value: `${plans.reduce((acc, p) => acc + p.totalHours, 0)}H` }
                ].map((stat, i) => (
                  <div key={i} className="p-6 bg-(--input) rounded-2xl border border-(--border) shadow-sm">
                    <span className="text-[9px] font-black text-(--muted) uppercase tracking-widest block mb-2">{stat.label}</span>
                    <span className="text-xl font-black text-(--foreground) tracking-tighter uppercase">{stat.value}</span>
                  </div>
                ))}
             </div>
             <Button variant="outline" className="w-full mt-10 border-(--border) text-(--muted) font-black uppercase tracking-widest text-[10px] py-4 rounded-xl hover:text-(--primary) hover:border-(--primary)">
                Sync Network Data
             </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
