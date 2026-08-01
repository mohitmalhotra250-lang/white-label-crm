import { useEffect, useState } from 'react';
import Sidebar from '../../components/sidebar';
import { apiGet } from '../../lib/api';
import { Phone, Download } from 'lucide-react';

export default function CallHistoryPage() {
  const [calls, setCalls] = useState<any[]>([]);
  useEffect(() => { apiGet('/calls').then(r => setCalls(r.calls || [])); }, []);
  return (
    <div className="flex min-h-screen"><Sidebar active="/call-history" />
      <main className="flex-1 p-6 lg:p-10 overflow-auto max-w-6xl">
        <h1 className="text-3xl font-extrabold mb-2">Call History</h1>
        <p className="text-slate-400 mb-6">Every call with status, duration, provider and recordings.</p>
        <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 shadow-xl overflow-auto">
          <table className="w-full text-sm text-left"><thead className="bg-white/5 text-slate-300"><tr><th className="px-4 py-3">Lead / Phone</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Duration</th><th className="px-4 py-3">Provider</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-white/5">
            {calls.map((c: any) => (
              <tr key={c.id} className="hover:bg-white/[0.03]"><td className="px-4 py-3 font-medium">{c.lead_id ? 'Lead #' + c.lead_id.slice(0, 6) : 'Direct'} <br/><span className="text-xs text-slate-500">{c.phone}</span></td><td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : c.status === 'failed' ? 'bg-red-500/20 text-red-300' : 'bg-cyan-500/20 text-cyan-300'}`}>{c.status}</span></td><td className="px-4 py-3">{Math.round((c.duration_seconds || 0) / 60)}m</td><td className="px-4 py-3 text-slate-400">{c.provider || 'N/A'}</td><td className="px-4 py-3"><a href={`/recordings?id=${c.id}`} className="text-cyan-300 hover:underline text-xs flex items-center gap-1"><Download size={14}/> Recording</a></td></tr>
            ))}
          </tbody></table>
        </div>
      </main>
    </div>
  );
}
