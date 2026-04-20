import React, { useEffect, useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Paperclip, MessageSquare, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { Card, Button, Badge } from '../components/UI';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { getAIConversations, saveAIConversation, clearAIConversations, AIConversationEntry } from '../services/ai';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "" });

export const AIAssistant = () => {
  const [messages, setMessages] = useState<AIConversationEntry[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const history = await getAIConversations();
      if (history.length === 0) {
        setMessages([{ 
          id: 'initial', 
          role: 'assistant', 
          content: "Neural Link established. I am your academic core. How shall we optimize your learning cycle today?",
          created_at: new Date().toISOString()
        }]);
      } else {
        setMessages(history);
      }
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
      // Save user message to backend
      const userMsg = await saveAIConversation('user', userInput);
      setMessages(prev => [...prev, userMsg]);

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userInput,
        config: {
            systemInstruction: "You are a professional academic assistant in a futuristic student hub. Your tone is technical, supportive, and efficient. Use academic terminology where appropriate. Keep responses relatively concise but high-value."
        }
      });
      const text = response.text;

      // Save assistant message to backend
      const assistantMsg = await saveAIConversation('assistant', text || "Neural link sync failed.");
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
        content: "Logs purged. Neural Link re-established. Standing by.",
        created_at: new Date().toISOString()
      }]);
    } catch (err) {
      alert('Failed to clear logs');
    }
  };

  if (isFetching) {
    return (
      <div className="flex-1 flex items-center justify-center bg-(--background)">
        <Loader2 className="w-10 h-10 text-(--primary) animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-(--background) text-(--foreground) h-full overflow-hidden relative">
      <header className="p-8 md:p-10 border-b border-(--border) bg-(--card)/50 backdrop-blur-2xl flex items-center justify-between shrink-0 z-20">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">Neural Link</h1>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-2 h-2 rounded-full bg-(--primary) animate-pulse shadow-[0_0_10px_var(--primary)]" />
            <span className="text-[10px] font-black text-(--primary) uppercase tracking-[0.3em] opacity-80">Sync: Real-Time</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={handleClear}
             className="p-3 text-(--muted) hover:text-red-500 transition-colors opacity-60 hover:opacity-100"
             title="Clear History"
           >
             <Trash2 className="w-5 h-5" />
           </button>
           <Badge className="hidden md:flex bg-(--accent) text-(--muted) border-(--border) font-black text-[10px] tracking-widest px-6 py-3 rounded-2xl uppercase">Session: Beta_0.4</Badge>
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
                  "w-12 h-12 md:w-16 md:h-16 rounded-3xl flex items-center justify-center shrink-0 mt-1 shadow-2xl relative overflow-hidden group",
                  msg.role === 'user' 
                    ? "bg-(--primary) text-white" 
                    : "bg-(--card) border border-(--border) text-(--primary)"
                )}>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {msg.role === 'user' ? (
                     <div className="w-6 h-6 rounded-lg border-4 border-white/80" />
                  ) : (
                     <Sparkles className="w-7 h-7 drop-shadow-[0_0_10px_var(--primary)]" />
                  )}
                </div>
                <div className={cn(
                  "p-8 md:p-10 rounded-5xl text-sm md:text-lg leading-relaxed shadow-2xl border transition-all",
                  msg.role === 'user' 
                    ? "bg-(--primary) text-white border-(--primary) rounded-tr-none hover:shadow-[0_20px_40px_-15px_var(--primary)]/40" 
                    : "bg-(--card) border border-(--border) text-(--foreground) rounded-tl-none font-black uppercase tracking-tight whitespace-pre-wrap opacity-90 hover:opacity-100"
                )}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-6 md:gap-8">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-3xl bg-(--card) border border-(--border) flex items-center justify-center shadow-xl">
                <Sparkles className="w-6 h-6 text-(--primary) animate-pulse" />
              </div>
              <div className="p-8 rounded-[2.5rem] rounded-tl-none bg-(--card)/50 border border-(--border) flex gap-3 items-center shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-(--primary) animate-bounce shadow-[0_0_8px_var(--primary)]" />
                <div className="w-2.5 h-2.5 rounded-full bg-(--primary) animate-bounce [animation-delay:0.2s] shadow-[0_0_8px_var(--primary)]" />
                <div className="w-2.5 h-2.5 rounded-full bg-(--primary) animate-bounce [animation-delay:0.4s] shadow-[0_0_8px_var(--primary)]" />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 pointer-events-none pb-24 md:pb-12 z-30">
        <div className="max-w-5xl mx-auto w-full flex items-center gap-6 bg-(--card)/80 backdrop-blur-3xl p-4 md:p-6 rounded-6xl border-2 border-(--border) shadow-[0_40px_80px_-20px_rgb(0,0,0,0.5)] pointer-events-auto group focus-within:border-(--primary) transition-all">
           <button className="w-14 h-14 bg-(--accent) hover:bg-(--primary)/10 rounded-2xl transition-all text-(--muted) hover:text-(--primary) active:scale-90 flex items-center justify-center shadow-lg group-focus-within:border-(--primary)/30 border border-transparent">
             <Paperclip className="w-6 h-6" />
           </button>
           <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Query neural network..."
              className="flex-1 bg-transparent border-none focus:outline-none font-black text-sm md:text-xl text-foreground placeholder:text-muted-foreground placeholder:opacity-30 uppercase tracking-tight"
            />
           <button 
             onClick={handleSend}
             disabled={isLoading}
             className="w-16 h-16 md:w-20 md:h-20 bg-primary text-white rounded-4xl flex items-center justify-center shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all group-hover:shadow-primary/40"
           >
             <Send className="w-7 h-7" />
           </button>
        </div>
      </div>
    </div>
  );
};
