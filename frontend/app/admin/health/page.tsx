"use client";
import { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/admin-sidebar';
import { apiGet } from '../../../lib/api';
import { Activity, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function AdminHealth() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { apiGet('/admin/monitoring').then(r => setData(r)).catch(() => setData({ status: 'unhealthy', error: 'Connection failed' })); }, []);
  return (
    <div className="flex min-h-screen"><AdminSidebar active="/admin/health" />
      <main className="flex-1 p-6 lg:p-10 overflow-auto max-w-6xl">
        <h1 className="text-3xl font-extrabold mb-2">Health Dashboard</h1>
        <p className="text-slate-400 mb-6">Real-time provider status, queue health, API latency.</p>
        <div className="grid md:grid-cols-3 gap-5 mb-6">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-400/20 p-6 shadow-xl"><div className="text-xs uppercase text-emerald-300 mb-1">Status</div><div className="text-3xl font-extrabold">{data?.status || 'Unknown'}</div></div>
          <div className="rounded-3xl bg-gradient-to-br from-cyan-900/40 to-slate-900 border border-cyan-400/20 p-6 shadow-xl"><div className="text-xs uppercase text-cyan-300 mb-1">DB Latency</div><div className="text-3xl font-extrabold">{data?.dbLatencyMs || '--'}ms</div></div>
          <div className="rounded-3xl bg-gradient-to-br from-amber-900/40 to-slate-900 border border-amber-400/20 p-6 shadow-xl"><div className="text-xs uppercase text-amber-300 mb-1">Queue</div><div className="text-3xl font-extrabold">Active</div></div>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl"><h3 className="font-bold text-lg mb-4">Provider Status</h3><table className="w-full text-sm"><thead className="text-slate-300"><tr><th>Provider</th><th>Health</th><th>Last Tested</th></tr></thead><tbody className="divide-y divide-white/5">
          {data?.providers ? data.providers.map((p: any) => (
            <tr key={p.id || p.name}><td className="py-2 font-medium">{p.name}</td><td><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.health_status === 'connected' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>{p.health_status}</span></td><td className="py-2 text-slate-400">{p.last_tested_at ? new Date(p.last_tested_at).toLocaleString() : 'N/A'}</td></tr>
          )) : <tr><td colSpan={3} className="py-4 text-slate-500">No provider data</td></tr>}
        </tbody></table></div>
      </main>
    </div>
  );
}
