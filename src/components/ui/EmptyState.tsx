// File: src/components/ui/EmptyState.jsx
import React from 'react';
import { FileText } from 'lucide-react';

export default function EmptyState({ icon: Icon = FileText, message = 'No data available', actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center h-full w-full">
      <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-zinc-900 border border-slate-100/80 dark:border-zinc-800/60 flex items-center justify-center mb-4 transition-all duration-200">
        <Icon className="w-8 h-8 text-slate-300 dark:text-zinc-600" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 max-w-sm mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        {message}
      </p>
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className="text-xs font-semibold tracking-wider uppercase text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
