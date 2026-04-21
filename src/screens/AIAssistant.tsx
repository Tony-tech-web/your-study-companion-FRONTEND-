import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Paperclip, Sparkles, Loader2, Trash2, Activity } from 'lucide-react';
import { Badge } from '../components/UI';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { getAIConversations, saveAIConversation, clearAIConversations, AIConversationEntry } from '../services/ai';
import api from '../services/api';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "" });

// Strip Gemini model metadata prefixes e.g. "{{MODEL:GOOGLE}}"
const cleanResponse = (text: string): string =>
  text.replace(/\{\{[^}]+\}\}/g, '').trim();

// Minimal markdown renderer: bold, bullets, line breaks
const renderMarkdown = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Bullet points
    const isBullet = /^[*\-]\s+/.test(line);
    const content = line.replace(/^[*\-]\s+/, '');
    // Bold **text**
    const parts = (isBullet ? content : line).split(/\*\*(.+?)\*\*/g);
    const rendered = parts.map((p, j) =>
      j % 2 === 1 ? <strong key={j}>{p}</strong> : p
    );
    if (isBullet) {
      return <li key={i} className="ml-4 list-disc">{rendered}</li>;
    }
    if (line.trim() === '') return <br key={i} />;
    return <p key={i} className="mb-1">{rendered}</p>;
  });
};

interface ProviderStatus {
  name: string;
  status: string;
  latency: string;
  is_backup: boolean;
}

const SystemStatusModal = ({ onClose }: { onClose: () => void }) => {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/model-health')
      .then(res => setProviders(res.data.providers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter">System API Status</h2>
            <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mt-1 opacity-60">Live provider health</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--accent)] text-[var(--muted)] transition-colors text-lg font-bold">✕</button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" /></div>
        ) : (
          <div className="space-y-3">
            {providers.map(p => (
              <div key={p.name} className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--input)] border border-[var(--border)]">
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full shrink-0",
                  p.status === 'connected' ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-red-500"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-[var(--foreground)] uppercase tracking-tight">{p.name}</p>
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest opacity-60">
                    {p.is_backup ? 'Backup' : 'Primary'} · Latency: {p.latency}
                  </p>
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg",
                  p.status === 'connected'
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-red-500/10 text-red-500"
                )}>
                  {p.status === 'connected' ? 'Online' : 'No Key'}
                </span>
              </div>
            ))}
          </div>
        )}
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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchHistory(); }, []);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const fetchHistory = async () => {
    try {
      const history = await getAIConversations();
      setMessages(history.length === 0 ? [{
        id: 'initial',
        role: 'assistant',
        content: "Neural Link established. I am Orbit, your academic core. How shall we optimize your learning cycle today?",
        created_at: new Date().toISOString()
      }] : history);
    } catch (err) {
      console.error('Failed to fetch AI history:', err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userInput = input;
    setInput('');
    setIsLoading(true);
    try {
      const userMsg = await saveAIConversation('user', userInput);
      setMessages(prev => [...prev, userMsg]);

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: userInput,
        config: {
          systemInstruction: "You are Orbit, a professional academic AI assistant in a futuristic student hub. Your tone is technical, supportive, and efficient. Never include model metadata tags like {{MODEL:GOOGLE}} in your responses. Use academic terminology. Keep responses concise but high-value. Format lists with proper line breaks."
        }
      });

      const rawText = response.text || "Neural link sync failed.";
      const cleanText = cleanResponse(rawText);
      const assistantMsg = await saveAIConversation('assistant', cleanText);
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorText = "CRITICAL: Neural link connection timeout. Verify API clearance and try again.";
      const assistantMsg = await saveAIConversation('assistant', errorText);
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('Clear all neural logs?')) return;
    try {
      await clearAIConversations();
      setMessages([{
        id: 'initial',
        role: 'assistant',
        content: "Logs purged. Orbit re-established. Standing by.",
        created_at: new Date().toISOString()
      }]);
    } catch { alert('Failed to clear logs'); }
  };

  if (isFetching) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--background)] text-[var(--foreground)] h-full overflow-hidden relative">
      <AnimatePresence>{showStatus && <SystemStatusModal onClose={() => setShowStatus(false)} />}</AnimatePresence>

      {/* Header */}
      <header className="px-6 md:px-10 py-5 border-b border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-xl flex items-center justify-between shrink-0 z-20">
        <div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase leading-none">Neural Link</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
            <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.3em] opacity-80">Orbit · Sync: Real-Time</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowStatus(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--accent)] text-[var(--muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all text-[11px] font-black uppercase tracking-wider"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden md:inline">API Status</span>
          </button>
          <button
            onClick={handleClear}
            className="p-2.5 rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-red-500 hover:border-red-500/30 transition-all"
            title="Clear History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 space-y-6 pb-36 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", damping: 22, stiffness: 120 }}
                className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "")}
              >
                {/* Avatar */}
                <div className={cn(
                  "w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-1 shadow-lg",
                  msg.role === 'user' ? "bg-[var(--primary)] text-white" : "bg-[var(--card)] border border-[var(--border)] text-[var(--primary)]"
                )}>
                  {msg.role === 'user'
                    ? <div className="w-3.5 h-3.5 rounded-md border-2 border-white/80" />
                    : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className={cn(
                  "px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-lg max-w-[85%]",
                  msg.role === 'user'
                    ? "bg-[var(--primary)] text-white rounded-tr-none"
                    : "bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-tl-none"
                )}>
                  {msg.role === 'assistant'
                    ? <div className="space-y-1">{renderMarkdown(msg.content)}</div>
                    : msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-9 h-9 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-[var(--primary)] animate-pulse" />
              </div>
              <div className="px-5 py-4 rounded-2xl rounded-tl-none bg-[var(--card)] border border-[var(--border)] flex gap-2 items-center">
                {[0, 0.15, 0.3].map((delay, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: `${delay}s` }} />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="absolute bottom-0 left-0 right-0 px-4 md:px-10 pb-6 pt-3 bg-gradient-to-t from-[var(--background)] to-transparent z-30">
        <div className="max-w-3xl mx-auto flex items-center gap-3 bg-[var(--card)] border border-[var(--border)] rounded-2xl px-4 py-3 shadow-xl focus-within:border-[var(--primary)] transition-all">
          <button className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--accent)] transition-all">
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Query neural network..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="w-9 h-9 bg-[var(--primary)] text-white rounded-xl flex items-center justify-center shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
