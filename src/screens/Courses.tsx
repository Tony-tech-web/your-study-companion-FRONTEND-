import React from 'react';
import { Card, Button, Input, Badge } from '../components/UI';
import { Upload, Search, MoreHorizontal, FileText, Trash2, Wand2 } from 'lucide-react';
import { mockDocuments } from '../mockData';
import { cn } from '../lib/utils';

export const Courses = () => {
  return (
    <div className="flex-1 p-8 bg-slate-50 text-slate-900 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Good morning, Aman</h1>
        <p className="text-slate-500 text-sm">Manage your course documents and research materials</p>
      </header>

      {/* Upload Zone */}
      <div className="mb-8 border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center bg-white shadow-sm group hover:border-blue-400/50 transition-all cursor-pointer">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-600" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-slate-800">Drag & drop PDFs here or click to upload files</h3>
        <p className="text-slate-500 text-sm font-medium">Supported formats: PDF, DOCX, PPTX. Max size: 50MB.</p>
      </div>

      <Card title="Document List">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 max-w-sm relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <Input placeholder="Search documents..." className="pl-12" />
          </div>
          <div className="flex gap-2">
            {['All', 'Math', 'Science', 'History', 'Literature'].map(cat => (
              <Badge key={cat} className={cn(
                "cursor-pointer font-bold transition-all",
                cat === 'All' ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              )}>
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <div className="grid grid-cols-12 px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <div className="col-span-6">My Documents</div>
            <div className="col-span-3">Uploaded</div>
            <div className="col-span-2 text-center">Size</div>
            <div className="col-span-1" />
          </div>
          {mockDocuments.map((doc) => (
            <div key={doc.id} className="grid grid-cols-12 px-4 py-4 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all group">
              <div className="col-span-6 flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                  doc.category === 'Math' ? "bg-blue-50 text-blue-600 border border-blue-100" :
                  doc.category === 'Science' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                  doc.category === 'History' ? "bg-rose-50 text-rose-600 border border-rose-100" :
                  "bg-amber-50 text-amber-600 border border-amber-100"
                )}>
                  <BookOpenIcon category={doc.category} />
                </div>
                <span className="text-sm font-bold text-slate-700">{doc.name}</span>
              </div>
              <div className="col-span-3 flex items-center text-sm text-slate-500 font-medium">{doc.uploadedAt}</div>
              <div className="col-span-2 flex items-center justify-center text-sm text-slate-500 font-medium">{doc.size}</div>
              <div className="col-span-1 flex items-center justify-end relative">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                   <div className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 rounded-lg cursor-pointer text-slate-400 hover:text-slate-900 transition-all">
                      <MoreHorizontal className="w-4 h-4" />
                   </div>
                </div>
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
