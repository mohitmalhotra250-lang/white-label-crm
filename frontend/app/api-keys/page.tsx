"use client";
import { useEffect, useState } from 'react';
import Sidebar from '../../components/sidebar';
import { apiGet } from '../../lib/api';
import { Key, Copy } from 'lucide-react';
export default function ApiKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  useEffect(() => { apiGet('/admin/api-keys').then(r => setKeys(r.keys || [])); }, []);
  return (
    <div className="flex min-h-screen"><Sidebar active="/settings" />
      <main className="flex-1 p-6 lg:p-10 overflow-auto max-w-4xl">
        <h1 className="text-3xl font-extrabold mb-2">API Keys</h1>
        <p className="text-slate-400 mb-6">Public REST API access for integrations.</p>
        <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl space-y-3">
          {keys.map((k: any) => (
            <div key={k.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div><div className="font-medium">{k.name || 'Key'}</div><div className="text-xs text-slate-400">Scopes: {(k.scopes || []).join(', ')} • Rate: {k.rate_limit_rpm || 60}/min</div></div>
              <button onClick={() => navigator.clipboard.writeText(k.key_hash || 'hidden')} className="text-xs text-cyan-300 hover:underline flex items-center gap-1"><Copy size={12}/> Copy</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
