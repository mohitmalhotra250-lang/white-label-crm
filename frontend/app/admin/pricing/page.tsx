"use client";
import { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/admin-sidebar';
import { apiGet, apiPut } from '../../../lib/api';
import { DollarSign, ShieldCheck } from 'lucide-react';

export default function AdminPricing() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { apiGet('/api/admin/pricing').then(r => setRows(r.pricing || [])).catch(() => setRows([])); }, []);

  const update = async (provider: string, field: string, value: any) => {
    await apiPut(`/api/admin/pricing/${provider}`, { [field]: value });
    setRows(rows.map(r => r.provider === provider ? { ...r, [field]: value } : r));
  };

  return (
    <div className="flex min-h-screen"><AdminSidebar active="/admin/pricing" />
      <main className="flex-1 p-6 lg:p-10 overflow-auto max-w-6xl">
        <h1 className="text-3xl font-extrabold mb-2">Provider Pricing</h1>
        <p className="text-slate-400 mb-6">Super Admin only — edit cost per minute, setup fee, markup, fixed fee, currency, status.</p>
        <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-slate-300 bg-white/5"><tr><th>Provider</th><th>Cost/Min (¢)</th><th>Currency</th><th>Setup (¢)</th><th>Markup %</th><th>Fixed/Call (¢)</th><th>Active</th></tr></thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((r: any) => (
                <tr key={r.provider}>
                  <td className="py-3 font-medium">{r.provider}</td>
                  <td><input type="number" value={r.cost_per_minute_cents || 0} onChange={e => update(r.provider, 'cost_per_minute_cents', parseInt(e.target.value))} className="w-24 px-2 py-1 rounded bg-white/5 border border-white/10 text-xs" /></td>
                  <td><input value={r.currency || 'INR'} onChange={e => update(r.provider, 'currency', e.target.value)} className="w-16 px-2 py-1 rounded bg-white/5 border border-white/10 text-xs" /></td>
                  <td><input type="number" value={r.setup_fee_cents || 0} onChange={e => update(r.provider, 'setup_fee_cents', parseInt(e.target.value))} className="w-24 px-2 py-1 rounded bg-white/5 border border-white/10 text-xs" /></td>
                  <td><input type="number" step="0.01" value={r.markup_percent || 0} onChange={e => update(r.provider, 'markup_percent', parseFloat(e.target.value))} className="w-20 px-2 py-1 rounded bg-white/5 border border-white/10 text-xs" /></td>
                  <td><input type="number" value={r.fixed_fee_per_call_cents || 0} onChange={e => update(r.provider, 'fixed_fee_per_call_cents', parseInt(e.target.value))} className="w-24 px-2 py-1 rounded bg-white/5 border border-white/10 text-xs" /></td>
                  <td><button onClick={() => update(r.provider, 'is_active', !r.is_active)} className={`px-2 py-1 rounded text-xs font-medium ${r.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>{r.is_active ? 'Active' : 'Inactive'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
