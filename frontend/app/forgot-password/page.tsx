import { useState } from 'react';
import { Mail } from 'lucide-react';
export default function ForgotPage() {
  const [email, setEmail] = useState('');
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6">
      <form onSubmit={e => { e.preventDefault(); alert('Password reset link sent to ' + email); }} className="w-full max-w-md rounded-3xl bg-white/[0.05] border border-white/10 backdrop-blur-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-extrabold mb-2">Reset Password</h1>
        <p className="text-slate-400 text-sm mb-4">Enter your email to receive a reset link.</p>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 mb-4"><Mail size={18} className="text-slate-400"/><input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="bg-transparent w-full text-sm outline-none" /></div>
        <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold">Send Reset Link</button>
      </form>
    </div>
  );
}
