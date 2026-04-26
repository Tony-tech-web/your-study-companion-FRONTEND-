'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Upload, Search, FileText, Trash2, Loader2, X, BookOpen, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface PDF { id: string; file_name: string; file_path: string; file_size: number | null; uploaded_at: string; }

const formatSize = (bytes: number | null) => {
  if (!bytes) return 'Unknown';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const Courses = () => {
  const { user } = useAuth();
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [query, setQuery] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchPdfs(); }, []);

  const fetchPdfs = async () => {
    try {
      const res = await api.get('/api/pdfs');
      setPdfs(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user?.id) return;
    setUploadError('');

    for (const file of Array.from(files)) {
      if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
        setUploadError('Only PDF files are allowed');
        continue;
      }
      if (file.size > 50 * 1024 * 1024) {
        setUploadError('File too large (max 50MB)');
        continue;
      }

      setUploading(true);
      try {
        // 1. Upload to Supabase Storage
        const filePath = `${user.id}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const { error: uploadErr } = await supabase.storage
          .from('student-pdfs')
          .upload(filePath, file, { contentType: 'application/pdf', upsert: false });

        if (uploadErr) throw new Error(uploadErr.message);

        // 2. Register in database via backend
        const { data: newPdf } = await api.post('/api/pdfs', {
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
        });

        setPdfs(prev => [newPdf, ...prev]);
      } catch (err: any) {
        setUploadError(err.message || 'Upload failed');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDelete = async (pdf: PDF) => {
    if (!confirm(`Delete "${pdf.file_name}"?`)) return;
    try {
      // Delete from storage
      await supabase.storage.from('student-pdfs').remove([pdf.file_path]);
      // Delete from database
      await api.delete(`/api/pdfs/${pdf.id}`);
      setPdfs(prev => prev.filter(p => p.id !== pdf.id));
    } catch { alert('Failed to delete'); }
  };

  const filtered = pdfs.filter(p => !query || p.file_name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)] text-[var(--foreground)] custom-scrollbar">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-5 pb-28 lg:pb-8">

        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Course Materials</h1>
            <p className="text-xs text-[var(--muted)] mt-0.5">{pdfs.length} PDF{pdfs.length !== 1 ? 's' : ''} in your library</p>
          </div>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: 'var(--primary)' }}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload PDF
          </button>
          <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" multiple className="hidden"
            onChange={e => handleUpload(e.target.files)} />
        </div>

        {/* Upload error */}
        <AnimatePresence>
          {uploadError && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500">
              <X className="w-4 h-4 shrink-0" />
              {uploadError}
              <button onClick={() => setUploadError('')} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleUpload(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all',
            dragging ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)] hover:border-[var(--primary)]/40 hover:bg-[var(--accent)]'
          )}>
          <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all',
            dragging ? 'bg-[var(--primary)] text-white' : 'bg-[var(--input)] text-[var(--muted)]')}>
            {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
          </div>
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {dragging ? 'Drop to upload' : 'Drop PDFs here or click to browse'}
          </p>
          <p className="text-xs text-[var(--muted)] mt-1">PDF files only, up to 50MB each</p>
        </div>

        {/* Search */}
        {pdfs.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] opacity-40" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search PDFs..."
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--primary)] transition-all" />
          </div>
        )}

        {/* PDF List */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-12 text-center">
            <BookOpen className="w-10 h-10 text-[var(--muted)] opacity-20 mx-auto mb-3" />
            <p className="text-sm font-medium text-[var(--muted)] opacity-50">
              {query ? 'No PDFs match your search' : 'Your library is empty'}
            </p>
            {!query && <p className="text-xs text-[var(--muted)] opacity-30 mt-1">Upload your first PDF to get started</p>}
          </div>
        ) : (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--input)]">
              <div className="col-span-6 text-[11px] font-semibold text-[var(--muted)] uppercase">File</div>
              <div className="col-span-2 text-[11px] font-semibold text-[var(--muted)] uppercase text-center">Size</div>
              <div className="col-span-3 text-[11px] font-semibold text-[var(--muted)] uppercase text-center hidden sm:block">Uploaded</div>
              <div className="col-span-1" />
            </div>
            <div className="divide-y divide-[var(--border)]">
              {filtered.map((pdf, i) => (
                <motion.div key={pdf.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-12 items-center px-4 py-3.5 hover:bg-[var(--accent)] transition-all group">
                  <div className="col-span-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-red-500" />
                    </div>
                    <p className="text-[13px] font-medium text-[var(--foreground)] truncate">{pdf.file_name}</p>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-[12px] text-[var(--muted)]">{formatSize(pdf.file_size)}</span>
                  </div>
                  <div className="col-span-3 text-center hidden sm:block">
                    <span className="text-[12px] text-[var(--muted)] flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 opacity-40" />
                      {formatDate(pdf.uploaded_at)}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => handleDelete(pdf)}
                      className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Info box */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[var(--foreground)]">Use PDFs in AI Assistant</p>
            <p className="text-[12px] text-[var(--muted)] mt-0.5">
              Open the Library panel in Orbit AI, select your PDFs, then use Teach mode to learn from them or Test mode to quiz yourself.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Need to add Sparkles import
function Sparkles({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
    </svg>
  );
}
