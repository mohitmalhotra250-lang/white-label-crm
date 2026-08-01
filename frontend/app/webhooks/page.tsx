import { useEffect, useState } from 'react';
import Sidebar from '../../components/sidebar';
import { apiGet } from '../../lib/api';
import { Webhook, RefreshCw } from 'lucide-react';
export default function WebhooksPage() {
  const [w, setW] = useState<any[]>([]);
  useEffect(() => { apiGet('/admin/webhooks-manage').then(r => setW(r.webhooks || [])); }, []);
  return (
    <div className="flex min-h-screen"><Sidebar active="/settings" />
      <main className="flex-1 p-6 lg:p-10 overflow-auto max-w-5xl">
        <h1 className="text-3xl font-extrabold mb-2">Webhook Logs</h1>
        <p className="text-slate-400 mb-6">Incoming webhook events from providers.</p>
        <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl space-y-3">
          {w.map((x: any) => (
            <div key={x.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3"><Webhook size={16} className="text-cyan-400"/><div><div className="font-medium text-sm">{x.event_type}</div><div className="text-xs text-slate-400">{x.url} • {x.is_active ? 'Active' : 'Disabled'}</div></div></div>
          ))}
        </div>
      </main>
    </div>
  );
}
