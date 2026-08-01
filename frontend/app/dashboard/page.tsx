import ThemeToggle from "../../components/theme-toggle";
import { useEffect, useState } from 'react';
import { apiGet } from '../../lib/api';
import Sidebar from '../../components/sidebar';
import { PhoneCall, CheckCircle2, XCircle, Clock, AlertCircle, Activity, CalendarDays, TrendingUp, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const [calls, setCalls] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiGet('/calls'), apiGet('/leads'), apiGet('/analytics')]).then(([c, l, a]) => { setCalls(c.calls || []); setLeads(l.leads || []); setAnalytics(a.analytics || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const stats = {
    total: calls.length,
    answered: calls.filter((x: any) => x.status === 'completed' || x.status === 'talking').length,
    rejected: calls.filter((x: any) => x.status === 'rejected').length,
    busy: calls.filter((x: any) => x.status === 'busy').length,
    noAnswer: calls.filter((x: any) => x.status === 'no_answer').length,
    failed: calls.filter((x: any) => x.status === 'failed').length,
    running: calls.filter((x: any) => ['dialing','ringing','connected','talking'].includes(x.status)).length,
    appointments: 0,
    avgDur: calls.reduce((s: number, x: any) => s + (x.duration_seconds || 0), 0) / Math.max(calls.length, 1),
    totalLeads: leads.length,
    conversionRate: Math.round((calls.filter((x: any) => x.status === 'completed').length / Math.max(leads.length, 1)) * 100),
  };

  const chartData = analytics.filter((x: any) => x.metric === 'calls_per_day').slice(-7).map((x: any) => ({ day: x.date, calls: x.value }));

  const Card = ({ icon: Icon, label, value, sub }: any) => (
    <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-md hover:bg-white/[0.09] transition">
      <div className="flex items-center justify-between mb-4"><Icon className="text-cyan-400" size={22} /><span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span></div>
      <div className="text-3xl font-extrabold tracking-tight">{value}</div>
      {sub && <div className="mt-1 text-sm text-slate-400">{sub}</div>}
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar active="/dashboard" />
      <div className="absolute top-4 right-6 z-50"><ThemeToggle /></div>
      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Dashboard</h1>
        <p className="text-slate-400 mb-8">Real-time calling progress from your campaigns.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Card icon={PhoneCall} label="Total Calls" value={stats.total} sub="All time" />
          <Card icon={CheckCircle2} label="Answered" value={stats.answered} sub="Completed / Talking" />
          <Card icon={Users} label="Total Leads" value={stats.totalLeads} sub="Uploaded" />
          <Card icon={TrendingUp} label="Conversion Rate" value={`${stats.conversionRate}%`} sub="Calls / Leads" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Card icon={AlertCircle} label="No Answer" value={stats.noAnswer} sub="No pickup" />
          <Card icon={Activity} label="Failed" value={stats.failed} sub="Errors / retries" />
          <Card icon={TrendingUp} label="Running" value={stats.running} sub="Active now" />
          <Card icon={CalendarDays} label="Avg Duration" value={`${Math.round(stats.avgDur / 60)}m`} sub="Per call" />
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-md mb-8">
          <h3 className="font-bold text-lg mb-4">Calls Per Day (Last 7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="day" stroke="#94a3b8" fontSize={12} /><YAxis stroke="#94a3b8" fontSize={12} /><Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} /><Bar dataKey="calls" fill="#22d3ee" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-md">
          <h3 className="font-bold text-lg mb-3">Recent Activity</h3>
          <div className="divide-y divide-white/10">
            {calls.slice(0, 6).map((c: any) => (
              <div key={c.id} className="py-3 flex items-center gap-4 text-sm"><span className="font-mono text-xs text-slate-500">{new Date(c.created_at).toLocaleString()}</span><span className="font-medium">{c.phone || 'Unknown'}</span><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : c.status === 'failed' ? 'bg-red-500/20 text-red-300' : 'bg-cyan-500/20 text-cyan-300'}`}>{c.status}</span></div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
