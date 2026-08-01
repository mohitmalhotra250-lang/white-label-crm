import { useState } from 'react';
import Sidebar from '../../components/sidebar';
import { BookOpen, Copy } from 'lucide-react';

export default function ApiDocsPage() {
  const [token, setToken] = useState('YOUR_JWT_TOKEN_HERE');
  return (
    <div className="flex min-h-screen"><Sidebar active="/settings" />
      <main className="flex-1 p-6 lg:p-10 overflow-auto max-w-5xl">
        <h1 className="text-3xl font-extrabold mb-2">Public REST API</h1>
        <p className="text-slate-400 mb-6">For integrations with HubSpot, Zapier, Salesforce, and custom apps.</p>

        <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-8 shadow-xl space-y-6">
          <section>
            <h3 className="font-bold text-lg mb-2">Authentication</h3>
            <div className="bg-black/30 rounded-xl p-3 font-mono text-xs text-cyan-300">Authorization: Bearer &lt;jwt&gt;</div>
          </section>
          <section>
            <h3 className="font-bold text-lg mb-2">Leads</h3>
            <div className="bg-black/30 rounded-xl p-3 font-mono text-xs text-slate-300">GET /api/leads • POST /api/leads • POST /api/leads/upload</div>
          </section>
          <section>
            <h3 className="font-bold text-lg mb-2">Calls</h3>
            <div className="bg-black/30 rounded-xl p-3 font-mono text-xs text-slate-300">GET /api/calls • POST /api/calls/start • POST /api/calls/:id/stop</div>
          </section>
          <section>
            <h3 className="font-bold text-lg mb-2">Analytics</h3>
            <div className="bg-black/30 rounded-xl p-3 font-mono text-xs text-slate-300">GET /api/analytics?from=&to=</div>
          </section>
          <section>
            <h3 className="font-bold text-lg mb-2">Webhooks</h3>
            <div className="bg-black/30 rounded-xl p-3 font-mono text-xs text-slate-300">POST /api/webhooks/:providerName (secret required)</div>
          </section>
          <section>
            <h3 className="font-bold text-lg mb-2">Example cURL</h3>
            <div className="bg-black/30 rounded-xl p-3 font-mono text-xs text-green-300 overflow-auto">curl -H "Authorization: Bearer {token}" http://localhost:4000/api/calls</div>
          </section>
        </div>
      </main>
    </div>
  );
}
