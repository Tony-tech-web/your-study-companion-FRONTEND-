import React from 'react';
import { Card, Button, Input, Badge } from '../components/UI';
import { Upload, Search, MoreHorizontal, FileText, Trash2, Wand2 } from 'lucide-react';
import { mockDocuments } from '../mockData';
import { cn } from '../lib/utils';

export const Courses = () => {
  return (
    <div className="flex-1 p-6 md:p-10 bg-[var(--background)] text-[var(--foreground)] overflow-y-auto custom-scrollbar pb-32 lg:pb-10">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">Archives & Assets</h1>
          <p className="text-[var(--muted)] text-xs font-black uppercase tracking-[0.2em] mt-3 opacity-60">Library Node: <span className="text-[var(--primary)] font-black">Data_Vault_Alpha</span></p>
        </div>
        <div className="relative group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)] opacity-50 group-focus-within:text-[var(--primary)] transition-colors" />
           <input 
             placeholder="Search global vault..." 
             className="w-full md:w-80 bg-[var(--card)] border border-[var(--border)] rounded-2xl pl-12 pr-4 py-4 text-sm font-black text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:opacity-30 focus:outline-none focus:border-[var(--primary)] transition-all shadow-sm"
           />
        </div>
      </header>

      {/* Upload Zone */}
      <div className="mb-12 border-2 border-dashed border-[var(--border)] rounded-[2.5rem] p-12 flex flex-col items-center justify-center bg-[var(--card)]/50 backdrop-blur-sm shadow-xl group hover:border-[var(--primary)] transition-all cursor-pointer relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="w-20 h-20 rounded-[1.5rem] bg-[var(--card)] border border-[var(--border)] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg group-hover:border-[var(--primary)]">
          <Upload className="w-8 h-8 text-[var(--muted)] group-hover:text-[var(--primary)]" />
        </div>
        <h3 className="text-xl md:text-2xl font-black mb-3 text-[var(--foreground)] uppercase tracking-tight">Deposit neural data or PDFs here</h3>
        <p className="text-[var(--muted)] text-xs font-black uppercase tracking-widest opacity-60">LINK BANDWIDTH: 50MB / SEC</p>
      </div>

      <Card className="p-0 overflow-hidden border-[var(--border)]">
        <div className="p-8 border-b border-[var(--border)] flex items-center justify-between bg-[var(--accent)]/30">
          <h2 className="text-xl font-black uppercase tracking-tighter">Manifest Index</h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 md:pb-0">
            {['All', 'Math', 'Science', 'History', 'Link'].map(cat => (
              <Badge key={cat} className={cn(
                "cursor-pointer font-black text-[9px] px-4 py-2 uppercase tracking-widest transition-all rounded-lg",
                cat === 'All' ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20" : "bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--primary)]"
              )}>
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {mockDocuments.map((doc) => (
            <div key={doc.id} className="grid grid-cols-12 px-8 py-6 items-center hover:bg-[var(--accent)]/20 transition-all group cursor-pointer">
              <div className="col-span-8 md:col-span-6 flex items-center gap-6">
                <div className={cn(
                  "w-12 h-12 rounded-[1rem] flex items-center justify-center shadow-md border transition-all group-hover:scale-110",
                  doc.category === 'Math' ? "bg-blue-500/10 border-blue-500/20 text-blue-500" :
                  doc.category === 'Science' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                  doc.category === 'History' ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                  "bg-[var(--primary)]/10 border-[var(--primary)]/20 text-[var(--primary)]"
                )}>
                  <BookOpenIcon category={doc.category} />
                </div>
                <div>
                   <h4 className="text-sm font-black text-[var(--foreground)] uppercase tracking-tight group-hover:text-[var(--primary)] transition-colors">{doc.name}</h4>
                   <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest opacity-60">Sync Date: {doc.uploadedAt}</span>
                </div>
              </div>
              <div className="col-span-2 hidden md:flex items-center justify-center">
                 <Badge className="bg-[var(--input)] text-[var(--muted)] font-black text-[10px] uppercase tracking-widest border-none">{doc.size}</Badge>
              </div>
              <div className="col-span-4 md:col-span-4 flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">Initialize</Button>
                <button className="p-3 bg-[var(--input)] text-[var(--muted)] rounded-xl hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const BookOpenIcon = ({ category }: { category: string }) => {
  const icons: Record<string, React.ReactNode> = {
    Math: <div className="text-lg">∑</div>,
    Science: <div className="text-lg">⌬</div>,
    History: <div className="text-lg">📜</div>,
    Literature: <div className="text-lg">📖</div>,
  };
  return icons[category] || <FileText className="w-5 h-5" />;
};
