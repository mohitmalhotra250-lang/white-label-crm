import AdminSidebar from '../../../components/admin-sidebar';
import { apiGet } from '../../../lib/api';
import { useEffect, useState } from 'react';
import { Plug, CheckCircle2, AlertCircle } from 'lucide-react';
export default function AdminProviders() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => { apiGet('/admin/providers').then(r => setList(r.providers || [])).catch(() => { setList([]); console.error('Failed to load providers') }) }, []);
  return <div className="flex min-h-screen"><AdminSidebar active="/admin/providers" /><main className="flex-1 p-8 overflow-auto max-w-6xl"><h1 className="text-3xl font-extrabold mb-2">Provider Manager</h1><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{list.map(p => <div key={p.id||p.name} className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl"><div className="flex items-center gap-2 mb-2"><Plug size={18} className="text-cyan-400"/><h3 className="font-bold">{p.name}</h3></div><div className="text-xs text-slate-400 mb-1">Status: <span className={p.health_status==='connected'?'text-emerald-300':'text-red-300'}>{p.health_status}</span></div><div className="text-xs text-slate-400">Enabled: {String(p.enabled)}</div></div>)}</div></main></div>;
}
