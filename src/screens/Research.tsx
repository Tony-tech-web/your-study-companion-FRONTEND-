'use client';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Search, Loader2, Trash2, Copy, ExternalLink, BookOpen, Clock, Check, X, Lightbulb, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDialog } from '../components/Dialog';
import { cn } from '../lib/utils';
import { searchResearch, getResearchHistory, deleteResearchEntry, SearchResult, ResearchSearchResult } from '../services/research';
import { updateXP } from '../lib/supabase';

interface HistoryItem { id: string; title: string; abstract: string; year: number; }

type FilterMode = 'academic' | 'projects';

export const Research = () => {
  const [query, setQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('academic');
  const [searchData, setSearchData] = useState<ResearchSearchResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [citationFormat, setCitationFormat] = useState<'APA' | 'MLA' | 'CHI'>('APA');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'results' | 'insights'>('results');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    try { setHistory(await getResearchHistory()); }
    catch (err) { console.error(err); }
    finally { setLoadingHistory(false); }
  };

  // Filter results by mode (academic = no GitHub, projects = GitHub first)
  const results = useMemo(() => {
    if (!searchData) return [];
    const all = searchData.results;
    if (filterMode === 'academic') return all.filter(r => !r.isGitHub);
    return all; // projects shows everything, GitHub sorted first already by edge fn
  }, [searchData, filterMode]);

  const handleSearch = async () => {
    if (!query.trim() || searching) return;
    setSearching(true); setSearchData(null); setSelected(null); setHasSearched(true); setActiveTab('results');
    try {
      const data = await searchResearch(query.trim(), filterMode);
      setSearchData(data);
      await updateXP('research');
      loadHistory();
    } catch (err: any) {
      setSearchData({ results: [], insights: err.message || 'Search failed', projectIdeas: [], gaps: [], relatedTopics: [] });
    } finally { setSearching(false); }
  };

  const { show: showDialog } = useDialog();
  const handleDelete = async (id: string) => {
    const ok = await showDialog({ title: 'Delete Search', message: 'Remove this search from history?', confirmLabel: 'Delete', destructive: true });
    if (!ok) return;
    try { await deleteResearchEntry(id); setHistory(prev => prev.filter(h => h.id !== id)); }
    catch { showDialog({ type: 'error', message: 'Failed to delete.' }); }
  };

  const getCitation = (r: SearchResult) => {
    const src = r.source || r.url;
    if (citationFormat === 'APA') return `Unknown Author (n.d.). ${r.title}. Retrieved from ${r.url}`;
    if (citationFormat === 'MLA') return `"${r.title}." ${src}, n.d., ${r.url}`;
    return `Unknown. n.d. ${r.title}. ${src}. ${r.url}`;
  };

  const handleCopy = () => {
    if (!selected) return;
    navigator.clipboard.writeText(getCitation(selected));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)] text-[var(--foreground)] custom-scrollbar">
      <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-4 sm:space-y-5 pb-28 lg:pb-8">

        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Research</h1>
            <p className="text-xs text-[var(--muted)] mt-0.5">Powered by Serper + AI — live search with insights</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
          </span>
        </div>

        {/* Search */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] opacity-40" />
              <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search papers, projects, datasets..."
                className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] placeholder:opacity-40 focus:outline-none focus:border-[var(--primary)] transition-all" />
            </div>
            <button onClick={handleSearch} disabled={searching || !query.trim()}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all"
              style={{ backgroundColor: 'var(--primary)' }}>
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </div>
          {/* Mode tabs */}
          <div className="flex gap-2">
            {([
              { key: 'academic' as FilterMode, label: 'Academic', icon: BookOpen },
              { key: 'projects' as FilterMode, label: 'Projects', icon: Code2 },
            ]).map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setFilterMode(key)}
                className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all',
                  key === filterMode ? 'bg-[var(--primary)] text-white' : 'bg-[var(--input)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]')}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Results + Insights */}
          <div className="lg:col-span-2 space-y-3">

            {/* Tab switcher when results exist */}
            {hasSearched && searchData && (
              <div className="flex gap-2 border-b border-[var(--border)] pb-3">
                {[
                  { key: 'results' as const, label: `Results (${results.length})` },
                  { key: 'insights' as const, label: 'AI Insights' },
                ].map(t => (
                  <button key={t.key} onClick={() => setActiveTab(t.key)}
                    className={cn('px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all',
                      activeTab === t.key ? 'bg-[var(--primary)] text-white' : 'text-[var(--muted)] hover:text-[var(--foreground)]')}>
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            {searching && (
              <div className="flex items-center justify-center py-16 bg-[var(--card)] border border-[var(--border)] rounded-xl">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
                <span className="ml-3 text-sm text-[var(--muted)]">Searching with AI analysis...</span>
              </div>
            )}

            {/* Results tab */}
            {!searching && activeTab === 'results' && (
              <>
                {hasSearched && results.length === 0 && (
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-12 text-center">
                    <Search className="w-8 h-8 text-[var(--muted)] opacity-20 mx-auto mb-2" />
                    <p className="text-sm text-[var(--muted)] opacity-40">No results in this category</p>
                  </div>
                )}
                <AnimatePresence mode="popLayout">
                  {results.map((r, i) => (
                    <motion.div key={`${r.id}-${i}`} layout
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setSelected(r === selected ? null : r)}
                      className={cn('bg-[var(--card)] border rounded-xl p-4 cursor-pointer transition-all hover:shadow-sm',
                        selected?.id === r.id ? 'border-[var(--primary)]' : 'border-[var(--border)] hover:border-[var(--primary)]/40')}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-[13px] font-semibold text-[var(--foreground)] leading-snug line-clamp-2">{r.title}</h3>
                        {r.url && (
                          <a href={r.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--accent)] transition-all shrink-0">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-[var(--muted)] line-clamp-2 mb-2.5">{r.snippet}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--input)] border border-[var(--border)] text-[var(--muted)]">{r.source}</span>
                        {r.isGitHub && <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-500">GitHub</span>}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </>
            )}

            {/* Insights tab */}
            {!searching && activeTab === 'insights' && searchData && (
              <div className="space-y-3">
                {searchData.insights && (
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-[var(--primary)]" />
                      <p className="text-[13px] font-semibold text-[var(--foreground)]">AI Summary</p>
                    </div>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">{searchData.insights}</p>
                  </div>
                )}
                {searchData.projectIdeas.length > 0 && (
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                    <p className="text-[13px] font-semibold text-[var(--foreground)] mb-3">{filterMode === 'projects' ? 'Enhancement Ideas' : 'Research Directions'}</p>
                    <div className="space-y-2">
                      {searchData.projectIdeas.map((idea, i) => (
                        <div key={i} className="p-3 bg-[var(--input)] rounded-xl border border-[var(--border)]">
                          <p className="text-[12px] font-semibold text-[var(--foreground)]">{idea.title}</p>
                          <p className="text-[11px] text-[var(--muted)] mt-0.5">{idea.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {searchData.gaps.length > 0 && (
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                    <p className="text-[13px] font-semibold text-[var(--foreground)] mb-2">Research Gaps</p>
                    <ul className="space-y-1">
                      {searchData.gaps.map((g, i) => <li key={i} className="text-[12px] text-[var(--muted)] flex items-start gap-1.5"><span className="text-[var(--primary)] shrink-0 mt-0.5">•</span>{g}</li>)}
                    </ul>
                  </div>
                )}
                {searchData.relatedTopics.length > 0 && (
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                    <p className="text-[13px] font-semibold text-[var(--foreground)] mb-2">Related Topics</p>
                    <div className="flex flex-wrap gap-2">
                      {searchData.relatedTopics.map((t, i) => (
                        <button key={i} onClick={() => { setQuery(t); inputRef.current?.focus(); }}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-[var(--input)] border border-[var(--border)] text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all">
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* History */}
            {!searching && !hasSearched && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[var(--muted)]" />
                  <p className="text-[12px] font-semibold text-[var(--foreground)]">Recent Searches</p>
                </div>
                {loadingHistory
                  ? <div className="p-8 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" /></div>
                  : history.length === 0
                    ? <div className="p-10 text-center text-xs text-[var(--muted)] opacity-40">Search for a topic above</div>
                    : <div className="divide-y divide-[var(--border)]">
                        {history.slice(0, 8).map(h => (
                          <div key={h.id} className="flex items-center justify-between px-4 py-3 hover:bg-[var(--accent)] transition-all group cursor-pointer"
                            onClick={() => { setQuery(h.title); inputRef.current?.focus(); }}>
                            <div className="flex-1 min-w-0 mr-3">
                              <p className="text-[13px] font-medium text-[var(--foreground)] truncate">{h.title}</p>
                              {h.abstract && h.abstract !== 'No summary available.' && (
                                <p className="text-[11px] text-[var(--muted)] opacity-50 truncate">{h.abstract.slice(0, 60)}...</p>
                              )}
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
                <p className="text-[11px] text-[var(--muted)]">{selected.source}</p>
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
              <div className="py-10 text-center">
                <Search className="w-8 h-8 text-[var(--muted)] opacity-15 mx-auto mb-2" />
                <p className="text-xs text-[var(--muted)] opacity-40">Select a result to generate a citation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
