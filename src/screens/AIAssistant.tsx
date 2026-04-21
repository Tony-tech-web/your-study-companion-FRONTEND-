'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, Loader2, Trash2, Activity, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { getAIConversations, saveAIConversation, clearAIConversations, AIConversationEntry } from '../services/ai';
import api from '../services/api';

const cleanResponse = (text: string): string => text.replace(/\{\{[^}]+\}\}/g, '').trim();

const renderMarkdown = (text: string) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(<ul key={`ul-${elements.length}`} className="my-1 space-y-0.5 pl-4">{listItems}</ul>);
      listItems = [];
    }
  };

  lines.forEach((line, i) => {
    const isBullet = /^[*\-]\s+/.test(line);
    const isHeading = /^#{1,3}\s+/.test(line);
    const content = line.replace(/^[*\-]\s+/, '').replace(/^#{1,3}\s+/, '');

    const parseBold = (str: string) =>
      str.split(/\*\*(.+?)\*\*/g).map((p, j) => j % 2 === 1 ? <strong key={j} className="font-semibold">{p}</strong> : p);

    if (isBullet) {
      listItems.push(<li key={i} className="text-sm list-disc">{parseBold(content)}</li>);
    } else {
      flushList();
      if (line.trim() === '') {
        elements.push(<div key={i} className="h-1" />);
      } else if (isHeading) {
        elements.push(<p key={i} className="text-sm font-semibold mt-2 mb-0.5">{parseBold(content)}</p>);
      } else {
        elements.push(<p key={i} className="text-sm leading-relaxed">{parseBold(line)}</p>);
      }
    }
  });
  flushList();
  return elements;
};

interface Model { id: string; label: string; available: boolean; }
interface Provider { name: string; status: string; latency: string; is_backup: boolean; }

const ModelPicker = ({ current, models, onChange, onClose }: {
  current: string; models: Model[]; onChange: (id: string) => void; onClose: () => void;
}) => (
  <div className="absolute top-full right-0 mt-2 w-56 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden">
    {models.map(m => (
      <button key={m.id} onClick={() => { onChange(m.id); onClose(); }}
        disabled={!m.available}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 text-left transition-all',
          m.available ? 'hover:bg-[var(--accent)] text-[var(--foreground)]' : 'opacity-30 cursor-not-allowed text-[var(--muted)]',
          current === m.id ? 'bg-[var(--accent)]' : ''
        )}>
        <span className="text-[13px] font-medium">{m.label}</span>
        {current === m.id && <Check className="w-3.5 h-3.5 text-[var(--primary)]" />}
      </button>
    ))}
  </div>
);

const StatusModal = ({ onClose }: { onClose: () => void }) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/api/model-health').then(r => setProviders(r.data.providers || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-[var(--foreground)]">API Status</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">Live provider health</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--accent)] text-[var(--muted)] transition-colors"><span className="text-sm font-bold">✕</span></button>
        </div>
        {loading
          ? <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" /></div>
          : <div className="space-y-2">
              {providers.map(p => (
                <div key={p.name} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--input)] border border-[var(--border)]">
                  <div className={cn('w-2 h-2 rounded-full shrink-0', p.status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-400')} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--foreground)]">{p.name}</p>
                    <p className="text-[11px] text-[var(--muted)]">{p.is_backup ? 'Backup' : 'Primary'} · {p.latency} latency</p>
                  </div>
                  <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-lg',
                    p.status === 'connected' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-400')}>
                    {p.status === 'connected' ? 'Online' : 'No Key'}
                  </span>
                </div>
              ))}
            </div>
        }
      </motion.div>
    </div>
  );
};

export const AIAssistant = () => {
  const [messages, setMessages] = useState<AIConversationEntry[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [selectedModel, setSelectedModel] = useState('auto');
  const [models, setModels] = useState<Model[]>([
    { id: 'auto', label: 'Auto (Best available)', available: true },
    { id: 'openai', label: 'GPT-4o Mini', available: false },
    { id: 'gemini', label: 'Gemini 2.0 Flash', available: false },
    { id: 'openrouter', label: 'OpenRouter', available: false },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchHistory(); fetchModels(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

  const fetchModels = async () => {
    try {
      const res = await api.get('/api/ai/models');
      setModels(res.data);
    } catch {}
  };

  const fetchHistory = async () => {
    try {
      const history = await getAIConversations();
      setMessages(history.length === 0 ? [{
        id: 'initial', role: 'assistant',
        content: "Hi, I'm Orbit — your academic AI assistant. Ask me anything about your studies, research, or coursework.",
        created_at: new Date().toISOString()
      }] : history);
    } catch (err) { console.error('Failed to fetch AI history:', err); }
    finally { setIsFetching(false); }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userInput = input.trim();
    setInput('');
    setIsLoading(true);

    const userMsg: AIConversationEntry = { id: `tmp-${Date.now()}`, role: 'user', content: userInput, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);

    try {
      // Save user message to backend
      const savedUser = await saveAIConversation('user', userInput);
      setMessages(prev => prev.map(m => m.id === userMsg.id ? savedUser : m));

      // Call AI through backend (keys stay server-side)
      const history = messages.slice(-10).filter(m => m.id !== 'initial').map(m => ({ role: m.role, content: m.content }));
      const res = await api.post('/api/ai/chat', { message: userInput, history, model: selectedModel });
      const rawReply = res.data.reply || "I couldn't generate a response. Please try again.";
      const cleanReply = cleanResponse(rawReply);

      const savedAssistant = await saveAIConversation('assistant', cleanReply);
      setMessages(prev => [...prev, savedAssistant]);
    } catch (err: any) {
      const errMsg = err?.response?.data?.reply || "Connection failed. Please check your network and try again.";
      const savedErr = await saveAIConversation('assistant', errMsg).catch(() => ({
        id: `err-${Date.now()}`, role: 'assistant' as const, content: errMsg, created_at: new Date().toISOString()
      }));
      setMessages(prev => [...prev, savedErr]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('Clear all conversation history?')) return;
    try {
      await clearAIConversations();
      setMessages([{ id: 'initial', role: 'assistant', content: "Conversation cleared. How can I help you?", created_at: new Date().toISOString() }]);
    } catch { alert('Failed to clear history'); }
  };

  const currentModelLabel = models.find(m => m.id === selectedModel)?.label || 'Auto';

  if (isFetching) return <div className="flex-1 flex items-center justify-center bg-[var(--background)]"><Loader2 className="w-5 h-5 text-[var(--primary)] animate-spin" /></div>;

  return (
    <div className="flex-1 flex flex-col bg-[var(--background)] text-[var(--foreground)] h-full overflow-hidden">
      <AnimatePresence>{showStatus && <StatusModal onClose={() => setShowStatus(false)} />}</AnimatePresence>

      {/* Header */}
      <header className="px-5 py-3.5 border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-base font-bold text-[var(--foreground)] tracking-tight">Orbit AI</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-[var(--muted)]">Active connection</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Model selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelPicker(!showModelPicker)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--input)] text-[12px] font-medium text-[var(--foreground)] hover:border-[var(--primary)] transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span className="hidden sm:inline max-w-[100px] truncate">{currentModelLabel}</span>
              <ChevronDown className="w-3 h-3 text-[var(--muted)]" />
            </button>
            <AnimatePresence>
              {showModelPicker && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                  <ModelPicker current={selectedModel} models={models} onChange={setSelectedModel} onClose={() => setShowModelPicker(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={() => setShowStatus(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--input)] text-[12px] font-medium text-[var(--muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all">
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">API Status</span>
          </button>
          <button onClick={handleClear} className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-red-500 hover:border-red-500/30 transition-all" title="Clear history">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-32">
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div key={msg.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 24, stiffness: 200 }}
                className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '')}
              >
                <div className={cn('w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                  msg.role === 'user' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--card)] border border-[var(--border)]')}>
                  {msg.role === 'user'
                    ? <div className="w-2.5 h-2.5 rounded-md border-2 border-white/80" />
                    : <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />}
                </div>
                <div className={cn('px-4 py-3 rounded-2xl max-w-[82%] shadow-sm',
                  msg.role === 'user'
                    ? 'bg-[var(--primary)] text-white rounded-tr-sm'
                    : 'bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-tl-sm')}>
                  {msg.role === 'assistant'
                    ? <div className="space-y-0.5">{renderMarkdown(msg.content)}</div>
                    : <p className="text-sm">{msg.content}</p>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-7 h-7 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[var(--primary)] animate-pulse" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[var(--card)] border border-[var(--border)] flex gap-1.5 items-center">
                {[0, 0.15, 0.3].map((d, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: `${d}s` }} />)}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-3 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent">
        <div className="max-w-2xl mx-auto flex items-center gap-2 bg-[var(--card)] border border-[var(--border)] rounded-xl px-3 py-2.5 shadow-lg focus-within:border-[var(--primary)] transition-all">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:opacity-40" />
          <button onClick={handleSend} disabled={isLoading || !input.trim()}
            className="w-8 h-8 bg-[var(--primary)] text-white rounded-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-30">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
