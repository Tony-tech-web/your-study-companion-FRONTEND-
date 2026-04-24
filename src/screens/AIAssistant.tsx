'use client';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Send, Sparkles, Loader2, Trash2, Activity, ChevronDown, Check,
  BookOpen, Brain, FlaskConical, X, FileText, BookMarked,
  Layers, ListChecks, AlignLeft, HelpCircle, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { callEdgeFunction, downloadStorageFile, updateXP } from '../lib/supabase';
import { extractPdfText } from '../lib/pdfExtractor';
import { getAIConversations, saveAIConversation, clearAIConversations, AIConversationEntry } from '../services/ai';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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
  const parseBold = (str: string) =>
    str.split(/\*\*(.+?)\*\*/g).map((p, j) => j % 2 === 1 ? <strong key={j} className="font-semibold">{p}</strong> : p);

  lines.forEach((line, i) => {
    if (/^[*\-]\s+/.test(line)) {
      listItems.push(<li key={i} className="text-sm leading-relaxed">{parseBold(line.replace(/^[*\-]\s+/, ''))}</li>);
    } else {
      flushList();
      if (line.trim() === '') elements.push(<div key={i} className="h-1" />);
      else if (/^#{1,3}\s+/.test(line)) elements.push(<p key={i} className="text-sm font-semibold mt-2 mb-0.5">{parseBold(line.replace(/^#{1,3}\s+/, ''))}</p>);
      else elements.push(<p key={i} className="text-sm leading-relaxed">{parseBold(line)}</p>);
    }
  });
  flushList();
  return elements;
};

const MODELS = [
  { id: 'google',       label: 'Gemini Flash', provider: 'gemini',      desc: 'Fast & free' },
  { id: 'google-pro',   label: 'Gemini Pro',   provider: 'gemini',      desc: 'More capable' },
  { id: 'openrouter',   label: 'GPT-4o',       provider: 'openrouter',  desc: 'OpenRouter credits' },
];

const AUTO_MODEL = 'auto';

interface StudentPdf { id: string; file_name: string; file_path: string; file_size: number | null; uploaded_at: string; }
interface ExtractedPdfState { pdfId: string; fileName: string; text: string; pages: string[]; pageCount: number; extracting: boolean; error?: string; }

const BATCH_SIZE = 5;

interface TeachSession {
  pdfId: string;
  fileName: string;
  pages: string[];
  totalPages: number;
  currentBatch: number; // 0-indexed
  finished: boolean;
}
type ChatMode = 'chat' | 'teach' | 'test';
type StudyToolType = 'flashcards' | 'quiz' | 'notes' | 'summary';

interface Flashcard { front: string; back: string; }
interface QuizQuestion { question: string; type: string; options: string[]; correct_answer: string; explanation: string; }

// ─── Study Tools Panel ───────────────────────────────────────────────────────
const StudyToolsPanel = ({ extractedPdfs, onClose }: { extractedPdfs: ExtractedPdfState[]; onClose: () => void }) => {
  const [toolType, setToolType] = useState<StudyToolType>('flashcards');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const readyPdfs = extractedPdfs.filter(p => !p.extracting && p.text && !p.error);
  const pdfContent = readyPdfs.map(p => `=== ${p.fileName} ===\n${p.text}`).join('\n\n');

  const tools = [
    { id: 'flashcards' as StudyToolType, icon: Layers,    label: 'Flashcards', desc: 'Q&A cards' },
    { id: 'quiz'       as StudyToolType, icon: ListChecks, label: 'Quiz',       desc: 'Multiple choice' },
    { id: 'notes'      as StudyToolType, icon: AlignLeft,  label: 'Notes',      desc: 'Study summary' },
    { id: 'summary'    as StudyToolType, icon: BookMarked, label: 'Summary',    desc: 'Key points' },
  ];

  const handleGenerate = async () => {
    if (!pdfContent.trim()) { setError('No PDF content available. Select and extract a PDF first.'); return; }
    setGenerating(true); setResult(null); setError(''); setCurrentCard(0); setFlipped(false); setAnswers({}); setSubmitted(false);
    try {
      const res = await callEdgeFunction('generate-study-tools', {
        pdfContent: pdfContent.substring(0, 30000),
        toolType,
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Generation failed'); }
      const data = await res.json();
      setResult(data.content);
      await updateXP(toolType === 'quiz' ? 'quiz' : 'flashcard');
    } catch (e: any) {
      setError(e.message || 'Failed to generate');
    } finally { setGenerating(false); }
  };

  const quizItems: QuizQuestion[] = Array.isArray(result) ? result : [];
  const flashItems: Flashcard[] = Array.isArray(result) ? result : [];
  const score = submitted ? quizItems.filter((q, i) => answers[i] === q.correct_answer).length : 0;

  return (
    <div className="flex flex-col h-full bg-[var(--card)] border-l border-[var(--border)] w-[380px] shrink-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border)] shrink-0">
        <p className="text-[13px] font-semibold text-[var(--foreground)]">Study Tools</p>
        <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-all"><X className="w-4 h-4" /></button>
      </div>

      {/* Tool type selector */}
      <div className="p-3 border-b border-[var(--border)] shrink-0">
        <div className="grid grid-cols-4 gap-1.5">
          {tools.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => { setToolType(t.id); setResult(null); setError(''); }}
                className={cn('flex flex-col items-center gap-1 p-2 rounded-xl transition-all text-center',
                  toolType === t.id ? 'bg-[var(--primary)] text-white' : 'bg-[var(--input)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]')}>
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-semibold">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* PDF status */}
        {readyPdfs.length > 0 ? (
          <div className="mt-3 flex items-center gap-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <p className="text-[11px] text-emerald-600 font-medium">{readyPdfs.length} PDF{readyPdfs.length > 1 ? 's' : ''} ready</p>
          </div>
        ) : (
          <div className="mt-3 p-2 bg-[var(--input)] border border-[var(--border)] rounded-xl">
            <p className="text-[11px] text-[var(--muted)] opacity-60 text-center">Select PDFs from Library panel and extract text first</p>
          </div>
        )}

        {error && <p className="mt-2 text-[11px] text-red-500 bg-red-500/10 rounded-xl p-2">{error}</p>}

        <button onClick={handleGenerate} disabled={generating || readyPdfs.length === 0}
          className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
          style={{ backgroundColor: 'var(--primary)' }}>
          {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : `Generate ${tools.find(t => t.id === toolType)?.label}`}
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-3">
        {generating && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            <p className="text-xs text-[var(--muted)]">AI is generating your {toolType}...</p>
          </div>
        )}

        {/* Flashcards */}
        {!generating && toolType === 'flashcards' && flashItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-semibold text-[var(--foreground)]">{currentCard + 1} / {flashItems.length}</p>
              <div className="flex gap-1.5">
                <button disabled={currentCard === 0} onClick={() => { setCurrentCard(c => c - 1); setFlipped(false); }}
                  className="w-7 h-7 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted)] disabled:opacity-30 hover:bg-[var(--accent)] transition-all">
                  <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                </button>
                <button disabled={currentCard === flashItems.length - 1} onClick={() => { setCurrentCard(c => c + 1); setFlipped(false); }}
                  className="w-7 h-7 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted)] disabled:opacity-30 hover:bg-[var(--accent)] transition-all">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="cursor-pointer" onClick={() => setFlipped(f => !f)}>
              <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.3 }} style={{ transformStyle: 'preserve-3d' }} className="relative h-44">
                <div className="absolute inset-0 bg-[var(--primary)] rounded-2xl p-5 flex flex-col items-center justify-center text-center" style={{ backfaceVisibility: 'hidden' }}>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2">Question</p>
                  <p className="text-sm font-semibold text-white leading-snug">{flashItems[currentCard]?.front}</p>
                  <p className="text-[10px] text-white/50 mt-3">Tap to reveal</p>
                </div>
                <div className="absolute inset-0 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 flex flex-col items-center justify-center text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mb-2">Answer</p>
                  <p className="text-sm text-[var(--foreground)] leading-snug">{flashItems[currentCard]?.back}</p>
                </div>
              </motion.div>
            </div>
            <div className="flex justify-center gap-1.5">
              {flashItems.map((_, i) => (
                <div key={i} className={cn('h-1 rounded-full transition-all', i === currentCard ? 'w-4 bg-[var(--primary)]' : 'w-1.5 bg-[var(--border)]')} />
              ))}
            </div>
          </div>
        )}

        {/* Quiz */}
        {!generating && toolType === 'quiz' && quizItems.length > 0 && (
          <div className="space-y-4">
            {submitted && (
              <div className="p-4 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-xl text-center">
                <p className="text-2xl font-bold text-[var(--primary)]">{score}/{quizItems.length}</p>
                <p className="text-[12px] text-[var(--muted)] mt-1">
                  {score === quizItems.length ? 'Perfect score!' : score >= quizItems.length * 0.7 ? 'Great work!' : 'Keep studying!'}
                </p>
                <button onClick={() => { setAnswers({}); setSubmitted(false); }} className="mt-2 text-[11px] text-[var(--primary)] font-semibold hover:opacity-80">Retry</button>
              </div>
            )}
            {quizItems.map((q, qi) => (
              <div key={qi} className="bg-[var(--input)] border border-[var(--border)] rounded-xl p-4">
                <p className="text-[13px] font-semibold text-[var(--foreground)] mb-3">{qi + 1}. {q.question}</p>
                <div className="space-y-2">
                  {(q.options || []).map((opt, oi) => {
                    const isSelected = answers[qi] === opt;
                    const isCorrect = opt === q.correct_answer;
                    const showResult = submitted;
                    return (
                      <button key={oi} onClick={() => !submitted && setAnswers(prev => ({ ...prev, [qi]: opt }))}
                        className={cn('w-full text-left px-3 py-2 rounded-xl text-[12px] font-medium transition-all border',
                          showResult && isCorrect ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600' :
                          showResult && isSelected && !isCorrect ? 'bg-red-500/15 border-red-500/40 text-red-500' :
                          isSelected ? 'bg-[var(--primary)]/15 border-[var(--primary)]/40 text-[var(--primary)]' :
                          'bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--primary)]/30 hover:text-[var(--foreground)]')}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {submitted && q.explanation && (
                  <p className="mt-2 text-[11px] text-[var(--muted)] italic">{q.explanation}</p>
                )}
              </div>
            ))}
            {!submitted && (
              <button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length < quizItems.length}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 hover:opacity-90 transition-all"
                style={{ backgroundColor: 'var(--primary)' }}>
                Submit ({Object.keys(answers).length}/{quizItems.length} answered)
              </button>
            )}
          </div>
        )}

        {/* Notes / Summary */}
        {!generating && (toolType === 'notes' || toolType === 'summary') && result && typeof result === 'string' && (
          <div className="bg-[var(--input)] border border-[var(--border)] rounded-xl p-4">
            <div className="prose prose-sm max-w-none space-y-1">
              {renderMarkdown(result)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── PDF Library Sidebar ──────────────────────────────────────────────────────
const LibraryPanel = ({
  pdfs, extractedPdfs, selectedPdfIds, onTogglePdf, onClose, onExtract
}: {
  pdfs: StudentPdf[];
  extractedPdfs: ExtractedPdfState[];
  selectedPdfIds: string[];
  onTogglePdf: (id: string) => void;
  onClose: () => void;
  onExtract: (pdf: StudentPdf) => void;
}) => {
  return (
    <div className="flex flex-col h-full bg-[var(--card)] border-r border-[var(--border)] w-[260px] shrink-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border)] shrink-0">
        <p className="text-[13px] font-semibold text-[var(--foreground)]">PDF Library</p>
        <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-all"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
        {pdfs.length === 0 && (
          <div className="py-10 text-center">
            <FileText className="w-8 h-8 text-[var(--muted)] opacity-20 mx-auto mb-2" />
            <p className="text-xs text-[var(--muted)] opacity-40">No PDFs. Upload from Courses.</p>
          </div>
        )}
        {pdfs.map(pdf => {
          const selected = selectedPdfIds.includes(pdf.id);
          const extracted = extractedPdfs.find(e => e.pdfId === pdf.id);
          return (
            <div key={pdf.id}
              className={cn('rounded-xl border transition-all p-3',
                selected ? 'bg-[var(--primary)]/10 border-[var(--primary)]/40' : 'border-[var(--border)] bg-[var(--input)]')}>
              <div className="flex items-start gap-2.5">
                <button onClick={() => onTogglePdf(pdf.id)} className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
                  selected ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-[var(--border)]')}>
                  {selected && <Check className="w-3 h-3 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[var(--foreground)] truncate">{pdf.file_name}</p>
                  {extracted && !extracted.extracting && !extracted.error && (
                    <p className="text-[10px] text-emerald-500 mt-0.5">{extracted.pageCount} pages extracted</p>
                  )}
                  {extracted?.extracting && (
                    <p className="text-[10px] text-[var(--primary)] mt-0.5 flex items-center gap-1"><Loader2 className="w-2.5 h-2.5 animate-spin" /> Extracting...</p>
                  )}
                  {extracted?.error && <p className="text-[10px] text-red-500 mt-0.5">{extracted.error}</p>}
                </div>
              </div>
              {selected && !extracted && (
                <button onClick={() => onExtract(pdf)}
                  className="mt-2 w-full text-[10px] font-semibold py-1.5 rounded-lg text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: 'var(--primary)' }}>
                  Extract Text
                </button>
              )}
              {selected && extracted && !extracted.extracting && !extracted.error && (
                <div className="mt-2 p-2 bg-[var(--card)] rounded-lg border border-[var(--border)]">
                  <p className="text-[10px] text-[var(--muted)] line-clamp-2">{extracted.text.slice(0, 120)}...</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {selectedPdfIds.length > 0 && (
        <div className="p-3 border-t border-[var(--border)] shrink-0">
          <p className="text-[11px] text-center text-[var(--muted)]">
            {selectedPdfIds.length} PDF{selectedPdfIds.length > 1 ? 's' : ''} selected as context
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const AIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AIConversationEntry[]>([]);
  const [streamingMsg, setStreamingMsg] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [autoSwitch, setAutoSwitch] = useState(true);
  const [model, setModel] = useState('google');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [mode, setMode] = useState<ChatMode>('chat');
  const [pdfs, setPdfs] = useState<StudentPdf[]>([]);
  const [selectedPdfIds, setSelectedPdfIds] = useState<string[]>([]);
  const [extractedPdfs, setExtractedPdfs] = useState<ExtractedPdfState[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showStudyTools, setShowStudyTools] = useState(false);
  const [scanProgress, setScanProgress] = useState<{ current: number; total: number } | null>(null);
  const [teachSession, setTeachSession] = useState<TeachSession | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchHistory(); fetchPdfs(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streamingMsg, isLoading]);

  const fetchHistory = async () => {
    try {
      const history = await getAIConversations();
      setMessages(history.length === 0 ? [{
        id: 'initial', role: 'assistant',
        content: "Neural Link established. I'm Orbit, your academic AI.\n\nSelect a **mode** below:\n- **Chat** — ask me anything\n- **Teach** — I'll tutor you from your PDFs\n- **Test** — I'll quiz you on your material\n\nUse the **Library** button to attach PDFs and **Study Tools** to generate flashcards, quizzes, and notes.",
        created_at: new Date().toISOString()
      }] : history);
    } catch (err) { console.error(err); }
    finally { setIsFetching(false); }
  };

  const fetchPdfs = async () => {
    try { const res = await api.get('/api/pdfs'); setPdfs(res.data); } catch {}
  };

  const handleExtractPdf = async (pdf: StudentPdf) => {
    setExtractedPdfs(prev => {
      const existing = prev.find(e => e.pdfId === pdf.id);
      if (existing) return prev;
      return [...prev, { pdfId: pdf.id, fileName: pdf.file_name, text: '', pages: [], pageCount: 0, extracting: true }];
    });

    try {
      const arrayBuffer = await downloadStorageFile('student-pdfs', pdf.file_path);
      const extracted = await extractPdfText(arrayBuffer, (current, total) => {
        setScanProgress({ current, total });
      });
      setScanProgress(null);
      setExtractedPdfs(prev => prev.map(e =>
        e.pdfId === pdf.id
          ? { ...e, text: extracted.text, pages: extracted.pages, pageCount: extracted.pageCount, extracting: false }
          : e
      ));
    } catch (err: any) {
      setScanProgress(null);
      setExtractedPdfs(prev => prev.map(e =>
        e.pdfId === pdf.id ? { ...e, extracting: false, error: err.message || 'Extraction failed' } : e
      ));
    }
  };

  const togglePdf = (id: string) => {
    setSelectedPdfIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    // Auto-extract if selecting
    if (!selectedPdfIds.includes(id)) {
      const pdf = pdfs.find(p => p.id === id);
      if (pdf && !extractedPdfs.find(e => e.pdfId === id)) {
        handleExtractPdf(pdf);
      }
    }
  };

  const pdfContext = useMemo(() => {
    const ready = extractedPdfs.filter(e => selectedPdfIds.includes(e.pdfId) && e.text && !e.extracting);
    return ready.map(e => `=== ${e.fileName} ===\n${e.text}`).join('\n\n');
  }, [extractedPdfs, selectedPdfIds]);

  const extractedForTools = useMemo(() =>
    extractedPdfs.filter(e => selectedPdfIds.includes(e.pdfId)),
    [extractedPdfs, selectedPdfIds]
  );

  // ─── Shared AI sender ────────────────────────────────────────────────────────
  const sendToAI = async ({
    userText,
    batchPdfContext,
    teachScanProgress,
    overrideMode,
    silent = false,
  }: {
    userText: string;
    batchPdfContext?: string;
    teachScanProgress?: { current: number; total: number };
    overrideMode?: ChatMode;
    silent?: boolean;
  }) => {
    setIsLoading(true);
    setStreamingMsg('');

    try {
      const userMsg = await saveAIConversation('user', userText);
      if (!silent) setMessages(prev => [...prev, userMsg]);

      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const effectiveMode = overrideMode ?? mode;
      const effectiveContext = batchPdfContext ?? pdfContext;
      const effectiveScan = teachScanProgress ?? null;

      const res = await callEdgeFunction('ai-chat', {
        user_id: user?.id,
        message: userText,
        messages: [...history, { role: 'user', content: userText }],
        providerId: autoSwitch ? AUTO_MODEL : model,
        mode: effectiveMode,
        ...(effectiveContext ? { pdfContext: effectiveContext } : {}),
        ...(effectiveScan ? { scanProgress: effectiveScan } : {}),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || 'AI request failed');
      }

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream')) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split('\n').filter(l => l.startsWith('data: '))) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content || '';
                fullText += delta;
                setStreamingMsg(cleanText(fullText));
              } catch { /* skip */ }
            }
          }
        }
        const finalText = cleanText(fullText) || 'No response. Try again.';
        setStreamingMsg('');
        const assistantMsg = await saveAIConversation('assistant', finalText);
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        const data = await res.json();
        const reply = cleanText(data.text || data.reply || data.message || 'No response.');
        setStreamingMsg('');
        const assistantMsg = await saveAIConversation('assistant', reply);
        setMessages(prev => [...prev, assistantMsg]);
      }

      await updateXP('ai_chat');
    } catch (error: any) {
      console.error('AI Error:', error);
      const errText = `Error: ${error.message || 'Neural link failed.'}`;
      setStreamingMsg('');
      const errMsg = await saveAIConversation('assistant', errText).catch(() => ({
        id: Date.now().toString(), role: 'assistant' as const, content: errText, created_at: new Date().toISOString()
      }));
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Teach session handlers ───────────────────────────────────────────────────
  const startTeaching = async () => {
    const readyPdf = extractedPdfs.find(e => selectedPdfIds.includes(e.pdfId) && e.pages.length > 0 && !e.extracting);
    if (!readyPdf) return;

    const session: TeachSession = {
      pdfId: readyPdf.pdfId,
      fileName: readyPdf.fileName,
      pages: readyPdf.pages,
      totalPages: readyPdf.pageCount,
      currentBatch: 0,
      finished: false,
    };
    setTeachSession(session);
    setMode('teach');

    const batchPages = session.pages.slice(0, BATCH_SIZE);
    const batchText = batchPages.join('\n\n');
    const endPage = Math.min(BATCH_SIZE, session.totalPages);

    await sendToAI({
      userText: `Please teach me pages 1 to ${endPage} of "${session.fileName}".`,
      batchPdfContext: batchText,
      teachScanProgress: { current: endPage, total: session.totalPages },
      overrideMode: 'teach',
    });
  };

  const nextBatch = async () => {
    if (!teachSession || teachSession.finished) return;
    const nextBatchIndex = teachSession.currentBatch + 1;
    const startPage = nextBatchIndex * BATCH_SIZE;      // 0-indexed
    const endPage = Math.min(startPage + BATCH_SIZE, teachSession.totalPages);
    const batchPages = teachSession.pages.slice(startPage, endPage);
    const batchText = batchPages.join('\n\n');
    const finished = endPage >= teachSession.totalPages;

    setTeachSession(prev => prev ? { ...prev, currentBatch: nextBatchIndex, finished } : prev);

    await sendToAI({
      userText: `Continue — teach me pages ${startPage + 1} to ${endPage} of "${teachSession.fileName}".`,
      batchPdfContext: batchText,
      teachScanProgress: { current: endPage, total: teachSession.totalPages },
      overrideMode: 'teach',
    });
  };

  const startTest = async () => {
    setMode('test');
    const batchText = teachSession
      ? teachSession.pages.slice(0, Math.min((teachSession.currentBatch + 1) * BATCH_SIZE, teachSession.totalPages)).join('\n\n')
      : pdfContext;
    await sendToAI({
      userText: `I'm ready to be tested on everything we covered from "${teachSession?.fileName || 'the document'}".`,
      batchPdfContext: batchText,
      teachScanProgress: teachSession
        ? { current: teachSession.totalPages, total: teachSession.totalPages }
        : undefined,
      overrideMode: 'test',
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userInput = input.trim();
    setInput('');
    await sendToAI({ userText: userInput });
  };

  const handleClear = async () => {
    if (!confirm('Clear all conversation history?')) return;
    try {
      await clearAIConversations();
      setMessages([{ id: 'initial', role: 'assistant', content: "Logs cleared. Orbit ready.", created_at: new Date().toISOString() }]);
    } catch { alert('Failed to clear'); }
  };

  const modeConfig = {
    chat:  { icon: Sparkles,     label: 'Chat',  color: 'var(--primary)', placeholder: 'Ask Orbit anything...' },
    teach: { icon: Brain,        label: 'Teach', color: '#6366f1',        placeholder: 'What should I explain from your PDFs?' },
    test:  { icon: FlaskConical, label: 'Test',  color: '#10b981',        placeholder: 'Ready? I\'ll quiz you on your material.' },
  };
  const currentMode = modeConfig[mode];
  const currentModel = MODELS.find(m => m.id === model) || MODELS[0];

  if (isFetching) return <div className="flex-1 flex items-center justify-center bg-[var(--background)]"><Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" /></div>;

  return (
    <div className="flex-1 flex bg-[var(--background)] text-[var(--foreground)] h-full overflow-hidden">
      {/* Library sidebar */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <LibraryPanel pdfs={pdfs} extractedPdfs={extractedPdfs} selectedPdfIds={selectedPdfIds}
              onTogglePdf={togglePdf} onClose={() => setShowLibrary(false)} onExtract={handleExtractPdf} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        {/* Header */}
        <header className="px-5 py-3.5 border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-base font-bold text-[var(--foreground)] tracking-tight">Orbit AI</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-medium text-[var(--muted)] uppercase tracking-wider">Neural Link Active</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Model selector */}
            <div className="relative">
              <button onClick={() => setShowModelPicker(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--input)] text-[12px] font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--primary)]/50 transition-all">
                {autoSwitch ? (
                  <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Auto</>
                ) : (
                  <>{MODELS.find(m => m.id === model)?.label || 'Select'}</>
                )}
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showModelPicker && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    onClick={e => e.stopPropagation()}
                    className="absolute top-full right-0 mt-1.5 w-64 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl z-50 overflow-hidden">

                    {/* Auto Switch row */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                      <div>
                        <p className="text-[13px] font-semibold text-[var(--foreground)]">Auto Switch</p>
                        <p className="text-[10px] text-[var(--muted)] opacity-60">Best available provider</p>
                      </div>
                      <button onClick={() => setAutoSwitch(v => !v)}
                        className={cn('relative w-10 h-5 rounded-full transition-all',
                          autoSwitch ? 'bg-[var(--primary)]' : 'bg-[var(--border)]')}>
                        <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all',
                          autoSwitch ? 'left-5' : 'left-0.5')} />
                      </button>
                    </div>

                    {/* Manual model list — only when auto is OFF */}
                    <div className={cn('transition-all', autoSwitch ? 'opacity-40 pointer-events-none' : '')}>
                      <p className="px-4 pt-2.5 pb-1 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Select Model</p>
                      {MODELS.map(m => (
                        <button key={m.id}
                          disabled={autoSwitch}
                          onClick={() => { setModel(m.id); setShowModelPicker(false); }}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[var(--accent)] transition-all group">
                          <div>
                            <p className="text-[13px] font-medium text-[var(--foreground)]">{m.label}</p>
                            <p className="text-[10px] text-[var(--muted)] opacity-60">{m.desc}</p>
                          </div>
                          {!autoSwitch && model === m.id && <Check className="w-3.5 h-3.5 text-[var(--primary)]" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={handleClear}
              className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-red-500 hover:border-red-500/30 transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Scan progress bar */}
        <AnimatePresence>
          {scanProgress && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
              className="overflow-hidden shrink-0">
              <div className="px-5 py-2 bg-[var(--primary)]/10 border-b border-[var(--primary)]/20 flex items-center gap-3">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--primary)] shrink-0" />
                <div className="flex-1">
                  <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden">
                    <motion.div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${(scanProgress.current / scanProgress.total) * 100}%` }} />
                  </div>
                </div>
                <span className="text-[11px] text-[var(--primary)] font-medium shrink-0">Scanning page {scanProgress.current}/{scanProgress.total}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-3xl mx-auto px-4 py-5 pb-44">
            {/* Message card */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 space-y-5">
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <motion.div key={msg.id || i}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', damping: 24, stiffness: 140 }}
                      className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '')}>
                      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                        msg.role === 'user' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--background)] border border-[var(--border)] text-[var(--primary)]')}>
                        {msg.role === 'user' ? <div className="w-3 h-3 rounded-md border-2 border-white/80" /> : <Sparkles className="w-3.5 h-3.5" />}
                      </div>
                      <div className={cn('px-4 py-3 rounded-2xl max-w-[85%] shadow-sm',
                        msg.role === 'user'
                          ? 'bg-[var(--primary)] text-white rounded-tr-none text-sm'
                          : 'bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] rounded-tl-none')}>
                        {msg.role === 'assistant'
                          ? <div className="space-y-0.5">{renderMarkdown(msg.content)}</div>
                          : msg.content}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {streamingMsg && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--primary)] animate-pulse" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-[var(--background)] border border-[var(--primary)]/30 max-w-[85%]">
                      <div className="space-y-0.5">{renderMarkdown(streamingMsg)}</div>
                      <span className="inline-block w-1 h-4 bg-[var(--primary)] animate-pulse ml-1 rounded-sm align-middle" />
                    </div>
                  </motion.div>
                )}

                {isLoading && !streamingMsg && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--primary)] animate-pulse" />
                    </div>
                    <div className="px-4 py-3.5 rounded-2xl rounded-tl-none bg-[var(--background)] border border-[var(--border)] flex gap-1.5 items-center">
                      {[0, 0.15, 0.3].map((delay, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: `${delay}s` }} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Bottom controls — backdrop blur so messages slide under cleanly */}
        <div className="absolute bottom-0 left-0 right-0 z-20"
          style={{ backdropFilter: 'blur(12px)', background: 'linear-gradient(to top, var(--background) 60%, transparent)' }}>
          <div className="max-w-3xl mx-auto px-4 pt-2 pb-2 flex items-center justify-between gap-2">
            {/* Mode tabs */}
            <div className="flex items-center gap-1 bg-[var(--card)] border border-[var(--border)] rounded-xl p-1">
              {(Object.entries(modeConfig) as [ChatMode, typeof modeConfig.chat][]).map(([key, cfg]) => {
                const Icon = cfg.icon;
                const active = mode === key;
                return (
                  <button key={key} onClick={() => setMode(key)}
                    className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all',
                      active ? 'text-white shadow-sm' : 'text-[var(--muted)] hover:text-[var(--foreground)]')}
                    style={active ? { backgroundColor: cfg.color } : {}}>
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{cfg.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right buttons */}
            <div className="flex items-center gap-2">
              {/* Library */}
              <button onClick={() => setShowLibrary(v => !v)}
                className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12px] font-medium transition-all',
                  showLibrary || selectedPdfIds.length > 0
                    ? 'bg-[var(--primary)]/10 border-[var(--primary)]/40 text-[var(--primary)]'
                    : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]')}>
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Library</span>
                {selectedPdfIds.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[var(--primary)] text-white text-[10px] flex items-center justify-center font-bold">{selectedPdfIds.length}</span>
                )}
              </button>

              {/* Study Tools */}
              <button onClick={() => setShowStudyTools(v => !v)}
                className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12px] font-medium transition-all',
                  showStudyTools
                    ? 'bg-[#6366f1]/10 border-[#6366f1]/40 text-[#6366f1]'
                    : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]')}>
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Study Tools</span>
              </button>
            </div>
          </div>

          {/* PDF context pills */}
          {selectedPdfIds.length > 0 && (
            <div className="max-w-3xl mx-auto px-4 pb-2">
              <div className="flex flex-wrap gap-1.5">
                {selectedPdfIds.map(id => {
                  const pdf = pdfs.find(p => p.id === id);
                  const extracted = extractedPdfs.find(e => e.pdfId === id);
                  return pdf ? (
                    <span key={id} className={cn('flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-lg border',
                      extracted?.extracting ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                      extracted?.text ? 'bg-[var(--primary)]/10 border-[var(--primary)]/20 text-[var(--primary)]' :
                      'bg-[var(--input)] border-[var(--border)] text-[var(--muted)]')}>
                      <FileText className="w-3 h-3" />
                      {pdf.file_name.slice(0, 18)}{pdf.file_name.length > 18 ? '...' : ''}
                      {extracted?.extracting && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                      <button onClick={() => togglePdf(id)} className="hover:opacity-70"><X className="w-2.5 h-2.5" /></button>
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* ── Teach session strip (sits above input, never overlaps messages) ── */}
          <AnimatePresence>
            {/* Start Teaching CTA */}
            {mode === 'teach' && !teachSession && !isLoading && (() => {
              const ready = extractedPdfs.find(e => selectedPdfIds.includes(e.pdfId) && e.pages.length > 0 && !e.extracting);
              return ready ? (
                <motion.div key="start-teach" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="max-w-3xl mx-auto px-4 pb-2 overflow-hidden">
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Brain className="w-4 h-4 text-[#6366f1] shrink-0" />
                      <span className="text-[12px] text-[var(--muted)] truncate">
                        <span className="font-semibold text-[var(--foreground)]">{ready.fileName.slice(0, 28)}{ready.fileName.length > 28 ? '…' : ''}</span> · {ready.pageCount} pages ready
                      </span>
                    </div>
                    <button onClick={startTeaching} disabled={isLoading}
                      className="shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[12px] font-semibold text-white hover:opacity-90 active:scale-95 transition-all"
                      style={{ background: 'linear-gradient(135deg, #6366f1, var(--primary))' }}>
                      <Brain className="w-3.5 h-3.5" /> Start Teaching
                    </button>
                  </div>
                </motion.div>
              ) : null;
            })()}

            {/* Progress + Next / Test buttons */}
            {teachSession && !isLoading && (
              <motion.div key="teach-controls" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="max-w-3xl mx-auto px-4 pb-2 overflow-hidden">
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 space-y-2">
                  {/* Progress bar */}
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-medium text-[var(--muted)] shrink-0">
                      Pages {Math.min(teachSession.currentBatch * BATCH_SIZE + 1, teachSession.totalPages)}–{Math.min((teachSession.currentBatch + 1) * BATCH_SIZE, teachSession.totalPages)} of {teachSession.totalPages}
                    </span>
                    <div className="flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ background: 'var(--primary)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(((teachSession.currentBatch + 1) * BATCH_SIZE / teachSession.totalPages) * 100, 100)}%` }}
                        transition={{ duration: 0.5 }} />
                    </div>
                    <span className="text-[11px] font-semibold text-[var(--primary)] shrink-0">
                      {Math.round(Math.min(((teachSession.currentBatch + 1) * BATCH_SIZE / teachSession.totalPages) * 100, 100))}%
                    </span>
                  </div>
                  {/* Buttons */}
                  <div className="flex items-center gap-2">
                    {!teachSession.finished && (
                      <button onClick={nextBatch} disabled={isLoading}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[12px] font-semibold text-white hover:opacity-90 active:scale-95 transition-all"
                        style={{ background: 'linear-gradient(135deg, #6366f1, var(--primary))' }}>
                        <ChevronRight className="w-3.5 h-3.5" />
                        Next {Math.min(BATCH_SIZE, teachSession.totalPages - (teachSession.currentBatch + 1) * BATCH_SIZE > 0
                          ? BATCH_SIZE
                          : teachSession.totalPages % BATCH_SIZE || BATCH_SIZE)} Pages
                      </button>
                    )}
                    <button onClick={startTest} disabled={isLoading}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[12px] font-semibold border border-[var(--border)] text-[var(--muted)] hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:text-emerald-500 transition-all">
                      <FlaskConical className="w-3.5 h-3.5" /> Test Me
                    </button>
                    {teachSession.finished && (
                      <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1 ml-auto">
                        <Activity className="w-3 h-3" /> All pages covered!
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <div className="max-w-3xl mx-auto px-4 pb-5 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent pt-1">
            <div className="flex items-center gap-2.5 bg-[var(--card)] border border-[var(--border)] rounded-2xl px-4 py-2.5 shadow-lg focus-within:border-[var(--primary)] transition-all">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={currentMode.placeholder}
                className="flex-1 bg-transparent border-none focus:outline-none text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:opacity-50" />
              <button onClick={handleSend} disabled={isLoading || !input.trim()}
                className="w-8 h-8 bg-[var(--primary)] text-white rounded-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-30">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-center text-[10px] text-[var(--muted)] opacity-30 mt-2">Powered by Supabase Edge · OpenRouter</p>
          </div>
        </div>
      </div>

      {/* Study Tools panel */}
      <AnimatePresence>
        {showStudyTools && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 380, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <StudyToolsPanel extractedPdfs={extractedForTools} onClose={() => setShowStudyTools(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
