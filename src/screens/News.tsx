import React, { useEffect, useState } from 'react';
import { Card, Badge, Button } from '../components/UI';
import { getNews } from '../services/news';
import { NewsItem } from '../types';
import { Bookmark, Search, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getNews();
        setNews(data);
      } catch (err) {
        console.error('Failed to fetch news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-(--background)">
        <Loader2 className="w-10 h-10 text-(--primary) animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-10 bg-(--background) text-(--foreground) overflow-y-auto custom-scrollbar pb-32 lg:pb-10">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">News Broadcast</h1>
          <p className="text-(--muted) text-xs font-black uppercase tracking-[0.2em] mt-3 opacity-60">Source: <span className="text-(--primary) font-black">Cluster_Global_Feed</span></p>
        </div>
        <div className="flex gap-2">
           <Badge className="bg-(--accent) text-(--primary) border-(--border) font-black text-[10px] tracking-widest py-2 px-4 rounded-xl">SYNC: REAL-TIME</Badge>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-10">
        {/* Main Feed */}
        <div className="col-span-12 lg:col-span-9">
          <h2 className="text-[10px] font-black mb-8 text-(--muted) uppercase tracking-[0.3em] opacity-60">Primary Data Stream</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {news.map((item, idx) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                key={item.id} 
                className="group cursor-pointer flex flex-col h-full"
              >
                <div className="relative overflow-hidden rounded-4xl aspect-video mb-6 shadow-xl border border-(--border) group-hover:border-(--primary) transition-all">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                     <Badge className="bg-(--card)/90 backdrop-blur-md text-(--primary) border-(--border) font-black uppercase tracking-widest text-[9px] py-1.5 px-4 shadow-xl">{item.category}</Badge>
                  </div>
                </div>
                <h3 className="text-xl font-black mb-3 group-hover:text-(--primary) transition-colors text-(--foreground) leading-tight uppercase tracking-tight">{item.title}</h3>
                <p className="text-xs text-(--muted) line-clamp-3 mb-6 font-medium leading-relaxed opacity-80 uppercase tracking-tighter">{item.excerpt}</p>
                <div className="mt-auto flex items-center justify-between pt-6 border-t border-(--border)">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-(--primary) animate-pulse" />
                     <span className="text-[10px] text-(--muted) font-black uppercase tracking-widest">{item.date}</span>
                   </div>
                   <button className="w-10 h-10 bg-(--accent) text-(--muted) hover:text-(--primary) rounded-xl flex items-center justify-center transition-all active:scale-90 group-hover:shadow-(--primary)/20">
                      <Bookmark className="w-5 h-5 fill-current opacity-20 group-hover:opacity-100" />
                   </button>
                </div>
              </motion.div>
            ))}
            {news.length === 0 && (
              <div className="col-span-full py-20 text-center opacity-40">
                <p className="text-[10px] font-black uppercase tracking-widest">No primary transmissions found</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-10">
          <div>
            <h2 className="text-[10px] font-black mb-8 text-(--muted) uppercase tracking-[0.3em] opacity-60">Trending Nodes</h2>
            <div className="space-y-4">
              {[
                { title: "Campus WiFi Updates", desc: "Digital infrastructure expansion project starts next month across all halls..." },
                { title: "New Student Union", desc: "Modern student hub featuring collaborative zones and VR learning station..." },
                { title: "Top 5 Study Apps", desc: "A guide to the most effective academic tools for the upcoming finals..." },
                { title: "Neural Link Access", desc: "Beta testing for the new brain-computer interface opens next Friday..." }
              ].map((trend, i) => (
                <motion.div 
                  whileHover={{ x: 5 }}
                  key={i} 
                  className="p-6 rounded-3xl bg-(--card)/50 border border-(--border) hover:border-(--primary) hover:bg-(--accent)/30 transition-all cursor-pointer shadow-lg group relative overflow-hidden"
                >
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-(--primary) translate-x-full group-hover:translate-x-0 transition-transform" />
                  <h4 className="text-xs font-black text-(--foreground) mb-2 group-hover:text-(--primary) uppercase tracking-tight">{trend.title}</h4>
                  <p className="text-[10px] text-(--muted) leading-relaxed font-black uppercase tracking-tighter opacity-60">{trend.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
          
          <Card className="bg-(--primary) border-none text-white p-8 overflow-hidden relative group">
             <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
             <div className="relative z-10">
               <h3 className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-4">Ad Node</h3>
               <p className="text-xl font-black tracking-tighter uppercase mb-6">Upgrade to Core Pro for unlimited data sync</p>
               <Button className="w-full bg-white text-(--primary) hover:bg-white/90 font-black uppercase tracking-widest text-[10px] py-3 rounded-xl border-none">Initialize Upgrade</Button>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
