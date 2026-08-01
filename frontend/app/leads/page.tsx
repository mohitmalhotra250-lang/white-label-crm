import { useEffect, useState, useRef } from 'react';
import Sidebar from '../../components/sidebar';
import { apiGet, apiPost, apiDelete } from '../../lib/api';
import { UploadCloud, Plus, Search, Trash2, FileDown, Pencil, X } from 'lucide-react';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', company: '', city: '', state: '', country: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  async function fetchLeads() { const res = await apiGet('/leads'); setLeads(res.leads || []); }
  useEffect(() => { fetchLeads(); }, []);

  async function handleUpload() {
    if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    try {
      await fetch('http://localhost:4000/api/leads/upload', { method: 'POST', body: fd, headers: { Authorization: `Bearer ${localStorage.getItem('crm_token') || ''}` } });
      setFile(null); fetchLeads();
    } catch (e) { alert('Upload failed'); }
  }

  async function handleAdd() {
    try { await apiPost('/leads', form); setForm({ name: '', phone: '', email: '', company: '', city: '', state: '', country: '' }); fetchLeads(); } catch (e: any) { alert(e.message); }
  }

  async function handleEdit(id: string, updates: any) {
    try { await apiPost(`/leads/${id}`, updates); setEditId(null); fetchLeads(); } catch (e: any) { alert(e.message); }
  }

  function downloadSample() {
    const csv = 'name,phone,email,company,city,state,country\nJohn Doe,9876543210,john@example.com,Acme,City,State,IN\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'sample_leads.csv'; a.click(); URL.revokeObjectURL(url);
  }

  const filtered = leads.filter((l: any) => (l.name || '').toLowerCase().includes(search.toLowerCase()) || (l.phone || '').includes(search));

  return (
    <div className="flex min-h-screen">
      <Sidebar active="/leads" />
      <main className="flex-1 p-6 lg:p-10 overflow-auto max-w-6xl">
        <h1 className="text-3xl font-extrabold mb-2">Leads</h1>
        <p className="text-slate-400 mb-6">Upload CSV, add single leads, search and manage.</p>

        <div ref={dragRef} onDragOver={e => { e.preventDefault(); }} onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }} className="rounded-3xl border-2 border-dashed border-cyan-400/30 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-8 text-center mb-6 transition hover:border-cyan-400/60">
          <UploadCloud className="mx-auto text-cyan-400 mb-3" size={40} />
          <h3 className="font-bold text-lg mb-1">Drag & drop CSV</h3>
          <p className="text-sm text-slate-400 mb-4">Or click to select. Supports Name, Phone, Email, Company, City, State, Country.</p>
          <div className="flex items-center justify-center gap-3">
            <input type="file" accept=".csv" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" id="csvfile" />
            <label htmlFor="csvfile" className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 font-medium text-sm cursor-pointer hover:bg-cyan-500/30">Select CSV</label>
            <button onClick={downloadSample} className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-medium text-sm hover:bg-white/10 flex items-center gap-2"><FileDown size={16}/> Sample CSV</button>
          </div>
          {file && <div className="mt-3 text-sm font-medium text-cyan-300">{file.name} — <button onClick={() => setFile(null)} className="underline text-red-400">Remove</button></div>}
          {file && <button onClick={handleUpload} className="mt-3 px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-sm shadow-lg hover:brightness-110">Upload CSV</button>}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Plus size={20}/> Add Single Lead</h3>
            <div className="space-y-3">
              {['name','phone','email','company','city','state','country'].map(k => <input key={k} placeholder={k} value={(form as any)[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm" />)}
            </div>
            <button onClick={handleAdd} className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-sm">Add Lead</button>
          </div>

          <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4"><Search size={20} className="text-cyan-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..." className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm flex-1" /></div>
            <div className="overflow-auto rounded-xl border border-white/10">
              <table className="w-full text-sm text-left"><thead className="bg-white/5 text-slate-300"><tr><th className="px-3 py-2">Name</th><th className="px-3 py-2">Phone</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Actions</th></tr></thead><tbody className="divide-y divide-white/5">{filtered.map((l: any) => (
                <tr key={l.id} className="hover:bg-white/[0.03]">
                  <td className="px-3 py-2 font-medium">{l.name}</td>
                  <td className="px-3 py-2 text-slate-400">{l.phone}</td>
                  <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/10 text-cyan-300">{l.status}</span></td>
                  <td className="px-3 py-2 flex gap-2">
                    {editId === l.id ? (
                      <><input value={l.name} onChange={e => { const u = [...filtered]; const idx = u.findIndex(x => x.id === l.id); u[idx] = { ...l, name: e.target.value }; setLeads(u); }} className="w-24 px-2 py-1 rounded bg-white/5 text-xs" /><button onClick={() => handleEdit(l.id, { name: (filtered.find(x => x.id === l.id) as any)?.name })} className="text-xs text-emerald-300">Save</button><button onClick={() => setEditId(null)} className="text-xs text-red-300">Cancel</button></>
                    ) : (
                      <><button onClick={() => setEditId(l.id)} className="text-cyan-300 hover:text-white"><Pencil size={16}/></button><button onClick={async () => { await apiDelete(`/leads/${l.id}`); fetchLeads(); }} className="text-red-400 hover:text-white"><Trash2 size={16}/></button></>
                    )}
                  </td>
                </tr>
              ))}</tbody></table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
