import { useEffect, useState } from 'react';
import Sidebar from '../../components/sidebar';
import { apiGet } from '../../lib/api';
import { FileText, Copy, Search } from 'lucide-react';

export default function TranscriptsPage() {
  const [transcripts, setTranscripts] = useState<any[]>([]);
  const [q, setQ] = useState('');
  useEffect(() => { apiGet('/calls').then(r => { const ts = (r.calls || []).map((c: any) => ({ id: c.id, phone: c.phone, content: c.transcript ? c.transcript.content : 'Loading transcript...', segments: c.transcript ? JSON.parse(c.transcript.speaker_segments || '[]') : [] })); setTranscripts(ts); }); }, []);
  const list = transcripts.filter(t => (t.phone || '').includes(q) || (t.content || '').toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="flex min-h-screen"><Sidebar active="/transcripts" />
      <main className="flex-1 p-6 lg:p-10 overflow-auto max-w-4xl">
        <h1 className="text-3xl font-extrabold mb-2">Transcripts</h1>
        <p className="text-slate-400 mb-6">Beautiful chat-style transcripts with AI and Customer labels.</p>
        <div className="flex gap-3 mb-6"><div className="relative flex-1"><Search className="absolute left-3 top-3 text-slate-400" size={18}/><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search transcripts..." className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm" /></div><button onClick={() => navigator.clipboard.writeText(list.map(t => t.content).join('\n'))} className="px-4 py-3 rounded-2xl bg-cyan-500/20 text-cyan-300 font-medium text-sm hover:bg-cyan-500/30 flex items-center gap-2"><Copy size={16}/> Copy All</button></div>
        <div className="space-y-6">
          {list.map(t => (
            <div key={t.id} className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3"><h3 className="font-bold">{t.phone || 'Call #' + t.id.slice(0,6)}</h3><button onClick={() => navigator.clipboard.writeText(t.content)} className="text-xs text-cyan-300 hover:underline">Copy</button></div>
              <div className="space-y-3">
                {t.segments && t.segments.length ? t.segments.map((seg: any, i: number) => (
                  <div key={i} className={`flex gap-3 ${seg.speaker === 'AI' ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${seg.speaker === 'AI' ? 'bg-cyan-500/10 text-cyan-100 border border-cyan-400/20' : 'bg-amber-500/10 text-amber-50 border border-amber-400/20'}`}>
                      <div className="text-xs font-bold uppercase tracking-wide mb-1 opacity-70">{seg.speaker}</div>
                      <div>{seg.text}</div>
                    </div>
                  </div>
                )) : <div className="text-slate-400 text-sm">{t.content}</div>}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
