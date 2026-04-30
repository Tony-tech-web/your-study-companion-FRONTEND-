'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDialog } from '../components/Dialog';
import { ListSkeleton } from '../components/Skeleton';
import { cn } from '../lib/utils';
import {
  Plus, Loader2, Trash2, BookOpen, X, Calendar,
  CheckCircle2, Circle, ChevronLeft, ChevronRight,
  Brain, Clock, Sparkles,
} from 'lucide-react';
import { getStudyPlans, createStudyPlan, deleteStudyPlan } from '../services/planner';
import { callEdgeFunction } from '../lib/supabase';
import { StudyPlan } from '../types';

// Time slots shown in the schedule column
const HOURS = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'];

interface ScheduleBlock { day: number; hour: number; subject: string; duration: number; color: string; }
interface GeneratedSchedule { blocks: ScheduleBlock[]; summary: string; }

const COLORS = ['#6366f1','#10b981','#f27d26','#8b5cf6','#f59e0b','#ef4444','#06b6d4'];

const getDayLabel = (d: number) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d];
const today = new Date().getDay();

// ── Create Plan Modal ─────────────────────────────────────────────────────────
const CreateModal = ({ onClose, onSave }: { onClose: () => void; onSave: (p: StudyPlan) => void }) => {
  const [step, setStep] = useState<'form' | 'generating' | 'schedule'>('form');
  const [name, setName] = useState('');
  const [subjectsInput, setSubjectsInput] = useState('');
  const [hours, setHours] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState('5');
  const [error, setError] = useState('');
  const [schedule, setSchedule] = useState<GeneratedSchedule | null>(null);
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    if (!name || !hours || !subjectsInput) { setError('All fields are required'); return; }
    setError(''); setStep('generating');
    try {
      const subjects = subjectsInput.split(',').map(s => s.trim()).filter(Boolean);
      const res = await callEdgeFunction('ai-chat', {
        messages: [{
          role: 'user',
          content: `Generate a weekly study schedule for "${name}".
Subjects: ${subjects.join(', ')}
Total hours/week: ${hours}
Days per week: ${daysPerWeek}
Return ONLY valid JSON in this exact format:
{
  "blocks": [
    { "day": 1, "hour": 9, "subject": "Math", "duration": 2, "color": "#6366f1" },
    ...
  ],
  "summary": "Brief description of the schedule"
}
day is 0=Sun,1=Mon,...,6=Sat. hour is 24h. duration is hours. Use these colors: ${COLORS.slice(0, subjects.length).join(',')}. Only JSON, no markdown.`
        }],
        providerId: 'auto',
        mode: 'chat',
      });
      if (!res.ok) throw new Error('AI failed');
      const data = await res.json();
      const text = data.text || data.reply || data.message || '';
      const json = text.replace(/```json|```/g, '').trim();
      const parsed: GeneratedSchedule = JSON.parse(json);
      setSchedule(parsed);
      setStep('schedule');
    } catch {
      setSchedule({ blocks: [], summary: 'Could not generate AI schedule. You can still create the plan.' });
      setStep('schedule');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const subjects = subjectsInput.split(',').map(s => s.trim()).filter(Boolean);
      const plan = await createStudyPlan({
        name, subjects,
        totalHours: parseInt(hours) || 0,
      });
      onSave(plan); onClose();
    } catch { setError('Failed to save plan'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] shrink-0">
          <h2 className="text-base font-bold text-[var(--foreground)]">
            {step === 'form' ? 'New Study Plan' : step === 'generating' ? 'Generating Schedule…' : 'Review Schedule'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--accent)] text-[var(--muted)] transition-all"><X className="w-4 h-4" /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {step === 'form' && (
            <div className="p-6 space-y-4">
              {error && <p className="text-sm text-red-500 bg-red-500/10 rounded-xl p-3">{error}</p>}
              {[
                { label: 'Plan Name *', value: name, set: setName, placeholder: 'e.g. Semester 1 Study Plan' },
                { label: 'Subjects * (comma-separated)', value: subjectsInput, set: setSubjectsInput, placeholder: 'Math, Physics, Chemistry' },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5 block">{f.label}</label>
                  <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                    className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--primary)] transition-all" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5 block">Hours/Week *</label>
                  <input type="number" value={hours} onChange={e => setHours(e.target.value)} placeholder="20" min="1"
                    className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--primary)] transition-all" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5 block">Days/Week</label>
                  <select value={daysPerWeek} onChange={e => setDaysPerWeek(e.target.value)}
                    className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-all">
                    {[3,4,5,6,7].map(d => <option key={d} value={d}>{d} days</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--muted)] hover:bg-[var(--accent)] transition-all">Cancel</button>
                <button onClick={handleGenerate}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                  style={{ backgroundColor: 'var(--primary)' }}>
                  <Brain className="w-4 h-4" /> Generate with AI
                </button>
              </div>
            </div>
          )}

          {step === 'generating' && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-4 border-[var(--primary)]/20 animate-spin border-t-[var(--primary)]" />
                <Brain className="absolute inset-0 m-auto w-5 h-5 text-[var(--primary)]" />
              </div>
              <p className="text-sm font-medium text-[var(--foreground)]">Orbit is building your schedule…</p>
              <p className="text-xs text-[var(--muted)] opacity-50">Optimising for {daysPerWeek} days/week</p>
            </div>
          )}

          {step === 'schedule' && schedule && (
            <SchedulePreview schedule={schedule} name={name} subjectsInput={subjectsInput} hours={hours} onSave={handleSave} saving={saving} error={error} />
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ── Schedule Preview inside the modal ────────────────────────────────────────
const SchedulePreview = ({ schedule, name, subjectsInput, hours, onSave, saving, error }: any) => {
  const days = [1,2,3,4,5,6,0]; // Mon–Sun

  return (
    <div className="p-6 space-y-5">
      {schedule.summary && (
        <div className="flex items-start gap-3 bg-[var(--primary)]/8 border border-[var(--primary)]/20 rounded-xl p-4">
          <Sparkles className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
          <p className="text-[13px] text-[var(--muted)] leading-relaxed">{schedule.summary}</p>
        </div>
      )}

      {/* Calendar grid */}
      {schedule.blocks.length > 0 ? (
        <div className="bg-[var(--input)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="flex">
            {/* Hour column */}
            <div className="w-14 shrink-0 border-r border-[var(--border)] bg-[var(--card)]">
              <div className="h-8 border-b border-[var(--border)]" />
              {HOURS.map(h => (
                <div key={h} className="h-10 border-b border-[var(--border)] flex items-center justify-center">
                  <span className="text-[9px] font-medium text-[var(--muted)] opacity-50">{h}</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(7, 1fr)` }}>
              {/* Day headers */}
              {days.map(d => (
                <div key={d} className={cn('h-8 border-b border-r border-[var(--border)] flex items-center justify-center',
                  d === today ? 'bg-[var(--primary)]/10' : '')}>
                  <span className={cn('text-[10px] font-bold', d === today ? 'text-[var(--primary)]' : 'text-[var(--muted)]')}>
                    {getDayLabel(d)}
                  </span>
                </div>
              ))}

              {/* Time cells */}
              {days.map(d => (
                <div key={d} className="relative border-r border-[var(--border)]">
                  {HOURS.map((_, hi) => (
                    <div key={hi} className={cn('h-10 border-b border-[var(--border)]',
                      d === today ? 'bg-[var(--primary)]/3' : '')} />
                  ))}
                  {/* Schedule blocks */}
                  {schedule.blocks.filter((b: ScheduleBlock) => b.day === d).map((block: ScheduleBlock, bi: number) => {
                    const startHour = parseInt(HOURS[0]);
                    const topOffset = (block.hour - startHour) * 40; // 40px per hour
                    const height = Math.max(block.duration * 40 - 2, 32);
                    if (block.hour < startHour || block.hour >= startHour + HOURS.length) return null;
                    return (
                      <div key={bi} className="absolute inset-x-0.5 rounded-md overflow-hidden flex flex-col justify-center px-1.5"
                        style={{ top: topOffset + 2, height, backgroundColor: block.color + 'cc' }}>
                        <p className="text-[9px] font-bold text-white truncate leading-tight">{block.subject}</p>
                        <p className="text-[8px] text-white/70">{block.duration}h</p>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--input)] border border-[var(--border)] rounded-xl p-8 text-center">
          <Calendar className="w-8 h-8 text-[var(--muted)] opacity-20 mx-auto mb-2" />
          <p className="text-sm text-[var(--muted)] opacity-40">No schedule generated. Plan will be saved without a calendar.</p>
        </div>
      )}

      {error && <p className="text-sm text-red-500 bg-red-500/10 rounded-xl p-3">{error}</p>}

      <button onClick={onSave} disabled={saving}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition-all"
        style={{ backgroundColor: 'var(--primary)' }}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Save Plan</>}
      </button>
    </div>
  );
};

// ── Plan Detail view with inline calendar ─────────────────────────────────────
const PlanDetail = ({ plan, onBack, onDelete }: { plan: StudyPlan; onBack: () => void; onDelete: () => void }) => {
  const { show: showDialog } = useDialog();
  const [completedSlots, setCompletedSlots] = useState<Set<string>>(new Set());

  const progress = useMemo(() => {
    if (plan.subjects.length === 0) return plan.progress;
    return Math.round((completedSlots.size / Math.max(plan.subjects.length * 3, 1)) * 100);
  }, [completedSlots, plan]);

  const toggleSlot = async (key: string) => {
    setCompletedSlots(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleConfirmSession = async (subject: string, timeLabel: string) => {
    const ok = await showDialog({
      title: 'Confirm Study Session',
      message: `Mark "${subject}" at ${timeLabel} as completed?`,
      confirmLabel: 'Confirm',
      cancelLabel: 'Not Yet',
    });
    if (ok) toggleSlot(`${subject}-${timeLabel}`);
  };

  // Generate a simple weekly schedule from subjects
  const weekDays = [1,2,3,4,5]; // Mon–Fri
  const hoursPerSubject = plan.totalHours > 0 && plan.subjects.length > 0
    ? Math.round(plan.totalHours / plan.subjects.length)
    : 2;
  const sessionTimes = ['08:00','10:00','14:00','16:00'];
  const colors = ['#6366f1','#10b981','#f27d26','#8b5cf6','#f59e0b','#ef4444'];

  // Distribute subjects across week days
  const weekSchedule: { day: number; sessions: { subject: string; time: string; color: string }[] }[] = weekDays.map((d, di) => ({
    day: d,
    sessions: plan.subjects
      .filter((_, si) => si % weekDays.length === di || (di === 0 && si >= weekDays.length))
      .slice(0, 2)
      .map((sub, si) => ({
        subject: sub,
        time: sessionTimes[si] || '09:00',
        color: colors[plan.subjects.indexOf(sub) % colors.length],
      })),
  }));

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)] text-[var(--foreground)] custom-scrollbar">
      <div className="max-w-5xl mx-auto p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 pt-2">
          <button onClick={onBack} className="p-2 rounded-xl border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--accent)] transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold tracking-tight truncate">{plan.name}</h1>
            <p className="text-xs text-[var(--muted)] mt-0.5">{plan.subjects.length} subjects · {plan.totalHours}h total</p>
          </div>
          <button onClick={onDelete} className="p-2 rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-red-500 hover:border-red-500/30 transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Progress</span>
            <span className="text-sm font-bold text-[var(--primary)]">{progress}%</span>
          </div>
          <div className="h-2 bg-[var(--input)] rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ backgroundColor: 'var(--primary)' }}
              initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.6 }} />
          </div>
          <p className="text-[11px] text-[var(--muted)] mt-1.5">
            {completedSlots.size} session{completedSlots.size !== 1 ? 's' : ''} confirmed this week
          </p>
        </div>

        {/* Main content: schedule + hour breakdown side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Hours breakdown column */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-[var(--foreground)]">Weekly Hours</p>
            {plan.subjects.map((sub, i) => {
              const hrs = hoursPerSubject;
              const pct = plan.subjects.length > 0 ? 100 / plan.subjects.length : 0;
              const color = colors[i % colors.length];
              return (
                <div key={sub}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-[12px] font-medium text-[var(--foreground)] truncate max-w-[100px]">{sub}</span>
                    </div>
                    <span className="text-[11px] text-[var(--muted)]">{hrs}h</span>
                  </div>
                  <div className="h-1.5 bg-[var(--input)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
            {plan.subjects.length === 0 && <p className="text-xs text-[var(--muted)] opacity-40">No subjects</p>}
          </div>

          {/* Calendar */}
          <div className="lg:col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--primary)]" />
              <p className="text-sm font-semibold text-[var(--foreground)]">This Week</p>
            </div>

            <div className="flex">
              {/* Hours column */}
              <div className="w-12 shrink-0 border-r border-[var(--border)]">
                <div className="h-10 border-b border-[var(--border)]" />
                {HOURS.slice(0, 10).map(h => (
                  <div key={h} className="h-12 border-b border-[var(--border)] flex items-center justify-center">
                    <span className="text-[9px] text-[var(--muted)] opacity-50">{h}</span>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${weekDays.length}, 1fr)` }}>
                {/* Headers */}
                {weekDays.map(d => (
                  <div key={d} className={cn('h-10 border-b border-r border-[var(--border)] flex flex-col items-center justify-center',
                    d === today ? 'bg-[var(--primary)]/8' : '')}>
                    <span className={cn('text-[10px] font-bold', d === today ? 'text-[var(--primary)]' : 'text-[var(--muted)]')}>
                      {getDayLabel(d)}
                    </span>
                    {d === today && <div className="w-1 h-1 rounded-full bg-[var(--primary)] mt-0.5" />}
                  </div>
                ))}

                {/* Cells */}
                {weekDays.map(d => {
                  const dayData = weekSchedule.find(w => w.day === d);
                  return (
                    <div key={d} className="relative border-r border-[var(--border)]">
                      {HOURS.slice(0, 10).map((h, hi) => (
                        <div key={hi} className={cn('h-12 border-b border-[var(--border)]',
                          d === today ? 'bg-[var(--primary)]/3' : '')} />
                      ))}
                      {/* Sessions */}
                      {dayData?.sessions.map((sess, si) => {
                        const hourIndex = HOURS.indexOf(sess.time);
                        if (hourIndex < 0 || hourIndex >= 10) return null;
                        const key = `${sess.subject}-${getDayLabel(d)}-${sess.time}`;
                        const done = completedSlots.has(key);
                        return (
                          <button key={si} onClick={() => handleConfirmSession(sess.subject, `${getDayLabel(d)} ${sess.time}`)}
                            className="absolute inset-x-0.5 rounded-lg flex flex-col justify-center px-1.5 py-1 transition-all hover:opacity-90 active:scale-95"
                            style={{ top: hourIndex * 48 + 2, height: 44, backgroundColor: done ? sess.color : sess.color + '33', borderWidth: 1, borderColor: done ? sess.color : sess.color + '66' }}>
                            <p className="text-[9px] font-bold truncate" style={{ color: done ? '#fff' : sess.color }}>{sess.subject}</p>
                            {done && <CheckCircle2 className="w-2.5 h-2.5 text-white mt-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-4 py-2.5 border-t border-[var(--border)] bg-[var(--input)]">
              <p className="text-[10px] text-[var(--muted)] opacity-50">Tap a session to confirm completion</p>
            </div>
          </div>
        </div>

        {/* Subjects quick view */}
        {plan.subjects.length > 0 && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <p className="text-sm font-semibold mb-3">Subjects</p>
            <div className="flex flex-wrap gap-2">
              {plan.subjects.map((s, i) => (
                <span key={s} className="text-[12px] font-medium px-3 py-1.5 rounded-xl border"
                  style={{ backgroundColor: colors[i % colors.length] + '15', borderColor: colors[i % colors.length] + '40', color: colors[i % colors.length] }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Planner ──────────────────────────────────────────────────────────────
export const Planner = () => {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);
  const { show: showDialog } = useDialog();

  useEffect(() => {
    getStudyPlans().then(setPlans).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    const ok = await showDialog({ title: 'Delete Plan', message: 'Remove this study plan permanently?', confirmLabel: 'Delete', destructive: true });
    if (!ok) return;
    try { await deleteStudyPlan(id); setPlans(prev => prev.filter(p => p.id !== id)); setSelectedPlan(null); }
    catch { showDialog({ type: 'error', message: 'Failed to delete plan.' }); }
  };

  if (loading) return <ListSkeleton rows={3} />;

  if (selectedPlan) return (
    <PlanDetail plan={selectedPlan} onBack={() => setSelectedPlan(null)}
      onDelete={() => handleDelete(selectedPlan.id)} />
  );

  const totalHours = plans.reduce((a, p) => a + p.totalHours, 0);
  const avgProgress = plans.length ? Math.round(plans.reduce((a, p) => a + p.progress, 0) / plans.length) : 0;

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)] text-[var(--foreground)] custom-scrollbar">
      <AnimatePresence>{showModal && <CreateModal onClose={() => setShowModal(false)} onSave={p => setPlans(prev => [p, ...prev])} />}</AnimatePresence>
      <div className="max-w-4xl mx-auto p-6 space-y-5">

        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Study Planner</h1>
            <p className="text-xs text-[var(--muted)] mt-0.5">{plans.length} active plan{plans.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 active:scale-95 transition-all"
            style={{ backgroundColor: 'var(--primary)' }}>
            <Plus className="w-4 h-4" /> New Plan
          </button>
        </div>

        {plans.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Plans', value: plans.length },
              { label: 'Hours', value: `${totalHours}h` },
              { label: 'Avg Progress', value: `${avgProgress}%` },
            ].map(s => (
              <div key={s.label} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-2xl font-bold tracking-tight">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {plans.length === 0 ? (
          <div className="bg-[var(--card)] border-2 border-dashed border-[var(--border)] rounded-xl p-16 text-center">
            <Calendar className="w-10 h-10 text-[var(--muted)] opacity-20 mx-auto mb-3" />
            <p className="text-sm text-[var(--muted)] opacity-50 mb-4">No study plans yet</p>
            <button onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
              style={{ backgroundColor: 'var(--primary)' }}>
              <Brain className="w-4 h-4" /> Create with AI
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan, i) => (
              <motion.div key={plan.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedPlan(plan)}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--primary)]/40 hover:shadow-sm transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <h3 className="text-[14px] font-semibold truncate">{plan.name}</h3>
                    <p className="text-[11px] text-[var(--muted)] mt-0.5">
                      {plan.subjects.length} subjects · {plan.totalHours}h/week
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors" />
                    <button onClick={e => { e.stopPropagation(); handleDelete(plan.id); }}
                      className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[var(--input)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${plan.progress}%`, backgroundColor: 'var(--primary)' }} />
                  </div>
                  <span className="text-[11px] font-medium text-[var(--primary)] shrink-0">{plan.progress}%</span>
                </div>
                {plan.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {plan.subjects.slice(0, 4).map((s: string, si: number) => (
                      <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: COLORS[si % COLORS.length] + '18', color: COLORS[si % COLORS.length] }}>
                        {s}
                      </span>
                    ))}
                    {plan.subjects.length > 4 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--input)] text-[var(--muted)]">+{plan.subjects.length - 4}</span>
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
