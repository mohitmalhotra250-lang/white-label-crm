"use client";
import AdminSidebar from '../../../components/admin-sidebar';
import { apiGet } from '../../../lib/api';
import { useEffect, useState } from 'react';
import { Users, Trash2, RefreshCw } from 'lucide-react';
export default function AdminClients() {
  const [clients, setClients] = useState<any[]>([]);
  useEffect(() => { apiGet('/leads').then(r => setClients([])).catch(() => { setClients([]); console.error('Failed to load clients') }); }, []);
  return (
    <div className="flex min-h-screen"><AdminSidebar active="/admin/clients" />
      <main className="flex-1 p-8 overflow-auto max-w-6xl"><h1 className="text-3xl font-extrabold mb-2">Client Management</h1>
        <table className="w-full text-sm text-left rounded-2xl overflow-hidden border border-white/10"><thead className="bg-white/5"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Usage</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-white/5">{clients.map((c:any,i:number)=><tr key={i}><td className="px-4 py-3 font-medium">{c.name}</td><td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-300">{c.status}</span></td><td className="px-4 py-3 text-slate-400">Active</td><td className="px-4 py-3"><button className="text-red-400 hover:text-white text-xs"><Trash2 size={14}/></button></td></tr>)}</tbody></table>
      </main></div>
  );
}
