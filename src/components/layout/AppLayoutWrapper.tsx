import React from 'react';

export default function AppLayoutWrapper({ children }) {
  return (
    <div className="h-full w-full bg-slate-50 dark:bg-zinc-900 transition-colors duration-300 text-slate-900 dark:text-zinc-100 font-sans flex flex-col overscroll-none" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {children}
    </div>
  );
}
