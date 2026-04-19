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
        <Card className="relative bg-[#111111] border-[#2A2A2A] shadow-2xl">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-2xl font-bold mb-8">System API Status</h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <StatusItem label="Supabase Auth" status="Operational" />
            <StatusItem label="AI Engine" status="Operational" />
            <StatusItem label="Database" status="Operational" />
            <StatusItem label="PDF Parser" status="Minor Delay" type="warning" />
          </div>

          <div className="bg-[#0F0F0F] rounded-2xl p-6 border border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">System Health (24h Uptime)</h3>
            </div>
            
            <div className="h-48 w-full relative">
                <div className="absolute inset-0 flex flex-col justify-between py-2 text-[10px] font-bold text-gray-700">
                    <span>100%</span>
                    <span>95%</span>
                    <span>90%</span>
                </div>
                <div className="absolute inset-0 pt-1 pb-1 ml-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={uptimeData}>
                            <defs>
                                <linearGradient id="statusGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.3}/>
                                </linearGradient>
                            </defs>
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#10B981" 
                                strokeWidth={3}
                                fill="url(#statusGrad)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="absolute bottom-[-20px] left-10 right-0 flex justify-between text-[10px] font-bold text-gray-700">
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
  <div className="flex items-center gap-3 p-4 rounded-xl bg-[#0F0F0F] border border-[#2A2A2A]">
    <div className={cn(
      "w-2 h-2 rounded-full",
      type === 'success' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
    )} />
    <span className="text-sm font-medium text-gray-300">{label}:</span>
    <span className={cn(
      "text-sm font-bold",
      type === 'success' ? "text-emerald-500/80" : "text-amber-500/80"
    )}>{status}</span>
  </div>
);
