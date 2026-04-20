import React from 'react';
import { X, CheckCircle, AlertCircle, Circle } from 'lucide-react';
import { Card, Badge } from './UI';
import { cn } from '../lib/utils';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const uptimeData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}h`,
  value: 98 + Math.random() * 2,
}));

export const SystemStatusOverlay = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
      <div className="w-full max-w-2xl animate-in zoom-in-95 duration-200">
        <Card className="relative bg-(--background) border-(--border) shadow-2xl">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-(--muted) hover:text-(--foreground) transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-2xl font-black uppercase tracking-tighter">System API Status</h2>

          <div className="grid grid-cols-2 gap-4 mt-8 mb-8">
            <StatusItem label="Edge API" status="Operational" />
            <StatusItem label="Neural Link" status="Operational" />
            <StatusItem label="Data Vault" status="Operational" />
            <StatusItem label="PDF Sync" status="Minor Delay" type="warning" />
          </div>

          <div className="bg-(--input) rounded-2xl p-6 border border-(--border)">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-(--muted) uppercase tracking-widest opacity-60">System Health (24h Uptime)</h3>
            </div>
            
            <div className="h-48 w-full relative">
                <div className="absolute inset-0 flex flex-col justify-between py-2 text-[10px] font-black text-(--muted) opacity-40">
                    <span>100%</span>
                    <span>95%</span>
                    <span>90%</span>
                </div>
                <div className="absolute inset-0 pt-1 pb-1 ml-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={uptimeData}>
                            <defs>
                                <linearGradient id="statusGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="var(--primary)" 
                                strokeWidth={3}
                                fill="url(#statusGrad)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="absolute bottom-[-20px] left-10 right-0 flex justify-between text-[10px] font-black text-(--muted) opacity-40 uppercase tracking-tighter">
                    <span>0h</span>
                    <span>4h</span>
                    <span>8h</span>
                    <span>12h</span>
                    <span>16h</span>
                    <span>20h</span>
                    <span>24h</span>
                </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const StatusItem = ({ label, status, type = 'success' }: { label: string; status: string; type?: 'success' | 'warning' }) => (
  <div className="flex items-center gap-3 p-4 rounded-xl bg-(--card) border border-(--border) shadow-sm group hover:border-(--primary)/30 transition-all">
    <div className={cn(
      "w-2.5 h-2.5 rounded-full animate-pulse",
      type === 'success' ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
    )} />
    <span className="text-xs font-black text-(--foreground) uppercase tracking-tight">{label}:</span>
    <span className={cn(
      "text-xs font-black uppercase tracking-widest ml-auto",
      type === 'success' ? "text-emerald-500" : "text-amber-500"
    )}>{status}</span>
  </div>
);
