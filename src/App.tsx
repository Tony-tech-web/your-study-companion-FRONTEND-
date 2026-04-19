import React, { useState } from 'react';
import { Sidebar } from './components/Navigation';
import { Dashboard } from './screens/Dashboard';
import { AIAssistant } from './screens/AIAssistant';
import { GPA } from './screens/GPA';
import { Courses } from './screens/Courses';
import { Research } from './screens/Research';
import { News } from './screens/News';
import { Leaderboard } from './screens/Leaderboard';
import { Login } from './screens/Login';
import { SystemStatusOverlay } from './components/SystemStatusOverlay';
import { Screen } from './types';
import { Info, Loader2 } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { session, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [showStatus, setShowStatus] = useState(false);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard': return <Dashboard />;
      case 'ai-assistant': return <AIAssistant />;
      case 'gpa': return <GPA />;
      case 'courses': return <Courses />;
      case 'research': return <Research />;
      case 'news': return <News />;
      case 'leaderboard': return <Leaderboard />;
      case 'planner': return <GPA />; // Planner is integrated in GPA screen for this design
      case 'chat': return <AIAssistant />; // Chat redirected to AI Assistant for now
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600/30">
      <Sidebar currentScreen={currentScreen} setScreen={setCurrentScreen} />
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {renderScreen()}
        
        <button 
          onClick={() => setShowStatus(true)}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-600/50 transition-all shadow-lg z-40 group"
        >
          <Info className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      </main>

      {showStatus && <SystemStatusOverlay onClose={() => setShowStatus(false)} />}
    </div>
  );
}
