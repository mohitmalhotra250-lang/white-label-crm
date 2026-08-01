"use client";
import { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/admin-sidebar';
import { apiGet } from '../../../lib/api';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export default function AdminRevenue() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { apiGet('/api/admin/revenue').then(r => setData(r)).catch(() => setData({ revenue: {}, clients: {}, usage: {}, providerCosts: [], subscriptions: {} })); }, []);

  return (
    <div className="flex min-h-screen"><AdminSidebar active="/admin/revenue" />
      <main className="flex-1 p-6 lg:p-10 overflow-auto max-w-6xl">
        <h1 className="text-3xl font-extrabold mb-2">Revenue & Business Intelligence</h1>
        <p className="text-slate-400 mb-6">Super Admin only — real-time revenue, cost, profit, usage.</p>

        <div className="grid md:grid-cols-4 gap-5 mb-8">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-900/30 to-slate-900 border border-emerald-400/20 p-6 shadow-xl"><div className="text-xs text-slate-400">Total Revenue</div><div className="text-3xl font-extrabold text-emerald-300">₹{(data?.revenue?.totalRevenueCents || 0) / 100}</div></div>
          <div className="rounded-3xl bg-gradient-to-br from-cyan-900/30 to-slate-900 border border-cyan-400/20 p-6 shadow-xl"><div className="text-xs text-slate-400">Gross Profit</div><div className="text-3xl font-extrabold text-cyan-300">₹{(data?.revenue?.grossProfitCents || 0) / 100}</div></div>
          <div className="rounded-3xl bg-gradient-to-br from-amber-900/30 to-slate-900 border border-amber-400/20 p-6 shadow-xl"><div className="text-xs text-slate-400">AI Cost</div><div className="text-3xl font-extrabold text-amber-300">₹{(data?.revenue?.totalCostCents || 0) / 100}</div></div>
          <div className="rounded-3xl bg-gradient-to-br from-violet-900/30 to-slate-900 border border-violet-400/20 p-6 shadow-xl"><div className="text-xs text-slate-400">Active Clients</div><div className="text-3xl font-extrabold text-violet-300">{data?.clients?.active || 0}</div></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl"><h3 className="font-bold mb-3">Daily Usage (Minutes)</h3><ResponsiveContainer width="100%" height={250}><BarChart data={data?.charts?.dailyUsage || []}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="date" stroke="#94a3b8" fontSize={12} /><YAxis stroke="#94a3b8" fontSize={12} /><Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} /><Bar dataKey="minutes" fill="#22d3ee" radius={[8,8,0,0]} /></BarChart></ResponsiveContainer></div>
          <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl"><h3 className="font-bold mb-3">Provider Cost Breakdown</h3><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={((data?.providerCosts || [])).map((p: any) => ({ name: p.provider, value: p.total_cost_cents || 0 }))} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value"><Cell fill="#22d3ee" /><Cell fill="#f87171" /><Cell fill="#fbbf24" /><Cell fill="#a78bfa" /><Cell fill="#34d399" /></Pie><Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} /><Legend /></PieChart></ResponsiveContainer></div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl">
          <h3 className="font-bold text-lg mb-3">Usage Limits & Client Implementation</h3>
          <p className="text-sm text-slate-400">Each client's usage limits (minutes, daily/monthly calls, concurrent) are enforced automatically at /api/calls/start. Alerts shown at 80/90/100% consumption.</p>
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-xs text-slate-400">Remaining Minutes</div><div className="font-extrabold">{data?.clients?.total || 0}</div></div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-xs text-slate-400">Active Plans</div><div className="font-extrabold">{data?.subscriptions?.activePlans || 0}</div></div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10"><div className="text-xs text-slate-400">Pending Invoices</div><div className="font-extrabold">{data?.subscriptions?.pendingInvoices || 0}</div></div>
          </div>
        </div>
      </main>
    </div>
  );
}
