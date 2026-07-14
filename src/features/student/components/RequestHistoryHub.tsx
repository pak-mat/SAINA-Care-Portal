// File: src/features/student/components/RequestHistoryHub.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Calendar, ArrowUpRight, CheckCircle2, Clock, Download } from 'lucide-react';

export default function RequestHistoryHub({ requests }: any) {
 const [expandedId, setExpandedId] = useState(null);

 const getStatusColor = (status: string) => {
 switch(status?.toLowerCase()) {
 case 'pending': return 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
 case 'in-progress': return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
 case 'approved': return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
 case 'completed': return 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50';
 case 'rejected': return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50';
 default: return 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700';
 }
 };

 const getIcon = (type: string) => {
 if (type === 'appointment') return <Calendar size={18} className="text-indigo-500" />;
 return <ArrowUpRight size={18} className="text-blue-500" />;
 };

 const downloadSummary = (req: any) => {
 let content = `COUNSELING SESSION NOTES SUMMARY\n`;
 content += `=================================\n\n`;
 content += `Date Submitted: ${new Date(req.submissionDate).toLocaleString()}\n`;
 content += `Type: ${req.type.toUpperCase()}\n`;
 content += `Status: ${req.status.toUpperCase()}\n`;
 
 if (req.type === 'appointment') {
 content += `Category: ${req.reasonCategory || 'N/A'}\n`;
 content += `Requested Dates: \n- ${req.choice1}\n- ${req.choice2 || 'N/A'}\n- ${req.choice3 || 'N/A'}\n`;
 content += `Context/Details:\n${req.details || 'N/A'}\n\n`;
 } else if (req.type === 'permission') {
 content += `Target School: ${req.targetSchool || 'N/A'}\n`;
 content += `Reason for Transfer:\n${req.reason || 'N/A'}\n\n`;
 }
 
 content += `COUNSELOR FEEDBACK\n`;
 content += `===================\n`;
 if (req.counselorNotes) {
 if (req.resolvedByName) content += `Reviewed by: ${req.resolvedByName}\n`;
 content += `${req.counselorNotes}\n`;
 } else {
 content += `No official feedback provided yet.\n`;
 }

 const blob = new Blob([content], { type: 'text/plain' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `Session_Summary_${req.type}_${req.submissionDate}.txt`;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
 };

 return (
 <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="w-full max-w-6xl mx-auto pb-12 font-sans" style={{ fontFamily: 'Montserrat, sans-serif' }}>
 
 {/* Hero Banner */}
 <div className="mb-8 overflow-hidden bg-gradient-to-r from-emerald-900 to-slate-900 dark:from-emerald-950 dark:to-black rounded-[1.75rem] p-8 sm:p-10 relative shadow-lg">
 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 opacity-20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/4 pointer-events-none"></div>
 <div className="relative z-10">
 <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Request History</h2>
 <p className="text-emerald-100/80 text-sm font-medium max-w-lg">
 Review the status of your past counseling appointments and transfer requests.
 </p>
 </div>
 </div>
 
 {requests.length === 0 ? (
 <div className="glass-panel p-16 text-center shadow-sm">
 <div className="w-24 h-24 mx-auto bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-200 dark:border-zinc-700">
 <Clock size={40} className="text-slate-400 dark:text-zinc-500" />
 </div>
 <h3 className="text-2xl font-bold text-slate-800 dark:text-zinc-200 tracking-tight mb-2">No requests found</h3>
 <p className="text-slate-500 dark:text-zinc-400">You haven't submitted any requests yet. Use the Quick Actions on your dashboard to get started.</p>
 </div>
 ) : (
 <div className="glass-panel shadow-sm overflow-hidden">
 <div className="hidden md:grid grid-cols-12 gap-4 p-5 border-b border-white/50 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/50 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
 <div className="col-span-4 pl-3">Request Subject</div>
 <div className="col-span-3">Submitted On</div>
 <div className="col-span-3">Status</div>
 <div className="col-span-2 text-right pr-3">Action</div>
 </div>
 
 <div className="divide-y divide-slate-100 dark:divide-zinc-800/50">
 {requests.slice().reverse().map((req: any) => (
 <div key={req.id} className="transition-colors duration-300">
 <div 
 className={`p-4 md:p-0 cursor-pointer hover:bg-white/80 dark:hover:bg-zinc-800/50 transition-colors ${expandedId === req.id ? 'bg-white dark:bg-zinc-800/30' : ''}`}
 onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
 >
 <div className="md:grid md:grid-cols-12 gap-4 items-center p-0 md:p-5">
 <div className="col-span-4 flex items-center gap-4 mb-3 md:mb-0 pl-0 md:pl-3">
 <div className="w-10 h-10 rounded-[1rem] bg-slate-50 dark:bg-zinc-800 flex items-center justify-center border border-slate-200 dark:border-zinc-700 shadow-sm">
 {getIcon(req.type)}
 </div>
 <div>
 <p className="font-bold text-slate-900 dark:text-zinc-100 capitalize text-base">{req.type}</p>
 <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 md:hidden block mt-0.5">Submitted: {new Date(req.submissionDate).toLocaleDateString()}</p>
 </div>
 </div>
 
 <div className="col-span-3 hidden md:block text-sm font-medium text-slate-600 dark:text-zinc-400">
 {new Date(req.submissionDate).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}
 </div>
 
 <div className="col-span-3 mb-4 md:mb-0">
 <span className={`inline-flex px-3 py-1 rounded-full border shadow-sm text-xs font-bold uppercase tracking-wide ${getStatusColor(req.status)}`}>
 {req.status}
 </span>
 </div>
 
 <div className="col-span-2 flex justify-start md:justify-end pr-0 md:pr-3">
 <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 group uppercase tracking-wider bg-slate-50 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700">
 {expandedId === req.id ? 'Hide' : 'View'}
 <ChevronRight size={14} className={`transition-flex-shrink-0 ${expandedId === req.id ? 'rotate-90 text-emerald-500' : 'group-hover:translate-x-1'}`} />
 </div>
 </div>
 </div>
 </div>
 
 <AnimatePresence>
 {expandedId === req.id && (
 <motion.div 
 initial={{ height: 0, opacity: 0 }} 
 animate={{ height: 'auto', opacity: 1 }} 
 exit={{ height: 0, opacity: 0 }}
 className="overflow-hidden border-t border-slate-100 dark:border-zinc-800/50 bg-slate-50/80 dark:bg-zinc-900/80 shadow-inner"
 >
 <div className="p-6 md:p-8">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 {/* Details Column */}
 <div className="space-y-5 text-sm">
 <h4 className="font-black text-slate-900 dark:text-zinc-100 uppercase tracking-widest text-xs border-b border-slate-200 dark:border-zinc-700 pb-2">Submission Data</h4>
 {req.type === 'appointment' && (
 <div className="space-y-4">
 <div><span className="text-slate-500 dark:text-zinc-400 block mb-1 uppercase text-[10px] font-bold tracking-wider">Reason Category:</span> <span className="font-bold text-slate-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700">{req.reasonCategory}</span></div>
 {req.scheduledAt && (
 <div><span className="text-emerald-600 dark:text-emerald-400 font-bold block mb-1 uppercase text-[10px] tracking-wider">Final Scheduled Appointment:</span> <span className="inline-block bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 font-bold uppercase tracking-wide text-sm shadow-sm">{new Date(req.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span></div>
 )}
 <div><span className="text-slate-500 dark:text-zinc-400 block mb-1 uppercase text-[10px] font-bold tracking-wider">Requested Dates:</span> 
 <ul className="space-y-1.5 mt-1 font-medium">
 <li className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 shadow-sm">{req.choice1}</li>
 {req.choice2 && <li className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 shadow-sm">{req.choice2}</li>}
 {req.choice3 && <li className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 shadow-sm">{req.choice3}</li>}
 </ul>
 </div>
 <div>
 <span className="text-slate-500 dark:text-zinc-400 block mb-1 uppercase text-[10px] font-bold tracking-wider">Context / Details:</span>
 <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 shadow-sm leading-relaxed">{req.details}</div>
 </div>
 </div>
 )}
 
 {req.type === 'permission' && (
 <div className="space-y-4">
 <div><span className="text-slate-500 dark:text-zinc-400 block mb-1 uppercase text-[10px] font-bold tracking-wider">Target School:</span> <span className="font-bold text-slate-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700">{req.targetSchool}</span></div>
 <div>
 <span className="text-slate-500 dark:text-zinc-400 block mb-1 uppercase text-[10px] font-bold tracking-wider">Reason for Transfer:</span>
 <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 shadow-sm leading-relaxed">{req.reason}</div>
 </div>
 </div>
 )}
 </div>
 
 {/* Feedback Column */}
 <div className="space-y-4">
 <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-700 pb-2">
 <h4 className="font-black text-slate-900 dark:text-zinc-100 uppercase tracking-widest text-xs">Counselor Feedback</h4>
 {(req.status === 'approved' || req.status === 'completed' || !!req.counselorNotes) && (
 <button 
 onClick={(e) => { e.stopPropagation(); downloadSummary(req); }}
 className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50 uppercase tracking-wider"
 title="Download session notes summary"
 >
 <Download size={12} /> Download
 </button>
 )}
 </div>
 {req.counselorNotes ? (
 <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-[1.25rem] border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
 <div className="flex items-center gap-2 mb-3">
 <CheckCircle2 className="text-emerald-500" size={18} />
 <span className="font-bold text-emerald-900 dark:text-emerald-100">Reviewed by {req.resolvedByName}</span>
 </div>
 <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 leading-relaxed border-l-2 border-emerald-300 dark:border-emerald-700 pl-4 bg-white/40 dark:bg-zinc-900/40 p-3 rounded-r-lg">
 {req.counselorNotes}
 </p>
 </div>
 ) : (
 <div className="h-full min-h-[120px] flex items-center justify-center bg-slate-100/50 dark:bg-zinc-900/30 rounded-[1.25rem] border border-dashed border-slate-300 dark:border-zinc-700 p-6 text-center text-slate-500 dark:text-zinc-500 text-sm font-medium shadow-inner">
 No official feedback provided yet. Your request is currently {req.status}.
 </div>
 )}
 </div>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 ))}
 </div>
 </div>
 )}
 </motion.div>
 );
}
