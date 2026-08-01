import { useEffect, useState } from 'react';
import Sidebar from '../../components/sidebar';
import { apiGet } from '../../lib/api';
import { CalendarDays, Clock, CheckCircle2 } from 'lucide-react';

export default function AppointmentsPage() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => { apiGet('/appointments').then(r => setList(r.appointments || [])); }, []);
  return (
    <div className="flex min-h-screen"><Sidebar active="/appointments" />
      <main className="flex-1 p-6 lg:p-10 overflow-auto max-w-5xl">
        <h1 className="text-3xl font-extrabold mb-2">Appointments</h1>
        <p className="text-slate-400 mb-6">Booked, pending, completed and cancelled appointments.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map(a => (
            <div key={a.id} className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3"><h3 className="font-bold">{a.customer}</h3><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.status === 'booked' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-amber-500/20 text-amber-300'}`}>{a.status}</span></div>
              <div className="text-sm text-slate-300 mb-1">{a.phone}</div>
              <div className="text-sm text-slate-400 mb-3">{a.date} at {a.time}</div>
              <div className="text-xs text-slate-500">{a.notes}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
