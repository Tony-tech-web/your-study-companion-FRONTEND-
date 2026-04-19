import React from 'react';
import { Card, Badge, Button } from '../components/UI';
import { mockNews } from '../mockData';
import { Bookmark, Search } from 'lucide-react';

export const News = () => {
  return (
    <div className="flex-1 p-8 bg-slate-50 text-slate-900 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Academic Hub</h1>
        <p className="text-slate-500 font-medium text-sm">Real-time news and trending topics across campus</p>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Feed */}
        <div className="col-span-12 lg:col-span-9">
          <h2 className="text-xs font-bold mb-6 text-slate-400 uppercase tracking-widest">Global News Feed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {mockNews.map((item) => (
              <div key={item.id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl aspect-video mb-4 shadow-sm">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3">
                     <Badge className="bg-white/90 backdrop-blur-md text-blue-600 border border-white font-bold shadow-sm">{item.category}</Badge>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors text-slate-800 leading-tight">{item.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 font-medium">{item.excerpt}</p>
                <div className="flex items-center justify-between">
                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.date}</span>
                   <button className="text-slate-300 hover:text-blue-600 transition-all active:scale-90">
                      <Bookmark className="w-5 h-5" />
                   </button>
                </div>
              </div>
            ))}
            {/* Repeat for visual density */}
            {mockNews.map((item) => (
              <div key={item.id + '_2'} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl aspect-video mb-4 shadow-sm">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3">
                     <Badge className="bg-white/90 backdrop-blur-md text-blue-600 border border-white font-bold shadow-sm">{item.category}</Badge>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors text-slate-800 leading-tight">{item.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 font-medium">{item.excerpt}</p>
                <div className="flex items-center justify-between">
                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.date}</span>
                   <button className="text-slate-300 hover:text-blue-600 transition-all active:scale-90">
                      <Bookmark className="w-5 h-5" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-8">
          <div>
            <h2 className="text-xs font-bold mb-6 text-slate-400 uppercase tracking-widest px-1">Top Trends</h2>
            <div className="space-y-4">
              {[
                { title: "Campus WiFi Updates", desc: "Digital infrastructure expansion project starts next month across all halls..." },
                { title: "New Student Union", desc: "Modern student hub featuring collaborative zones and VR learning station..." },
                { title: "Top 5 Study Apps", desc: "A guide to the most effective academic tools for the upcoming finals..." }
              ].map((trend, i) => (
                <div key={i} className="p-4 rounded-xl bg-white border border-slate-100 hover:bg-slate-50 transition-all cursor-pointer shadow-sm group">
                  <h4 className="text-xs font-black text-slate-700 mb-1 group-hover:text-blue-600">{trend.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{trend.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
