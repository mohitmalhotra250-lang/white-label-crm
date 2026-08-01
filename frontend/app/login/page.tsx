import { useState } from 'react';
import { apiPost } from '../../lib/api';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function submit(e: any) {
    e.preventDefault(); setErr('');
    try {
      const res = await apiPost('/auth/login', { email, password });
      localStorage.setItem('crm_token', res.token);
      window.location.href = '/dashboard';
    } catch (e: any) { setErr(e.message || 'Login failed'); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white/[0.05] border border-white/10 backdrop-blur-2xl p-8 shadow-2xl shadow-black/40">
        <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg" /><h1 className="text-2xl font-extrabold">Login</h1></div>
        <div className="space-y-3"><input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40" /><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40" /></div>
        {err && <div className="text-red-400 text-sm mt-3">{err}</div>}
        <button type="submit" className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold shadow-lg shadow-cyan-500/20 hover:brightness-110 transition flex items-center justify-center gap-2"><LogIn size={18}/> Sign In</button>
        <p className="text-xs text-slate-400 mt-4 text-center">No account? <a href="/signup" className="text-cyan-300 hover:underline">Sign up</a></p>
      </form>
    </div>
  );
}
