import { useState } from 'react';
import Sidebar from '../../components/sidebar';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const [biz, setBiz] = useState('Universal CRM Demo');
  const [tz, setTz] = useState('Asia/Kolkata');
  const [lang, setLang] = useState('en');
  const [notifs, setNotifs] = useState(true);
  const [pwd, setPwd] = useState('');
  return (
    <div className="flex min-h-screen"><Sidebar active="/settings" />
      <main className="flex-1 p-6 lg:p-10 overflow-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold mb-2">Settings</h1>
        <p className="text-slate-400 mb-8">Business branding and account preferences.</p>
        <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-8 shadow-xl space-y-6">
          <div><label className="text-xs uppercase tracking-wider text-slate-400 font-medium">Business Name</label><input value={biz} onChange={e => setBiz(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10" /></div>
          <div className="grid md:grid-cols-2 gap-4"><div><label className="text-xs uppercase tracking-wider text-slate-400 font-medium">Timezone</label><input value={tz} onChange={e => setTz(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10" /></div><div><label className="text-xs uppercase tracking-wider text-slate-400 font-medium">Language</label><select value={lang} onChange={e => setLang(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10"><option value="en">English</option><option value="hi">Hindi</option></select></div></div>
          <div><label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={notifs} onChange={e => setNotifs(e.target.checked)} className="w-5 h-5 rounded bg-cyan-500/20 border-cyan-400/30" /><span className="text-sm">Receive in-app notifications</span></label></div>
          <div className="pt-4 border-t border-white/10"><label className="text-xs uppercase tracking-wider text-slate-400 font-medium">Change Password</label><input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="New password" className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10" /></div>
          <button onClick={() => alert('Settings saved. Connect to /api/settings in production.') } className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold shadow-lg flex items-center justify-center gap-2"><Save size={18}/> Save Changes</button>
        </div>
      </main>
    </div>
  );
}
