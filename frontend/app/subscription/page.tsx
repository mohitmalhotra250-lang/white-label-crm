"use client";
import { useEffect, useState } from 'react';
import Sidebar from '../../components/sidebar';
import { apiGet } from '../../lib/api';
import { Check, Zap } from 'lucide-react';

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<any[]>([]);
  useEffect(() => { apiGet('/admin/subscription').then(r => setPlans(r.plans || [])).catch(() => setPlans([{name:'Basic',price_cents:0,billing_cycle:'monthly',features:{calls:100}}])); }, []);
  return (
    <div className="flex min-h-screen"><Sidebar active="/subscription" />
      <main className="flex-1 p-6 lg:p-10 overflow-auto max-w-6xl">
        <h1 className="text-3xl font-extrabold mb-2">Subscription Plans</h1>
        <p className="text-slate-400 mb-8">Monthly & yearly billing with usage tracking.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p: any) => (
            <div key={p.id || p.name} className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-8 shadow-2xl backdrop-blur-md">
              <h3 className="text-xl font-extrabold mb-1">{p.name}</h3>
              <div className="text-4xl font-extrabold mb-1">₹{(p.price_cents || 0) / 100}<span className="text-sm text-slate-400 font-medium">/{p.billing_cycle}</span></div>
              <div className="text-xs text-slate-400 mb-4">Usage-based minute tracking • Credits included</div>
              <ul className="space-y-2 text-sm text-slate-300 mb-6">{Object.entries(p.features || {}).map(([k, v]) => <li key={k} className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> {k}: {String(v)}</li>)}</ul>
              <button className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold shadow-lg">Choose Plan</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
