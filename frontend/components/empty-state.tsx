"use client";
export default function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-4"><span className="text-2xl">📭</span></div>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-slate-400 text-sm max-w-xs">{desc}</p>
    </div>
  );
}
