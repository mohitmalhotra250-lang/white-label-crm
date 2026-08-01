import { useEffect, useState } from 'react';
import Sidebar from '../../components/sidebar';
import { apiGet } from '../../lib/api';
import { Users, Shield, User } from 'lucide-react';
export default function TeamPage() {
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => { apiGet('/auth/me').then(r => setUsers([r.user || { full_name: 'You', role: 'super_admin', email: '' }])).catch(() => setUsers([{ full_name: 'Admin', role: 'super_admin', email: 'admin@crm.ai' }])); }, []);
  return (
    <div className="flex min-h-screen"><Sidebar active="/settings" />
      <main className="flex-1 p-6 lg:p-10 overflow-auto max-w-4xl">
        <h1 className="text-3xl font-extrabold mb-2">Team Members</h1>
        <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl space-y-3">
          {users.map((u: any) => (
            <div key={u.email || u.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold">{u.full_name?.[0] || 'U'}</div>
              <div><div className="font-medium">{u.full_name || u.email}</div><div className="text-xs text-slate-400">{u.role} • {u.email}</div></div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
