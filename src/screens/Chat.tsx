'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Send, Search, MessageSquare, Loader2 } from 'lucide-react';
import { getChatMessages, sendChatMessage, ChatMessage } from '../services/chat';
import { useAuth } from '../contexts/AuthContext';
import { ListSkeleton } from '../components/Skeleton';

export const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => { fetchMessages(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchMessages = async () => {
    try { const data = await getChatMessages(); setMessages(data); }
    catch (err) { console.error('Failed to fetch messages:', err); }
    finally { setLoading(false); }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);
    try {
      const newMsg = await sendChatMessage(content);
      setMessages(prev => [...prev, newMsg]);
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  };

  if (loading) return <ListSkeleton rows={6} />;

  return (
    <div className="flex-1 flex bg-[var(--background)] text-[var(--foreground)] overflow-hidden h-full">
      {/* Sidebar */}
      <div className="w-72 border-r border-[var(--border)] hidden md:flex flex-col bg-[var(--card)] shrink-0">
        <div className="p-4 border-b border-[var(--border)] shrink-0">
          <h2 className="text-sm font-bold text-[var(--foreground)] tracking-tight">Messages</h2>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)] opacity-40" />
            <input placeholder="Search..." className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--primary)] transition-all" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--primary)]/8 border border-[var(--primary)]/20 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center text-sm font-black shrink-0">G</div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[var(--foreground)] truncate">Global Study Hub</p>
              <p className="text-[11px] text-[var(--muted)] truncate">Campus-wide channel</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          </div>
          {/* Realtime chat coming soon notice */}
          <p className="text-center text-[10px] text-[var(--muted)] opacity-30 mt-4 px-3">Realtime messaging coming soon</p>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center text-sm font-black md:hidden">G</div>
            <div>
              <p className="text-[14px] font-bold text-[var(--foreground)]">Global Study Hub</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-[var(--muted)] font-medium uppercase tracking-wider">Campus channel</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-24 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 opacity-30">
              <MessageSquare className="w-10 h-10 text-[var(--muted)]" />
              <p className="text-sm text-[var(--muted)] font-medium">No messages yet. Start the conversation.</p>
            </div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <motion.div key={msg.id || i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 24, stiffness: 140 }}
                  className={cn('flex gap-2.5', isMe ? 'flex-row-reverse' : '')}>
                  <div className={cn('w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5',
                    isMe ? 'bg-[var(--primary)] text-white' : 'bg-[var(--input)] border border-[var(--border)] text-[var(--muted)]')}>
                    {isMe ? (user?.email?.slice(0, 2).toUpperCase() || 'ME') : 'U'}
                  </div>
                  <div className={cn('max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm',
                    isMe
                      ? 'bg-[var(--primary)] text-white rounded-tr-none'
                      : 'bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-tl-none')}>
                    <p className="leading-relaxed">{msg.content}</p>
                    <p className={cn('text-[10px] mt-1 opacity-60', isMe ? 'text-right' : '')}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent">
          <div className="flex items-center gap-2.5 bg-[var(--card)] border border-[var(--border)] rounded-2xl px-4 py-2.5 shadow-lg focus-within:border-[var(--primary)] transition-all">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Send a message..."
              className="flex-1 bg-transparent border-none focus:outline-none text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:opacity-40" />
            <button onClick={handleSend} disabled={sending || !input.trim()}
              className="w-8 h-8 bg-[var(--primary)] text-white rounded-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-30">
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
