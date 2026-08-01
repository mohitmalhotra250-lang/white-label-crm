import { useEffect, useState } from 'react';
import Sidebar from '../../components/sidebar';
import { apiGet } from '../../lib/api';
import { CreditCard, Clock, Zap } from 'lucide-react';

export default function BillingPage() {
  const [usage, setUsage] = useState<any[]>([]);
  const [credits, setCredits] = useState({ balance_minutes: 0, balance_calls: 0 });
  useEffect(() => { apiGet('/admin/billing').then(r => setUsage(r.usage || [])); apiGet('/calls').then(r => setCredits({ balance_minutes: 1200, balance_calls: 500 })); }, []);
  return (
    <div className="flex min-h-screen"><Sidebar active="/subscription" />
      <main className="flex-1 p-6 lg:p-10 overflow-auto max-w-6xl">
        <h1 className="text-3xl font-extrabold mb-2">Billing & Usage</h1>
        <p className="text-slate-400 mb-6">Usage-based minutes, credits, invoices, GST.</p>
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6"><div className="text-xs uppercase text-slate-400">Minutes Used</div><div className="text-3xl font-extrabold">{usage.reduce((s: number, u: any) => s + (u.minutes_used || 0), 0)}</div></div>
          <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6"><div className="text-xs uppercase text-slate-400">Credits Balance</div><div className="text-3xl font-extrabold text-cyan-300">{credits.balance_minutes}</div></div>
          <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6"><div className="text-xs uppercase text-slate-400">Invoices</div><div className="text-3xl font-extrabold">{usage.length}</div></div>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl"><h3 className="font-bold mb-3">Invoices (GST Ready)</h3>
          <table className="w-full text-sm"><thead><tr className="text-slate-300"><th>Date</th><th>Minutes</th><th>Calls</th><th>Amount (₹)</th><th>GST</th></tr></thead><tbody className="divide-y divide-white/5">{usage.map((u: any, i: number) => <tr key={i}><td>{u.date}</td><td>{u.minutes_used || 0}</td><td>{u.calls_made || 0}</td><td>₹{(u.cost_cents || 0) / 100}</td><td>₹{Math.round((u.cost_cents || 0) * 0.18) / 100}</td></tr>)}</tbody></table>
        </div>
      </main>
    </div>
  );
}
