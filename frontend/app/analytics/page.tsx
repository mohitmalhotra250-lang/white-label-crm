"use client";
import { useEffect, useState } from 'react';
import Sidebar from '../../components/sidebar';
import { apiGet } from '../../lib/api';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>([]);
  useEffect(() => { apiGet('/analytics').then(r => setData(r.analytics || [])); }, []);

  const answered = data.filter((d: any) => d.metric === 'answered_pct').pop()?.value || 0;
  const rejected = data.filter((d: any) => d.metric === 'rejected_pct').pop()?.value || 0;
  const busy = data.filter((d: any) => d.metric === 'busy_pct').pop()?.value || 0;

  const pie = [
    { name: 'Answered', value: answered || 40 },
    { name: 'Rejected', value: rejected || 15 },
    { name: 'Busy', value: busy || 10 },
    { name: 'No Answer', value: (100 - (answered + rejected + busy + 10)) || 35 },
  ];
  const colors = ['#22d3ee', '#f87171', '#fbbf24', '#a78bfa'];

  return (
    <div className="flex min-h-screen"><Sidebar active="/analytics" />
      <main className="flex-1 p-6 lg:p-10 overflow-auto max-w-6xl">
        <h1 className="text-3xl font-extrabold mb-2">Analytics</h1>
        <p className="text-slate-400 mb-6">Real-time conversion and call metrics.</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Answered %', value: `${Math.round(answered)}%`, color: 'text-cyan-300' },
            { label: 'Rejected %', value: `${Math.round(rejected)}%`, color: 'text-red-300' },
            { label: 'Busy %', value: `${Math.round(busy)}%`, color: 'text-amber-300' },
          ].map(s => (
            <div key={s.label} className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl"><div className="text-xs uppercase tracking-widest text-slate-400 mb-1">{s.label}</div><div className={`text-4xl font-extrabold ${s.color}`}>{s.value}</div></div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl"><h3 className="font-bold mb-4">Status Distribution</h3><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={pie} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label><Cell fill={colors[0]} /><Cell fill={colors[1]} /><Cell fill={colors[2]} /><Cell fill={colors[3]} /></Pie><Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} /><Legend /></PieChart></ResponsiveContainer></div>
          <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl"><h3 className="font-bold mb-4">Daily Calls (7d)</h3><ResponsiveContainer width="100%" height={250}><BarChart data={data.filter((d: any) => d.metric === 'calls_per_day').slice(-7)}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="date" stroke="#94a3b8" fontSize={12} /><YAxis stroke="#94a3b8" fontSize={12} /><Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} /><Bar dataKey="value" fill="#22d3ee" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl"><h3 className="font-bold mb-3">Export</h3><div className="flex gap-3"><a href="#" className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 font-medium text-sm">Export PDF</a><a href="#" className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-medium text-sm">Export CSV</a></div></div>
      </main>
    </div>
  );
}
