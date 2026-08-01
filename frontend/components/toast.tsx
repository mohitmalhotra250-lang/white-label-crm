"use client";
import { useState, createContext, useContext } from 'react';
const ToastCtx = createContext({ show: (msg: string) => {} });
export function ToastProvider({ children }: any) {
  const [msg, setMsg] = useState('');
  return (
    <ToastCtx.Provider value={{ show: (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); } }}>
      {children}
      {msg && <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-cyan-500 text-white font-medium shadow-2xl animate-in slide-in-from-bottom-4">{msg}</div>}
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);
