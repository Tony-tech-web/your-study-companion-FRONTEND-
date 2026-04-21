import React, { useEffect, useState } from 'react';
import { Card, Input, Button } from '../components/UI';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Send, Phone, Video, Search, Info, Users, Circle, Loader2 } from 'lucide-react';
import { getChatMessages, sendChatMessage, ChatMessage } from '../services/chat';

export const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const data = await getChatMessages();
      setMessages(data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const content = input;
    setInput('');
    try {
      const newMsg = await sendChatMessage(content);
      setMessages(prev => [...prev, newMsg]);
    } catch (err) {
      alert('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-(--background)">
        <Loader2 className="w-10 h-10 text-(--primary) animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-[var(--background)] overflow-hidden">
      {/* Sidebar List (Mocked contacts for now as there is no profiles list endpoint yet) */}
      <div className="w-80 border-r border-(--border) hidden md:flex flex-col bg-(--card)/50 shrink-0">
        <header className="p-8 pb-4 shrink-0">
          <h2 className="text-2xl font-black tracking-tighter uppercase">Messages</h2>
          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-(--muted)" />
            <input 
              placeholder="Search conversations..." 
              className="w-full bg-(--input) border border-(--border) rounded-2xl pl-12 pr-4 py-3 text-xs font-bold focus:outline-none focus:border-(--primary)"
            />
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
           <div className="p-4 rounded-3xl flex items-center gap-4 cursor-pointer transition-all border-2 bg-(--accent) border-(--primary)/30 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-(--primary) text-white flex items-center justify-center font-black shadow-inner">G</div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className="font-black text-xs uppercase tracking-tight text-(--foreground) truncate">Global Study Hub</h3>
                  <span className="text-[10px] font-bold text-(--muted) opacity-60">Online</span>
                </div>
                <p className="text-xs text-(--muted) truncate font-medium">Synchronizing nodes...</p>
              </div>
           </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative h-full">
        <header className="h-24 px-6 md:px-10 border-b border-(--border) bg-(--card)/50 backdrop-blur-xl flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-(--primary) text-white flex items-center justify-center font-black md:hidden">G</div>
             <div>
               <h3 className="font-black text-lg md:text-xl uppercase tracking-tighter">Global Study Hub</h3>
               <div className="flex items-center gap-2 mt-0.5">
                  <Circle className="w-2 h-2 fill-(--primary) text-(--primary) animate-pulse" />
                  <span className="text-[10px] font-black text-(--muted) uppercase tracking-widest leading-none">Cluster Synchronized</span>
               </div>
             </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-3 hover:bg-(--accent)/50 rounded-xl transition-all text-(--muted) hover:text-(--primary)"><Phone className="w-5 h-5" /></button>
            <button className="p-3 hover:bg-(--accent)/50 rounded-xl transition-all text-(--muted) hover:text-(--primary)"><Video className="w-5 h-5" /></button>
            <button className="p-3 hover:bg-(--accent)/50 rounded-xl transition-all text-(--muted) hover:text-(--primary)"><Info className="w-5 h-5" /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 pb-32 custom-scrollbar">
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex flex-col max-w-[80%] md:max-w-[70%]",
                msg.receiver_id === null ? "ml-auto items-end" : "items-start" // Assuming null receiver means broadcast or 'me'
              )}
            >
              <div className={cn(
                "p-5 rounded-4xl text-sm md:text-base leading-relaxed shadow-xl",
                msg.receiver_id === null 
                  ? "bg-(--primary) text-white rounded-tr-none" 
                  : "bg-(--card) border border-(--border) text-(--foreground) rounded-tl-none font-medium shadow-sm hover:border-(--primary)/30 transition-all"
              )}>
                {msg.content}
              </div>
              <span className="text-[10px] font-bold text-(--muted) mt-2 mx-4 opacity-40 uppercase tracking-tighter">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.div>
          ))}
          {messages.length === 0 && (
            <div className="p-20 text-center opacity-40">
              <p className="text-xs font-black uppercase tracking-widest">No transmissions detected in this frequency</p>
            </div>
          )}
        </div>

        {/* Input Bar Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 pointer-events-none pb-28 md:pb-10 z-20">
          <div className="max-w-4xl mx-auto w-full flex items-center gap-4 bg-(--card)/90 backdrop-blur-2xl p-3 rounded-5xl border-2 border-(--border) shadow-[0_30px_60px_-12px_rgb(0,0,0,0.3)] pointer-events-auto hover:border-(--primary) transition-all">
             <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Transmit data..."
                className="flex-1 bg-transparent border-none focus:outline-none font-black text-sm md:text-base text-(--foreground) placeholder:text-(--muted) placeholder:opacity-30 px-6"
              />
             <button 
               onClick={handleSend}
               className="w-14 h-14 bg-(--primary) text-white rounded-4xl flex items-center justify-center shadow-xl shadow-(--primary)/30 hover:scale-105 active:scale-95 transition-all"
             >
               <Send className="w-6 h-6" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
