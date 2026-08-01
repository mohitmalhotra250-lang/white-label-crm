import AdminSidebar from '../../components/admin-sidebar';
import { apiGet } from '../../lib/api';
import { Shield, Users, Plug, CreditCard, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminOverview() {
  const [stats, setStats] = useState({ clients: 0, providers: 0, calls: 0 });
  useEffect(() => { Promise.all([apiGet('/calls'), apiGet('/leads')]).then(([c, l]) => setStats({ clients: 1, providers: 1, calls: c.calls?.length || 0 })); }, []);
  return (
    <div className="flex min-h-screen">
      <AdminSidebar active="/admin" />
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-extrabold mb-2">Super Admin Portal</h1>
        <p className="text-slate-400 mb-6">Manage every client, provider, agent, billing, and system health.</p>
        <div className="grid md:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Clients', value: stats.clients, icon: Users },
            { label: 'Providers', value: stats.providers, icon: Plug },
            { label: 'Calls Today', value: stats.calls, icon: Activity },
            { label: 'Usage', value: 'Live', icon: CreditCard },
          ].map(s => (
            <div key={s.label} className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl"><div className="flex items-center gap-3 mb-2"><s.icon size={22} className="text-rose-400"/><span className="text-xs uppercase text-slate-400">{s.label}</span></div><div className="text-3xl font-extrabold">{s.value}</div></div>
          ))}
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl"><h3 className="font-bold text-lg">Provider Health</h3><p className="text-sm text-slate-400">Switch providers instantly from the Provider Manager. The client dashboard never changes.</p></div>
      </main>
    </div>
  );
}
