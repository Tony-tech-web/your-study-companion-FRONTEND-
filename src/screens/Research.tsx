import React from 'react';
import { Card, Button, Input, Badge } from '../components/UI';
import { Search, Copy, Save } from 'lucide-react';
import { mockResearchPapers } from '../mockData';
import { cn } from '../lib/utils';

export const Research = () => {
  return (
    <div className="flex-1 p-8 bg-slate-50 text-slate-900 overflow-hidden flex flex-col">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Research & Scholarly Articles</h1>
        <p className="text-slate-500 text-sm">Access journals, publications, and citation tools</p>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        {/* Search Results */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 overflow-hidden">
          <Card title="Search Results" className="flex flex-col">
            <div className="mb-6 relative group">
              <Input placeholder="Search scholarly articles and journals..." className="pl-12 h-12 bg-slate-50" />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
            
            <div className="flex gap-2 mb-6">
              <Badge className="bg-blue-600 text-white shadow-sm cursor-pointer font-bold">All</Badge>
              <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer font-bold">Peer-reviewed</Badge>
              <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer font-bold uppercase tracking-tighter">Year</Badge>
              <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer font-bold uppercase tracking-tighter">Subject</Badge>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {mockResearchPapers.map((paper) => (
                <div key={paper.id} className="p-6 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:bg-slate-50/50 transition-all shadow-sm group">
                  <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{paper.title}</h3>
                  <p className="text-sm font-medium text-slate-500">Authors: {paper.authors.join(', ')}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md uppercase tracking-widest">{paper.year}</span>
                    <Button variant="outline" className="text-xs h-9 font-bold px-4">Add to Citations</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Citation Sidebar */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Citations</h2>
          <Card title="Citation Preview">
             <div className="space-y-6">
                <div>
                    <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">Selected Abstract</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                        Modern approaches to educational technology utilize various machine learning models to improve student outcomes and individualize learning paths at scale...
                    </p>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest px-1">Format Output</h4>
                    <div className="grid grid-cols-3 bg-slate-100 rounded-xl p-1.5 border border-slate-200">
                        {['APA', 'MLA', 'Chicago'].map(format => (
                            <button key={format} className={cn(
                                "py-2.5 text-xs font-black rounded-lg transition-all",
                                format === 'APA' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                            )}>{format}</button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                    <Button variant="primary" className="w-full h-12 shadow-md">
                        <Copy className="w-4 h-4" />
                        Copy Full Citation
                    </Button>
                    <Button variant="outline" className="w-full h-12">
                        <Save className="w-4 h-4" />
                        Save to Project Bundle
                    </Button>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
