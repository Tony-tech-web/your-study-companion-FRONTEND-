import React, { useEffect, useState } from 'react';
import { Card, Button, Input, Badge } from '../components/UI';
import { Search, Copy, Save, Plus, Loader2, Trash2 } from 'lucide-react';
import { getResearchHistory, deleteResearchEntry } from '../services/research';
import { ResearchPaper } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const Research = () => {
  const [history, setHistory] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await getResearchHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch research history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this research entry?')) return;
    try {
      await deleteResearchEntry(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert('Failed to delete entry');
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
    <div className="flex-1 p-6 md:p-10 bg-[var(--background)] text-[var(--foreground)] overflow-y-auto flex flex-col custom-scrollbar pb-32 lg:pb-10">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">Research Nexus</h1>
          <p className="text-(--muted) text-xs font-black uppercase tracking-[0.2em] mt-3 opacity-60">Scholarly Node: <span className="text-(--primary) font-black">Archive_Indexer_7</span></p>
        </div>
        <div className="flex items-center gap-3">
           <Badge className="bg-(--accent) text-(--primary) border-(--border) font-black text-[10px] tracking-widest py-2 px-4 rounded-xl">SYNC: REAL-TIME</Badge>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-8 overflow-hidden">
        {/* Search Results */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8 overflow-hidden">
          <Card className="flex-1 flex flex-col p-0 overflow-hidden border-(--border) group hover:border-(--primary)/30 transition-all">
            <div className="p-8 border-b border-(--border) bg-(--accent)/30 shrink-0">
              <div className="relative group/search mb-6">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-(--muted) opacity-50 group-focus-within/search:text-(--primary) transition-colors" />
                <input 
                  placeholder="Query global scholarly archives..." 
                  className="w-full bg-(--input) border border-(--border) rounded-3xl pl-14 pr-6 py-5 text-sm md:text-base font-black text-(--foreground) placeholder:text-(--muted) placeholder:opacity-30 focus:outline-none focus:border-(--primary) transition-all shadow-sm" 
                />
              </div>
              
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {['Global', 'Peer-reviewed', 'Dataset', 'Thesis', 'Alpha'].map(cat => (
                  <Badge key={cat} className={cn(
                    "cursor-pointer font-black text-[9px] px-5 py-2.5 uppercase tracking-widest transition-all rounded-xl",
                    cat === 'Global' ? "bg-(--primary) text-white shadow-xl shadow-(--primary)/20" : "bg-(--card) text-(--muted) border-(--border) hover:border-(--primary)"
                  )}>
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar pb-32">
              {history.map((paper, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={paper.id} 
                  className="p-8 rounded-4xl bg-(--input) border border-(--border) hover:border-(--primary) hover:bg-(--accent)/10 transition-all group/card cursor-pointer shadow-sm relative overflow-hidden"
                >
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-(--primary) translate-x-full group-hover/card:translate-x-0 transition-transform" />
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-xl font-black text-(--foreground) tracking-tighter uppercase leading-tight group-hover/card:text-(--primary) transition-colors">{paper.title}</h3>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={(e) => { e.stopPropagation(); handleDelete(paper.id); }}
                         className="w-10 h-10 rounded-xl bg-(--card) border border-(--border) flex items-center justify-center shrink-0 hover:text-red-500 transition-all text-(--muted)"
                       >
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-(--muted) uppercase tracking-widest opacity-60 mb-6 line-clamp-2">{paper.abstract}</p>
                  <div className="flex items-center justify-between pt-6 border-t border-(--border)/50">
                    <div className="flex gap-2">
                       <Badge className="bg-(--card) text-(--muted) border-(--border) font-black text-[10px] tracking-widest uppercase">{paper.year}</Badge>
                       <Badge className="bg-(--card) text-(--primary) border-(--border) font-black text-[10px] tracking-widest uppercase">NODE: {paper.id.substring(0, 8)}</Badge>
                    </div>
                    <Button className="h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest">Access Node</Button>
                  </div>
                </motion.div>
              ))}
              {history.length === 0 && (
                <div className="py-20 text-center opacity-40">
                  <p className="text-[10px] font-black uppercase tracking-widest">No previous research logs detected</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Citation Sidebar */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <Card className="hover:border-(--primary) transition-all shadow-xl">
             <div className="flex items-center gap-4 mb-10 text-(--primary)">
                <div className="w-12 h-12 rounded-2xl bg-(--accent) flex items-center justify-center">
                   <Copy className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black tracking-tighter uppercase text-(--foreground)">Citations</h2>
             </div>

             <div className="space-y-8">
                <div>
                    <h4 className="text-[10px] font-black text-(--muted) mb-4 uppercase tracking-[0.2em] opacity-60 px-1">Selected Abstract</h4>
                    <p className="text-xs text-(--foreground) leading-relaxed font-black uppercase tracking-tight bg-(--input) p-6 rounded-3xl border border-(--border) shadow-inner opacity-80">
                        "Modern approaches to educational technology utilize various machine learning models to improve student outcomes and individualize learning paths at scale..."
                    </p>
                </div>

                <div>
                    <h4 className="text-[10px] font-black text-(--muted) mb-4 uppercase tracking-[0.2em] opacity-60 px-1">Transmit Format</h4>
                    <div className="grid grid-cols-3 bg-(--input) rounded-2xl p-2 border border-(--border) shadow-sm">
                        {['APA', 'MLA', 'CHI'].map(format => (
                            <button key={format} className={cn(
                                "py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                format === 'APA' ? "bg-(--primary) text-white shadow-lg" : "text-(--muted) hover:text-(--foreground)"
                            )}>{format}</button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 pt-6">
                    <Button className="w-full h-14 rounded-2xl shadow-xl shadow-(--primary)/20 font-black tracking-[0.2em] text-xs">
                       Transmit Citation
                    </Button>
                    <Button variant="outline" className="w-full h-14 rounded-2xl border-(--border) text-(--muted) hover:text-(--primary) hover:border-(--primary) font-black tracking-[0.2em] text-xs">
                       Archive to Bundle
                    </Button>
                </div>
             </div>
          </Card>
          
          <Card className="bg-(--accent)/30 border-dashed border-(--border) flex flex-col items-center justify-center py-10 opacity-60 hover:opacity-100 transition-opacity">
             <Save className="w-8 h-8 text-(--muted) mb-4" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-(--muted)">Project Vault Offline</span>
          </Card>
        </div>
      </div>
    </div>
  );
};
