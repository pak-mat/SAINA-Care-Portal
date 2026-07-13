import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { Inbox, MessageSquare, Users, InboxIcon, Loader2, FileDown } from 'lucide-react';
import PriorityCard from '../../components/ui/PriorityCard';
import { generateAppointmentPDF, ReportRequest } from './AppointmentPDFReport';
import { User, BaseRequest } from '../../types';

export interface KanbanRequest extends ReportRequest {
  counselorid?: string | null;
  studentid?: string;
}

const EMPTY_STATES: Record<string, any> = {
  'Triage Pool': {
    icon: Inbox,
    title: 'No new requests',
    desc: 'New student submissions will appear here for triage.'
  },
  'Active Processing': {
    icon: Users,
    title: 'No active cases',
    desc: 'Cases you are currently working on will sit here.'
  },
  'Awaiting Response': {
    icon: MessageSquare,
    title: 'No pending replies',
    desc: 'Cases waiting for student action.'
  },
  'Archived Cases': {
    icon: InboxIcon,
    title: 'No archived cases',
    desc: 'Completed or rejected cases will be filed here.'
  }
};

interface ExportPDFButtonProps {
  requests: ReportRequest[];
  userName: string;
}

function ExportPDFButton({ requests, userName }: ExportPDFButtonProps) {
  const [generating, setGenerating] = useState(false);

  const handleExport = async () => {
    setGenerating(true);
    try {
      await generateAppointmentPDF(requests, userName);
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={generating || requests.length === 0}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border outline-none
        bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:shadow-md
        dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/40
        disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
    >
      {generating ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <FileDown size={14} />
      )}
      {generating ? 'Generating...' : 'Export PDF'}
    </button>
  );
}

interface KanbanWorkspaceProps {
  requests: KanbanRequest[];
  user: User;
  onSelectCase: (req: KanbanRequest) => void;
}

export default function KanbanWorkspace({ requests, user, onSelectCase }: KanbanWorkspaceProps) {
  const pool = useMemo(() => requests.filter(r => r.status === 'pending' && !r.counselorid), [requests]);
  const active = useMemo(() => requests.filter(r => r.status === 'in-progress' && r.counselorid === user.id), [requests, user.id]);
  const awaiting = useMemo(() => requests.filter(r => r.status === 'pending' && r.counselorid === user.id), [requests, user.id]);
  const archived = useMemo(() => requests.filter(r => ['approved', 'rejected'].includes(r.status)), [requests]);

  const columns = useMemo(() => [
    { title: 'Triage Pool', count: pool.length, items: pool },
    { title: 'Active Processing', count: active.length, items: active },
    { title: 'Awaiting Response', count: awaiting.length, items: awaiting },
    { title: 'Archived Cases', count: archived.length, items: archived }
  ], [pool, active, awaiting, archived]);

  return (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="h-full flex flex-col p-4 sm:p-6 overflow-hidden">
      <div className="mb-4 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">Kanban Pipeline</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 font-medium">Manage student cases through dynamic routing states.</p>
        </div>
        <ExportPDFButton requests={requests} userName={user.name} />
      </div>
      
      <div className="flex-1 flex overflow-x-auto gap-4 md:gap-6 pb-2 scroll-smooth">
        {columns.map(col => {
          const EmptyIcon = EMPTY_STATES[col.title].icon;
          return (
            <div key={col.title} className="w-80 min-w-[320px] flex flex-col max-h-full">
              <div className="flex items-center gap-2 mb-3 px-1 pt-1 shrink-0">
                <h3 className="font-bold text-sm text-slate-700 dark:text-zinc-300 uppercase tracking-wider">{col.title}</h3>
                <span className="bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">{col.count}</span>
              </div>
              
              <div className="flex-1 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-white/60 dark:border-zinc-800/50 rounded-2xl p-3 overflow-y-auto shadow-[inset_0_2px_12px_rgba(0,0,0,0.02)]">
                {col.items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-200 dark:border-zinc-700/60 rounded-xl bg-white/50 dark:bg-zinc-800/30">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-3">
                      <EmptyIcon size={20} className="text-slate-400 dark:text-zinc-500" />
                    </div>
                    <p className="font-semibold text-slate-700 dark:text-zinc-300 text-sm">{EMPTY_STATES[col.title].title}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">{EMPTY_STATES[col.title].desc}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {col.items.map(req => (
                      <PriorityCard key={req.id} request={req} onClick={() => onSelectCase(req)} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
