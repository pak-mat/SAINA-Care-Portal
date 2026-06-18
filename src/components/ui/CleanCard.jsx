// File: src/components/ui/CleanCard.jsx
import React from 'react';

export default function CleanCard({ children, className = '', ...props }) {
  return (
    <div 
      className={`bg-white dark:bg-zinc-800 rounded-md md:rounded-lg border border-slate-100/80 dark:border-zinc-800/60 p-4 md:p-6 lg:p-8 shadow-sm transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
