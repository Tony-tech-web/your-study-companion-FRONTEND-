import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  Search, 
  MessageSquare, 
  Newspaper, 
  Trophy,
  Search as SearchIcon
} from 'lucide-react';
import { Screen } from '../types';
import { cn } from '../lib/utils';

export const Sidebar = ({ currentScreen, setScreen }: { currentScreen: Screen; setScreen: (s: Screen) => void }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'bg-blue-600/10 text-blue-600' },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles, color: 'bg-indigo-600/10 text-indigo-600' },
    { id: 'gpa', label: 'GPA', icon: GraduationCap, color: 'bg-emerald-600/10 text-emerald-600' },
    { id: 'planner', label: 'Planner', icon: Calendar, color: 'bg-violet-600/10 text-violet-600' },
    { id: 'courses', label: 'Courses', icon: BookOpen, color: 'bg-amber-600/10 text-amber-600' },
    { id: 'research', label: 'Research', icon: Search, color: 'bg-rose-600/10 text-rose-600' },
    { id: 'chat', label: 'Chat', icon: MessageSquare, color: 'bg-teal-600/10 text-teal-600' },
    { id: 'news', label: 'News', icon: Newspaper, color: 'bg-sky-600/10 text-sky-600' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, color: 'bg-fuchsia-600/10 text-fuchsia-600' },
  ] as const;

  return (
    <div className="w-64 border-r border-slate-200 h-screen bg-white flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
           <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <span className="text-xl font-bold text-slate-900 tracking-tight">StratoCore</span>
      </div>

      <div className="relative mb-8 group">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
        <input 
          placeholder="Search..." 
          className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-600 focus:outline-none focus:border-blue-600 transition-all"
        />
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setScreen(item.id)}
            className={cn(
              "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
              currentScreen === item.id 
                ? "bg-blue-50 text-blue-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
              item.color
            )}>
              <item.icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
