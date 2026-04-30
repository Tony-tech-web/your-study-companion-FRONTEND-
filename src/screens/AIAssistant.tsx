'use client';
import { ChatSkeleton } from '../components/Skeleton';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Send, Sparkles, Loader2, Trash2, ChevronDown, Check,
  Brain, FlaskConical, X, FileText, Layers, ListChecks,
  AlignLeft, BookMarked, ChevronRight, Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { callEdgeFunction, downloadStorageFile, updateXP } from '../lib/supabase';
import { extractPdfText } from '../lib/pdfExtractor';
import { getAIConversations, saveAIConversation, clearAIConversations, AIConversationEntry } from '../services/ai';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useDialog } from '../components/Dialog';

const cleanText = (t: string) => t.replace(/\{\{[^}]+\}\}/g, '').trim();

const renderMarkdown = (text: string) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(<ul key={`ul-${elements.length}`} className="my-1.5 space-y-1 pl-4 list-disc">{listItems}</ul>);
      listItems = [];
    }
  };
  const parseBold = (s: string) =>
    s.split(/\*\*(.+?)\*\*/g).map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p);
  lines.forEach((line, i) => {
    if (/^[*\-]\s+/.test(line)) {
      listItems.push(<li key={i} className="text-sm leading-relaxed">{parseBold(line.replace(/^[*\-]\s+/, ''))}</li>);
    } else {
      flushList();
      if (!line.trim()) elements.push(<div key={i} className="h-1" />);
      else if (/^#{1,3}\s+/.test(line)) elements.push(<p key={i} className="text-sm font-semibold mt-2 mb-0.5">{parseBold(line.replace(/^#{1,3}\s+/, ''))}</p>);
      else elements.push(<p key={i} className="text-sm leading-relaxed">{parseBold(line)}</p>);
    }
  });
  flushList();
  return elements;
};

const MODELS = [
  { id: 'google',     label: 'Gemini Flash', desc: 'Fast & free' },
  { id: 'google-pro', label: 'Gemini Pro',   desc: 'More capable' },
  { id: 'openrouter', label: 'GPT-4o',       desc: 'OpenRouter credits' },
];
const BATCH_SIZE = 5;

interface StudentPdf { id: string; file_name: string; file_path: string; file_size: number | null; uploaded_at: string; }
interface ExtractedPdf { pdfId: string; fileName: string; text: string; pages: string[]; pageCount: number; extracting: boolean; error?: string; }
interface TeachSession { pdfId: string; fileName: string; pages: string[]; totalPages: number; currentBatch: number; finished: boolean; }
interface Flashcard { front: string; back: string; }
interface QuizQuestion { question: string; options: string[]; correct_answer: string; explanation: string; }
type ChatMode = 'chat' | 'teach' | 'test';
type StudyTool = 'flashcards' | 'quiz' | 'notes' | 'summary';

// ─── PDF Picker modal (for Teach / Test) ─────────────────────────────────────
const PdfPickerModal = ({
  mode, pdfs, extractedPdfs, onClose, onConfirm, onExtract,
}: {
  mode: 'teach' | 'test';
  pdfs: StudentPdf[];
  extractedPdfs: ExtractedPdf[];
  onClose: () => void;
  onConfirm: (selectedIds: string[]) => void;
  onExtract: (pdf: StudentPdf) => void;
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const icolor = mode === 'teach' ? '#6366f1' : '#10b981';
  const ModeIcon = mode === 'teach' ? Brain : FlaskConical;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }} transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl">

        {/* Accent strip */}
        <div className="h-0.5 w-full" style={{ backgroundColor: icolor }} />

        <div className="px-6 py-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: icolor + '18' }}>
              <ModeIcon className="w-5 h-5" style={{ color: icolor }} />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[var(--foreground)]">
                {mode === 'teach' ? 'Start Teach Mode' : 'Start Test Mode'}
              </p>
              <p className="text-[12px] text-[var(--muted)]">
                {mode === 'teach' ? 'Select PDFs for Orbit to teach you' : 'Select PDFs to be tested on'}
              </p>
            </div>
            <button onClick={onClose} className="ml-auto p-1.5 rounded-lg text-[var(--muted)] hover:bg-[var(--accent)] transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* PDF list */}
          <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar mb-5">
            {pdfs.length === 0 && (
              <div className="py-8 text-center">
                <FileText className="w-8 h-8 text-[var(--muted)] opacity-20 mx-auto mb-2" />
                <p className="text-xs text-[var(--muted)] opacity-50">No PDFs uploaded yet</p>
                <p className="text-[11px] text-[var(--muted)] opacity-30 mt-1">Upload from Courses page first</p>
              </div>
            )}
            {pdfs.map(pdf => {
              const extracted = extractedPdfs.find(e => e.pdfId === pdf.id);
              const isSelected = selected.includes(pdf.id);
              return (
                <button key={pdf.id} onClick={() => toggle(pdf.id)}
                  className={cn('w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all',
                    isSelected
                      ? 'border-2 bg-[var(--background)]'
                      : 'border-[var(--border)] bg-[var(--input)] hover:border-[var(--border)]')}
                  style={isSelected ? { borderColor: icolor, backgroundColor: icolor + '08' } : {}}>
                  {/* Checkbox */}
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                    style={isSelected ? { backgroundColor: icolor, borderColor: icolor } : { borderColor: 'var(--border)' }}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  {/* File icon */}
                  <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[var(--foreground)] truncate">{pdf.file_name}</p>
                    {extracted?.extracting && <p className="text-[10px] text-[var(--primary)] flex items-center gap-1 mt-0.5"><Loader2 className="w-2.5 h-2.5 animate-spin" />Extracting…</p>}
                    {extracted?.text && !extracted.extracting && <p className="text-[10px] text-emerald-500 mt-0.5">{extracted.pageCount} pages ready</p>}
                    {extracted?.error && <p className="text-[10px] text-red-500 mt-0.5">{extracted.error}</p>}
                    {!extracted && <p className="text-[10px] text-[var(--muted)] opacity-40 mt-0.5">Tap to extract on start</p>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => selected.length > 0 && onConfirm(selected)}
              disabled={selected.length === 0}
              className="w-full py-3 rounded-2xl text-[14px] font-bold text-white disabled:opacity-30 transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: icolor }}>
              {mode === 'teach' ? `Teach Me (${selected.length} PDF${selected.length !== 1 ? 's' : ''})` : `Start Test (${selected.length} PDF${selected.length !== 1 ? 's' : ''})`}
            </button>
            <button onClick={onClose}
              className="w-full py-3 rounded-2xl text-[14px] font-semibold text-[var(--muted)] bg-[var(--input)] hover:bg-[var(--accent)] transition-all">
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── End Session Dialog ───────────────────────────────────────────────────────
const EndSessionDialog = ({ mode, onEnd, onContinue }: { mode: ChatMode; onEnd: () => void; onContinue: () => void }) => {
  const ModeIcon = mode === 'teach' ? Brain : FlaskConical;
  const icolor = mode === 'teach' ? '#6366f1' : '#10b981';
  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="w-full max-w-xs bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl">
        <div className="h-0.5 w-full" style={{ backgroundColor: icolor }} />
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: icolor + '18' }}>
            <ModeIcon className="w-7 h-7" style={{ color: icolor }} />
          </div>
          <div>
            <p className="text-[16px] font-black text-[var(--foreground)]">End {mode === 'teach' ? 'Teach' : 'Test'} Session?</p>
            <p className="text-[13px] text-[var(--muted)] mt-1">Your progress will not be saved. Are you sure you want to stop?</p>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <button onClick={onEnd}
              className="w-full py-3 rounded-2xl text-[14px] font-bold text-white transition-all hover:opacity-90 active:scale-95 bg-red-500 shadow-lg shadow-red-500/20">
              End Session
            </button>
            <button onClick={onContinue}
              className="w-full py-3 rounded-2xl text-[14px] font-semibold text-[var(--muted)] bg-[var(--input)] hover:bg-[var(--accent)] transition-all">
              Keep Going
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Study Tools Panel ────────────────────────────────────────────────────────
const StudyToolsPanel = ({ extractedPdfs, onClose }: { extractedPdfs: ExtractedPdf[]; onClose: () => void }) => {
  const [tool, setTool] = useState<StudyTool>('flashcards');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [card, setCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const ready = extractedPdfs.filter(p => !p.extracting && p.text && !p.error);
  const content = ready.map(p => `=== ${p.fileName} ===\n${p.text}`).join('\n\n');

  const tools = [
    { id: 'flashcards' as StudyTool, icon: Layers, label: 'Cards' },
    { id: 'quiz' as StudyTool, icon: ListChecks, label: 'Quiz' },
    { id: 'notes' as StudyTool, icon: AlignLeft, label: 'Notes' },
    { id: 'summary' as StudyTool, icon: BookMarked, label: 'Summary' },
  ];

  const generate = async () => {
    if (!content) { setError('No PDF content. Extract a PDF first.'); return; }
    setGenerating(true); setResult(null); setError(''); setCard(0); setFlipped(false); setAnswers({}); setSubmitted(false);
    try {
      const res = await callEdgeFunction('generate-study-tools', { pdfContent: content.slice(0, 30000), toolType: tool });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      const data = await res.json();
      setResult(data.content);
      await updateXP(tool === 'quiz' ? 'quiz' : 'flashcard');
    } catch (e: any) { setError(e.message); }
    finally { setGenerating(false); }
  };

  const flashItems: Flashcard[] = Array.isArray(result) ? result : [];
  const quizItems: QuizQuestion[] = Array.isArray(result) ? result : [];
  const score = submitted ? quizItems.filter((q, i) => answers[i] === q.correct_answer).length : 0;

  return (
    <div className="flex flex-col h-full bg-[var(--card)] border-l border-[var(--border)] w-[360px] shrink-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border)] shrink-0">
        <p className="text-[13px] font-semibold">Study Tools</p>
        <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-[var(--accent)] transition-all"><X className="w-4 h-4" /></button>
      </div>

      <div className="p-3 border-b border-[var(--border)] shrink-0 space-y-3">
        <div className="grid grid-cols-4 gap-1.5">
          {tools.map(t => { const Icon = t.icon; return (
            <button key={t.id} onClick={() => { setTool(t.id); setResult(null); setError(''); }}
              className={cn('flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-all',
                tool === t.id ? 'bg-[var(--primary)] text-white' : 'bg-[var(--input)] text-[var(--muted)] border border-[var(--border)]')}>
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-semibold">{t.label}</span>
            </button>
          ); })}
        </div>
        {ready.length > 0
          ? <div className="flex items-center gap-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <p className="text-[11px] text-emerald-600 font-medium">{ready.length} PDF{ready.length > 1 ? 's' : ''} ready</p>
            </div>
          : <p className="text-[11px] text-[var(--muted)] opacity-50 text-center">Start Teach or Test mode to load PDFs</p>
        }
        {error && <p className="text-[11px] text-red-500 bg-red-500/10 rounded-xl p-2">{error}</p>}
        <button onClick={generate} disabled={generating || ready.length === 0}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
          style={{ backgroundColor: 'var(--primary)' }}>
          {generating ? <><Loader2 className="w-4 h-4 animate-spin" />Generating…</> : `Generate ${tools.find(t => t.id === tool)?.label}`}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-3">
        {generating && <div className="flex flex-col items-center py-12 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-[var(--primary)]" />
          <p className="text-xs text-[var(--muted)]">Generating {tool}…</p>
        </div>}

        {/* Flashcards */}
        {!generating && tool === 'flashcards' && flashItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-semibold">{card + 1}/{flashItems.length}</p>
              <div className="flex gap-1.5">
                {[{ d: 'prev', disabled: card === 0, fn: () => { setCard(c => c - 1); setFlipped(false); } },
                  { d: 'next', disabled: card === flashItems.length - 1, fn: () => { setCard(c => c + 1); setFlipped(false); } }
                ].map(b => (
                  <button key={b.d} onClick={b.fn} disabled={b.disabled}
                    className="w-7 h-7 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted)] disabled:opacity-30 hover:bg-[var(--accent)]">
                    <ChevronRight className={cn('w-3.5 h-3.5', b.d === 'prev' && 'rotate-180')} />
                  </button>
                ))}
              </div>
            </div>
            <div className="cursor-pointer" onClick={() => setFlipped(f => !f)}>
              <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.3 }} style={{ transformStyle: 'preserve-3d' }} className="relative h-40">
                <div className="absolute inset-0 bg-[var(--primary)] rounded-2xl p-5 flex flex-col items-center justify-center text-center" style={{ backfaceVisibility: 'hidden' }}>
                  <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest mb-2">Question</p>
                  <p className="text-sm font-semibold text-white leading-snug">{flashItems[card]?.front}</p>
                  <p className="text-[9px] text-white/40 mt-3">Tap to flip</p>
                </div>
                <div className="absolute inset-0 bg-[var(--input)] border border-[var(--border)] rounded-2xl p-5 flex flex-col items-center justify-center text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mb-2">Answer</p>
                  <p className="text-sm leading-snug">{flashItems[card]?.back}</p>
                </div>
              </motion.div>
            </div>
            <div className="flex justify-center gap-1">{flashItems.map((_, i) => <div key={i} className={cn('h-1 rounded-full transition-all', i === card ? 'w-4 bg-[var(--primary)]' : 'w-1.5 bg-[var(--border)]')} />)}</div>
          </div>
        )}

        {/* Quiz */}
        {!generating && tool === 'quiz' && quizItems.length > 0 && (
          <div className="space-y-3">
            {submitted && (
              <div className="p-4 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-xl text-center">
                <p className="text-2xl font-bold text-[var(--primary)]">{score}/{quizItems.length}</p>
                <p className="text-[12px] text-[var(--muted)] mt-0.5">{score === quizItems.length ? 'Perfect!' : score >= quizItems.length * 0.7 ? 'Great work!' : 'Keep studying!'}</p>
                <button onClick={() => { setAnswers({}); setSubmitted(false); }} className="mt-2 text-[11px] text-[var(--primary)] font-semibold">Retry</button>
              </div>
            )}
            {quizItems.map((q, qi) => (
              <div key={qi} className="bg-[var(--input)] border border-[var(--border)] rounded-xl p-3 space-y-2">
                <p className="text-[12px] font-semibold">{qi + 1}. {q.question}</p>
                {(q.options || []).map((opt, oi) => {
                  const sel = answers[qi] === opt;
                  const correct = opt === q.correct_answer;
                  return (
                    <button key={oi} onClick={() => !submitted && setAnswers(prev => ({ ...prev, [qi]: opt }))}
                      className={cn('w-full text-left px-3 py-2 rounded-xl text-[11px] font-medium border transition-all',
                        submitted && correct ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600' :
                        submitted && sel && !correct ? 'bg-red-500/15 border-red-500/40 text-red-500' :
                        sel ? 'bg-[var(--primary)]/15 border-[var(--primary)]/40 text-[var(--primary)]' :
                        'bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--primary)]/30')}>
                      {opt}
                    </button>
                  );
                })}
                {submitted && q.explanation && <p className="text-[10px] text-[var(--muted)] italic">{q.explanation}</p>}
              </div>
            ))}
            {!submitted && (
              <button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length < quizItems.length}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 hover:opacity-90"
                style={{ backgroundColor: 'var(--primary)' }}>
                Submit ({Object.keys(answers).length}/{quizItems.length})
              </button>
            )}
          </div>
        )}

        {/* Notes / Summary */}
        {!generating && (tool === 'notes' || tool === 'summary') && result && typeof result === 'string' && (
          <div className="bg-[var(--input)] border border-[var(--border)] rounded-xl p-4 space-y-1">
            {renderMarkdown(result)}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export const AIAssistant = () => {
  const { user } = useAuth();
  const { show: showDialog } = useDialog();
  const [messages, setMessages] = useState<AIConversationEntry[]>([]);
  const [streaming, setStreaming] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [autoSwitch, setAutoSwitch] = useState(true);
  const [model, setModel] = useState('google');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [mode, setMode] = useState<ChatMode>('chat');
  const [pdfs, setPdfs] = useState<StudentPdf[]>([]);
  const [extracted, setExtracted] = useState<ExtractedPdf[]>([]);
  const [selectedPdfIds, setSelectedPdfIds] = useState<string[]>([]);
  const [showPdfPicker, setShowPdfPicker] = useState<'teach' | 'test' | null>(null);
  const [showStudyTools, setShowStudyTools] = useState(false);
  const [showEndSession, setShowEndSession] = useState(false);
  const [teachSession, setTeachSession] = useState<TeachSession | null>(null);
  const [scanProgress, setScanProgress] = useState<{ current: number; total: number } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchHistory(); fetchPdfs(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streaming, isLoading]);

  const fetchHistory = async () => {
    try {
      const h = await getAIConversations();
      setMessages(h.length === 0 ? [{ id: 'init', role: 'assistant', content: "Neural Link established. I'm Orbit.\n\n**Chat** — ask me anything\n**Teach** — I'll teach you from your PDFs page by page\n**Test** — I'll quiz you on your material", created_at: new Date().toISOString() }] : h);
    } catch (e) { console.error(e); }
    finally { setIsFetching(false); }
  };

  const fetchPdfs = async () => { try { setPdfs((await api.get('/api/pdfs')).data); } catch {} };

  const extractPdf = async (pdf: StudentPdf) => {
    setExtracted(prev => prev.find(e => e.pdfId === pdf.id) ? prev : [...prev, { pdfId: pdf.id, fileName: pdf.file_name, text: '', pages: [], pageCount: 0, extracting: true }]);
    try {
      const buf = await downloadStorageFile('student-pdfs', pdf.file_path);
      const result = await extractPdfText(buf, (cur, tot) => setScanProgress({ current: cur, total: tot }));
      setScanProgress(null);
      setExtracted(prev => prev.map(e => e.pdfId === pdf.id ? { ...e, ...result, extracting: false } : e));
    } catch (err: any) {
      setScanProgress(null);
      setExtracted(prev => prev.map(e => e.pdfId === pdf.id ? { ...e, extracting: false, error: err.message } : e));
    }
  };

  const pdfContext = useMemo(() => {
    return extracted.filter(e => selectedPdfIds.includes(e.pdfId) && e.text && !e.extracting)
      .map(e => `=== ${e.fileName} ===\n${e.text}`).join('\n\n');
  }, [extracted, selectedPdfIds]);

  const sendToAI = async (userText: string, overrideMode?: ChatMode, ctx?: string, scan?: { current: number; total: number }) => {
    setIsLoading(true); setStreaming('');
    try {
      const userMsg = await saveAIConversation('user', userText);
      setMessages(prev => [...prev, userMsg]);
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await callEdgeFunction('ai-chat', {
        messages: [...history, { role: 'user', content: userText }],
        providerId: autoSwitch ? 'auto' : model,
        mode: overrideMode ?? mode,
        ...(ctx ?? pdfContext ? { pdfContext: ctx ?? pdfContext } : {}),
        ...(scan ? { scanProgress: scan } : {}),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `HTTP ${res.status}`); }
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('text/event-stream')) {
        const reader = res.body?.getReader(); const dec = new TextDecoder(); let full = '';
        if (reader) while (true) {
          const { done, value } = await reader.read(); if (done) break;
          for (const line of dec.decode(value, { stream: true }).split('\n').filter(l => l.startsWith('data: '))) {
            const d = line.slice(6).trim(); if (d === '[DONE]') break;
            try { const delta = JSON.parse(d).choices?.[0]?.delta?.content || ''; full += delta; setStreaming(cleanText(full)); } catch {}
          }
        }
        setStreaming('');
        setMessages(prev => [...prev, await saveAIConversation('assistant', cleanText(full) || 'No response.')]);
      } else {
        const data = await res.json();
        setStreaming('');
        setMessages(prev => [...prev, await saveAIConversation('assistant', cleanText(data.text || data.reply || data.message || 'No response.'))]);
      }
      await updateXP('ai_chat');
    } catch (err: any) {
      setStreaming('');
      const errMsg = `Error: ${err.message || 'Neural link failed.'}`;
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: errMsg, created_at: new Date().toISOString() }]);
    } finally { setIsLoading(false); }
  };

  // Teach: start with first batch
  const startTeach = async (pdfIds: string[]) => {
    setShowPdfPicker(null); setSelectedPdfIds(pdfIds); setMode('teach');
    // Extract if needed
    for (const id of pdfIds) {
      const pdf = pdfs.find(p => p.id === id);
      if (pdf && !extracted.find(e => e.pdfId === id)) await extractPdf(pdf);
    }
    const ready = extracted.find(e => pdfIds.includes(e.pdfId) && e.pages.length > 0) || null;
    if (!ready) return;
    const session: TeachSession = { pdfId: ready.pdfId, fileName: ready.fileName, pages: ready.pages, totalPages: ready.pageCount, currentBatch: 0, finished: false };
    setTeachSession(session);
    const batch = ready.pages.slice(0, BATCH_SIZE).join('\n\n');
    await sendToAI(`Please teach me pages 1–${Math.min(BATCH_SIZE, ready.pageCount)} of "${ready.fileName}".`, 'teach', batch, { current: Math.min(BATCH_SIZE, ready.pageCount), total: ready.pageCount });
  };

  // Teach: next batch
  const nextBatch = async () => {
    if (!teachSession || teachSession.finished) return;
    const next = teachSession.currentBatch + 1;
    const start = next * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, teachSession.totalPages);
    const batch = teachSession.pages.slice(start, end).join('\n\n');
    const finished = end >= teachSession.totalPages;
    setTeachSession(prev => prev ? { ...prev, currentBatch: next, finished } : prev);
    await sendToAI(`Continue — pages ${start + 1}–${end} of "${teachSession.fileName}".`, 'teach', batch, { current: end, total: teachSession.totalPages });
  };

  // Test: start
  const startTest = async (pdfIds: string[]) => {
    setShowPdfPicker(null); setSelectedPdfIds(pdfIds); setMode('test');
    for (const id of pdfIds) {
      const pdf = pdfs.find(p => p.id === id);
      if (pdf && !extracted.find(e => e.pdfId === id)) await extractPdf(pdf);
    }
    await sendToAI(`I'm ready to be tested on the content from the selected PDFs.`, 'test', pdfContext);
  };

  // End session
  const endSession = () => {
    setMode('chat'); setTeachSession(null); setSelectedPdfIds([]); setShowEndSession(false);
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Session ended. Back to chat mode.', created_at: new Date().toISOString() }]);
  };

  const handleModeClick = (clicked: ChatMode) => {
    if (clicked === 'chat') {
      if (mode !== 'chat') setShowEndSession(true);
      else setMode('chat');
    } else {
      setShowPdfPicker(clicked as 'teach' | 'test');
    }
  };

  const handleClear = async () => {
    const ok = await showDialog({ title: 'Clear History', message: 'Permanently delete all conversation history?', confirmLabel: 'Clear', destructive: true });
    if (!ok) return;
    try { await clearAIConversations(); setMessages([{ id: 'init', role: 'assistant', content: 'Logs cleared. Orbit ready.', created_at: new Date().toISOString() }]); }
    catch { showDialog({ type: 'error', message: 'Failed to clear.' }); }
  };

  const modeColors: Record<ChatMode, string> = { chat: 'var(--primary)', teach: '#6366f1', test: '#10b981' };
  const extractedForTools = useMemo(() => extracted.filter(e => selectedPdfIds.includes(e.pdfId)), [extracted, selectedPdfIds]);

  if (isFetching) return <ChatSkeleton />;

  return (
    <div className="flex-1 flex bg-[var(--background)] text-[var(--foreground)] h-full overflow-hidden">
      <AnimatePresence>
        {showPdfPicker && <PdfPickerModal mode={showPdfPicker} pdfs={pdfs} extractedPdfs={extracted}
          onClose={() => setShowPdfPicker(null)}
          onConfirm={ids => showPdfPicker === 'teach' ? startTeach(ids) : startTest(ids)}
          onExtract={extractPdf} />}
        {showEndSession && mode !== 'chat' && <EndSessionDialog mode={mode} onEnd={endSession} onContinue={() => setShowEndSession(false)} />}
      </AnimatePresence>

      {/* Main chat */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        {/* Header */}
        <header className="px-5 py-3.5 border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-base font-bold tracking-tight">Orbit AI</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-medium text-[var(--muted)] uppercase tracking-wider">
                  {mode === 'chat' ? 'Chat Mode' : mode === 'teach' ? 'Teach Session Active' : 'Test Session Active'}
                </span>
                {mode !== 'chat' && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold text-white" style={{ backgroundColor: modeColors[mode] }}>{mode.toUpperCase()}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Model picker */}
            <div className="relative">
              <button onClick={() => setShowModelPicker(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--input)] text-[12px] font-medium text-[var(--muted)] hover:border-[var(--primary)]/50 transition-all">
                {autoSwitch ? <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Auto</> : MODELS.find(m => m.id === model)?.label}
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showModelPicker && (
                  <><div className="fixed inset-0 z-40" onClick={() => setShowModelPicker(false)} />
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full right-0 mt-1.5 w-60 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                      <div>
                        <p className="text-[13px] font-semibold">Auto Switch</p>
                        <p className="text-[10px] text-[var(--muted)] opacity-60">{autoSwitch ? 'Best available provider' : 'Manual model'}</p>
                      </div>
                      <button onClick={() => setAutoSwitch(v => !v)} className={cn('relative w-10 h-5 rounded-full transition-all', autoSwitch ? 'bg-[var(--primary)]' : 'bg-[var(--border)]')}>
                        <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all', autoSwitch ? 'left-5' : 'left-0.5')} />
                      </button>
                    </div>
                    <div className={cn('transition-all', autoSwitch ? 'opacity-40 pointer-events-none' : '')}>
                      <p className="px-4 pt-2.5 pb-1 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Select Model</p>
                      {MODELS.map(m => (
                        <button key={m.id} onClick={() => { setModel(m.id); setShowModelPicker(false); }} disabled={autoSwitch}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[var(--accent)] transition-all">
                          <div><p className="text-[13px] font-medium">{m.label}</p><p className="text-[10px] text-[var(--muted)] opacity-60">{m.desc}</p></div>
                          {!autoSwitch && model === m.id && <Check className="w-3.5 h-3.5 text-[var(--primary)]" />}
                        </button>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-[var(--border)]">
                      <p className="text-[10px] text-[var(--muted)] opacity-40">{autoSwitch ? 'Gemini → OpenAI fallback' : `Sending to: ${MODELS.find(m => m.id === model)?.label}`}</p>
                    </div>
                  </motion.div></>
                )}
              </AnimatePresence>
            </div>

            {/* Study Tools */}
            <button onClick={() => setShowStudyTools(v => !v)}
              className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[12px] font-medium transition-all',
                showStudyTools ? 'bg-[#6366f1]/10 border-[#6366f1]/40 text-[#6366f1]' : 'border-[var(--border)] bg-[var(--input)] text-[var(--muted)] hover:border-[var(--primary)]/50')}>
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Tools</span>
            </button>

            <button onClick={handleClear} className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-red-500 hover:border-red-500/30 transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Scan progress */}
        <AnimatePresence>
          {scanProgress && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden shrink-0">
              <div className="px-5 py-2 bg-[var(--primary)]/10 border-b border-[var(--primary)]/20 flex items-center gap-3">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--primary)] shrink-0" />
                <div className="flex-1 h-1 bg-[var(--border)] rounded-full overflow-hidden">
                  <motion.div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${(scanProgress.current / scanProgress.total) * 100}%` }} />
                </div>
                <span className="text-[11px] text-[var(--primary)] font-medium shrink-0">Page {scanProgress.current}/{scanProgress.total}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-3xl mx-auto px-4 py-5 space-y-4 pb-52">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div key={msg.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 24, stiffness: 140 }}
                  className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '')}>
                  <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                    msg.role === 'user' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--card)] border border-[var(--border)] text-[var(--primary)]')}>
                    {msg.role === 'user' ? <div className="w-3 h-3 rounded-md border-2 border-white/80" /> : <Sparkles className="w-3.5 h-3.5" />}
                  </div>
                  <div className={cn('px-4 py-3 rounded-2xl max-w-[85%] shadow-sm',
                    msg.role === 'user' ? 'bg-[var(--primary)] text-white rounded-tr-none text-sm' : 'bg-[var(--card)] border border-[var(--border)] rounded-tl-none')}>
                    {msg.role === 'assistant' ? <div className="space-y-0.5">{renderMarkdown(msg.content)}</div> : msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {streaming && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--primary)] animate-pulse" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-[var(--card)] border border-[var(--primary)]/30 max-w-[85%]">
                  <div className="space-y-0.5">{renderMarkdown(streaming)}</div>
                  <span className="inline-block w-1 h-4 bg-[var(--primary)] animate-pulse ml-1 rounded-sm align-middle" />
                </div>
              </motion.div>
            )}

            {isLoading && !streaming && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--primary)] animate-pulse" />
                </div>
                <div className="px-4 py-3.5 rounded-2xl rounded-tl-none bg-[var(--card)] border border-[var(--border)] flex gap-1.5 items-center">
                  {[0, 0.15, 0.3].map((d, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: `${d}s` }} />)}
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[var(--background)] via-[var(--background)/95] to-transparent pt-3">
          <div className="max-w-3xl mx-auto px-4 space-y-2.5 pb-5">

            {/* Mode buttons — Chat, Teach, Test as primary CTAs */}
            <div className="flex items-center gap-2">
              {/* Chat */}
              <button onClick={() => handleModeClick('chat')}
                className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold border transition-all',
                  mode === 'chat' ? 'text-white border-transparent shadow-sm' : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]')}
                style={mode === 'chat' ? { backgroundColor: 'var(--primary)' } : {}}>
                <Sparkles className="w-3.5 h-3.5" /> Chat
              </button>

              {/* Teach */}
              <button onClick={() => handleModeClick('teach')}
                className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold border transition-all',
                  mode === 'teach' ? 'text-white border-transparent shadow-sm' : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]')}
                style={mode === 'teach' ? { backgroundColor: '#6366f1' } : {}}>
                <Brain className="w-3.5 h-3.5" /> Teach
                {mode !== 'teach' && pdfs.length > 0 && <span className="w-3.5 h-3.5 rounded-full bg-[#6366f1]/20 text-[#6366f1] text-[9px] flex items-center justify-center font-black">{pdfs.length}</span>}
              </button>

              {/* Test */}
              <button onClick={() => handleModeClick('test')}
                className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold border transition-all',
                  mode === 'test' ? 'text-white border-transparent shadow-sm' : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]')}
                style={mode === 'test' ? { backgroundColor: '#10b981' } : {}}>
                <FlaskConical className="w-3.5 h-3.5" /> Test
              </button>

              {/* Teach session controls — next batch or end */}
              {mode === 'teach' && teachSession && !isLoading && (
                <div className="flex items-center gap-1.5 ml-auto">
                  {!teachSession.finished && (
                    <button onClick={nextBatch}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-[12px] font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                      style={{ background: 'linear-gradient(135deg,#6366f1,var(--primary))' }}>
                      <ChevronRight className="w-3.5 h-3.5" /> Next
                    </button>
                  )}
                  <button onClick={() => setShowEndSession(true)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl text-[12px] font-semibold border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all">
                    End
                  </button>
                  {teachSession.finished && <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1"><Activity className="w-3 h-3" /> Done!</span>}
                </div>
              )}

              {/* Test end button */}
              {mode === 'test' && !isLoading && (
                <button onClick={() => setShowEndSession(true)} className="ml-auto flex items-center gap-1 px-3 py-2 rounded-xl text-[12px] font-semibold border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all">
                  End Test
                </button>
              )}
            </div>

            {/* Teach progress bar */}
            {teachSession && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-[var(--border)] rounded-full overflow-hidden">
                  <motion.div className="h-full bg-[#6366f1] rounded-full" style={{ width: `${Math.min(((teachSession.currentBatch + 1) * BATCH_SIZE / teachSession.totalPages) * 100, 100)}%` }} />
                </div>
                <span className="text-[10px] text-[var(--muted)] shrink-0">
                  {Math.min((teachSession.currentBatch + 1) * BATCH_SIZE, teachSession.totalPages)}/{teachSession.totalPages} pages
                </span>
              </div>
            )}

            {/* Input */}
            <div className="flex items-center gap-2.5 bg-[var(--card)] border border-[var(--border)] rounded-2xl px-4 py-2.5 shadow-lg focus-within:border-[var(--primary)] transition-all">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && input.trim() && !isLoading && (sendToAI(input.trim()), setInput(''))}
                placeholder={mode === 'chat' ? 'Ask Orbit anything…' : mode === 'teach' ? 'Ask a question about what was taught…' : 'Reply to the quiz…'}
                className="flex-1 bg-transparent border-none focus:outline-none text-sm placeholder:text-[var(--muted)] placeholder:opacity-50" />
              <button onClick={() => { if (input.trim() && !isLoading) { sendToAI(input.trim()); setInput(''); } }}
                disabled={isLoading || !input.trim()}
                className="w-8 h-8 bg-[var(--primary)] text-white rounded-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-30">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-center text-[10px] text-[var(--muted)] opacity-25">Powered by Supabase Edge</p>
          </div>
        </div>
      </div>

      {/* Study Tools side panel */}
      <AnimatePresence>
        {showStudyTools && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 360, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <StudyToolsPanel extractedPdfs={extractedForTools} onClose={() => setShowStudyTools(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
