'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDialog } from '../components/Dialog';
import { ListSkeleton } from '../components/Skeleton';
import { cn } from '../lib/utils';
import { Clock, Plus, Loader2, Trash2, BookOpen, X, Calendar } from 'lucide-react';
import { getStudyPlans, createStudyPlan, deleteStudyPlan } from '../services/planner';
import { StudyPlan } from '../types';

const AddModal = ({ onClose, onSave }: { onClose: () => void; onSave: (p: StudyPlan) => void }) => {
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
      onSave(plan); onClose();
    } catch { setError('Failed to create plan'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)] shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-[var(--foreground)]">New Study Plan</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--accent)] text-[var(--muted)] transition-all"><X className="w-4 h-4" /></button>
        </div>
        {error && <p className="mb-4 text-sm text-red-500 bg-red-500/10 rounded-xl p-3">{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5 block">Plan Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Final Exam Prep"
              className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--primary)] transition-all" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5 block">Subjects (comma-separated)</label>
            <input value={subjectsInput} onChange={e => setSubjectsInput(e.target.value)} placeholder="Math, Physics, Chemistry"
              className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--primary)] transition-all" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5 block">Total Hours *</label>
            <input type="number" value={hours} onChange={e => setHours(e.target.value)} placeholder="20" min="1"
              className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--primary)] transition-all" />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--muted)] hover:bg-[var(--accent)] transition-all">Cancel</button>
            <button onClick={handleSave} disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition-all"
              style={{ backgroundColor: 'var(--primary)' }}>
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
  const { show: showDialog } = useDialog();

  useEffect(() => {
    getStudyPlans().then(setPlans).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    const ok = await showDialog({ title: 'Delete Plan', message: 'Remove this study plan permanently?', confirmLabel: 'Delete', destructive: true });
    if (!ok) return;
    try { await deleteStudyPlan(id); setPlans(prev => prev.filter(p => p.id !== id)); }
    catch { showDialog({ type: 'error', message: 'Failed to delete plan.' }); }
  };

  const totalHours = plans.reduce((a, p) => a + p.totalHours, 0);
  const avgProgress = plans.length ? Math.round(plans.reduce((a, p) => a + p.progress, 0) / plans.length) : 0;

  if (loading) return <ListSkeleton rows={3} />;

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)] text-[var(--foreground)] custom-scrollbar">
      <AnimatePresence>{showModal && <AddModal onClose={() => setShowModal(false)} onSave={p => setPlans(prev => [p, ...prev])} />}</AnimatePresence>
      <div className="max-w-4xl mx-auto p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Study Planner</h1>
            <p className="text-xs text-[var(--muted)] mt-0.5">{plans.length} active plan{plans.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 active:scale-95 transition-all"
            style={{ backgroundColor: 'var(--primary)' }}>
            <Plus className="w-4 h-4" /> New Plan
          </button>
        </div>

        {/* Stats */}
        {plans.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Plans', value: plans.length },
              { label: 'Hours Allocated', value: `${totalHours}h` },
              { label: 'Avg Progress', value: `${avgProgress}%` },
            ].map(s => (
              <div key={s.label} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider mb-1.5">{s.label}</p>
                <p className="text-2xl font-bold text-[var(--foreground)] tracking-tight">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Plans list */}
        {plans.length === 0 ? (
          <div className="bg-[var(--card)] border-2 border-dashed border-[var(--border)] rounded-xl p-16 text-center">
            <Calendar className="w-10 h-10 text-[var(--muted)] opacity-20 mx-auto mb-3" />
            <p className="text-sm font-medium text-[var(--muted)] opacity-50 mb-4">No study plans yet</p>
            <button onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
              style={{ backgroundColor: 'var(--primary)' }}>
              <Plus className="w-4 h-4" /> Create Your First Plan
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan, i) => (
              <motion.div key={plan.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--primary)]/40 hover:shadow-sm transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <h3 className="text-[14px] font-semibold text-[var(--foreground)] truncate">{plan.name}</h3>
                  </div>
                  <button onClick={() => handleDelete(plan.id)}
                    className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-[var(--muted)]">Progress</span>
                    <span className="text-[11px] font-medium text-[var(--primary)]">{plan.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-[var(--input)] rounded-full overflow-hidden border border-[var(--border)]">
                    <div className="h-full rounded-full transition-all" style={{ width: `${plan.progress}%`, backgroundColor: 'var(--primary)' }} />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-[12px] text-[var(--muted)]">
                    <Clock className="w-3.5 h-3.5" />
                    {plan.totalHours}h
                  </span>
                  {plan.subjects.length > 0 && (
                    <span className="flex items-center gap-1.5 text-[12px] text-[var(--muted)]">
                      <BookOpen className="w-3.5 h-3.5" />
                      {plan.subjects.length} subject{plan.subjects.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {plan.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {plan.subjects.slice(0, 5).map((s: string) => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--input)] border border-[var(--border)] text-[var(--muted)]">{s}</span>
                    ))}
                    {plan.subjects.length > 5 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--input)] border border-[var(--border)] text-[var(--muted)]">+{plan.subjects.length - 5}</span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
