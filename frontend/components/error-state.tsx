"use client";
export default function ErrorState({ msg }: { msg: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-400/20 flex items-center justify-center mb-4"><span className="text-2xl">⚠️</span></div>
      <h3 className="font-bold text-lg text-red-300">Something went wrong</h3>
      <p className="text-slate-400 text-sm">{msg}</p>
      <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10">Retry</button>
    </div>
  );
}
