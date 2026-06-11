'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDialog } from '../components/Dialog';
import { ListSkeleton } from '../components/Skeleton';
import { cn } from '../lib/utils';
import {
  Plus, Loader2, Trash2, BookOpen, X, Calendar,
  CheckCircle2, Circle, ChevronLeft, ChevronRight,
  Brain, Clock, Sparkles, Edit3, Bell,
} from 'lucide-react';
import { getStudyPlans, createStudyPlan, updateStudyPlan, deleteStudyPlan, randomizeStudyPlan } from '../services/planner';
import { callEdgeFunction } from '../lib/supabase';
import { StudyPlan, StudyPlanBlock } from '../types';
import { getBillingUsage, recordAiUsageEvent } from '../services/billing';

// Time slots shown in the schedule column
const HOURS = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'];

interface GeneratedSchedule { blocks: StudyPlanBlock[]; summary: string; }

const COLORS = ['#6366f1','#10b981','#f27d26','#8b5cf6','#f59e0b','#ef4444','#06b6d4'];

const getDayLabel = (d: number) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d];
const today = new Date().getDay();
const pad = (n: number) => String(n).padStart(2, '0');
const getBlockMinute = (block: StudyPlanBlock) => Number.isFinite(block.minute) ? block.minute! : 0;
const getDurationMinutes = (block: StudyPlanBlock) => Number.isFinite(block.durationMinutes) ? block.durationMinutes! : Math.max(15, Math.round((block.duration || 1) * 60));
const formatBlockTime = (block: StudyPlanBlock) => {
  const hour = Math.max(0, Math.min(23, Number(block.hour) || 0));
  const minute = Math.max(0, Math.min(59, getBlockMinute(block)));
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${pad(minute)} ${suffix}`;
};
const formatDuration = (block: StudyPlanBlock) => {
  const mins = getDurationMinutes(block);
  if (mins % 60 === 0) return `${mins / 60}h`;
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};
const blockStartMinutes = (block: StudyPlanBlock) => (Number(block.hour) || 0) * 60 + getBlockMinute(block);
const normalizeBlocks = (blocks: StudyPlanBlock[] = []) => blocks.map((block, index) => {
  const durationMinutes = getDurationMinutes(block);
  return {
    ...block,
    day: Math.max(0, Math.min(6, Number(block.day) || 0)),
    hour: Math.max(0, Math.min(23, Number(block.hour) || 9)),
    minute: Math.max(0, Math.min(59, getBlockMinute(block))),
    duration: Math.max(0.25, Math.round((durationMinutes / 60) * 4) / 4),
    durationMinutes,
    color: block.color || COLORS[index % COLORS.length],
  };
});

const nextDateForDay = (day: number, time: string) => {
  const now = new Date();
  const [hour, minute] = time.split(':').map(Number);
  const date = new Date(now);
  date.setDate(now.getDate() + ((day - now.getDay() + 7) % 7));
  date.setHours(hour || 9, minute || 0, 0, 0);
  if (date <= now) date.setDate(date.getDate() + 7);
  return date;
};

const toIcsDate = (date: Date) =>
  `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;

const downloadSessionReminder = (planName: string, subject: string, day: number, time: string) => {
  const start = nextDateForDay(day, time);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const safeName = `${planName}-${subject}-${getDayLabel(day)}-${time}`.replace(/[^a-z0-9-]+/gi, '-').toLowerCase();
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Orbit//Study Planner//EN',
    'BEGIN:VEVENT',
    `UID:${safeName}-${start.getTime()}@orbit`,
    `SUMMARY:Study: ${subject}`,
    `DESCRIPTION:${planName}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Study reminder for ${subject}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}.ics`;
  a.click();
  URL.revokeObjectURL(url);
};

// ── Create Plan Modal ─────────────────────────────────────────────────────────
const CreateModal = ({ onClose, onSave, initialPlan }: { onClose: () => void; onSave: (p: StudyPlan) => void; initialPlan?: StudyPlan | null }) => {
  const [step, setStep] = useState<'form' | 'generating' | 'schedule'>('form');
  const [name, setName] = useState(initialPlan?.name || '');
  const [subjectsInput, setSubjectsInput] = useState(initialPlan?.subjects.join(', ') || '');
  const [hours, setHours] = useState(initialPlan?.totalHours ? String(initialPlan.totalHours) : '');
  const [daysPerWeek, setDaysPerWeek] = useState('5');
  const [error, setError] = useState('');
  const [schedule, setSchedule] = useState<GeneratedSchedule | null>(
    initialPlan?.scheduleBlocks?.length ? { blocks: initialPlan.scheduleBlocks, summary: 'Saved weekly schedule' } : null
  );
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    if (!name || !hours || !subjectsInput) { setError('All fields are required'); return; }
    setError(''); setStep('generating');
    try {
      const usage = await getBillingUsage().catch(() => null);
      if (usage?.ai_token_limit > 0 && usage?.tokens_remaining <= 0) {
        throw new Error('AI token allowance exhausted');
      }
      const subjects = subjectsInput.split(',').map(s => s.trim()).filter(Boolean);
      const messages = [{
          role: 'user',
          content: `Generate a weekly study schedule for "${name}".
Subjects: ${subjects.join(', ')}
Total hours/week: ${hours}
Days per week: ${daysPerWeek}
Return ONLY valid JSON in this exact format:
{
  "blocks": [
    { "day": 1, "hour": 9, "minute": 30, "subject": "Math", "duration": 1.5, "durationMinutes": 90, "color": "#6366f1" },
    ...
  ],
  "summary": "Brief description of the schedule"
}
day is 0=Sun,1=Mon,...,6=Sat. hour is 24h, minute must be 0, 15, 30, or 45. durationMinutes must be 45, 60, 75, 90, or 120. Use readable AM/PM-friendly study times between 7:00 and 21:00. Use these colors: ${COLORS.slice(0, subjects.length).join(',')}. Only JSON, no markdown, no emoji, no decorative glyphs.`
        }];
      const res = await callEdgeFunction('ai-chat', {
        messages,
        providerId: 'auto',
        mode: 'chat',
      });
      if (!res.ok) throw new Error('AI failed');
      const data = await res.json();
      const text = data.text || data.reply || data.message || '';
      const json = text.replace(/```json|```/g, '').trim();
      const parsed: GeneratedSchedule = JSON.parse(json);
      parsed.blocks = normalizeBlocks(parsed.blocks || []);
      await recordAiUsageEvent({
        provider: 'edge:auto',
        feature: 'planner_generate',
        prompt: messages,
        completion: text,
      }).catch(() => {});
      setSchedule(parsed);
      setStep('schedule');
    } catch {
      try {
        const fallbackSubjects = subjectsInput.split(',').map(s => s.trim()).filter(Boolean);
        const randomized = await randomizeStudyPlan({
          subjects: fallbackSubjects,
          totalHours: parseInt(hours) || fallbackSubjects.length,
          daysPerWeek: parseInt(daysPerWeek) || 5,
        });
        setSchedule({ blocks: normalizeBlocks(randomized.blocks), summary: randomized.summary });
      } catch {
        setSchedule({ blocks: [], summary: 'Could not generate a schedule. You can still save the plan and try again later.' });
      }
      setStep('schedule');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const subjects = subjectsInput.split(',').map(s => s.trim()).filter(Boolean);
      const payload = {
        name, subjects,
        totalHours: parseInt(hours) || 0,
        progress: initialPlan?.progress || 0,
        scheduleBlocks: normalizeBlocks(schedule?.blocks || initialPlan?.scheduleBlocks || []),
        completedSessionIds: initialPlan?.completedSessionIds || [],
      };
      const plan = initialPlan ? await updateStudyPlan(initialPlan.id, payload) : await createStudyPlan(payload);
      onSave(plan); onClose();
    } catch { setError('Failed to save plan'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        onClick={e => e.stopPropagation()}
        className="stitch-glass-card w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] shrink-0">
          <h2 className="text-base font-bold text-[var(--foreground)]">
            {initialPlan ? 'Edit Study Plan' : step === 'form' ? 'New Study Plan' : step === 'generating' ? 'Generating Schedule...' : 'Review Schedule'}
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
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[var(--primary-foreground)] flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                  style={{ backgroundColor: 'var(--primary)' }}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : initialPlan ? <><CheckCircle2 className="w-4 h-4" /> Save Changes</> : <><CheckCircle2 className="w-4 h-4" /> Save Plan</>}
                </button>
              </div>
              {!initialPlan && (
                <button onClick={handleGenerate}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold border border-[var(--border)] text-[var(--foreground)] flex items-center justify-center gap-2 hover:bg-[var(--accent)] transition-all">
                  <Brain className="w-4 h-4" /> Preview AI Schedule
                </button>
              )}
              {initialPlan && (
                <button onClick={() => { setSchedule({ blocks: normalizeBlocks(initialPlan.scheduleBlocks || []), summary: 'Edit exact days, start times, and durations before saving.' }); setStep('schedule'); }}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold border border-[var(--border)] text-[var(--foreground)] flex items-center justify-center gap-2 hover:bg-[var(--accent)] transition-all">
                  <Clock className="w-4 h-4" /> Edit Schedule Times
                </button>
              )}
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
            <SchedulePreview schedule={schedule} onBlocksChange={(blocks: StudyPlanBlock[]) => setSchedule(prev => ({ summary: prev?.summary || 'Manual schedule', blocks: normalizeBlocks(blocks) }))} onSave={handleSave} saving={saving} error={error} />
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ── Schedule Preview inside the modal ────────────────────────────────────────
const SchedulePreview = ({ schedule, onBlocksChange, onSave, saving, error }: { schedule: GeneratedSchedule; onBlocksChange: (blocks: StudyPlanBlock[]) => void; onSave: () => void; saving: boolean; error?: string }) => {
  const days = [1,2,3,4,5,6,0]; // Mon-Sun
  const updateBlock = (index: number, patch: Partial<StudyPlanBlock>) => {
    onBlocksChange(schedule.blocks.map((block, i) => i === index ? { ...block, ...patch } : block));
  };

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
                  {schedule.blocks.filter((b: StudyPlanBlock) => b.day === d).map((block: StudyPlanBlock) => {
                    const blockIndex = schedule.blocks.indexOf(block);
                    const startHour = parseInt(HOURS[0]);
                    const topOffset = ((blockStartMinutes(block) - startHour * 60) / 60) * 40;
                    const height = Math.max((getDurationMinutes(block) / 60) * 40 - 2, 32);
                    if (block.hour < startHour || block.hour >= startHour + HOURS.length) return null;
                    return (
                      <div key={blockIndex} className="absolute inset-x-0.5 rounded-md overflow-hidden flex flex-col justify-center px-1.5"
                        style={{ top: topOffset + 2, height, backgroundColor: block.color + 'cc' }}>
                        <p className="text-[9px] font-bold text-white truncate leading-tight">{block.subject}</p>
                        <p className="text-[8px] text-white/70">{formatBlockTime(block)} - {formatDuration(block)}</p>
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

      {schedule.blocks.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--muted)]">Manual time editor</p>
          {schedule.blocks.map((block, index) => (
            <div key={`${block.subject}-${index}`} className="grid grid-cols-12 gap-2 rounded-xl border border-[var(--border)] bg-[var(--input)] p-3">
              <div className="col-span-12 sm:col-span-4">
                <label className="block text-[10px] font-bold uppercase text-[var(--muted)]">Subject</label>
                <input value={block.subject} onChange={e => updateBlock(index, { subject: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs text-[var(--foreground)] outline-none" />
              </div>
              <div className="col-span-4 sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-[var(--muted)]">Day</label>
                <select value={block.day} onChange={e => updateBlock(index, { day: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-2 text-xs text-[var(--foreground)] outline-none">
                  {[0,1,2,3,4,5,6].map(day => <option key={day} value={day}>{getDayLabel(day)}</option>)}
                </select>
              </div>
              <div className="col-span-4 sm:col-span-3">
                <label className="block text-[10px] font-bold uppercase text-[var(--muted)]">Start</label>
                <input type="time" value={`${pad(block.hour)}:${pad(getBlockMinute(block))}`} onChange={e => {
                  const [hour, minute] = e.target.value.split(':').map(Number);
                  updateBlock(index, { hour, minute });
                }} className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-2 text-xs text-[var(--foreground)] outline-none" />
              </div>
              <div className="col-span-4 sm:col-span-3">
                <label className="block text-[10px] font-bold uppercase text-[var(--muted)]">Duration</label>
                <select value={getDurationMinutes(block)} onChange={e => {
                  const durationMinutes = Number(e.target.value);
                  updateBlock(index, { durationMinutes, duration: Math.round((durationMinutes / 60) * 4) / 4 });
                }} className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-2 text-xs text-[var(--foreground)] outline-none">
                  {[30,45,60,75,90,120,150,180].map(mins => <option key={mins} value={mins}>{mins < 60 ? `${mins}m` : mins % 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins / 60}h`}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-500 bg-red-500/10 rounded-xl p-3">{error}</p>}

      <button onClick={onSave} disabled={saving}
        className="w-full py-3 rounded-xl text-sm font-semibold text-[var(--primary-foreground)] flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition-all"
        style={{ backgroundColor: 'var(--primary)' }}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Save Plan</>}
      </button>
    </div>
  );
};

// ── Plan Detail view with inline calendar ─────────────────────────────────────
const PlanDetail = ({ plan, onBack, onDelete, onEdit, onPlanUpdate }: { plan: StudyPlan; onBack: () => void; onDelete: () => void; onEdit: () => void; onPlanUpdate: (plan: StudyPlan) => void }) => {
  const { show: showDialog } = useDialog();
  const [completedSlots, setCompletedSlots] = useState<Set<string>>(new Set(plan.completedSessionIds || []));

  const sessionTimes = ['08:00','10:00','14:00','16:00'];
  const colors = ['#6366f1','#10b981','#f27d26','#8b5cf6','#f59e0b','#ef4444'];

  const fallbackBlocks = useMemo<StudyPlanBlock[]>(() => {
    const days = [1,2,3,4,5];
    return plan.subjects.map((subject, index) => {
      const day = days[index % days.length];
      const time = sessionTimes[Math.floor(index / days.length) % sessionTimes.length] || '09:00';
      return {
        day,
        hour: parseInt(time.split(':')[0], 10),
        minute: 0,
        subject,
        duration: Math.max(1, Math.round(plan.totalHours / Math.max(plan.subjects.length, 1))),
        durationMinutes: Math.max(60, Math.round(plan.totalHours / Math.max(plan.subjects.length, 1)) * 60),
        color: colors[index % colors.length],
      };
    });
  }, [plan.subjects, plan.totalHours]);

  const scheduleBlocks = normalizeBlocks(plan.scheduleBlocks?.length ? plan.scheduleBlocks : fallbackBlocks);
  const sessionId = (block: StudyPlanBlock) => `${plan.id}-${block.day}-${block.hour}-${getBlockMinute(block)}-${block.subject}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-');

  const progress = useMemo(() => {
    if (scheduleBlocks.length === 0) return plan.progress;
    return Math.round((completedSlots.size / scheduleBlocks.length) * 100);
  }, [completedSlots, scheduleBlocks.length, plan.progress]);

  const toggleSlot = async (key: string) => {
    const next = new Set(completedSlots);
    if (next.has(key)) next.delete(key); else next.add(key);
    setCompletedSlots(next);
    try {
      const completedSessionIds = Array.from(next);
      const updated = await updateStudyPlan(plan.id, {
        ...plan,
        scheduleBlocks,
        completedSessionIds,
        progress: scheduleBlocks.length === 0 ? plan.progress : Math.round((completedSessionIds.length / scheduleBlocks.length) * 100),
      });
      onPlanUpdate(updated);
    } catch {
      showDialog({ type: 'error', message: 'Failed to save session progress.' });
    }
  };

  const handleConfirmSession = async (key: string, subject: string, timeLabel: string) => {
    const done = completedSlots.has(key);
    const ok = await showDialog({
      title: done ? 'Update Study Session' : 'Confirm Study Session',
      message: done ? `Mark "${subject}" at ${timeLabel} as not completed?` : `Mark "${subject}" at ${timeLabel} as completed?`,
      confirmLabel: done ? 'Mark Not Done' : 'Confirm',
      cancelLabel: 'Cancel',
    });
    if (ok) toggleSlot(key);
  };

  const weekDays = (scheduleBlocks.length
    ? Array.from(new Set(scheduleBlocks.map(block => block.day))).sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
    : [1,2,3,4,5]
  );
  const hoursPerSubject = plan.totalHours > 0 && plan.subjects.length > 0
    ? Math.round(plan.totalHours / plan.subjects.length)
    : 2;

  const weekSchedule: { day: number; sessions: { id: string; subject: string; time: string; timeLabel: string; color: string; duration: number; durationMinutes: number }[] }[] = weekDays.map(day => ({
    day,
    sessions: scheduleBlocks
      .filter(block => block.day === day)
      .map(block => ({
        id: sessionId(block),
        subject: block.subject,
        time: `${pad(block.hour)}:${pad(getBlockMinute(block))}`,
        timeLabel: formatBlockTime(block),
        color: block.color || colors[plan.subjects.indexOf(block.subject) % colors.length] || colors[0],
        duration: block.duration || 1,
        durationMinutes: getDurationMinutes(block),
      }))
      .sort((a, b) => a.time.localeCompare(b.time)),
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
          <button onClick={onEdit} className="p-2 rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40 transition-all">
            <Edit3 className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-2 rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-red-500 hover:border-red-500/30 transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="stitch-glass-card rounded-[28px] p-4">
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
          <div className="stitch-glass-card rounded-[28px] p-4 space-y-3">
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
          <div className="stitch-glass-card lg:col-span-2 rounded-[28px] overflow-hidden">
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
                      {dayData?.sessions.map((sess) => {
                        const [hour, minute] = sess.time.split(':').map(Number);
                        const startMinutes = hour * 60 + (minute || 0);
                        const gridStart = parseInt(HOURS[0]) * 60;
                        const gridEnd = gridStart + 10 * 60;
                        if (startMinutes < gridStart || startMinutes >= gridEnd) return null;
                        const done = completedSlots.has(sess.id);
                        return (
                          <button key={sess.id} onClick={() => handleConfirmSession(sess.id, sess.subject, `${getDayLabel(d)} ${sess.timeLabel}`)}
                            className="absolute inset-x-0.5 rounded-lg flex flex-col justify-center px-1.5 py-1 transition-all hover:opacity-90 active:scale-95"
                            style={{ top: ((startMinutes - gridStart) / 60) * 48 + 2, height: Math.max((sess.durationMinutes / 60) * 48 - 4, 38), backgroundColor: done ? sess.color : sess.color + '33', borderWidth: 1, borderColor: done ? sess.color : sess.color + '66' }}>
                            <p className="text-[9px] font-bold truncate" style={{ color: done ? '#fff' : sess.color }}>{sess.subject}</p>
                            <p className="text-[8px] font-semibold truncate" style={{ color: done ? 'rgba(255,255,255,0.75)' : sess.color }}>{sess.timeLabel}</p>
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

          <div className="stitch-glass-card rounded-[28px] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[var(--primary)]" />
              <p className="text-sm font-semibold text-[var(--foreground)]">Calendar Reminders</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {weekSchedule.flatMap(day => day.sessions.map(sess => ({ ...sess, day: day.day }))).map(sess => (
                <button key={`${sess.day}-${sess.subject}-${sess.time}`} onClick={() => downloadSessionReminder(plan.name, sess.subject, sess.day, sess.time)}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-left hover:border-[var(--primary)]/40 transition-all">
                  <span className="min-w-0">
                    <span className="block text-[12px] font-semibold text-[var(--foreground)] truncate">{sess.subject}</span>
                    <span className="block text-[10px] text-[var(--muted)]">{getDayLabel(sess.day)} {sess.timeLabel} - adds a 15 min reminder</span>
                  </span>
                  <Calendar className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Subjects quick view */}
        {plan.subjects.length > 0 && (
          <div className="stitch-glass-card rounded-[28px] p-4">
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
  const [editingPlan, setEditingPlan] = useState<StudyPlan | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
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
      onDelete={() => handleDelete(selectedPlan.id)}
      onEdit={() => { setEditingPlan(selectedPlan); setSelectedPlan(null); setShowModal(true); }}
      onPlanUpdate={updated => {
        setSelectedPlan(updated);
        setPlans(prev => prev.map(plan => plan.id === updated.id ? updated : plan));
      }} />
  );

  const totalHours = plans.reduce((a, p) => a + p.totalHours, 0);
  const avgProgress = plans.length ? Math.round(plans.reduce((a, p) => a + p.progress, 0) / plans.length) : 0;
  const dateStrip = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date;
  });
  const selectedSessions = plans.flatMap(plan =>
    (plan.scheduleBlocks || [])
      .filter(block => block.day === selectedDate.getDay())
      .map(block => ({ plan, block }))
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)] text-[var(--foreground)] custom-scrollbar">
      <AnimatePresence>{showModal && <CreateModal
        initialPlan={editingPlan}
        onClose={() => { setShowModal(false); setEditingPlan(null); }}
        onSave={p => {
          setPlans(prev => editingPlan ? prev.map(plan => plan.id === p.id ? p : plan) : [p, ...prev]);
          setEditingPlan(null);
        }} />}</AnimatePresence>
      <div className="max-w-4xl mx-auto p-6 space-y-5">

        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Study Planner</h1>
            <p className="text-xs text-[var(--muted)] mt-0.5">{plans.length} active plan{plans.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => { setEditingPlan(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 active:scale-95 transition-all"
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
              <div key={s.label} className="stitch-glass-card rounded-[28px] p-4">
                <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-2xl font-bold tracking-tight">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="stitch-glass-card rounded-[32px] p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">Calendar Actions</p>
              <p className="text-[11px] text-[var(--muted)] mt-0.5">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button onClick={() => { setEditingPlan(null); setShowModal(true); }}
              className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--input)] text-[12px] font-semibold text-[var(--foreground)] hover:border-[var(--primary)]/40 transition-all">
              Add Plan
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {dateStrip.map(date => {
              const active = date.toDateString() === selectedDate.toDateString();
              const count = plans.reduce((total, plan) => total + (plan.scheduleBlocks || []).filter(block => block.day === date.getDay()).length, 0);
              return (
                <button key={date.toISOString()} onClick={() => setSelectedDate(date)}
                  className={cn('min-h-[58px] rounded-xl border px-2 py-2 text-center transition-all',
                    active ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)] shadow-lg' : 'bg-[var(--input)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]/40')}>
                  <span className="block text-[10px] font-bold uppercase opacity-70">{getDayLabel(date.getDay())}</span>
                  <span className="block text-base font-black">{date.getDate()}</span>
                  <span className={cn('mx-auto mt-1 block h-1.5 w-1.5 rounded-full', count ? 'bg-current' : 'bg-transparent')} />
                </button>
              );
            })}
          </div>
          {selectedSessions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--input)] p-4 text-center">
              <p className="text-sm font-semibold text-[var(--foreground)]">Nothing scheduled on this day</p>
              <p className="text-[11px] text-[var(--muted)] mt-1">Create or edit a plan to place study blocks here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedSessions.map(({ plan, block }) => (
                <div key={`${plan.id}-${block.day}-${block.hour}-${getBlockMinute(block)}-${block.subject}`} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--input)] px-3 py-2">
                  <div className="h-9 w-1.5 rounded-full" style={{ backgroundColor: block.color || 'var(--primary)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[var(--foreground)] truncate">{block.subject}</p>
                    <p className="text-[11px] text-[var(--muted)]">{plan.name} - {formatBlockTime(block)} - {formatDuration(block)}</p>
                  </div>
                  <button onClick={() => { setEditingPlan(plan); setShowModal(true); }}
                    className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-[11px] font-semibold text-[var(--foreground)] hover:border-[var(--primary)]/40 transition-all">
                    Modify
                  </button>
                  <button onClick={() => handleDelete(plan.id)}
                    className="px-2.5 py-1.5 rounded-lg border border-red-500/20 text-[11px] font-semibold text-red-500 hover:bg-red-500/10 transition-all">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {plans.length === 0 ? (
          <div className="stitch-glass-card border-2 border-dashed border-[var(--border)] rounded-[32px] p-16 text-center">
            <Calendar className="w-10 h-10 text-[var(--muted)] opacity-20 mx-auto mb-3" />
            <p className="text-sm text-[var(--muted)] opacity-50 mb-4">No study plans yet</p>
            <button onClick={() => { setEditingPlan(null); setShowModal(true); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90 transition-all"
              style={{ backgroundColor: 'var(--primary)' }}>
              <Brain className="w-4 h-4" /> Create with AI
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan, i) => (
              <motion.div key={plan.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedPlan(plan)}
                className="stitch-glass-card rounded-[28px] p-4 hover:border-[var(--primary)]/40 hover:shadow-sm transition-all cursor-pointer group">
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
