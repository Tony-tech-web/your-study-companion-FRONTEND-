'use client';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Search, Loader2, Trash2, Copy, ExternalLink, BookOpen, Clock, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import api from '../services/api';
import { getResearchHistory, deleteResearchEntry } from '../services/research';

interface SearchResult {
  title: string; link: string; snippet: string; year: string | null;
  authors: string | null; cited_by: number | null; publication: string | null;
  isGitHub?: boolean;
}
interface HistoryItem { id: string; title: string; abstract: string; year: number; }

// Filter mode: what category the user selected, and which Serper type to use
type FilterMode = 'scholar' | 'web' | 'dataset' | 'thesis';

const CATEGORIES: { key: FilterMode; label: string; serperType: 'scholar' | 'search' }[] = [
  { key: 'scholar', label: 'Scholar',  serperType: 'scholar' },
  { key: 'web',     label: 'Web',      serperType: 'search' },
  { key: 'dataset', label: 'Dataset',  serperType: 'search' },
  { key: 'thesis',  label: 'Thesis',   serperType: 'scholar' },
];

// Detect if a result is from GitHub (for web results)
const isGitHubResult = (r: SearchResult) => r.link.includes('github.com');

// Apply the display filter per category
function applyFilter(results: SearchResult[], mode: FilterMode): SearchResult[] {
  const normalized = results.map(r => ({ ...r, isGitHub: isGitHubResult(r) }));
  switch (mode) {
    case 'scholar': return normalized; // Serper scholar already filtered
    case 'web': return normalized;
    case 'dataset': return normalized.filter(r => r.isGitHub || r.title.toLowerCase().includes('dataset') || r.title.toLowerCase().includes('data'));
    case 'thesis': return normalized.filter(r => !r.isGitHub && (r.title.toLowerCase().includes('thesis') || r.title.toLowerCase().includes('dissertation') || r.publication != null));
    default: return normalized;
  }
}

export const Research = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FilterMode>('scholar');
  const [rawResults, setRawResults] = useState<SearchResult[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [citationFormat, setCitationFormat] = useState<'APA' | 'MLA' | 'CHI'>('APA');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    try { setHistory(await getResearchHistory()); }
    catch (err) { console.error(err); }
    finally { setLoadingHistory(false); }
  };

  // Apply filter to results based on selected category
  const results = useMemo(() => applyFilter(rawResults, category), [rawResults, category]);

  const handleSearch = async () => {
    if (!query.trim() || searching) return;
    setSearching(true); setRawResults([]); setSelected(null); setHasSearched(true);
    try {
      const cat = CATEGORIES.find(c => c.key === category) || CATEGORIES[0];
      // Augment query for specific categories
      const augmentedQuery = category === 'dataset' ? `${query} dataset` : category === 'thesis' ? `${query} thesis dissertation` : query;
      const res = await api.post('/api/research/search', { query: augmentedQuery.trim(), type: cat.serperType });
      setRawResults(res.data.results || []);
      loadHistory();
    } catch (err: any) {
      setRawResults([{ title: 'Error', link: '', snippet: err?.response?.data?.error || 'Search failed', year: null, authors: null, cited_by: null, publication: null }]);
    } finally { setSearching(false); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteResearchEntry(id); setHistory(prev => prev.filter(h => h.id !== id)); }
    catch { alert('Failed to delete'); }
  };

  const getCitation = (r: SearchResult) => {
    const author = r.authors || 'Unknown Author';
    const year = r.year || 'n.d.';
    const src = r.publication || r.link;
    if (citationFormat === 'APA') return `${author} (${year}). ${r.title}. ${src}.`;
    if (citationFormat === 'MLA') return `${author}. "${r.title}." ${src}, ${year}.`;
    return `${author}. ${year}. ${r.title}. In ${src}.`;
  };

  const handleCopy = () => {
    if (!selected) return;
    navigator.clipboard.writeText(getCitation(selected));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)] text-[var(--foreground)] custom-scrollbar">
      <div className="max-w-5xl mx-auto p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Research</h1>
            <p className="text-xs text-[var(--muted)] mt-0.5">Powered by Serper — live scholarly search</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>

        {/* Search bar */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] opacity-40" />
              <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search papers, datasets, theses..."
                className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--primary)] transition-all" />
            </div>
            <button onClick={handleSearch} disabled={searching || !query.trim()}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all"
              style={{ backgroundColor: 'var(--primary)' }}>
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </div>

          {/* Category tabs — also act as display filter */}
          <div className="flex gap-2">
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setCategory(c.key)}
                className={cn('px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all',
                  c.key === category
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--input)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]')}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Results */}
          <div className="lg:col-span-2 space-y-3">
            {searching && (
              <div className="flex items-center justify-center py-16 bg-[var(--card)] border border-[var(--border)] rounded-xl">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
                <span className="ml-3 text-sm text-[var(--muted)]">Searching {category} archives...</span>
              </div>
            )}

            {!searching && hasSearched && results.length === 0 && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-12 text-center">
                <Search className="w-8 h-8 text-[var(--muted)] opacity-20 mx-auto mb-2" />
                <p className="text-sm text-[var(--muted)] opacity-40">No results for this category</p>
                <p className="text-xs text-[var(--muted)] opacity-30 mt-1">Try a different filter or search term</p>
              </div>
            )}

            {!searching && results.length > 0 && (
              <AnimatePresence mode="popLayout">
                {results.map((r, i) => (
                  <motion.div key={`${r.title}-${i}`} layout
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelected(r === selected ? null : r)}
                    className={cn('bg-[var(--card)] border rounded-xl p-4 cursor-pointer transition-all hover:shadow-sm',
                      selected?.title === r.title && selected?.link === r.link
                        ? 'border-[var(--primary)]'
                        : 'border-[var(--border)] hover:border-[var(--primary)]/40')}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-[13px] font-semibold text-[var(--foreground)] leading-snug line-clamp-2">{r.title}</h3>
                      {r.link && (
                        <a href={r.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                          className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--accent)] transition-all shrink-0">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted)] line-clamp-2 mb-2.5">{r.snippet}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {r.year && <span className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--input)] border border-[var(--border)] text-[var(--muted)]">{r.year}</span>}
                      {r.cited_by !== null && <span className="text-[11px] text-[var(--muted)]">{r.cited_by} citations</span>}
                      {r.isGitHub && <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-500">GitHub</span>}
                      {r.publication && <span className="text-[11px] text-[var(--muted)] truncate max-w-[140px]">{r.publication}</span>}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {/* History when no search */}
            {!searching && !hasSearched && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[var(--muted)]" />
                  <p className="text-[12px] font-semibold text-[var(--foreground)]">Recent Searches</p>
                </div>
                {loadingHistory
                  ? <div className="p-8 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" /></div>
                  : history.length === 0
                    ? <div className="p-10 text-center text-xs text-[var(--muted)] opacity-40">Search for a topic to get started</div>
                    : <div className="divide-y divide-[var(--border)]">
                        {history.slice(0, 8).map(h => (
                          <div key={h.id} className="flex items-center justify-between px-4 py-3 hover:bg-[var(--accent)] transition-all group cursor-pointer"
                            onClick={() => { setQuery(h.title); inputRef.current?.focus(); }}>
                            <div className="flex-1 min-w-0 mr-3">
                              <p className="text-[13px] font-medium text-[var(--foreground)] truncate">{h.title}</p>
                              <p className="text-[11px] text-[var(--muted)] opacity-50 truncate">{h.abstract?.slice(0, 55)}...</p>
                            </div>
                            <button onClick={e => { e.stopPropagation(); handleDelete(h.id); }}
                              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                }
              </div>
            )}
          </div>

          {/* Citation panel */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 sticky top-0 self-start">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-[var(--primary)]" />
              <p className="text-[13px] font-semibold text-[var(--foreground)]">Citation</p>
            </div>

            {selected ? (
              <div className="space-y-3">
                <p className="text-[12px] font-medium text-[var(--foreground)] line-clamp-2">{selected.title}</p>
                {selected.authors && <p className="text-[11px] text-[var(--muted)]">{selected.authors}</p>}

                <div className="flex gap-1 p-1 bg-[var(--input)] rounded-lg border border-[var(--border)]">
                  {(['APA', 'MLA', 'CHI'] as const).map(f => (
                    <button key={f} onClick={() => setCitationFormat(f)}
                      className={cn('flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-all',
                        citationFormat === f ? 'bg-[var(--primary)] text-white' : 'text-[var(--muted)] hover:text-[var(--foreground)]')}>
                      {f}
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-[var(--input)] rounded-xl border border-[var(--border)]">
                  <p className="text-[11px] text-[var(--foreground)] leading-relaxed">{getCitation(selected)}</p>
                </div>

                <button onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-semibold text-white hover:opacity-90 active:scale-95 transition-all"
                  style={{ backgroundColor: 'var(--primary)' }}>
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Citation</>}
                </button>

                <button onClick={() => setSelected(null)} className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-medium text-[var(--muted)] hover:bg-[var(--accent)] transition-all border border-[var(--border)]">
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Search className="w-8 h-8 text-[var(--muted)] opacity-15 mx-auto mb-2" />
                <p className="text-xs text-[var(--muted)] opacity-40">Select a result to generate citation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
