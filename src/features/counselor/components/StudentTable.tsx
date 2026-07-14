import React from 'react';
import { RefreshCw, Mail, Archive } from 'lucide-react';
import { User } from '../../../types';

interface StudentTableProps {
  loading: boolean;
  students: User[];
  selectedIds: Set<string>;
  handleSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectRow: (id: string, e: React.MouseEvent) => void;
  handleViewStudent: (student: User) => void;
  handleArchive: (id: string, e: React.MouseEvent) => void;
  onStartChat?: (id: string) => void;
  totalPages: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

export default function StudentTable({
  loading,
  students,
  selectedIds,
  handleSelectAll,
  handleSelectRow,
  handleViewStudent,
  handleArchive,
  onStartChat,
  totalPages,
  currentPage,
  setCurrentPage
}: StudentTableProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden relative min-h-[400px]">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm z-10">
          <RefreshCw className="animate-spin text-emerald-500" size={32} />
        </div>
      ) : null}
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 dark:bg-zinc-950/50 border-b border-slate-200 dark:border-zinc-800">
              <th className="p-4 w-12 text-center">
                <input type="checkbox" checked={students.length > 0 && selectedIds.size === students.length} onChange={handleSelectAll} className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
              </th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student ID</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Form</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Level</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
            {students.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 text-sm font-medium">No students found matching filters.</td>
              </tr>
            ) : (
              students.map((student: User) => (
                <tr key={student.id} onClick={() => handleViewStudent(student)} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 cursor-pointer group transition-colors">
                  <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.has(student.id)} onChange={(e) => handleSelectRow(student.id, e)} className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shadow-sm">
                        {student.name ? student.name.substring(0, 2).toUpperCase() : 'S'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{student.name}</span>
                        <span className="text-xs text-slate-500">{student.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-zinc-400 font-mono">{student.studentId || 'N/A'}</td>
                  <td className="p-4 text-sm text-slate-600 dark:text-zinc-400 font-bold">{student.form ? `Form ${student.form}` : 'N/A'}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${
                      student.riskLevel === 'Critical' ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse' :
                      student.riskLevel === 'High' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                      student.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}>
                      {student.riskLevel || 'Low'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); if (onStartChat) onStartChat(student.id); }} className="p-2 text-slate-400 hover:text-emerald-600 bg-white dark:bg-zinc-800 rounded-lg shadow-sm hover:shadow-md transition-all">
                        <Mail size={16} />
                      </button>
                      <button onClick={(e) => handleArchive(student.id, e)} className="p-2 text-slate-400 hover:text-rose-600 bg-white dark:bg-zinc-800 rounded-lg shadow-sm hover:shadow-md transition-all">
                        <Archive size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/50 flex items-center justify-between">
          <span className="text-sm text-slate-500 font-medium">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1.5 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors">Prev</button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1.5 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
