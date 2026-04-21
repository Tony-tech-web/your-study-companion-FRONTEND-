'use client';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Send, Sparkles, Loader2, Trash2, Activity, ChevronDown, Check,
         BookOpen, Brain, FlaskConical, X, FileText, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { callEdgeFunction, supabase } from '../lib/supabase';
import { getAIConversations, saveAIConversation, clearAIConversations, AIConversationEntry } from '../services/ai';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Strip model metadata tags
const cleanText = (t: string) => t.replace(/\{\{[^}]+\}\}/g, '').trim();

// Markdown renderer
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
  { id: 'google', label: 'Gemini Flash' },
  { id: 'google-pro', label: 'Gemini Pro' },
  { id: 'openrouter', label: 'GPT-4o (OpenRouter)' },
];

interface StudentPdf { id: string; file_name: string; file_path: string; file_size: number | null; uploaded_at: string; }
interface Provider { name: string; status: string; latency: string; is_backup: boolean; }

const StatusModal = ({ onClose }: { onClose: () => void }) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/api/model-health').then(r => setProviders(r.data.providers || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-[var(--foreground)]">API Status</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">Live provider health — via Supabase Edge</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--accent)] text-[var(--muted)] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        {loading
          ? <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" /></div>
          : <div className="space-y-2">
              {providers.map(p => (
                <div key={p.name} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--input)] border border-[var(--border)]">
                  <div className={cn('w-2 h-2 rounded-full shrink-0',
                    p.status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500')} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[var(--foreground)] truncate">{p.name}</p>
                    <p className="text-[10px] text-[var(--muted)] opacity-60">{p.is_backup ? 'Backup' : 'Primary'} · {p.latency} latency</p>
                  </div>
                  <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-md',
                    p.status === 'connected' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500')}>
                    {p.status === 'connected' ? 'Online' : 'No Key'}
                  </span>
                </div>
              ))}
              <p className="text-[11px] text-center text-[var(--muted)] opacity-50 pt-1">
                AI calls route through Supabase Edge
              </p>
            </div>}
      </motion.div>
    </div>
  );
};

type ChatMode = 'chat' | 'teach' | 'test';

const modeConfig = {
  chat:  { icon: Sparkles,    label: 'Chat',  color: 'var(--primary)', desc: 'Ask Orbit anything' },
  teach: { icon: Brain,       label: 'Teach', color: '#6366f1',        desc: 'Learn from selected PDFs' },
  test:  { icon: FlaskConical,label: 'Test',  color: '#10b981',        desc: 'Quiz yourself on content' },
};

export const AIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AIConversationEntry[]>([]);
  const [streamingMsg, setStreamingMsg] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  const [model, setModel] = useState('google');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [mode, setMode] = useState<ChatMode>('chat');
  const [pdfs, setPdfs] = useState<StudentPdf[]>([]);
  const [selectedPdfIds, setSelectedPdfIds] = useState<string[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchHistory(); fetchPdfs(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streamingMsg, isLoading]);

  const fetchHistory = async () => {
    try {
      const history = await getAIConversations();
      setMessages(history.length === 0 ? [{
        id: 'initial', role: 'assistant',
        content: "Neural Link established. I'm Orbit, your academic AI. How can I help you today?",
        created_at: new Date().toISOString()
      }] : history);
    } catch (err) { console.error(err); }
    finally { setIsFetching(false); }
  };

  const fetchPdfs = async () => {
    try {
      const res = await api.get('/api/pdfs');
      setPdfs(res.data);
    } catch {}
  };

  const selectedPdfs = useMemo(() => pdfs.filter(p => selectedPdfIds.includes(p.id)), [pdfs, selectedPdfIds]);

  const togglePdf = (id: string) => {
    setSelectedPdfIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userInput = input.trim();
    setInput('');
    setIsLoading(true);
    setStreamingMsg('');

    if (!user?.id) {
      setIsLoading(false);
      alert('You must be logged in to use the AI assistant.');
      return;
    }

    try {
      const userMsg = await saveAIConversation('user', userInput);
      setMessages(prev => [...prev, userMsg]);

      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));

      // Build pdfContext from selected PDFs
      const pdfContext = selectedPdfs.length > 0
        ? selectedPdfs.map(p => `File: ${p.file_name} (path: ${p.file_path})`).join('\n')
        : undefined;

      // Call Supabase edge function — MUST include userId
      const res = await callEdgeFunction('ai-chat', {
        messages: [...history, { role: 'user', content: userInput }],
        providerId: model,
        userId: user.id,           // REQUIRED by edge function
        mode,
        ...(pdfContext ? { pdfContext } : {}),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'AI request failed' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      // Handle streaming response
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
            const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
            for (const line of lines) {
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
        // Non-streaming JSON response
        const data = await res.json();
        const reply = cleanText(data.text || data.reply || data.message || 'No response.');
        setStreamingMsg('');
        const assistantMsg = await saveAIConversation('assistant', reply);
        setMessages(prev => [...prev, assistantMsg]);
      }
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

  const handleClear = async () => {
    if (!confirm('Clear all conversation history?')) return;
    try {
      await clearAIConversations();
      setMessages([{ id: 'initial', role: 'assistant', content: "Logs cleared. Orbit ready.", created_at: new Date().toISOString() }]);
    } catch { alert('Failed to clear'); }
  };

  const currentModel = MODELS.find(m => m.id === model) || MODELS[0];
  const ModeIcon = modeConfig[mode].icon;

  if (isFetching) return <div className="flex-1 flex items-center justify-center bg-[var(--background)]"><Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" /></div>;

  return (
    <div className="flex-1 flex bg-[var(--background)] text-[var(--foreground)] h-full overflow-hidden">
      <AnimatePresence>{showStatus && <StatusModal onClose={() => setShowStatus(false)} />}</AnimatePresence>

      {/* PDF Library Sidebar */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            className="flex flex-col h-full bg-[var(--card)] border-r border-[var(--border)] overflow-hidden shrink-0">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border)]">
              <p className="text-[13px] font-semibold text-[var(--foreground)]">PDF Library</p>
              <button onClick={() => setShowLibrary(false)} className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
              {pdfs.length === 0 && (
                <div className="py-8 text-center">
                  <FileText className="w-8 h-8 text-[var(--muted)] opacity-20 mx-auto mb-2" />
                  <p className="text-xs text-[var(--muted)] opacity-40">No PDFs uploaded yet</p>
                  <p className="text-[11px] text-[var(--muted)] opacity-30 mt-1">Upload from Courses page</p>
                </div>
              )}
              {pdfs.map(pdf => {
                const selected = selectedPdfIds.includes(pdf.id);
                return (
                  <button key={pdf.id} onClick={() => togglePdf(pdf.id)}
                    className={cn('w-full flex items-center gap-2.5 p-3 rounded-xl text-left transition-all border',
                      selected
                        ? 'bg-[var(--primary)]/10 border-[var(--primary)]/40 text-[var(--foreground)]'
                        : 'border-transparent hover:bg-[var(--accent)] text-[var(--muted)]')}>
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      selected ? 'bg-[var(--primary)] text-white' : 'bg-[var(--input)] text-[var(--muted)]')}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium truncate" style={{ color: selected ? 'var(--foreground)' : undefined }}>
                        {pdf.file_name}
                      </p>
                      <p className="text-[10px] opacity-50">{pdf.file_size ? `${Math.round(pdf.file_size / 1024)} KB` : 'Unknown size'}</p>
                    </div>
                    {selected && <Check className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />}
                  </button>
                );
              })}
            </div>
            {selectedPdfIds.length > 0 && (
              <div className="p-3 border-t border-[var(--border)]">
                <p className="text-[11px] text-[var(--muted)] text-center">{selectedPdfIds.length} PDF{selectedPdfIds.length > 1 ? 's' : ''} selected as context</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="px-5 py-3.5 border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-base font-bold text-[var(--foreground)] tracking-tight">Orbit AI</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-medium text-[var(--muted)] uppercase tracking-wider">Neural Link Active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Model picker */}
            <div className="relative">
              <button onClick={() => setShowModelPicker(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--input)] text-[12px] font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--primary)]/50 transition-all">
                {currentModel.label}
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showModelPicker && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full right-0 mt-1.5 w-52 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden">
                    {MODELS.map(m => (
                      <button key={m.id} onClick={() => { setModel(m.id); setShowModelPicker(false); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-left text-[13px] hover:bg-[var(--accent)] text-[var(--foreground)] transition-all">
                        {m.label}
                        {model === m.id && <Check className="w-3.5 h-3.5 text-[var(--primary)]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => setShowStatus(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--input)] text-[12px] font-medium text-[var(--muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/50 transition-all">
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Status</span>
            </button>
            <button onClick={handleClear}
              className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-red-500 hover:border-red-500/30 transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-3xl mx-auto px-4 py-5 space-y-5 pb-36">
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 24, stiffness: 140 }}
                  className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '')}>
                  <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                    msg.role === 'user' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--card)] border border-[var(--border)] text-[var(--primary)]')}>
                    {msg.role === 'user'
                      ? <div className="w-3 h-3 rounded-md border-2 border-white/80" />
                      : <Sparkles className="w-3.5 h-3.5" />}
                  </div>
                  <div className={cn('px-4 py-3 rounded-2xl max-w-[85%] shadow-sm',
                    msg.role === 'user'
                      ? 'bg-[var(--primary)] text-white rounded-tr-none text-sm'
                      : 'bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-tl-none')}>
                    {msg.role === 'assistant'
                      ? <div className="space-y-0.5">{renderMarkdown(msg.content)}</div>
                      : msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {streamingMsg && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--primary)] animate-pulse" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-[var(--card)] border border-[var(--primary)]/30 max-w-[85%]">
                  <div className="space-y-0.5">{renderMarkdown(streamingMsg)}</div>
                  <span className="inline-block w-1 h-4 bg-[var(--primary)] animate-pulse ml-1 rounded-sm align-middle" />
                </div>
              </motion.div>
            )}

            {isLoading && !streamingMsg && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--primary)] animate-pulse" />
                </div>
                <div className="px-4 py-3.5 rounded-2xl rounded-tl-none bg-[var(--card)] border border-[var(--border)] flex gap-1.5 items-center">
                  {[0, 0.15, 0.3].map((delay, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: `${delay}s` }} />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          {/* Mode + library row */}
          <div className="max-w-3xl mx-auto px-4 pb-2 flex items-center justify-between gap-2">
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

            {/* Library button */}
            <button onClick={() => setShowLibrary(v => !v)}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12px] font-medium transition-all',
                showLibrary || selectedPdfIds.length > 0
                  ? 'bg-[var(--primary)]/10 border-[var(--primary)]/40 text-[var(--primary)]'
                  : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]')}>
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Library</span>
              {selectedPdfIds.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[var(--primary)] text-white text-[10px] flex items-center justify-center font-bold">
                  {selectedPdfIds.length}
                </span>
              )}
            </button>
          </div>

          {/* Input bar */}
          <div className="max-w-3xl mx-auto px-4 pb-5 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent pt-1">
            {/* Context indicator */}
            {selectedPdfs.length > 0 && (
              <div className="flex items-center gap-2 mb-2 px-1 flex-wrap">
                {selectedPdfs.map(p => (
                  <span key={p.id} className="flex items-center gap-1.5 text-[11px] font-medium bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-1 rounded-lg border border-[var(--primary)]/20">
                    <FileText className="w-3 h-3" />
                    {p.file_name.slice(0, 20)}{p.file_name.length > 20 ? '...' : ''}
                    <button onClick={() => togglePdf(p.id)} className="hover:opacity-70"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2.5 bg-[var(--card)] border border-[var(--border)] rounded-2xl px-4 py-2.5 shadow-lg focus-within:border-[var(--primary)] transition-all">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={modeConfig[mode].desc}
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
    </div>
  );
};
