// File: src/features/counselor/CaseDetailSidebar.jsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckSquare, XSquare, FileText, Send, Hand, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

export default function CaseDetailSidebar({ request, onClose, user, onStartChat }) {
  const [activeTab, setActiveTab] = useState('documents');
  const [notes, setNotes] = useState(request?.counselorNotes || '');
  const [privateNotes, setPrivateNotes] = useState(request?.privateCounselorNotes || '');
  const [scheduledAt, setScheduledAt] = useState('');

  if (!request) return null;

  const quickPhrases = ["Follow-up required", "Approved with conditions", "Missing documentation", "Schedule appointment"];

  const queryClient = useQueryClient();

  const getTableName = () => request.type?.toLowerCase() === 'appointment' ? 'appointments' : 'school_transfers';

  const submitResolve = async (status) => {
    const table = getTableName();
    const updateData: any = { status, counselorid: user.id };
    if (table === 'appointments' && scheduledAt) {
      updateData.scheduled_date = new Date(scheduledAt).toISOString();
    }
    
    await supabase.from(table).update(updateData).eq('id', request.id);
    
    if (notes || privateNotes) {
       await supabase.from('case_notes').insert({
         studentid: request.studentid,
         counselorid: user.id,
         title: `${status.toUpperCase()} - ${request.type}`,
         content: `Visible Notes: ${notes}\nPrivate Notes: ${privateNotes}`,
         note_type: 'resolution'
       });
    }

    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    queryClient.invalidateQueries({ queryKey: ['school_transfers'] });
    queryClient.invalidateQueries({ queryKey: ['case_notes'] });
    onClose();
  };

  const submitSaveNotes = async () => {
    if (notes || privateNotes) {
       await supabase.from('case_notes').insert({
         studentid: request.studentid,
         counselorid: user.id,
         title: `Update on ${request.type}`,
         content: `Visible Notes: ${notes}\nPrivate Notes: ${privateNotes}`,
         note_type: 'update'
       });
       queryClient.invalidateQueries({ queryKey: ['case_notes'] });
       alert("Notes saved successfully");
    }
  };

  const submitClaim = async () => {
    const table = getTableName();
    await supabase.from(table).update({ counselorid: user.id, status: 'in-progress' }).eq('id', request.id);
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    queryClient.invalidateQueries({ queryKey: ['school_transfers'] });
    onClose();
  };

  const isResolved = request.status === 'approved' || request.status === 'rejected';
  const isUnassigned = !request.counselorid;
  
  const sidebarContent = (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border-l border-white/50 dark:border-zinc-800/50 shadow-2xl z-50 flex flex-col font-sans"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        <header className="p-6 sm:p-8 border-b border-white/50 dark:border-zinc-800/50 flex justify-between items-start bg-slate-50/50 dark:bg-zinc-900/30">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{request.studentName}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300">
                {request.type}
              </span>
              <span className={`uppercase text-[10px] font-bold px-2 py-0.5 rounded 
                ${request.status?.toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                  request.status?.toLowerCase() === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  request.status?.toLowerCase() === 'approved' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  request.status?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                }`}>
                {request.status}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex px-6 sm:px-8 border-b border-white/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md overflow-x-auto">
          <button onClick={() => setActiveTab('documents')} className={`whitespace-nowrap pb-3 pt-4 px-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'documents' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300'}`}>Request Profile</button>
          <button onClick={() => setActiveTab('notes')} className={`whitespace-nowrap pb-3 pt-4 px-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'notes' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300'}`}>Notes Log</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50/30 dark:bg-zinc-950/20">
          {activeTab === 'documents' && (
            <div className="space-y-6">
               <div className="glass-panel p-6 shadow-sm">
                 <h4 className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-5 border-b border-slate-100 dark:border-zinc-800 pb-3">Submission Details</h4>
                 {request.type?.toLowerCase() === 'appointment' && (
                  <div className="space-y-5">
                    <div><span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 block mb-1">Scheduled Date:</span> <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">{new Date(request.scheduled_date).toLocaleString()}</span></div>
                    <div><span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 block mb-1">Topic Category:</span> <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800/50 inline-block mt-1">{request.topic_category || request.reasonCategory}</span></div>
                    <div><span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 block mb-2">Private Notes:</span> <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm p-4 border border-slate-200/60 dark:border-zinc-700/60 rounded-xl text-sm font-medium text-slate-700 dark:text-zinc-300 mt-1 whitespace-pre-wrap">{request.private_notes || request.details || 'No notes provided.'}</div></div>
                  </div>
                 )}
                 {request.type?.toLowerCase() === 'transfer' && (
                  <div className="space-y-5">
                    <div><span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 block mb-1">Target School:</span> <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800/50 inline-block mt-1">{request.target_school}</span></div>
                    <div><span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 block mb-1">Reason Category:</span> <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800/50 inline-block mt-1">{request.reason_category}</span></div>
                    <div><span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 block mb-2">Detailed Reason:</span> <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm p-4 border border-slate-200/60 dark:border-zinc-700/60 rounded-xl text-sm font-medium text-slate-700 dark:text-zinc-300 mt-1 whitespace-pre-wrap">{request.detailed_reason}</div></div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 block mb-3">Attached Documents:</span>
                      <div className="flex flex-wrap gap-2.5">
                        {request.transfer_forms_url && <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm border border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 shadow-sm transition-all hover:-translate-y-0.5"><FileText size={16}/> Transfer Forms</div>}
                        {request.academic_records_url && <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm border border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 shadow-sm transition-all hover:-translate-y-0.5"><FileText size={16}/> Academic Records</div>}
                        {request.id_documents_url && <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm border border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 shadow-sm transition-all hover:-translate-y-0.5"><FileText size={16}/> ID Documents</div>}
                      </div>
                    </div>
                  </div>
                 )}
               </div>
            </div>
          )}
          {activeTab === 'notes' && (
            <div className="space-y-6">
               <div className="glass-panel p-6 shadow-sm">
                 <label className="block text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-zinc-400 mb-3">Student Feedback (Visible)</label>
                 <textarea 
                   rows={3} 
                   value={notes} 
                   onChange={(e) => setNotes(e.target.value)} 
                   disabled={isResolved || isUnassigned}
                   className="w-full bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm border border-slate-200/60 dark:border-zinc-700/60 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500/50 outline-none text-slate-900 dark:text-zinc-100 disabled:opacity-60 resize-none transition-all" 
                   placeholder="Provide structured feedback visible to the student pane..."
                 />
                 {!isResolved && !isUnassigned && (
                   <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                     <div className="flex flex-wrap gap-2">
                       {quickPhrases.map(phrase => (
                         <button key={phrase} onClick={() => setNotes(prev => prev + (prev ? ' ' : '') + phrase)} className="text-[10px] uppercase font-bold bg-slate-100/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-zinc-700/60 px-3 py-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-200 dark:hover:border-emerald-800/50 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all">
                           {phrase}
                         </button>
                       ))}
                     </div>
                     <button onClick={() => submitSaveNotes()} className="text-xs font-bold bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-all shadow-sm flex items-center gap-1.5 transform hover:-translate-y-0.5">
                       <Save size={14} /> Save Note
                     </button>
                   </div>
                 )}
               </div>

               <div className="bg-red-50/50 dark:bg-red-950/20 backdrop-blur-xl border border-red-200/60 dark:border-red-900/40 rounded-2xl p-6 shadow-sm mt-8 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                 <label className="block text-[10px] uppercase tracking-widest font-black text-red-700 dark:text-red-400 mb-3 ml-2">Strictly Private Notes</label>
                 <textarea 
                   rows={5} 
                   value={privateNotes} 
                   onChange={(e) => setPrivateNotes(e.target.value)} 
                   disabled={isResolved || isUnassigned}
                   className="w-full bg-white/60 dark:bg-zinc-950/50 backdrop-blur-sm border border-red-200/50 dark:border-red-900/40 rounded-xl p-4 text-sm focus:ring-2 focus:ring-red-500/50 outline-none text-red-900 dark:text-red-200 font-medium placeholder-red-300 dark:placeholder-red-800 disabled:opacity-60 resize-none transition-all ml-2 max-w-[calc(100%-8px)]" 
                   placeholder="Confidential case logging. Will not be serialized to student end."
                 />
               </div>
               
               {!isResolved && !isUnassigned && (
                 <div className="flex flex-col gap-5 pt-6 border-t border-slate-200/50 dark:border-zinc-800/50">
                   {request.type === 'appointment' && (
                     <div className="bg-emerald-50/50 dark:bg-emerald-950/20 backdrop-blur-md border border-emerald-200/60 dark:border-emerald-900/40 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                       <label className="block text-[10px] uppercase tracking-widest font-black text-emerald-800 dark:text-emerald-400 mb-3">Final Scheduled Date & Time</label>
                       <input 
                         type="datetime-local" 
                         value={scheduledAt} 
                         onChange={(e) => setScheduledAt(e.target.value)}
                         className="w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-emerald-200/60 dark:border-emerald-800/50 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-800 dark:text-zinc-100 transition-all shadow-inner"
                       />
                       <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-2.5 font-bold flex items-center gap-1">
                         <span className="w-1 h-1 rounded-full bg-emerald-500"></span> Select this before approving. Student will be alerted 1 hour before this schedule.
                       </p>
                     </div>
                   )}
                   <button onClick={onStartChat} className="w-full bg-slate-100/80 dark:bg-zinc-800/80 backdrop-blur-md border border-slate-200/60 dark:border-zinc-700/60 text-slate-700 dark:text-zinc-300 rounded-xl py-4 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:bg-white dark:hover:bg-zinc-700 hover:shadow-md transform hover:-translate-y-0.5">
                     <Send className="w-5 h-5 text-emerald-500" /> Jump to Case Comms Thread
                   </button>
                   <div className="flex flex-col sm:flex-row gap-4 mt-2">
                     <button onClick={() => submitResolve('approved')} disabled={request.type === 'appointment' && !scheduledAt} className="flex-1 bg-emerald-600 text-white rounded-xl py-4 font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-500 shadow-md transition-all disabled:opacity-50 transform hover:-translate-y-0.5"><CheckSquare className="w-5 h-5"/> Terminate (Approve)</button>
                     <button onClick={() => submitResolve('rejected')} className="flex-1 bg-white dark:bg-zinc-900 border-2 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl py-4 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 shadow-sm transition-all transform hover:-translate-y-0.5"><XSquare className="w-5 h-5"/> Terminate (Reject)</button>
                   </div>
                 </div>
               )}

               {isUnassigned && (
                 <div className="flex pt-4">
                   <button onClick={submitClaim} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl py-4 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5">
                     <Hand className="w-5 h-5" /> Claim Case to Workspace
                   </button>
                 </div>
               )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );

  return createPortal(sidebarContent, document.body);
}
