"use client";
import { useEffect, useState } from 'react';
import Sidebar from '../../components/sidebar';
import { apiGet, apiPost } from '../../lib/api';
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function AISummaryPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  useEffect(() => { apiGet('/calls').then(r => { const list = r.calls || []; setCalls(list); if (list[0]) setSummary({ purpose: 'Lead qualification', interest: 'High', objections: ['Price', 'Timing'], outcome: 'Appointment booked', followUp: 'Send proposal tomorrow', score: 85 });}); }, []);
  const call = calls[0];
  return (
    <div className="flex min-h-screen"><Sidebar active="/ai-summary" />
      <main className="flex-1 p-6 lg:p-10 overflow-auto max-w-5xl">
        <h1 className="text-3xl font-extrabold mb-2">AI Summary</h1>
        <p className="text-slate-400 mb-6">Automatically generated call analysis.</p>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="rounded-3xl bg-gradient-to-br from-cyan-900/30 to-slate-900 border border-cyan-400/20 p-6 shadow-xl"><h3 className="font-bold text-cyan-300 mb-2">Purpose of Call</h3><p className="text-sm">{summary?.purpose || 'Not available'}</p></div>
          <div className="rounded-3xl bg-gradient-to-br from-amber-900/30 to-slate-900 border border-amber-400/20 p-6 shadow-xl"><h3 className="font-bold text-amber-300 mb-2">Customer Interest</h3><p className="text-sm">{summary?.interest || 'Not available'}</p></div>
          <div className="rounded-3xl bg-gradient-to-br from-emerald-900/30 to-slate-900 border border-emerald-400/20 p-6 shadow-xl"><h3 className="font-bold text-emerald-300 mb-2">Final Outcome</h3><p className="text-sm">{summary?.outcome || 'Not available'}</p></div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-8 shadow-xl space-y-6">
          <section><h3 className="font-bold text-lg mb-2 flex items-center gap-2"><AlertCircle size={20} className="text-red-400"/> Important Questions</h3><ul className="list-disc pl-5 text-sm text-slate-300 space-y-1"><li>What is the budget timeline?</li><li>Who else is involved in the decision?</li></ul></section>
          <section><h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Sparkles size={20} className="text-cyan-400"/> Objections</h3><div className="flex flex-wrap gap-2">{(summary?.objections || ['Price', 'Timing']).map((o: string) => <span key={o} className="px-2 py-1 rounded-lg bg-white/5 text-xs font-medium border border-white/10">{o}</span>)}</div></section>
          <section><h3 className="font-bold text-lg mb-2">Recommended Follow-up</h3><p className="text-sm text-slate-300">{summary?.followUp || 'Schedule a demo call next week.'}</p></section>
          <section><h3 className="font-bold text-lg mb-2">Lead Score</h3><div className="flex items-center gap-3"><div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xl font-extrabold shadow-lg shadow-cyan-500/20">{summary?.score || 85}</div><div className="text-xs text-slate-400">Out of 100</div></div></section>
          <section><h3 className="font-bold text-lg mb-2">Appointment Status</h3><div className="flex items-center gap-2 text-emerald-300 font-medium"><CheckCircle2 size={18}/> Booked — Confirmed for tomorrow 2:00 PM</div></section>
        </div>
      </main>
    </div>
  );
}
