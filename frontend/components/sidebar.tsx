"use client";
import Link from 'next/link';
import { LayoutDashboard, Users, Phone, History, Mic2, FileText, BarChart3, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/calling', label: 'Calling', icon: Phone },
  { href: '/call-history', label: 'Call History', icon: History },
  { href: '/recordings', label: 'Recordings', icon: Mic2 },
  { href: '/transcripts', label: 'Transcripts', icon: FileText },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(!open)} className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-slate-900/80 backdrop-blur border border-white/10"><Menu size={20} /></button>
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-white/10 backdrop-blur-xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20" /><span className="font-bold text-xl tracking-tight">Universal CRM</span></div>
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${active === l.href ? 'bg-white/10 text-cyan-300 shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <l.icon size={18} /> {l.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={() => { localStorage.removeItem('crm_token'); window.location.href = '/login'; }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"><LogOut size={18} /> Logout</button>
        </div>
      </aside>
      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-black/40 lg:hidden" />}
    </>
  );
}
