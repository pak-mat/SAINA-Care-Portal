// File: src/features/student/components/PermissionForm.tsx
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UploadCloud, FileText, CheckCircle, HelpCircle } from 'lucide-react';
import { createSchoolTransfer } from '../../../services/localEngine';

export default function PermissionForm({ onDone, user }: any) {
  const [targetSchool, setTargetSchool] = useState('');
  const [reason, setReason] = useState('');

  const submit = (e: any) => {
    e.preventDefault();
    createSchoolTransfer({ targetSchool, reason, transferFormsFile: 'attached_form.pdf', academicRecordsFile: 'attached_records.pdf', idDocumentsFile: 'attached_id.pdf', studentId: user.id, studentName: user.name });
    onDone();
  };

  return (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="w-full">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-700 overflow-hidden transition-colors duration-300">
        <div className="flex flex-col lg:flex-row">
          {/* Left Info Section */}
          <div className="lg:w-1/3 bg-slate-50 dark:bg-zinc-900/50 p-8 sm:p-10 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-zinc-700">
            <div className="flex items-center gap-3 mb-6 block">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <FileText size={20} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">School Transfer</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-8 leading-relaxed">
              Submit your formal request to transfer out to another institution. The counseling team and administration will review your documentation within 3-5 business days.
            </p>
            
            <div className="space-y-4">
               <div className="flex items-start gap-3">
                 <CheckCircle className="text-blue-500 mt-0.5" size={16} />
                 <div>
                   <h4 className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Requires Documentation</h4>
                   <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Please ensure all attached copies are legible and up-to-date.</p>
                 </div>
               </div>
               <div className="flex items-start gap-3">
                 <HelpCircle className="text-blue-500 mt-0.5" size={16} />
                 <div>
                   <h4 className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Need Help?</h4>
                   <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">If you are unsure about the required forms, please book a counseling session first.</p>
                 </div>
               </div>
            </div>
          </div>

          {/* Right Form Section */}
          <div className="lg:w-2/3 p-8 sm:p-10">
            <form onSubmit={submit} className="space-y-8">
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Target Institution</label>
                  <input required value={targetSchool} onChange={e => setTargetSchool(e.target.value)} type="text" placeholder="e.g. SM Sains Sultan Mahmud" className="w-full border border-slate-300 dark:border-zinc-700 rounded-md px-4 py-3 bg-white dark:bg-zinc-900 focus:bg-slate-50 dark:focus:bg-zinc-800 text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Primary Reason for Transfer</label>
                  <textarea required value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="Please provide specific reasoning as this will be required for administrative approval..." className="w-full border border-slate-300 dark:border-zinc-700 rounded-md px-4 py-3 bg-white dark:bg-zinc-900 focus:bg-slate-50 dark:focus:bg-zinc-800 text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"></textarea>
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-100 dark:border-zinc-700/50">
                <label className="block text-sm font-semibold text-slate-800 dark:text-zinc-200 mb-4">Required Documents</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   {[
                     { label: 'Transfer Forms', id: 'f1' },
                     { label: 'Academic Records', id: 'f2' },
                     { label: 'ID Copies', id: 'f3' }
                   ].map(f => (
                     <div key={f.id} className="border-2 border-dashed border-slate-300 dark:border-zinc-600 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-zinc-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group">
                        <UploadCloud className="text-slate-400 dark:text-zinc-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 mb-3 transition-colors" size={28} />
                        <span className="text-sm font-semibold text-slate-600 dark:text-zinc-400 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{f.label}</span>
                        <span className="text-xs text-slate-400 dark:text-zinc-500 mt-1 mt-1 block">Click or drag</span>
                     </div>
                   ))}
                </div>
              </div>

              <div className="pt-4 mt-8 flex justify-end">
                <button type="submit" disabled={!targetSchool || !reason} className="bg-slate-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-zinc-100 disabled:opacity-50 font-semibold py-3 px-8 rounded-md transition-all shadow-sm focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 w-full sm:w-auto">
                  Submit Transfer Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
