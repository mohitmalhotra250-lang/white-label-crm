import { useState } from 'react';
import { useState, useEffect } from 'react';
import AdminSidebar from '../../../components/admin-sidebar';
import { apiGet, apiPost } from '../../../lib/api';
import { Zap, Mic2, FileText, Activity } from 'lucide-react';

export default function AdminSandbox() {
  const [providerId, setProviderId] = useState('');
  const [agentId, setAgentId] = useState('');
  const [phone, setPhone] = useState('+911234567890');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<any[]>([]);

  useEffect(() => { apiGet('/admin/providers').then(r => setProviders(r.providers || [])).catch(() => setProviders([])); }, []); // simplified

  const test = async () => {
    setLoading(true); setResult(null);
    try {
      const res = await apiPost('/admin/sandbox/test', { providerId, agentId, phoneNumber: phone, agentConfig: { name: 'Test Agent', prompt: 'Test call', voice: 'Rachel', language: 'en', greeting: 'Hello' } });
      setResult(res);
    } catch (e: any) { setResult({ error: e.message || 'Test failed' }); }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen"><AdminSidebar active="/admin/sandbox" />
      <main className="flex-1 p-6 lg:p-10 overflow-auto max-w-5xl">
        <h1 className="text-3xl font-extrabold mb-2">Provider Sandbox</h1>
        <p className="text-slate-400 mb-6">Test any provider with a single call. Only Super Admin.</p>
        <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl mb-6">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <select value={providerId} onChange={e => setProviderId(e.target.value)} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm"><option value="">Select Provider</option>{providers.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            <input value={agentId} onChange={e => setAgentId(e.target.value)} placeholder="Agent ID" className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm" />
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number" className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm" />
          </div>
          <button onClick={test} disabled={loading || !providerId} className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold shadow-lg hover:brightness-110 disabled:opacity-50">Run Test Call</button>
        </div>

        {result && (
          <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2"><Zap size={20} className="text-cyan-400"/> Test Result</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div><div className="text-xs text-slate-400">Provider</div><div className="font-medium">{result.provider || 'N/A'}</div></div>
              <div><div className="text-xs text-slate-400">Status</div><div className={`font-medium ${result.status === 'completed' ? 'text-emerald-300' : 'text-cyan-300'}`}>{result.status || 'N/A'}</div></div>
              <div><div className="text-xs text-slate-400">Latency</div><div className="font-medium">{result.latencyMs ? result.latencyMs + 'ms' : 'N/A'}</div></div>
            </div>
            <div className="bg-black/30 rounded-xl p-3 font-mono text-xs overflow-auto"><strong>Raw Request</strong><pre>{JSON.stringify(result.rawRequest || {}, null, 2)}</pre></div>
            <div className="bg-black/30 rounded-xl p-3 font-mono text-xs overflow-auto"><strong>Raw Response</strong><pre>{JSON.stringify(result.rawResponse || {}, null, 2)}</pre></div>
            <div><strong>Webhooks:</strong> {result.webhookEvents?.map((e: any) => e.event).join(', ') || 'N/A'}</div>
            <div><strong>Recording URL:</strong> <a href={result.recordingUrl || '#'} className="text-cyan-300 underline">{result.recordingUrl || 'Not available'}</a></div>
            <div><strong>Transcript:</strong> {result.transcript || 'Not yet available'}</div>
            <div><strong>Error:</strong> <span className="text-red-300">{result.error || 'None'}</span></div>
          </div>
        )}
      </main>
    </div>
  );
}
