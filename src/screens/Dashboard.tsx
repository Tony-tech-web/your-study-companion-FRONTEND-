import React, { useState } from 'react';
import { Card, Button, Input, Badge } from '../components/UI';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  mockActivity, 
  mockUser, 
  mockTasks 
} from '../mockData';
import { cn } from '../lib/utils';
import { 
  Plus, 
  Upload, 
  CheckCircle2, 
  MoreHorizontal
} from 'lucide-react';
import { motion } from 'motion/react';

export const Dashboard = () => {
  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-50 text-slate-900">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Good morning, Aman</h1>
        <p className="text-slate-500 text-sm">Real-time data for cluster <span className="text-blue-600 font-medium">US-EAST-1</span></p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* User XP Card */}
        <div className="col-span-12 lg:col-span-4">
          <Card title="Hero Card" subtitle={`User Level: ${mockUser.level}`}>
            <div className="flex flex-col items-center justify-center pt-4 pb-8">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="#F1F5F9"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="#2563EB"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 80}
                    initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - mockUser.xp / mockUser.maxXp) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-slate-900">XP</span>
                </div>
              </div>
              <div className="mt-8 text-center">
                <span className="text-slate-500 text-sm font-medium">XP: {mockUser.xp} / {mockUser.maxXp}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Study Activity Chart */}
        <div className="col-span-12 lg:col-span-8">
          <Card title="Study Activity" subtitle="Hours Studied This Week">
            <div className="h-[250px] w-full mt-4">
              <div className="absolute top-6 right-6 flex items-center gap-2">
                <Badge className="bg-slate-100 text-slate-600 border border-slate-200">25 hours total</Badge>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockActivity}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#2563EB' }}
                    cursor={{ fill: 'rgba(37,99,235,0.02)' }}
                  />
                  <Bar 
                    dataKey="hours" 
                    fill="#F1F5F9" 
                    radius={[6, 6, 0, 0]}
                    activeBar={{ fill: '#2563EB' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="col-span-12 lg:col-span-6">
          <Card title="Quick Action">
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="text-blue-600" />
                </div>
                <span className="text-sm font-bold text-slate-700">New Study Plan</span>
                <Button className="w-full">New Study Plan</Button>
              </div>
              <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="text-blue-600" />
                </div>
                <span className="text-sm font-bold text-slate-700">Upload PDF</span>
                <Button className="w-full">Upload PDF</Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Active Tasks */}
        <div className="col-span-12 lg:col-span-6">
          <Card title="Active Tasks">
            <div className="space-y-4 mt-2">
              <div className="flex items-center justify-between p-2">
                <div className="flex-1" />
                <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer" />
              </div>
              {mockTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-100 hover:bg-slate-50 transition-colors shadow-sm">
                  <div className="w-6 h-6 rounded-lg border-2 border-slate-200 cursor-pointer flex items-center justify-center hover:border-blue-600 transition-colors shadow-sm">
                    {task.completed && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800">{task.title}</h4>
                    <p className="text-xs text-slate-500 font-medium">({task.dueDate})</p>
                  </div>
                  <Badge className={cn(
                    "border shadow-sm font-bold",
                    task.category === 'Math' ? "bg-amber-50 border-amber-200 text-amber-600" :
                    task.category === 'History' ? "bg-rose-50 border-rose-200 text-rose-600" :
                    "bg-cyan-50 border-cyan-200 text-cyan-600"
                  )}>Category</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
