import React from 'react';
import { ArrowRight, Activity, CalendarDays } from 'lucide-react';

export default function SampleDashboardCard({ title = "Pending Registration", status = "In Progress", date = "May 28th, 2026" }) {
  return (
    <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md shadow-sm overflow-hidden flex flex-col group hover:border-emerald-300 dark:hover:border-emerald-500 hover:shadow-md transition-all">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide">
            {status}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-zinc-500">
            <CalendarDays size={14} /> {date}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-2 leading-tight">
          {title}
        </h3>
        
        <p className="text-sm text-slate-500 dark:text-zinc-400 mb-4 line-clamp-2">
          This is a sample production-ready card architecture demonstrating proper Dark Mode utility class injection.
        </p>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-700/50 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
             <Activity size={16} /> 
             <span>Updates active</span>
          </div>
          <button className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
            Review <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
