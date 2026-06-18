// File: src/features/counselor/CaseDetailSidebar.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckSquare, XSquare, FileText, Send, Hand, Save } from 'lucide-react';
import { resolveCase, claimCase, saveCaseNotes } from '../../services/localEngine';

export default function CaseDetailSidebar({ request, onClose, user, onStartChat }) {
  const [activeTab, setActiveTab] = useState('documents');
  const [notes, setNotes] = useState(request?.counselorNotes || '');
  const [privateNotes, setPrivateNotes] = useState(request?.privateCounselorNotes || '');
  const [scheduledAt, setScheduledAt] = useState('');

  if (!request) return null;

  const quickPhrases = ["Follow-up required", "Approved with conditions", "Missing documentation", "Schedule appointment"];

  const submitResolve = (status) => {
    resolveCase(request.id, status, notes, privateNotes, user.id, user.name, scheduledAt);
    onClose();
  };

  const submitSaveNotes = () => {
    saveCaseNotes(request.id, notes, privateNotes, scheduledAt);
  };

  const submitClaim = () => {
    claimCase(request.id, user.id, user.name);
    onClose();
  };

  const isResolved = request.status === 'approved' || request.status === 'rejected';
  const isUnassigned = !request.assignedTo;
  
  return (
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
        className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 shadow-2xl z-50 flex flex-col font-sans"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        <header className="p-6 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-start bg-slate-50/50 dark:bg-zinc-900/50">
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

        <div className="flex px-6 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-x-auto">
          <button onClick={() => setActiveTab('documents')} className={`whitespace-nowrap pb-3 pt-4 px-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'documents' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300'}`}>Request Profile</button>
          <button onClick={() => setActiveTab('notes')} className={`whitespace-nowrap pb-3 pt-4 px-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'notes' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300'}`}>Notes Log</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 dark:bg-zinc-950/20">
          {activeTab === 'documents' && (
            <div className="space-y-6">
               <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-5 shadow-sm">
                 <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-zinc-700 pb-2">Submission Details</h4>
                 {request.type === 'appointment' && (
                  <div className="space-y-4">
                    <div><span className="text-xs uppercase font-bold text-slate-400 dark:text-zinc-500 block mb-1">Dates Requested:</span> <span className="text-sm font-medium text-slate-900 dark:text-zinc-100">{request.choice1}{request.choice2 ? ` / ${request.choice2}` : ''}{request.choice3 ? ` / ${request.choice3}` : ''}</span></div>
                    <div><span className="text-xs uppercase font-bold text-slate-400 dark:text-zinc-500 block mb-1">Reason Category:</span> <span className="text-sm font-medium text-slate-900 dark:text-zinc-100">{request.reasonCategory}</span></div>
                    <div><span className="text-xs uppercase font-bold text-slate-400 dark:text-zinc-500 block mb-1">Details:</span> <div className="bg-slate-50 dark:bg-zinc-900 p-3 border border-slate-100 dark:border-zinc-800 rounded-lg text-sm text-slate-900 dark:text-zinc-300 mt-1 whitespace-pre-wrap">{request.details}</div></div>
                  </div>
                 )}
                 {request.type === 'permission' && (
                  <div className="space-y-4">
                    <div><span className="text-xs uppercase font-bold text-slate-400 dark:text-zinc-500 block mb-1">Target School:</span> <span className="text-sm font-medium text-slate-900 dark:text-zinc-100">{request.targetSchool}</span></div>
                    <div><span className="text-xs uppercase font-bold text-slate-400 dark:text-zinc-500 block mb-1">Reason:</span> <div className="bg-slate-50 dark:bg-zinc-900 p-3 border border-slate-100 dark:border-zinc-800 rounded-lg text-sm text-slate-900 dark:text-zinc-300 mt-1 whitespace-pre-wrap">{request.reason}</div></div>
                    <div>
                      <span className="text-xs uppercase font-bold text-slate-400 dark:text-zinc-500 block mb-2">Attached Documents:</span>
                      <div className="flex flex-wrap gap-2">
                        <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1.5 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-sm"><FileText size={14}/> Form Database</div>
                        <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1.5 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-sm"><FileText size={14}/> Academics Array</div>
                        <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1.5 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-sm"><FileText size={14}/> ID Base64</div>
                      </div>
                    </div>
                  </div>
                 )}
               </div>
            </div>
          )}
          {activeTab === 'notes' && (
            <div className="space-y-6">
               <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-5 shadow-sm">
                 <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-zinc-300 mb-2">Student Feedback (Visible)</label>
                 <textarea 
                   rows={3} 
                   value={notes} 
                   onChange={(e) => setNotes(e.target.value)} 
                   disabled={isResolved || isUnassigned}
                   className="w-full bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white disabled:opacity-60" 
                   placeholder="Provide structured feedback visible to the student pane..."
                 />
                 {!isResolved && !isUnassigned && (
                   <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                     <div className="flex flex-wrap gap-2">
                       {quickPhrases.map(phrase => (
                         <button key={phrase} onClick={() => setNotes(prev => prev + (prev ? ' ' : '') + phrase)} className="text-[10px] uppercase font-bold bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2 py-1 rounded-md text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
                           {phrase}
                         </button>
                       ))}
                     </div>
                     <button onClick={() => submitSaveNotes()} className="text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1">
                       <Save size={14} /> Save Note
                     </button>
                   </div>
                 )}
               </div>

               <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-200/50 dark:border-red-900/30 rounded-xl p-5 shadow-sm mt-8 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50"></div>
                 <label className="block text-xs uppercase tracking-wider font-bold text-red-700 dark:text-red-400 mb-2">Strictly Private Notes</label>
                 <textarea 
                   rows={5} 
                   value={privateNotes} 
                   onChange={(e) => setPrivateNotes(e.target.value)} 
                   disabled={isResolved || isUnassigned}
                   className="w-full bg-white/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/40 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none text-red-900 dark:text-red-200 font-medium placeholder-red-300 dark:placeholder-red-800 disabled:opacity-60" 
                   placeholder="Confidential case logging. Will not be serialized to student end."
                 />
               </div>
               
               {!isResolved && !isUnassigned && (
                 <div className="flex flex-col gap-4 pt-4">
                   {request.type === 'appointment' && (
                     <div className="bg-blue-50/50 dark:bg-blue-950/10 border border-blue-200/50 dark:border-blue-900/30 rounded-xl p-4 shadow-sm relative overflow-hidden">
                       <label className="block text-xs uppercase tracking-wider font-bold text-blue-800 dark:text-blue-400 mb-2">Final Scheduled Date & Time</label>
                       <input 
                         type="datetime-local" 
                         value={scheduledAt} 
                         onChange={(e) => setScheduledAt(e.target.value)}
                         className="w-full bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-800/50 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-zinc-100"
                       />
                       <p className="text-[10px] text-blue-600 dark:text-blue-500 mt-2 font-medium">Select this before approving. Student will be alerted 1 hour before this schedule.</p>
                     </div>
                   )}
                   <button onClick={onStartChat} className="w-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-400 rounded-lg py-3.5 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/50">
                     <Send className="w-5 h-5" /> Jump to Case Comms Thread
                   </button>
                   <div className="flex gap-4">
                     <button onClick={() => submitResolve('approved')} disabled={request.type === 'appointment' && !scheduledAt} className="flex-1 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg py-3.5 font-bold text-sm flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 shadow-sm transition-all disabled:opacity-50"><CheckSquare className="w-5 h-5"/> Terminate (Approve)</button>
                     <button onClick={() => submitResolve('rejected')} className="flex-1 bg-white dark:bg-zinc-800 border-2 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg py-3.5 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><XSquare className="w-5 h-5"/> Terminate (Reject)</button>
                   </div>
                 </div>
               )}

               {isUnassigned && (
                 <div className="flex pt-4">
                   <button onClick={submitClaim} className="w-full bg-gradient-to-br from-slate-800 to-slate-900 dark:from-zinc-100 dark:to-zinc-200 text-white dark:text-slate-900 rounded-lg py-3.5 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01]">
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
}
