"use client";
import { useEffect, useState } from 'react';
import Sidebar from '../../components/sidebar';
import { apiGet } from '../../lib/api';
import { Mic2, Play, Download } from 'lucide-react';

export default function RecordingsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  useEffect(() => { apiGet('/calls').then(r => setCalls(r.calls || [])); }, []);
  return (
    <div className="flex min-h-screen"><Sidebar active="/recordings" />
      <main className="flex-1 p-6 lg:p-10 overflow-auto max-w-5xl">
        <h1 className="text-3xl font-extrabold mb-2">Recordings</h1>
        <p className="text-slate-400 mb-6">Listen to call recordings and download files.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {calls.map((c: any) => (
            <div key={c.id} className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-3"><Mic2 className="text-cyan-400" size={22} /><div><div className="font-bold">{c.phone || 'Unknown'}</div><div className="text-xs text-slate-400">{new Date(c.created_at).toLocaleString()}</div></div></div>
              {c.recording_url ? <audio controls src={c.recording_url} className="w-full mb-3 rounded-xl bg-black/20" /> : <div className="w-full h-12 rounded-xl bg-black/20 mb-3 flex items-center justify-center text-slate-500 text-sm">No recording available</div>}
              <a href={c.recording_url || '#'} download className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${c.recording_url ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30' : 'bg-white/5 text-slate-500 pointer-events-none'}`}><Download size={14}/> Download</a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
