"use client";
import { useEffect, useState } from 'react';
import Sidebar from '../../components/sidebar';
import { apiGet, apiPost } from '../../lib/api';
import { Play, Pause, Square, RefreshCw, Phone, Clock } from 'lucide-react';

export default function CallingPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ total: 0, completed: 0, remaining: 0, currentStatus: 'idle' });

  async function refresh() { const res = await apiGet('/calls'); setCalls(res.calls || []); const total = (res.calls || []).length; const done = (res.calls || []).filter((c: any) => c.status === 'completed').length; const rem = (res.calls || []).filter((c: any) => ['dialing','ringing','connected','talking'].includes(c.status)).length; setProgress({ total, completed: done, remaining: rem, currentStatus: rem > 0 ? 'running' : 'idle' }); }
  useEffect(() => { refresh(); const iv = setInterval(refresh, 3000); return () => clearInterval(iv); }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar active="/calling" />
      <main className="flex-1 p-6 lg:p-10 overflow-auto max-w-5xl">
        <h1 className="text-3xl font-extrabold mb-2">Calling</h1>
        <p className="text-slate-400 mb-8">Control your AI voice calling campaign.</p>

        <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-8 shadow-2xl backdrop-blur-md mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <button onClick={async () => { await apiPost('/calls/start', { campaignId: 'demo', agentId: 'demo', phone: '9876543210' }).catch(() => {}); refresh(); }} className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 font-bold shadow-lg hover:brightness-110 flex items-center gap-2"><Play size={18}/> Start Calling</button>
            <button onClick={async () => { await apiPost('/calls/demo/stop'); refresh(); }} className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 font-bold shadow-lg hover:brightness-110 flex items-center gap-2"><Square size={18}/> Stop</button>
            <button onClick={() => { setRunning(!running); refresh(); }} className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 font-bold shadow-lg hover:brightness-110 flex items-center gap-2">{running ? <Pause size={18}/> : <RefreshCw size={18}/>} {running ? 'Pause' : 'Resume'}</button>
          </div>

          <div className="mb-2 flex items-center justify-between text-sm font-medium"><span>Campaign Progress</span><span>{progress.completed} / {progress.total} completed</span></div>
          <div className="h-3 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-700" style={{ width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%` }} /></div>
          <div className="grid grid-cols-3 gap-4 mt-6 text-sm"><div className="rounded-xl bg-white/5 p-3 text-center"><div className="font-extrabold text-xl">{progress.remaining}</div><div className="text-slate-400">Remaining</div></div><div className="rounded-xl bg-white/5 p-3 text-center"><div className="font-extrabold text-xl">{progress.currentStatus}</div><div className="text-slate-400">Status</div></div><div className="rounded-xl bg-white/5 p-3 text-center"><div className="font-extrabold text-xl">{calls.filter((c: any) => ['completed'].includes(c.status)).length}</div><div className="text-slate-400">Completed</div></div></div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Phone size={20} className="text-cyan-400"/> Active / Recent Calls</h3>
          <div className="space-y-3">
            {calls.slice(0, 6).map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5"><div><div className="font-medium">{c.phone || 'Unknown'}</div><div className="text-xs text-slate-500">{new Date(c.created_at).toLocaleString()}</div></div><div className="flex items-center gap-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>{c.status}</span></div></div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
