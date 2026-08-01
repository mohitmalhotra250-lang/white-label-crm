"use client";
import { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/admin-sidebar';
import { apiGet } from '../../../lib/api';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function AdminCosts() {
  const [data, setData] = useState<any>({ providerCosts: [], clientBilling: [] });
  useEffect(() => { apiGet('/api/admin/costs').then(r => setData(r)).catch(() => setData({ providerCosts: [], clientBilling: [] })); }, []);
  const pieData = (data.providerCosts || []).map((p: any) => ({ name: p.provider, value: p.total_cost_cents || 0 }));
  return (
    <div className="flex min-h-screen"><AdminSidebar active="/admin/costs" />
      <main className="flex-1 p-6 lg:p-10 overflow-auto max-w-6xl">
        <h1 className="text-3xl font-extrabold mb-2">AI Cost Dashboard</h1>
        <p className="text-slate-400 mb-6">Super Admin only — real-time provider costs, revenue, profit.</p>
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl"><h3 className="font-bold mb-4">Provider Cost Breakdown</h3><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value"><Cell fill="#22d3ee" /><Cell fill="#f87171" /><Cell fill="#fbbf24" /><Cell fill="#a78bfa" /></Pie><Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334055', color: '#f8fafc' }} /><Legend /></PieChart></ResponsiveContainer></div>
          <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl"><h3 className="font-bold mb-4">Client Billing Summary</h3><table className="w-full text-sm"><thead><tr><th>Client</th><th>Revenue</th><th>AI Cost</th><th>Profit</th><th>Remaining Min</th></tr></thead><tbody>{(data.clientBilling || []).map((c: any) => (<tr key={c.id}><td className="py-2">{c.name}</td><td>₹{(c.revenue_cents||0)/100}</td><td>₹{(c.total_ai_cost_cents||0)/100}</td><td>₹{((c.revenue_cents||0)-(c.total_ai_cost_cents||0))/100}</td><td>{c.remaining_minutes||0}</td></tr>))}</tbody></table></div>
        </div>
      </main>
    </div>
  );
}
