import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Paperclip, MessageSquare, Sparkles } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'user', content: "Can you help me understand quadratic equations?" },
    { id: '2', role: 'assistant', content: "Sure, Aman! A quadratic equation is a polynomial equation of degree 2. The standard form is ax² + bx + c = 0. Would you like me to walk you through an example?" },
    { id: '3', role: 'user', content: "Can you help me understand quadratic equations?" },
    { id: '4', role: 'assistant', content: "Hell, there's non quadratic equation takignnion is a polynomial equation." },
    { id: '5', role: 'user', content: "Can you help me understand quadratic equation?" }
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
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: input,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || "I'm sorry, I couldn't generate a response.",
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Gemini Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-black text-white p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Good morning, Aman</h1>
      </header>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4 max-w-[80%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1",
                  msg.role === 'user' ? "bg-orange-500/20 text-orange-500" : "bg-blue-500/20 text-blue-400"
                )}>
                  {msg.role === 'user' ? (
                     <div className="w-5 h-5 rounded-md border-2 border-orange-500" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <div className={cn(
                  "p-5 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-[#3D2317] border border-orange-950 text-orange-200" 
                    : "bg-[#1A1A1A] border border-[#2A2A2A] text-gray-300"
                )}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-orange-500 animate-pulse" />
              </div>
              <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" />
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-auto pt-6">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button className="text-gray-500 hover:text-gray-300 transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
            </div>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl py-4 pl-14 pr-24 focus:outline-none focus:border-[#FF6B2C] text-gray-200"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Button onClick={handleSend} className="h-10 px-6 font-bold" disabled={isLoading}>
                Send
                <span className="ml-2 text-lg">›</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
