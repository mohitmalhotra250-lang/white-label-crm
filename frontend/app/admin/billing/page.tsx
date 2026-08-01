"use client";
import AdminSidebar from '../../../components/admin-sidebar';
import { apiGet } from '../../../lib/api';
import { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
export default function AdminBilling() {
  const [usage, setUsage] = useState<any[]>([]);
  useEffect(() => { apiGet('/admin/billing').then(r => setUsage(r.usage || [])).catch(() => setUsage([])); }, []);
  return <div className="flex min-h-screen"><AdminSidebar active="/admin/billing" /><main className="flex-1 p-8 overflow-auto max-w-6xl"><h1 className="text-3xl font-extrabold mb-2">Billing & Usage</h1><div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl"><table className="w-full text-sm"><thead className="text-slate-300"><tr><th>Date</th><th>Minutes</th><th>Calls</th><th>Cost</th></tr></thead><tbody className="divide-y divide-white/5">{usage.map((u:any,i:number)=><tr key={i}><td>{u.date}</td><td>{u.minutes_used||0}</td><td>{u.calls_made||0}</td><td>{u.cost_cents ? (u.cost_cents/100).toFixed(2) : '0.00'}</td></tr>)}</tbody></table></div></main></div>;
}
