'use client';
import React, { useEffect, useState } from 'react';
import { Card, Badge, Button, Input } from '../components/UI';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Clock, Plus, Loader2, Trash2, BookOpen, X } from 'lucide-react';
import { getStudyPlans, createStudyPlan, deleteStudyPlan } from '../services/planner';
import { StudyPlan } from '../types';

const AddPlanModal = ({ onClose, onSave }: { onClose: () => void; onSave: (p: StudyPlan) => void }) => {
  const [name, setName] = useState('');
  const [subjectsInput, setSubjectsInput] = useState('');
  const [hours, setHours] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name || !hours) { setError('Name and hours are required'); return; }
    setLoading(true); setError('');
    try {
      const subjects = subjectsInput.split(',').map(s => s.trim()).filter(Boolean);
      const plan = await createStudyPlan({ name, subjects, totalHours: parseInt(hours) || 0 });
      onSave(plan);
      onClose();
    } catch { setError('Failed to create plan'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-[var(--card)] rounded-3xl p-8 border border-[var(--border)] shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black tracking-tight">New Study Plan</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--accent)] text-[var(--muted)] transition-colors"><X className="w-5 h-5" /></button>
        </div>
        {error && <p className="mb-4 text-sm text-red-500 bg-red-50 rounded-xl p-3">{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5 block">Plan Name *</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Final Exam Prep" />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5 block">Subjects (comma-separated)</label>
            <Input value={subjectsInput} onChange={e => setSubjectsInput(e.target.value)} placeholder="e.g. Math, Physics, Chemistry" />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5 block">Total Hours *</label>
            <Input type="number" value={hours} onChange={e => setHours(e.target.value)} placeholder="e.g. 20" min="1" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <button onClick={handleSave} disabled={loading} className="flex-1 py-2 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60" style={{ backgroundColor: 'var(--primary)' }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Plan'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const Planner = () => {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try { setPlans(await getStudyPlans()); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this plan?')) return;
    try { await deleteStudyPlan(id); setPlans(prev => prev.filter(p => p.id !== id)); }
    catch { alert('Failed to delete plan'); }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center bg-[var(--background)]"><Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" /></div>;

  return (
    <div className="flex-1 flex flex-col bg-[var(--background)] p-6 md:p-8 overflow-hidden">
      <AnimatePresence>{showModal && <AddPlanModal onClose={() => setShowModal(false)} onSave={p => setPlans(prev => [p, ...prev])} />}</AnimatePresence>

      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Protocol Stack</h1>
          <p className="text-[var(--muted)] text-sm mt-1">Your study plan manager</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black text-white shadow-lg w-fit"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Plus className="w-4 h-4" /> New Plan
        </button>
      </header>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-28">
          <div className="space-y-4">
            {plans.map((plan, idx) => (
              <motion.div key={plan.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card className="hover:border-[var(--primary)]/40 transition-all cursor-pointer group relative overflow-hidden">
                  <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-[var(--primary)] translate-x-full group-hover:translate-x-0 transition-transform" />
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Badge className="bg-[var(--accent)] text-[var(--primary)] font-bold text-[9px] uppercase tracking-wider py-1 px-3 rounded-lg mb-2">Active</Badge>
                      <h3 className="text-xl font-black text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{plan.name}</h3>
                    </div>
                    <button onClick={e => { e.stopPropagation(); handleDelete(plan.id); }} className="p-2 text-[var(--muted)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider opacity-60">Hours</span>
                      <div className="flex items-center gap-1.5 mt-1 text-[var(--foreground)] font-black">
                        <Clock className="w-3.5 h-3.5 text-[var(--primary)]" />
                        <span className="text-sm">{plan.totalHours}h</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider opacity-60">Subjects</span>
                      <div className="flex items-center gap-1.5 mt-1 text-[var(--foreground)] font-black">
                        <BookOpen className="w-3.5 h-3.5 text-[var(--primary)]" />
                        <span className="text-sm">{plan.subjects.length}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider opacity-60">Progress</span>
                      <p className="text-sm font-black text-[var(--primary)] mt-1">{plan.progress}%</p>
                    </div>
                  </div>
                  {plan.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {plan.subjects.slice(0, 4).map(s => (
                        <span key={s} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--muted)]">{s}</span>
                      ))}
                      {plan.subjects.length > 4 && <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--muted)]">+{plan.subjects.length - 4} more</span>}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
            {plans.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-[var(--border)] rounded-3xl">
                <p className="text-sm text-[var(--muted)] opacity-50 mb-4">No study plans yet</p>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-2xl text-sm font-black text-white" style={{ backgroundColor: 'var(--primary)' }}>
                  <Plus className="w-4 h-4" /> Create Your First Plan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar stats */}
        <div className="w-full md:w-72 shrink-0 space-y-4">
          <Card>
            <h4 className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest opacity-60 mb-5">Summary</h4>
            <div className="space-y-3">
              {[
                { label: 'Total Plans', value: plans.length },
                { label: 'Avg Completion', value: `${Math.round(plans.reduce((a, p) => a + p.progress, 0) / (plans.length || 1))}%` },
                { label: 'Hours Allocated', value: `${plans.reduce((a, p) => a + p.totalHours, 0)}h` },
              ].map(stat => (
                <div key={stat.label} className="p-4 bg-[var(--input)] rounded-2xl border border-[var(--border)]">
                  <span className="text-[9px] font-black text-[var(--muted)] uppercase tracking-wider block mb-1">{stat.label}</span>
                  <span className="text-2xl font-black text-[var(--foreground)] tracking-tight">{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
