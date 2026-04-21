'use client';
import React, { useEffect, useState } from 'react';
import { Card, Button, Input, Badge } from '../components/UI';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Plus, TrendingUp, Calculator, Loader2, Trash2, GraduationCap, X } from 'lucide-react';
import { getGPARecords, createGPARecord, deleteGPARecord } from '../services/gpa';
import { GPARecord } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const getGpaClass = (gpa: number) => {
  if (gpa >= 4.5) return 'First Class';
  if (gpa >= 3.5) return 'Second Class Upper';
  if (gpa >= 2.4) return 'Second Class Lower';
  if (gpa >= 1.5) return 'Third Class';
  return 'Pass';
};

const AddGPAModal = ({ onClose, onSave }: { onClose: () => void; onSave: (r: GPARecord) => void }) => {
  const [semester, setSemester] = useState('');
  const [gpa, setGpa] = useState('');
  const [credits, setCredits] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    const gpaNum = parseFloat(gpa);
    const creditsNum = parseInt(credits);
    if (!semester || isNaN(gpaNum) || isNaN(creditsNum)) { setError('Please fill in all fields correctly'); return; }
    if (gpaNum < 0 || gpaNum > 5) { setError('GPA must be between 0 and 5'); return; }
    setLoading(true); setError('');
    try {
      const record = await createGPARecord({
        semester,
        gpa: gpaNum,
        totalCredits: creditsNum,
        courses: [],
        class: getGpaClass(gpaNum),
      });
      onSave(record);
      onClose();
    } catch { setError('Failed to save record'); }
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
          <h2 className="text-xl font-black tracking-tight">Add GPA Record</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--accent)] text-[var(--muted)] transition-colors"><X className="w-5 h-5" /></button>
        </div>
        {error && <p className="mb-4 text-sm text-red-500 bg-red-50 rounded-xl p-3">{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5 block">Semester</label>
            <Input value={semester} onChange={e => setSemester(e.target.value)} placeholder="e.g. 2023/2024 First Semester" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5 block">GPA (0-5)</label>
              <Input type="number" value={gpa} onChange={e => setGpa(e.target.value)} placeholder="e.g. 4.2" min="0" max="5" step="0.01" />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5 block">Total Credits</label>
              <Input type="number" value={credits} onChange={e => setCredits(e.target.value)} placeholder="e.g. 18" min="1" />
            </div>
          </div>
          {gpa && !isNaN(parseFloat(gpa)) && (
            <div className="p-3 rounded-xl bg-[var(--accent)] border border-[var(--border)]">
              <p className="text-xs text-[var(--muted)]">Classification: <span className="font-bold text-[var(--primary)]">{getGpaClass(parseFloat(gpa))}</span></p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <button onClick={handleSave} disabled={loading} className="flex-1 py-2 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60" style={{ backgroundColor: 'var(--primary)' }}>
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

  useEffect(() => { fetchRecords(); }, []);

  const fetchRecords = async () => {
    try { setRecords(await getGPARecords()); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record?')) return;
    try { await deleteGPARecord(id); setRecords(prev => prev.filter(r => r.id !== id)); }
    catch { alert('Failed to delete'); }
  };

  const gpaData = [...records].reverse().map((r, i) => ({ sem: r.semester || `Sem ${i + 1}`, gpa: r.gpa }));
  const cumulativeGPA = records.length > 0
    ? (records.reduce((acc, r) => acc + r.gpa, 0) / records.length).toFixed(2)
    : '0.00';

  if (loading) return <div className="flex-1 flex items-center justify-center bg-[var(--background)]"><Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" /></div>;

  return (
    <div className="flex-1 p-6 md:p-8 bg-[var(--background)] text-[var(--foreground)] overflow-y-auto custom-scrollbar pb-28 lg:pb-8">
      <AnimatePresence>{showModal && <AddGPAModal onClose={() => setShowModal(false)} onSave={r => setRecords(prev => [r, ...prev])} />}</AnimatePresence>

      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Scholar Matrix</h1>
          <p className="text-[var(--muted)] text-sm mt-1">Academic performance tracker</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black text-white shadow-lg"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Plus className="w-4 h-4" /> Add Record
        </button>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <Card className="bg-[var(--primary)] border-none text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-[-10%] top-[-10%] opacity-10"><GraduationCap className="w-32 h-32" /></div>
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-3 block">Cumulative GPA</span>
            <h2 className="text-6xl font-black tracking-tighter mb-3">{cumulativeGPA}</h2>
            <Badge className="bg-white/20 text-white border-none font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-lg">{getGpaClass(parseFloat(cumulativeGPA))}</Badge>
          </div>
        </Card>
        <Card className="flex flex-col justify-center hover:border-[var(--primary)]/40 transition-all">
          <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest opacity-60 mb-3 block">Total Credits</span>
          <div className="flex items-center gap-3">
            <h2 className="text-5xl font-black tracking-tight">{records.reduce((acc, r) => acc + r.totalCredits, 0)}</h2>
            <TrendingUp className="w-7 h-7 text-emerald-500" />
          </div>
        </Card>
        <Card className="flex flex-col justify-center hover:border-[var(--primary)]/40 transition-all">
          <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest opacity-60 mb-3 block">Semesters Logged</span>
          <div className="flex items-center gap-3">
            <h2 className="text-5xl font-black tracking-tight">{records.length}</h2>
            <Badge className="bg-[var(--accent)] text-[var(--primary)] font-bold text-[10px] uppercase px-2 py-1 rounded-lg">Active</Badge>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7">
          <Card className="hover:border-[var(--primary)]/30 transition-all">
            <h3 className="text-lg font-black tracking-tight mb-1">GPA Trajectory</h3>
            <p className="text-xs text-[var(--muted)] mb-6">Academic growth over semesters</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gpaData} margin={{ left: -20, bottom: 10 }}>
                  <defs>
                    <linearGradient id="gpaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.4} />
                  <XAxis dataKey="sem" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 700 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 700 }} domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', fontSize: '12px', fontWeight: 700 }} itemStyle={{ color: 'var(--primary)' }} />
                  <Area type="monotone" dataKey="gpa" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#gpaGrad)" activeDot={{ r: 6, fill: 'var(--primary)', stroke: 'var(--card)', strokeWidth: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {gpaData.length === 0 && (
              <div className="flex items-center justify-center h-full text-center">
                <p className="text-sm text-[var(--muted)] opacity-50">Add your first GPA record to see your trajectory</p>
              </div>
            )}
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
          <Card className="flex-1 hover:border-[var(--primary)]/30 transition-all">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black tracking-tight">Academic History</h3>
              <button onClick={() => setShowModal(true)} className="w-8 h-8 rounded-xl bg-[var(--accent)] text-[var(--primary)] flex items-center justify-center hover:scale-110 transition-all"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-72 custom-scrollbar">
              {records.map((record, idx) => (
                <motion.div key={record.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                  className="p-4 rounded-2xl bg-[var(--input)] border border-[var(--border)] hover:border-[var(--primary)]/40 transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-black text-[var(--foreground)]">{record.semester}</h4>
                      <p className="text-[10px] text-[var(--muted)] opacity-60 mt-0.5">{record.totalCredits} credits   {record.class}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-[var(--primary)]">{Number(record.gpa).toFixed(2)}</span>
                      <button onClick={() => handleDelete(record.id)} className="p-1.5 text-[var(--muted)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {records.length === 0 && (
                <div className="py-8 text-center opacity-40">
                  <p className="text-xs font-bold uppercase tracking-widest">No records yet</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-[var(--primary)] border-none text-white relative overflow-hidden">
            <div className="absolute right-[-20px] bottom-[-20px] opacity-20"><Calculator className="w-32 h-32" /></div>
            <h3 className="text-lg font-black tracking-tight mb-2 relative z-10">Predictive Node</h3>
            <p className="text-xs opacity-80 mb-5 relative z-10">Maintain a 3.8+ GPA to secure Scholarship Level Alpha.</p>
            <button className="w-full py-2.5 rounded-xl bg-white font-black text-xs uppercase tracking-wider relative z-10" style={{ color: 'var(--primary)' }}>Initialize Simulator</button>
          </Card>
        </div>
      </div>
    </div>
  );
};
