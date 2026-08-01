import Link from 'next/link';
import { Shield, Users, Brain, Plug, CreditCard, BarChart3, Activity, LogOut } from 'lucide-react';

const links = [
  { href: '/admin', label: 'Overview', icon: Shield },
  { href: '/admin/clients', label: 'Clients', icon: Users },
  { href: '/admin/agents', label: 'AI Agents', icon: Brain },
  { href: '/admin/providers', label: 'Providers', icon: Plug },
  { href: '/admin/billing', label: 'Billing', icon: CreditCard },
  { href: '/admin/queue', label: 'Queue', icon: Activity },
  { href: '/admin/pricing', label: 'Pricing', icon: DollarSign },
  { href: '/admin/revenue', label: 'Revenue', icon: BarChart3 },
  { href: '/admin/sandbox', label: 'Sandbox', icon: Zap },
  { href: '/admin/health', label: 'Health', icon: Activity },
];

export default function AdminSidebar({ active }: { active: string }) {
  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 to-blue-950 border-r border-white/10 h-screen sticky top-0 flex flex-col shadow-2xl">
      <div className="p-6 flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-400 to-rose-600 shadow-lg" /><span className="font-extrabold text-xl tracking-tight">Super Admin</span></div>
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {links.map(l => <Link key={l.href} href={l.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${active === l.href ? 'bg-white/10 text-rose-300 shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><l.icon size={18}/> {l.label}</Link>)}
      </nav>
      <div className="p-4 border-t border-white/10"><button onClick={() => { localStorage.removeItem('crm_token'); window.location.href = '/login'; }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10"><LogOut size={18}/> Logout</button></div>
    </aside>
  );
}
