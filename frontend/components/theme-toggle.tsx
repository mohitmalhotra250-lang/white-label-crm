"use client";
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); }, [dark]);
  return <button onClick={() => setDark(!dark)} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10" aria-label="Toggle theme">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>;
}
