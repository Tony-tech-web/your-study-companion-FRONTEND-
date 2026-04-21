'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, Loader2, Trash2, Activity, ChevronDown, Check, GraduationCap, Zap, BookOpen, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { callEdgeFunction } from '../lib/supabase';
import { getAIConversations, saveAIConversation, clearAIConversations, AIConversationEntry } from '../services/ai';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getDocuments, scanDocument } from '../services/documents';
import { Document } from '../types';

// Strip model metadata tags e.g. {{MODEL:GOOGLE}}
const cleanText = (t: string) => t.replace(/\{\{[^}]+\}\}/g, '').trim();

// Render markdown: bold, bullets, headings, line breaks
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
    str.split(/\*\*(.+?)\*\*/g).map((p, j) =>
      j % 2 === 1 ? <strong key={j} className="font-semibold">{p}</strong> : p
    );

  lines.forEach((line, i) => {
    if (/^[*\-]\s+/.test(line)) {
      listItems.push(<li key={i} className="text-sm leading-relaxed">{parseBold(line.replace(/^[*\-]\s+/, ''))}</li>);
    } else {
      flushList();
      if (line.trim() === '') {
        elements.push(<div key={i} className="h-1" />);
      } else if (/^#{1,3}\s+/.test(line)) {
        elements.push(<p key={i} className="text-sm font-semibold mt-2 mb-0.5">{parseBold(line.replace(/^#{1,3}\s+/, ''))}</p>);
      } else {
        elements.push(<p key={i} className="text-sm leading-relaxed">{parseBold(line)}</p>);
      }
    }
  });
  flushList();
  return elements;
};

const MODELS = [
  { id: 'google', label: 'Gemini Flash (Default)' },
  { id: 'google-pro', label: 'Gemini Pro' },
  { id: 'openrouter', label: 'GPT-4o (OpenRouter)' },
];

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
        className="w-full max-w-md bg-(--card) border border-(--border) rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-(--foreground)">API Status</h2>
            <p className="text-xs text-(--muted) mt-0.5">Live provider health — via Supabase Edge</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-(--accent) text-(--muted) transition-all text-sm">✕</button>
        </div>
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-(--primary)" /></div>
        ) : (
          <div className="space-y-2">
            {providers.map(p => (
              <div key={p.name} className="flex items-center gap-3 p-3 rounded-xl bg-(--input) border border-(--border)">
                <div className={cn('w-2 h-2 rounded-full shrink-0',
                  p.status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500')} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-(--foreground) truncate">{p.name}</p>
                  <p className="text-[10px] text-(--muted) opacity-60">{p.is_backup ? 'Backup' : 'Primary'} · {p.latency} latency</p>
                </div>
                <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-md',
                  p.status === 'connected' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500')}>
                  {p.status === 'connected' ? 'Online' : 'No Key'}
                </span>
              </div>
            ))}
            <p className="text-[11px] text-(--muted) pt-1 opacity-60 text-center">
              AI calls route through Supabase Edge → OpenRouter
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export const AIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AIConversationEntry[]>([]);
  const [pdfs, setPdfs] = useState<Document[]>([]);
  const [selectedPDFs, setSelectedPDFs] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [showPDFPicker, setShowPDFPicker] = useState(false);
  const [streamingMsg, setStreamingMsg] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  const [model, setModel] = useState('google');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    fetchHistory();
    fetchPDFs();
  }, []);

  useEffect(() => {
    console.log("AIAssistant State:", { selectedPDFs, user: !!user, isReady, pdfsCount: pdfs.length });
  }, [selectedPDFs, user, isReady, pdfs]);

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

  const fetchPDFs = async () => {
    try {
      const docs = await getDocuments();
      setPdfs(docs);
      setIsReady(true);
      console.log("PDFs fetched:", docs.length);
    } catch (err) { console.error('Failed to fetch PDFs:', err); }
  };

  const handleScan = async (id: string) => {
    try {
      const updated = await scanDocument(id, 2);
      setPdfs(prev => prev.map(p => p.id === id ? updated : p));
    } catch (err) { console.error('Failed to scan document:', err); }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userInput = input.trim();
    setInput('');
    setIsLoading(true);
    setStreamingMsg('');

    try {
      const userMsg = await saveAIConversation('user', userInput);
      setMessages(prev => [...prev, userMsg]);
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const res = await callEdgeFunction('ai-chat', {
        user_id: user?.id,
        message: userInput,
        messages: [...history, { role: 'user', content: userInput }],
        providerId: model,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'AI request failed' }));
        throw new Error(err.error || 'AI request failed');
      }

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
            } catch { /* skip malformed chunks */ }
          }
        }
      }

      const finalText = cleanText(fullText) || 'Neural link response empty. Try again.';
      setStreamingMsg('');
      const assistantMsg = await saveAIConversation('assistant', finalText);
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      console.error('AI Error:', error);
      const errText = `Error: ${error.message || 'Neural link failed. Check Supabase edge function logs.'}`;
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

  if (isFetching) {
    return (
      <div className="flex-1 flex items-center justify-center bg-(--background)">
        <Loader2 className="w-6 h-6 animate-spin text-(--primary)" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-(--background) text-(--foreground) h-full overflow-hidden relative">
      <AnimatePresence>{showStatus && <StatusModal onClose={() => setShowStatus(false)} />}</AnimatePresence>

      {/* Header */}
      <header className="px-6 py-4 border-b border-(--border) bg-(--card)/60 backdrop-blur-xl flex items-center justify-between shrink-0 z-40">
        <div>
          <h1 className="text-lg font-bold text-(--foreground) tracking-tight">Orbit AI</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-medium text-(--muted) uppercase tracking-wider">Neural Link Active</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setShowModelPicker(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--border) bg-(--input) text-[12px] font-medium text-(--muted) hover:text-(--foreground) hover:border-(--primary)/50 transition-all">
              {currentModel.label}
              <ChevronDown className="w-3 h-3" />
            </button>
            <AnimatePresence>
              {showModelPicker && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full right-0 mt-1.5 w-52 bg-(--card) border border-(--border) rounded-xl shadow-xl z-50 overflow-hidden">
                  {MODELS.map(m => (
                    <button key={m.id} onClick={() => { setModel(m.id); setShowModelPicker(false); }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-left text-[13px] hover:bg-(--accent) text-(--foreground) transition-all">
                      {m.label}
                      {model === m.id && <Check className="w-3.5 h-3.5 text-(--primary)" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={() => setShowStatus(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--border) bg-(--input) text-[12px] font-medium text-(--muted) hover:text-(--primary) hover:border-(--primary)/50 transition-all">
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Status</span>
          </button>
          <button onClick={handleClear}
            className="p-2 rounded-lg border border-(--border) text-(--muted) hover:text-red-500 hover:border-red-500/30 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-5 space-y-5 pb-32 custom-scrollbar z-10">
        <div className="max-w-3xl mx-auto space-y-5">
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div key={msg.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 24, stiffness: 140 }}
                className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '')}>
                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                  msg.role === 'user' ? 'bg-(--primary) text-white' : 'bg-(--card) border border-(--border) text-(--primary)')}>
                  {msg.role === 'user'
                    ? <div className="w-3 h-3 rounded-md border-2 border-white/80" />
                    : <Sparkles className="w-3.5 h-3.5" />}
                </div>
                <div className={cn('px-4 py-3 rounded-2xl max-w-[85%] shadow-sm',
                  msg.role === 'user'
                    ? 'bg-(--primary) text-white rounded-tr-none text-sm'
                    : 'bg-(--card) border border-(--border) text-(--foreground) rounded-tl-none')}>
                  {msg.role === 'assistant'
                    ? <div className="space-y-0.5">{renderMarkdown(msg.content)}</div>
                    : msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {streamingMsg && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-(--card) border border-(--border) flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-(--primary) animate-pulse" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-(--card) border border-(--primary)/30 max-w-[85%]">
                <div className="space-y-0.5">{renderMarkdown(streamingMsg)}</div>
                <span className="inline-block w-1 h-4 bg-(--primary) animate-pulse ml-1 rounded-sm" />
              </div>
            </motion.div>
          )}

          {isLoading && !streamingMsg && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-(--card) border border-(--border) flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-(--primary) animate-pulse" />
              </div>
              <div className="px-4 py-3.5 rounded-2xl rounded-tl-none bg-(--card) border border-(--border) flex gap-1.5 items-center">
                {[0, 0.15, 0.3].map((delay, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-(--primary) animate-bounce" style={{ animationDelay: `${delay}s` }} />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Floating UI (Bottom Right Blank Space) */}
      <div className="absolute inset-x-0 bottom-24 z-30 pointer-events-none flex justify-end px-8 md:px-12">
        <div className="flex flex-col items-end gap-4 w-72 pointer-events-auto">
          {/* PDF Picker popover attached to the floating stack */}
          <AnimatePresence>
            {showPDFPicker && (
              <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="w-full bg-(--card)/95 backdrop-blur-2xl border border-(--border) rounded-2xl shadow-2xl p-4 overflow-hidden mb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-(--muted) mb-3 opacity-60 text-center">Archive Library</p>
                <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar">
                  {pdfs.map(pdf => (
                    <button key={pdf.id} onClick={() => setSelectedPDFs(prev => prev.includes(pdf.id) ? prev.filter(id => id !== pdf.id) : [...prev, pdf.id])}
                      className={cn("w-full group p-2.5 rounded-xl text-left transition-all", selectedPDFs.includes(pdf.id) ? "bg-(--primary)/10 border border-(--primary)/30" : "hover:bg-(--accent) border border-transparent")}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn("w-4 h-4 rounded border flex items-center justify-center shrink-0", selectedPDFs.includes(pdf.id) ? "bg-(--primary) border-(--primary) text-white" : "border-(--border)")}>
                          {selectedPDFs.includes(pdf.id) && <Check className="w-3 h-3" />}
                        </div>
                        <span className="text-xs font-bold truncate text-(--foreground) flex-1">{pdf.name}</span>
                        {pdf.totalPages && pdf.totalPages > 0 && (
                          <span className="text-[9px] font-medium text-(--muted) opacity-60">{pdf.scannedPages}/{pdf.totalPages}</span>
                        )}
                      </div>
                      {pdf.totalPages && pdf.totalPages > 0 && (
                        <div className="h-0.5 w-full bg-(--input) rounded-full overflow-hidden opacity-40 group-hover:opacity-100 transition-opacity">
                          <div className="h-full bg-(--primary)" style={{ width: `${(pdf.scannedPages || 0) / pdf.totalPages * 100}%` }} />
                        </div>
                      )}
                    </button>
                  ))}
                  {pdfs.length === 0 && <p className="text-[10px] text-center text-(--muted) py-4 opacity-40 uppercase font-black">Empty Vault</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Individual Progress Card */}
          <AnimatePresence>
            {selectedPDFs.length === 1 && (
              <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="w-full bg-(--card)/95 backdrop-blur-2xl border border-(--border) rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-amber-500/20 mb-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Syncing Knowledge
                  </span>
                  <button onClick={() => handleScan(selectedPDFs[0])}
                    className="text-[10px] font-black text-(--muted) hover:text-amber-500 flex items-center gap-1.5 transition-all">
                    <RefreshCw className="w-3 h-3" />
                    RE-SCAN
                  </button>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-(--foreground) truncate pr-2">
                    {pdfs.find(p => p.id === selectedPDFs[0])?.name}
                  </span>
                  <span className="text-xs font-black text-amber-500 tabular-nums">
                    {pdfs.find(p => p.id === selectedPDFs[0])?.scannedPages}/{pdfs.find(p => p.id === selectedPDFs[0])?.totalPages}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-(--input) rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${((pdfs.find(p => p.id === selectedPDFs[0])?.scannedPages || 0) / (pdfs.find(p => p.id === selectedPDFs[0])?.totalPages || 1)) * 100}%` }}
                    className="h-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons Stack */}
          <div className="flex gap-2 w-full justify-end">
            <button onClick={() => setShowPDFPicker(v => !v)}
              className={cn("flex-1 h-12 flex items-center justify-center gap-2 rounded-2xl transition-all border shadow-xl relative", 
                showPDFPicker ? "bg-(--primary) text-white border-white/20" : "bg-(--card) text-(--foreground) border-(--border) hover:bg-(--accent)")}>
              <BookOpen className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Library</span>
              {selectedPDFs.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-(--card) shadow-lg">
                  {selectedPDFs.length}
                </span>
              )}
            </button>
            <AnimatePresence>
              {selectedPDFs.length > 0 && (
                <motion.div initial={{ opacity: 0, x: 10, width: 0 }} animate={{ opacity: 1, x: 0, width: 'auto' }} exit={{ opacity: 0, x: 10, width: 0 }} className="flex gap-2 shrink-0 overflow-hidden">
                  <button className="h-12 px-5 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest shadow-xl hover:translate-y-[-2px] active:translate-y-0 transition-all border border-emerald-400/30 whitespace-nowrap">
                    <GraduationCap className="w-4 h-4" />
                    Teach
                  </button>
                  <button className="h-12 px-5 flex items-center justify-center gap-2 rounded-2xl bg-amber-500 text-white text-[11px] font-black uppercase tracking-widest shadow-xl hover:translate-y-[-2px] active:translate-y-0 transition-all border border-amber-400/30 whitespace-nowrap">
                    <Zap className="w-4 h-4" />
                    Test
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Input Bar Section */}
      <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-5 pt-3 bg-gradient-to-t from-(--background) via-(--background) to-transparent z-40 pointer-events-none">
        <div className="max-w-3xl mx-auto flex flex-col gap-3 pointer-events-auto">
          <div className="w-full flex items-center gap-2.5 bg-(--card) border border-(--border) rounded-2xl px-4 py-2.5 shadow-lg focus-within:border-(--primary) transition-all">
            <div className="p-1.5 rounded-lg text-(--muted) opacity-50">
              <Sparkles className="w-4 h-4" />
            </div>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask Orbit anything..."
              className="flex-1 bg-transparent border-none focus:outline-none text-sm text-(--foreground) placeholder:text-(--muted) placeholder:opacity-50" />
            <button onClick={handleSend} disabled={isLoading || !input.trim()}
              className="w-8 h-8 bg-(--primary) text-white rounded-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-30">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-center text-[10px] text-(--muted) opacity-30">Powered by Supabase Edge · OpenRouter</p>
        </div>
      </div>
    </div>
  );
};
