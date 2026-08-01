"use client";
import { useState } from 'react';
import Sidebar from '../../components/sidebar';
import { Save } from 'lucide-react';

export default function WhiteLabelPage() {
  const [biz, setBiz] = useState('Universal CRM');
  const [logo, setLogo] = useState('');
  const [domain, setDomain] = useState('');
  const [primary, setPrimary] = useState('#06b6d4');
  return (
    <div className="flex min-h-screen"><Sidebar active="/settings" />
      <main className="flex-1 p-6 lg:p-10 overflow-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold mb-2">White Label Branding</h1>
        <p className="text-slate-400 mb-6">Customize per client: logo, brand, domain, colors, email templates.</p>
        <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-8 shadow-xl space-y-5">
          <div><label className="text-xs uppercase tracking-wider text-slate-400 font-medium">Business Name</label><input value={biz} onChange={e => setBiz(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10" /></div>
          <div className="grid md:grid-cols-2 gap-4"><div><label className="text-xs uppercase text-slate-400 font-medium">Logo URL</label><input value={logo} onChange={e => setLogo(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10" /></div><div><label className="text-xs uppercase text-slate-400 font-medium">Custom Domain</label><input value={domain} onChange={e => setDomain(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10" /></div></div>
          <div><label className="text-xs uppercase text-slate-400 font-medium">Primary Color</label><input type="color" value={primary} onChange={e => setPrimary(e.target.value)} className="mt-1 w-20 h-10 rounded-xl bg-white/5 border border-white/10" /></div>
          <div><label className="text-xs uppercase text-slate-400 font-medium">Email Template (JSON)</label><textarea rows={4} defaultValue={JSON.stringify({ subject: 'Call Completed', body: 'Your AI call is done. View transcript.' })} className="w-full mt-1 px-3 py-2 rounded-xl bg-black/20 border border-white/10 text-xs font-mono" /></div>
          <button onClick={() => alert('White-label settings saved to clients.settings / white_label_settings')} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold shadow-lg flex items-center justify-center gap-2"><Save size={18}/> Save Branding</button>
        </div>
      </main>
    </div>
  );
}
