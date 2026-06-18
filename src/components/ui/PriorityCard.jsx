// File: src/components/ui/PriorityCard.jsx
import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function PriorityCard({ request, onClick }) {
  const isUrgent = new Date().getTime() - new Date(request.submissionDate || 0).getTime() > 3 * 24 * 60 * 60 * 1000 && request.status !== 'approved' && request.status !== 'rejected';
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={onClick}
      className={`cursor-pointer rounded-lg p-4 border transition-all duration-200 shadow-sm
        ${isUrgent 
          ? 'border-red-500/40 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/20 animate-pulse' 
          : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-600'}
      `}
    >
      <div className="flex justify-between items-start mb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 dark:from-zinc-600 dark:to-zinc-700 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
            {(request.studentName || 'S').charAt(0)}
          </div>
          <span className="font-semibold text-sm text-slate-800 dark:text-zinc-100 line-clamp-1">{request.studentName}</span>
        </div>
        {isUrgent && <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-1" />}
      </div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="uppercase px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
          {request.type}
        </span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border capitalize ${
          request.status?.toLowerCase() === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50' : 
          request.status?.toLowerCase() === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50' :
          request.status?.toLowerCase() === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50' :
          request.status?.toLowerCase() === 'rejected' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50' :
          'bg-slate-50 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
        }`}>
          {request.status}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5 focus:outline-none">
          <Clock className="w-3.5 h-3.5" />
          {new Date(request.submissionDate || 0).toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  );
}
