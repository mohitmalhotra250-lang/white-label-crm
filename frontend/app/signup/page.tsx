"use client";
import { useState } from 'react';
import { apiPost } from '../../lib/api';
import { UserPlus } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [err, setErr] = useState('');
  async function submit(e: any) { e.preventDefault(); setErr(''); try { await apiPost('/auth/register', { email, password, fullName, role: 'client' }); window.location.href = '/login'; } catch (e: any) { setErr(e.message || 'Signup failed'); } }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white/[0.05] border border-white/10 backdrop-blur-2xl p-8 shadow-2xl shadow-black/40">
        <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg" /><h1 className="text-2xl font-extrabold">Sign Up</h1></div>
        <div className="space-y-3"><input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm" /><input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm" /><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm" /></div>
        {err && <div className="text-red-400 text-sm mt-3">{err}</div>}
        <button type="submit" className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold shadow-lg flex items-center justify-center gap-2"><UserPlus size={18}/> Create Account</button>
        <p className="text-xs text-slate-400 mt-4 text-center">Already have an account? <a href="/login" className="text-cyan-300 hover:underline">Login</a></p>
      </form>
    </div>
  );
}
