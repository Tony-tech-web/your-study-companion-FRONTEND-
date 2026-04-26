'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Bookmark, Clock, Tag } from 'lucide-react';
import { getNews } from '../services/news';
import { NewsItem } from '../types';
import { ListSkeleton } from '../components/Skeleton';

const categories = ['All', 'Academic', 'Events', 'Research', 'General'];

export const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    getNews().then(setNews).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'All'
    ? news
    : news.filter(n => n.category?.toLowerCase() === activeCategory.toLowerCase());

  if (loading) return <ListSkeleton rows={5} />;

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--background)] text-[var(--foreground)] custom-scrollbar">
      <div className="max-w-4xl mx-auto p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Campus News</h1>
            <p className="text-xs text-[var(--muted)] mt-0.5">{news.length} article{news.length !== 1 ? 's' : ''} from Elizade University</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
          </span>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={cn('shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all',
                activeCategory === cat
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]')}>
              {cat}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-16 text-center">
            <Tag className="w-8 h-8 text-[var(--muted)] opacity-20 mx-auto mb-2" />
            <p className="text-sm text-[var(--muted)] opacity-40">No articles in this category</p>
          </div>
        )}

        {/* Featured article (first) */}
        {filtered.length > 0 && (
          <motion.div key={filtered[0].id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="group bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden hover:border-[var(--primary)]/30 hover:shadow-md transition-all cursor-pointer">
            <div className="relative aspect-video overflow-hidden bg-[var(--input)]">
              <img src={filtered[0].image} alt={filtered[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-3 left-3">
                <span className="text-[11px] font-bold text-white bg-[var(--primary)] px-2.5 py-1 rounded-lg">
                  {filtered[0].category}
                </span>
              </div>
              <div className="absolute bottom-3 left-4 right-4">
                <h2 className="text-[16px] font-bold text-white leading-snug line-clamp-2">{filtered[0].title}</h2>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                <Clock className="w-3.5 h-3.5" />
                {filtered[0].date}
              </div>
              <button onClick={e => { e.stopPropagation(); setSaved(prev => prev.includes(filtered[0].id) ? prev.filter(id => id !== filtered[0].id) : [...prev, filtered[0].id]); }}
                className={cn('p-1.5 rounded-lg transition-all', saved.includes(filtered[0].id) ? 'text-[var(--primary)]' : 'text-[var(--muted)] hover:text-[var(--primary)]')}>
                <Bookmark className={cn('w-4 h-4', saved.includes(filtered[0].id) ? 'fill-current' : '')} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Article grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.slice(1).map((item, i) => (
            <motion.div key={item.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="group bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--primary)]/30 hover:shadow-sm transition-all cursor-pointer">
              <div className="relative h-36 overflow-hidden bg-[var(--input)]">
                <img src={item.image} alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] font-bold text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md">
                    {item.category}
                  </span>
                </div>
              </div>
              <div className="p-3.5">
                <h3 className="text-[13px] font-semibold text-[var(--foreground)] line-clamp-2 mb-2 leading-snug group-hover:text-[var(--primary)] transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] text-[var(--muted)] line-clamp-2 mb-3">{item.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[var(--muted)] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.date}
                  </span>
                  <button onClick={e => { e.stopPropagation(); setSaved(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]); }}
                    className={cn('p-1 rounded-lg transition-all', saved.includes(item.id) ? 'text-[var(--primary)]' : 'text-[var(--muted)] hover:text-[var(--primary)]')}>
                    <Bookmark className={cn('w-3.5 h-3.5', saved.includes(item.id) ? 'fill-current' : '')} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
