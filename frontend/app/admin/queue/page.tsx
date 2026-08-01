import AdminSidebar from '../../../components/admin-sidebar';
import { apiGet } from '../../../lib/api';
import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
export default function AdminQueue() {
  const [jobs, setJobs] = useState<any[]>([]);
  useEffect(() => { apiGet('/calls').then(r => setJobs((r.calls||[]).map((c:any)=>({id:c.id, status:c.status, phone:c.phone, provider:c.provider})))); }, []);
  return <div className="flex min-h-screen"><AdminSidebar active="/admin/queue" /><main className="flex-1 p-8 overflow-auto max-w-6xl"><h1 className="text-3xl font-extrabold mb-2">Queue Monitoring</h1><div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl"><div className="grid md:grid-cols-4 gap-4 mb-4">{['queued','dialing','talking','completed'].map(s=><div key={s} className="rounded-2xl bg-white/5 p-4 text-center"><div className="text-2xl font-extrabold">{jobs.filter(j=>j.status===s||j.status==='dialing').length}</div><div className="text-xs text-slate-400 uppercase">{s}</div></div>)}</div><table className="w-full text-sm"><thead className="text-slate-300"><tr><th>Call ID</th><th>Phone</th><th>Provider</th><th>Status</th></tr></thead><tbody className="divide-y divide-white/5">{jobs.map(j=><tr key={j.id}><td className="py-2 font-mono text-xs">{j.id?.slice(0,8)}</td><td>{j.phone}</td><td>{j.provider||'N/A'}</td><td><span className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-300">{j.status}</span></td></tr>)}</tbody></table></div></main></div>;
}
