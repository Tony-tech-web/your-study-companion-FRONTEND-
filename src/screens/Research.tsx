import React from 'react';
import { Card, Button, Input, Badge } from '../components/UI';
import { Search, Copy, Save } from 'lucide-react';
import { mockResearchPapers } from '../mockData';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const Research = () => {
  return (
    <div className="flex-1 p-6 md:p-10 bg-[var(--background)] text-[var(--foreground)] overflow-hidden flex flex-col custom-scrollbar pb-32 lg:pb-10">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">Research Nexus</h1>
          <p className="text-[var(--muted)] text-xs font-black uppercase tracking-[0.2em] mt-3 opacity-60">Scholarly Node: <span className="text-[var(--primary)] font-black">Archive_Indexer_7</span></p>
        </div>
        <div className="flex items-center gap-3">
           <Badge className="bg-[var(--accent)] text-[var(--primary)] border-[var(--border)] font-black text-[10px] tracking-widest py-2 px-4 rounded-xl">2.4M DOCUMENTS SYNCED</Badge>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-8 overflow-hidden">
        {/* Search Results */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8 overflow-hidden">
          <Card className="flex-1 flex flex-col p-0 overflow-hidden border-[var(--border)] group hover:border-[var(--primary)]/30 transition-all">
            <div className="p-8 border-b border-[var(--border)] bg-[var(--accent)]/30 shrink-0">
              <div className="relative group/search mb-6">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)] opacity-50 group-focus-within/search:text-[var(--primary)] transition-colors" />
                <input 
                  placeholder="Query global scholarly archives..." 
                  className="w-full bg-[var(--input)] border border-[var(--border)] rounded-[1.5rem] pl-14 pr-6 py-5 text-sm md:text-base font-black text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:opacity-30 focus:outline-none focus:border-[var(--primary)] transition-all shadow-sm" 
                />
              </div>
              
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {['Global', 'Peer-reviewed', 'Dataset', 'Thesis', 'Alpha'].map(cat => (
                  <Badge key={cat} className={cn(
                    "cursor-pointer font-black text-[9px] px-5 py-2.5 uppercase tracking-widest transition-all rounded-xl",
                    cat === 'Global' ? "bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/20" : "bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--primary)]"
                  )}>
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar pb-32">
              {mockResearchPapers.map((paper, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={paper.id} 
                  className="p-8 rounded-[2rem] bg-[var(--input)] border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--accent)]/10 transition-all group/card cursor-pointer shadow-sm relative overflow-hidden"
                >
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-[var(--primary)] translate-x-full group-hover/card:translate-x-0 transition-transform" />
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-tight group-hover/card:text-[var(--primary)] transition-colors">{paper.title}</h3>
                    <div className="w-10 h-10 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center shrink-0 group-hover/card:border-[var(--primary)] transition-all text-[var(--muted)] group-hover/card:text-[var(--primary)]">
                       <Plus className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest opacity-60 mb-6">AUTHORS: {paper.authors.join(', ')}</p>
                  <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]/50">
                    <div className="flex gap-2">
                       <Badge className="bg-[var(--card)] text-[var(--muted)] border-[var(--border)] font-black text-[10px] tracking-widest uppercase">{paper.year}</Badge>
                       <Badge className="bg-[var(--card)] text-[var(--primary)] border-[var(--border)] font-black text-[10px] tracking-widest uppercase">SYMPOSIUM</Badge>
                    </div>
                    <Button className="h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest">Access Node</Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Citation Sidebar */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <Card className="hover:border-[var(--primary)] transition-all shadow-xl">
             <div className="flex items-center gap-4 mb-10 text-[var(--primary)]">
                <div className="w-12 h-12 rounded-2xl bg-[var(--accent)] flex items-center justify-center">
                   <Copy className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black tracking-tighter uppercase text-[var(--foreground)]">Citations</h2>
             </div>

             <div className="space-y-8">
                <div>
                    <h4 className="text-[10px] font-black text-[var(--muted)] mb-4 uppercase tracking-[0.2em] opacity-60 px-1">Selected Abstract</h4>
                    <p className="text-xs text-[var(--foreground)] leading-relaxed font-black uppercase tracking-tight bg-[var(--input)] p-6 rounded-[1.5rem] border border-[var(--border)] shadow-inner opacity-80">
                        "Modern approaches to educational technology utilize various machine learning models to improve student outcomes and individualize learning paths at scale..."
                    </p>
                </div>

                <div>
                    <h4 className="text-[10px] font-black text-[var(--muted)] mb-4 uppercase tracking-[0.2em] opacity-60 px-1">Transmit Format</h4>
                    <div className="grid grid-cols-3 bg-[var(--input)] rounded-2xl p-2 border border-[var(--border)] shadow-sm">
                        {['APA', 'MLA', 'CHI'].map(format => (
                            <button key={format} className={cn(
                                "py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                format === 'APA' ? "bg-[var(--primary)] text-white shadow-lg" : "text-[var(--muted)] hover:text-[var(--foreground)]"
                            )}>{format}</button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 pt-6">
                    <Button className="w-full h-14 rounded-2xl shadow-xl shadow-[var(--primary)]/20 font-black tracking-[0.2em] text-xs">
                       Transmit Citation
                    </Button>
                    <Button variant="outline" className="w-full h-14 rounded-2xl border-[var(--border)] text-[var(--muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] font-black tracking-[0.2em] text-xs">
                       Archive to Bundle
                    </Button>
                </div>
             </div>
          </Card>
          
          <Card className="bg-[var(--accent)]/30 border-dashed border-[var(--border)] flex flex-col items-center justify-center py-10 opacity-60 hover:opacity-100 transition-opacity">
             <Save className="w-8 h-8 text-[var(--muted)] mb-4" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted)]">Project Vault Offline</span>
          </Card>
        </div>
      </div>
    </div>
  );
};
