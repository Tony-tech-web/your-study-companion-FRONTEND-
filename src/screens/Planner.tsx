import React, { useState } from 'react';
import { Card, Badge, Button } from '../components/UI';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Calendar as CalendarIcon, Clock, ChevronRight, Filter, Plus } from 'lucide-react';

const mockEvents = [
  { id: '1', time: '09:00 AM', title: 'Advanced Calculus', type: 'Lecture', duration: '1.5h', status: 'completed' },
  { id: '2', time: '11:00 AM', title: 'Neural Systems', type: 'Lab', duration: '2h', status: 'upcoming' },
  { id: '3', time: '02:30 PM', title: 'Ethics in AI', type: 'Seminar', duration: '1h', status: 'upcoming' },
  { id: '4', time: '04:00 PM', title: 'Library Session', type: 'Self Study', duration: '3h', status: 'upcoming' },
];

export const Planner = () => {
  const [selectedDay, setSelectedDay] = useState(19);

  return (
    <div className="flex-1 flex flex-col bg-[var(--background)] p-6 md:p-10 overflow-hidden">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">Chronos Stack</h1>
          <p className="text-[var(--muted)] text-xs font-black uppercase tracking-[0.2em] mt-3 opacity-60">Temporal Node: <span className="text-[var(--primary)] font-black">2026.04.19</span></p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 shadow-xl shadow-[var(--primary)]/20">
            <Plus className="w-5 h-5" />
            Append Event
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row gap-8 overflow-hidden">
        {/* Calendar Strip */}
        <div className="w-full md:w-32 flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto pb-4 md:pb-0 scrollbar-hide">
          {[...Array(7)].map((_, i) => {
            const day = 17 + i;
            const isActive = selectedDay === day;
            return (
              <motion.button
                key={day}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "min-w-[70px] md:min-w-0 md:w-full aspect-square md:h-28 rounded-3xl flex flex-col items-center justify-center transition-all border-2",
                  isActive 
                    ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-2xl shadow-[var(--primary)]/30" 
                    : "bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--primary)]/50"
                )}
              >
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][i]}</span>
                <span className="text-2xl md:text-3xl font-black">{day}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Timeline Content */}
        <Card className="flex-1 overflow-hidden flex flex-col p-0">
          <div className="p-8 border-b border-[var(--border)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
               <CalendarIcon className="w-6 h-6 text-[var(--primary)]" />
               <span className="text-xl font-black uppercase tracking-tighter">Timeline Sequence</span>
            </div>
            <button className="text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar pb-32 md:pb-8">
            {mockEvents.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group flex gap-8 relative"
              >
                <div className="w-20 pt-1 shrink-0">
                  <span className="text-xs font-black text-[var(--foreground)] opacity-80">{event.time}</span>
                  <div className="text-[10px] font-bold text-[var(--muted)] mt-1">{event.duration}</div>
                </div>

                <div className="relative flex-1">
                  {/* Vertical Line Connector */}
                  {idx !== mockEvents.length - 1 && (
                    <div className="absolute left-[-2rem] top-8 bottom-[-1.5rem] w-0.5 bg-[var(--border)] opacity-30" />
                  )}
                  {/* Node Dot */}
                  <div className={cn(
                    "absolute left-[-2.3rem] top-2 w-3 h-3 rounded-full border-2 bg-[var(--card)] z-10",
                    event.status === 'completed' ? "border-[var(--primary)] bg-[var(--primary)]" : "border-[var(--border)]"
                  )} />

                  <div className={cn(
                     "p-6 rounded-[2rem] border transition-all hover:translate-x-2 cursor-pointer",
                     event.status === 'completed' 
                       ? "bg-[var(--accent)]/30 border-[var(--border)]" 
                       : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)] shadow-md"
                  )}>
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge className={cn(
                          "mb-3 font-black text-[9px] tracking-[0.2em] uppercase py-1 px-3 rounded-lg",
                          event.type === 'Lecture' ? "bg-blue-500/10 text-blue-500" :
                          event.type === 'Lab' ? "bg-amber-500/10 text-amber-500" :
                          "bg-purple-500/10 text-purple-500"
                        )}>{event.type}</Badge>
                        <h3 className={cn(
                          "text-lg font-black tracking-tight uppercase",
                          event.status === 'completed' ? "opacity-40 line-through" : ""
                        )}>{event.title}</h3>
                      </div>
                      <ChevronRight className={cn(
                         "w-6 h-6 text-[var(--muted)] group-hover:text-[var(--primary)] transition-all",
                         event.status === 'completed' ? "opacity-20" : ""
                      )} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
