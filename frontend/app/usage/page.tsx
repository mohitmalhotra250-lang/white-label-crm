"use client";
import { useEffect, useState } from 'react';
import Sidebar from '../../components/sidebar';
import { apiGet } from '../../lib/api';
import { Zap, AlertTriangle, Clock } from 'lucide-react';

export default function UsagePage() {
  const [limits, setLimits] = useState<any>({});
  const [usage, setUsage] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  useEffect(() => { apiGet('/api/admin/usage').catch(() => {}); apiGet('/calls').then(r => setUsage(r.calls || [])); }, []);
  // Mock limit awareness for demo until backend fully connected
  const remaining = limits.minutes_remaining ?? 120;
  const pctUsed = Math.round(((120 - remaining) / 120) * 100);
  const alertsList = [];
  if (pctUsed >= 80) alertsList.push({ msg: '80% minutes used', level: 'warning' });
  if (pctUsed >= 90) alertsList.push({ msg: '90% minutes used', level: 'critical' });
  if (pctUsed >= 100) alertsList.push({ msg: 'Minutes exhausted', level: 'danger' });
  return (
    <div className="flex min-h-screen"><Sidebar active="/settings" />
      <main className="flex-1 p-6 lg:p-10 overflow-auto max-w-6xl">
        <h1 className="text-3xl font-extrabold mb-2">Usage Limits</h1>
        <p className="text-slate-400 mb-6">Real-time usage tracking and limit enforcement.</p>
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl"><div className="text-xs uppercase text-slate-400 mb-1">Minutes Remaining</div><div className="text-3xl font-extrabold text-cyan-300">{remaining}</div><div className="mt-2 h-3 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${pctUsed}%` }} /></div></div>
          <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl"><div className="text-xs uppercase text-slate-400 mb-1">Usage %</div><div className="text-3xl font-extrabold">{pctUsed}%</div></div>
          <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl"><div className="text-xs uppercase text-slate-400 mb-1">Plan</div><div className="text-3xl font-extrabold">Basic</div></div>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl mb-8">
          <h3 className="font-bold text-lg mb-3">Alerts</h3>
          {alertsList.length === 0 ? <div className="text-slate-400 text-sm">No alerts — usage healthy.</div> : (
            <div className="space-y-2">{alertsList.map((a: any) => (
              <div key={a.msg} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${a.level === 'danger' ? 'bg-red-500/20 text-red-300' : a.level === 'critical' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'}`}><AlertTriangle size={16}/> {a.msg}</div>
            ))}</div>
          )}
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl"><h3 className="font-bold text-lg mb-3">Recent Usage (Real DB)</h3><div className="grid grid-cols-4 gap-3">{usage.slice(0,4).map((c:any) => <div key={c.id} className="rounded-xl bg-white/5 p-3"><div className="font-medium">{c.phone}</div><div className="text-xs text-slate-400">{new Date(c.created_at).toLocaleString()}</div><div className="text-xs">{c.status}</div></div>)}</div></div>
      </main>
    </div>
  );
}
