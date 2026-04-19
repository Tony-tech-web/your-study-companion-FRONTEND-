import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Paperclip, MessageSquare, Sparkles } from 'lucide-react';
import { Card, Button, Badge } from '../components/UI';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "" });

export const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: "Neural Link established. I am your academic core. How shall we optimize your learning cycle today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: input,
        config: {
            systemInstruction: "You are a professional academic assistant in a futuristic student hub. Your tone is technical, supportive, and efficient. Use academic terminology where appropriate. Keep responses relatively concise but high-value."
        }
      });
      const text = response.text;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text || "Neural link sync failed. Please re-initialize.",
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "CRITICAL: Neural link connection timeout. Verify API clearance and try again.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[var(--background)] text-[var(--foreground)] h-full overflow-hidden relative">
      <header className="p-8 md:p-10 border-b border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-2xl flex items-center justify-between shrink-0 z-20">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">Neural Link</h1>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse shadow-[0_0_10px_var(--primary)]" />
            <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.3em] opacity-80">Sync: Real-Time</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <Badge className="hidden md:flex bg-[var(--accent)] text-[var(--muted)] border-[var(--border)] font-black text-[10px] tracking-widest px-6 py-3 rounded-2xl uppercase">Session: Beta_0.4</Badge>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-12 space-y-12 pb-48 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-12">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className={cn(
                  "flex gap-6 md:gap-8",
                  msg.role === 'user' ? "flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-12 h-12 md:w-16 md:h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 mt-1 shadow-2xl relative overflow-hidden group",
                  msg.role === 'user' 
                    ? "bg-[var(--primary)] text-white" 
                    : "bg-[var(--card)] border border-[var(--border)] text-[var(--primary)]"
                )}>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {msg.role === 'user' ? (
                     <div className="w-6 h-6 rounded-lg border-4 border-white/80" />
                  ) : (
                     <Sparkles className="w-7 h-7 drop-shadow-[0_0_10px_var(--primary)]" />
                  )}
                </div>
                <div className={cn(
                  "p-8 md:p-10 rounded-[2.5rem] text-sm md:text-lg leading-relaxed shadow-2xl border transition-all",
                  msg.role === 'user' 
                    ? "bg-[var(--primary)] text-white border-[var(--primary)] rounded-tr-none hover:shadow-[0_20px_40px_-15px_var(--primary)]/40" 
                    : "bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-tl-none font-black uppercase tracking-tight whitespace-pre-wrap opacity-90 hover:opacity-100"
                )}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-6 md:gap-8">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.5rem] bg-[var(--card)] border border-[var(--border)] flex items-center justify-center shadow-xl">
                <Sparkles className="w-6 h-6 text-[var(--primary)] animate-pulse" />
              </div>
              <div className="p-8 rounded-[2.5rem] rounded-tl-none bg-[var(--card)]/50 border border-[var(--border)] flex gap-3 items-center shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] animate-bounce shadow-[0_0_8px_var(--primary)]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] animate-bounce [animation-delay:0.2s] shadow-[0_0_8px_var(--primary)]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] animate-bounce [animation-delay:0.4s] shadow-[0_0_8px_var(--primary)]" />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Futuristic Fixed Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 pointer-events-none pb-24 md:pb-12 z-30">
        <div className="max-w-5xl mx-auto w-full flex items-center gap-6 bg-[var(--card)]/80 backdrop-blur-3xl p-4 md:p-6 rounded-[3rem] border-2 border-[var(--border)] shadow-[0_40px_80px_-20px_rgb(0,0,0,0.5)] pointer-events-auto group focus-within:border-[var(--primary)] transition-all">
           <button className="w-14 h-14 bg-[var(--accent)] hover:bg-[var(--primary)]/10 rounded-2xl transition-all text-[var(--muted)] hover:text-[var(--primary)] active:scale-90 flex items-center justify-center shadow-lg group-focus-within:border-[var(--primary)]/30 border border-transparent">
             <Paperclip className="w-6 h-6" />
           </button>
           <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Query neural network..."
              className="flex-1 bg-transparent border-none focus:outline-none font-black text-sm md:text-xl text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:opacity-30 uppercase tracking-tight"
            />
           <button 
             onClick={handleSend}
             disabled={isLoading}
             className="w-16 h-16 md:w-20 md:h-20 bg-[var(--primary)] text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-[var(--primary)]/40 hover:scale-105 active:scale-95 transition-all group-hover:shadow-[0_15px_30px_-10px_var(--primary)]/60"
           >
             <Send className="w-7 h-7" />
           </button>
        </div>
      </div>
    </div>
  );
};
