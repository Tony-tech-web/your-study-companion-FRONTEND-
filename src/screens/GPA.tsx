import React from 'react';
import { Card, Button, Input, Badge } from '../components/UI';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Plus, MoreHorizontal } from 'lucide-react';

const gpaData = [
  { sem: 'Sem 1', gpa: 2.8, trend: 3.1 },
  { sem: 'Sem 2', gpa: 3.2, trend: 3.3 },
  { sem: 'Sem 3', gpa: 3.1, trend: 3.5 },
  { sem: 'Sem 4', gpa: 3.4, trend: 3.8 },
];

export const GPA = () => {
  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-50 text-slate-900">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Academic Progress</h1>
        <p className="text-slate-500 text-sm">Historical GPA and planning tools</p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Historical GPA Trend */}
        <div className="col-span-12 lg:col-span-7">
          <Card title="Historical GPA Trend" subtitle="Performance across semesters">
            <div className="h-[350px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gpaData} margin={{ left: -20 }}>
                  <defs>
                    <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="sem" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 12 }} 
                    domain={[2.0, 4.0]}
                    ticks={[2.5, 3.0, 3.5, 4.0]}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#2563EB' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="trend" 
                    stroke="#6366F1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorTrend)" 
                    strokeDasharray="5 5"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="gpa" 
                    stroke="#2563EB" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorGpa)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* GPA Calculator */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <Card title="GPA Calculator">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-widest px-1">Course Name</label>
                <Input placeholder="Introduction to Psychology" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-widest px-1">Grade (A-F)</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 appearance-none">
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                    <option>D</option>
                    <option>F</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-2 block uppercase tracking-widest px-1">Credits</label>
                  <Input placeholder="3" type="number" />
                </div>
              </div>
              <Button className="w-full mt-4 h-12 text-lg">Calculate Impact</Button>
            </div>
          </Card>

          <Card title="Study Planner">
            <div className="flex items-center justify-between p-2">
                <div className="flex-1" />
                <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer" />
            </div>
            <div className="grid grid-cols-7 gap-2 mt-2 border-b border-slate-100 pb-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-tighter">{day}</span>
                  <span className="text-xs font-bold text-slate-900">{10 + ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(day)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3 mt-4">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl ml-6 shadow-sm">
                <span className="text-xs font-bold text-amber-700 block">Biology Midterm Exam</span>
                <span className="text-[10px] font-medium text-amber-600/70 block">Tuesday, 10:00 AM</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl ml-12 shadow-sm">
                <span className="text-xs font-bold text-blue-700 block">History Research Paper</span>
                <span className="text-[10px] font-medium text-blue-600/70 block">Thursday, 11:59 PM</span>
              </div>
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl ml-16 shadow-sm">
                <span className="text-xs font-bold text-rose-700 block">Math Quiz 4</span>
                <span className="text-[10px] font-medium text-rose-600/70 block">Friday, 2:00 PM</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
