import React, { useState } from 'react';
import { Card, Input, Button } from '../components/UI';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Send, Phone, Video, Search, Info, Users, Circle } from 'lucide-react';

const mockChats = [
  { id: '1', user: 'Physics Study Group', lastMsg: 'Did anyone solve q4?', time: '2m ago', unread: 3, avatar: 'P' },
  { id: '2', user: 'Sarah Miller', lastMsg: 'See you at the library!', time: '1h ago', unread: 0, avatar: 'S' },
  { id: '3', user: 'CS 101', lastMsg: 'The server is up now.', time: '3h ago', unread: 0, avatar: 'C' },
];

const mockMessages = [
  { id: '1', role: 'other', user: 'Sarah', content: "Hey! Are we still meeting for the study group?", time: '10:30 AM' },
  { id: '2', role: 'me', content: "Yes! I'll be there in 15 minutes.", time: '10:32 AM' },
  { id: '3', role: 'other', user: 'Michael', content: "I'm already here at the third floor. I reserved a pod.", time: '10:35 AM' },
  { id: '4', role: 'other', user: 'Sarah', content: "Great! @Aman make sure to bring the neuro-link notes.", time: '10:36 AM' },
];

export const Chat = () => {
  const [input, setInput] = useState('');

  return (
    <div className="flex-1 flex bg-[var(--background)] overflow-hidden">
      {/* Sidebar List */}
      <div className="w-80 border-r border-[var(--border)] flex flex-col bg-[var(--card)]/50 hidden md:flex shrink-0">
        <header className="p-8 pb-4 shrink-0">
          <h2 className="text-2xl font-black tracking-tighter uppercase">Messages</h2>
          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input 
              placeholder="Search conversations..." 
              className="w-full bg-[var(--input)] border border-[var(--border)] rounded-2xl pl-12 pr-4 py-3 text-xs font-bold focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {mockChats.map((chat) => (
            <div 
              key={chat.id} 
              className={cn(
                "p-4 rounded-3xl flex items-center gap-4 cursor-pointer transition-all border-2",
                chat.id === '1' ? "bg-[var(--accent)] border-[var(--primary)]/30 shadow-lg" : "border-transparent hover:bg-[var(--accent)]/30"
              )}
            >
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/20 text-[var(--primary)] flex items-center justify-center font-black shadow-inner">
                {chat.avatar}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className="font-black text-xs uppercase tracking-tight text-[var(--foreground)] truncate">{chat.user}</h3>
                  <span className="text-[10px] font-bold text-[var(--muted)] opacity-60 text-[10px]">{chat.time}</span>
                </div>
                <p className="text-xs text-[var(--muted)] truncate font-medium">{chat.lastMsg}</p>
              </div>
              {chat.unread > 0 && (
                <div className="w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                  {chat.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative h-full">
        <header className="h-24 px-6 md:px-10 border-b border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-xl flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center font-black md:hidden">P</div>
             <div>
               <h3 className="font-black text-lg md:text-xl uppercase tracking-tighter">Physics Study Group</h3>
               <div className="flex items-center gap-2 mt-0.5">
                  <Circle className="w-2 h-2 fill-[var(--primary)] text-[var(--primary)] animate-pulse" />
                  <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest leading-none">12 Nodes Online</span>
               </div>
             </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-3 hover:bg-[var(--accent)]/50 rounded-xl transition-all text-[var(--muted)] hover:text-[var(--primary)]"><Phone className="w-5 h-5" /></button>
            <button className="p-3 hover:bg-[var(--accent)]/50 rounded-xl transition-all text-[var(--muted)] hover:text-[var(--primary)]"><Video className="w-5 h-5" /></button>
            <button className="p-3 hover:bg-[var(--accent)]/50 rounded-xl transition-all text-[var(--muted)] hover:text-[var(--primary)]"><Info className="w-5 h-5" /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 pb-32 custom-scrollbar">
          {mockMessages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex flex-col max-w-[80%] md:max-w-[70%]",
                msg.role === 'me' ? "ml-auto items-end" : "items-start"
              )}
            >
              {msg.role === 'other' && (
                <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-2 ml-4 opacity-60">{msg.user}</span>
              )}
              <div className={cn(
                "p-5 rounded-[2rem] text-sm md:text-base leading-relaxed shadow-xl",
                msg.role === 'me' 
                  ? "bg-[var(--primary)] text-white rounded-tr-none" 
                  : "bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-tl-none font-medium shadow-sm hover:border-[var(--primary)]/30 transition-all"
              )}>
                {msg.content}
              </div>
              <span className="text-[10px] font-bold text-[var(--muted)] mt-2 mx-4 opacity-40 uppercase tracking-tighter">{msg.time}</span>
            </motion.div>
          ))}
        </div>

        {/* Input Bar Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 pointer-events-none pb-28 md:pb-10 z-20">
          <div className="max-w-4xl mx-auto w-full flex items-center gap-4 bg-[var(--card)]/90 backdrop-blur-2xl p-3 rounded-[2.5rem] border-2 border-[var(--border)] shadow-[0_30px_60px_-12px_rgb(0,0,0,0.3)] pointer-events-auto hover:border-[var(--primary)] transition-all">
             <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Transmit data..."
                className="flex-1 bg-transparent border-none focus:outline-none font-black text-sm md:text-base text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:opacity-30 px-6"
              />
             <button className="w-14 h-14 bg-[var(--primary)] text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-[var(--primary)]/30 hover:scale-105 active:scale-95 transition-all">
               <Send className="w-6 h-6" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
