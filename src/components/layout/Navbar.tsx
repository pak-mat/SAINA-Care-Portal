// File: src/components/layout/Navbar.tsx
import React from 'react';
import SainaLogo from '../SainaLogo';
import { useAuth } from '../../context/AuthContext';
import LanguageToggle from '../ui/LanguageToggle';

export default function Navbar({ title = 'Saina Care Portal', children }: { title?: string; children?: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <header className="bg-white dark:bg-zinc-900 shadow-sm px-6 py-4 flex justify-between items-center z-20 relative transition-all duration-200 border-b border-slate-100/80 dark:border-zinc-800/60 font-sans" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="flex items-center gap-4">
        <a href="/" className="bg-slate-50 dark:bg-zinc-800 p-2 rounded-xl flex items-center justify-center h-12 sm:h-14 w-auto min-w-[180px] border border-slate-100/80 dark:border-zinc-700/60 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors shrink-0 cursor-pointer">
          <SainaLogo className="h-full w-full object-contain" />
        </a>
        <h1 className="font-bold text-slate-900 dark:text-zinc-50 text-lg tracking-tight hidden sm:block">{title}</h1>
      </div>
      
      <div className="flex items-center gap-3">
        {children}
        <LanguageToggle />
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300 hidden sm:inline-block">
              {user.name} <span className="text-slate-400 dark:text-zinc-500 font-medium">({user.role === 'counselor' ? 'Team' : 'Student'})</span>
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
