import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, InboxIcon } from 'lucide-react';
import PriorityCard from '../../components/ui/PriorityCard';
import { KanbanRequest } from './KanbanWorkspace';

interface CounselorArchiveSearchTabProps {
  requests: KanbanRequest[];
  onSelectCase: (req: KanbanRequest) => void;
}

export default function CounselorArchiveSearchTab({ requests, onSelectCase }: CounselorArchiveSearchTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('archived');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Search filter (by student name or case type)
      const matchesSearch = 
        !searchTerm || 
        (req.studentName && req.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (req.type && req.type.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter
      let matchesStatus = true;
      if (statusFilter === 'archived') {
        matchesStatus = req.status === 'approved' || req.status === 'rejected';
      } else if (statusFilter === 'active') {
        matchesStatus = req.status === 'in-progress' || req.status === 'pending';
      } else if (statusFilter !== 'all') {
        matchesStatus = req.status === statusFilter;
      }

      // Type filter
      let matchesType = true;
      if (typeFilter !== 'all') {
        matchesType = req.type?.toLowerCase() === typeFilter.toLowerCase();
      }

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [requests, searchTerm, statusFilter, typeFilter]);

  return (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="h-full flex flex-col p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">Archive & Search</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 font-medium">Search across all student cases or view archived records.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by student name or case type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-zinc-100 transition-all shadow-sm"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-zinc-100 appearance-none shadow-sm cursor-pointer font-medium text-sm text-slate-700 dark:text-zinc-300"
            >
              <option value="all">All Statuses</option>
              <option value="archived">Archived (Approved/Rejected)</option>
              <option value="active">Active (Pending/In-Progress)</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-zinc-100 appearance-none shadow-sm cursor-pointer font-medium text-sm text-slate-700 dark:text-zinc-300"
          >
            <option value="all">All Types</option>
            <option value="appointment">Appointments</option>
            <option value="transfer">Transfers</option>
          </select>
        </div>
      </div>

      <div className="flex-1 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-white/60 dark:border-zinc-800/50 rounded-2xl p-4 overflow-y-auto shadow-[inset_0_2px_12px_rgba(0,0,0,0.02)]">
        {filteredRequests.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-200 dark:border-zinc-700/60 rounded-xl bg-white/50 dark:bg-zinc-800/30">
            <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <InboxIcon size={24} className="text-slate-400 dark:text-zinc-500" />
            </div>
            <p className="font-semibold text-slate-700 dark:text-zinc-300">No cases found</p>
            <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1 max-w-sm">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredRequests.map(req => (
              <div key={req.id} className="h-full">
                <PriorityCard request={req} onClick={() => onSelectCase(req)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
