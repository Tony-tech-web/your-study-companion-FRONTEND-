'use client';
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, TrendingUp, Loader2, Trash2, GraduationCap, X } from 'lucide-react';
import { getGPARecords, createGPARecord, deleteGPARecord } from '../services/gpa';
import { GPARecord } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const classify = (gpa: number) => {
  if (gpa >= 4.5) return 'First Class';
  if (gpa >= 3.5) return 'Second Class Upper';
  if (gpa >= 2.4) return 'Second Class Lower';
  if (gpa >= 1.5) return 'Third Class';
  return 'Pass';
};

const AddModal = ({ onClose, onSave }: { onClose: () => void; onSave: (r: GPARecord) => void }) => {
  const [semester, setSemester] = useState('');
  const [gpa, setGpa] = useState('');
  const [credits, setCredits] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    const g = parseFloat(gpa), c = parseInt(credits);
    if (!semester || isNaN(g) || isNaN(c)) { setError('Fill in all fields correctly'); return; }
    if (g < 0 || g > 5) { setError('GPA must be 0–5'); return; }
    setLoading(true); setError('');
    try {
      const record = await createGPARecord({ semester, gpa: g, totalCredits: c, courses: [], class: classify(g) });
      onSave(record); onClose();
    } catch { setError('Failed to save'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)] shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-[var(--foreground)]">Add GPA Record</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--accent)] text-[var(--muted)] transition-all"><X className="w-4 h-4" /></button>
        </div>
        {error && <p className="mb-4 text-sm text-red-500 bg-red-500/10 rounded-xl p-3">{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5 block">Semester</label>
            <input value={semester} onChange={e => setSemester(e.target.value)} placeholder="e.g. 2023/2024 First Semester"
              className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--primary)] transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5 block">GPA (0–5)</label>
              <input type="number" value={gpa} onChange={e => setGpa(e.target.value)} placeholder="4.2" min="0" max="5" step="0.01"
                className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--primary)] transition-all" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5 block">Credits</label>
              <input type="number" value={credits} onChange={e => setCredits(e.target.value)} placeholder="18" min="1"
                className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--primary)] transition-all" />
            </div>
          </div>
          {gpa && !isNaN(parseFloat(gpa)) && (
            <div className="p-3 rounded-xl bg-[var(--accent)] border border-[var(--border)]">
              <p className="text-xs text-[var(--muted)]">Classification: <span className="font-semibold text-[var(--primary)]">{classify(parseFloat(gpa))}</span></p>
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--muted)] hover:bg-[var(--accent)] transition-all">Cancel</button>
            <button onClick={handleSave} disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--primary)' }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Record'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const GPA = () => {
  const [records, setRecords] = useState<GPARecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getGPARecords().then(setRecords).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record?')) return;
    try { await deleteGPARecord(id); setRecords(prev => prev.filter(r => r.id !== id)); }
    catch { alert('Failed to delete'); }
  };

  const chartData = [...records].reverse().map((r, i) => ({ sem: r.semester?.split(' ').slice(-2).join(' ') || `Sem ${i + 1}`, gpa: Number(r.gpa) }));
  const cumGPA = records.length ? (records.reduce((a, r) => a + Number(r.gpa), 0) / records.length).toFixed(2) : '0.00';
  const totalCredits = records.reduce((a, r) => a + r.totalCredits, 0);

  if (loading) return <div className="flex-1 flex items-center justify-center bg-[var(--background)]"><Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" /></div>;

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)] text-[var(--foreground)] custom-scrollbar">
      <AnimatePresence>{showModal && <AddModal onClose={() => setShowModal(false)} onSave={r => setRecords(prev => [r, ...prev])} />}</AnimatePresence>
      <div className="max-w-4xl mx-auto p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight">GPA Tracker</h1>
            <p className="text-xs text-[var(--muted)] mt-0.5">{records.length} semester{records.length !== 1 ? 's' : ''} recorded</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 active:scale-95 transition-all"
            style={{ backgroundColor: 'var(--primary)' }}>
            <Plus className="w-4 h-4" /> Add Record
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[var(--primary)] rounded-xl p-4 text-white relative overflow-hidden">
            <div className="absolute right-2 top-2 opacity-10"><GraduationCap className="w-16 h-16" /></div>
            <p className="text-[11px] font-medium uppercase tracking-wider opacity-70 mb-2">Cumulative GPA</p>
            <p className="text-3xl font-bold tracking-tight">{cumGPA}</p>
            <p className="text-[11px] mt-1 opacity-70">{classify(parseFloat(cumGPA))}</p>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider mb-2">Total Credits</p>
            <p className="text-3xl font-bold text-[var(--foreground)] tracking-tight">{totalCredits}</p>
            <p className="text-[11px] text-[var(--muted)] mt-1">Across all semesters</p>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-wider mb-2">Semesters</p>
            <p className="text-3xl font-bold text-[var(--foreground)] tracking-tight">{records.length}</p>
            <p className="text-[11px] text-[var(--muted)] mt-1">Logged</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-[var(--foreground)]">GPA Trajectory</p>
            <span className="text-[11px] text-[var(--muted)]">All semesters</span>
          </div>
          {chartData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gpaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.4} />
                  <XAxis dataKey="sem" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 10 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 10 }} domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }} itemStyle={{ color: 'var(--primary)' }} />
                  <Area type="monotone" dataKey="gpa" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#gpaGrad)" activeDot={{ r: 5, fill: 'var(--primary)' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-[var(--muted)] opacity-40">Add records to see your trajectory</p>
            </div>
          )}
        </div>

        {/* Records table */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <p className="text-sm font-semibold text-[var(--foreground)]">Academic History</p>
            <button onClick={() => setShowModal(true)}
              className="w-7 h-7 rounded-lg bg-[var(--accent)] text-[var(--primary)] flex items-center justify-center hover:scale-105 transition-all">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {records.length === 0 ? (
            <div className="p-12 text-center">
              <TrendingUp className="w-8 h-8 text-[var(--muted)] opacity-20 mx-auto mb-2" />
              <p className="text-sm text-[var(--muted)] opacity-40">No records yet</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {records.map((r, i) => (
                <motion.div key={r.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center px-4 py-3.5 hover:bg-[var(--accent)] transition-all group">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-[13px] font-medium text-[var(--foreground)] truncate">{r.semester || `Semester ${i + 1}`}</p>
                    <p className="text-[11px] text-[var(--muted)]">{r.totalCredits} credits &middot; {r.class}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold" style={{ color: Number(r.gpa) >= 4.5 ? 'var(--primary)' : 'var(--foreground)' }}>
                      {Number(r.gpa).toFixed(2)}
                    </span>
                    <button onClick={() => handleDelete(r.id)}
                      className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
