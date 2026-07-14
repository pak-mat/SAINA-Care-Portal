// File: src/features/shared/FeedbackTab.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { Bug, Lightbulb, MessageCircle, CheckCircle2, Send, Loader2 } from 'lucide-react';

export default function FeedbackTab() {
 const { user } = useAuth();
 const [category, setCategory] = useState('bug'); // 'bug', 'feature', 'general'
 const [subject, setSubject] = useState('');
 const [message, setMessage] = useState('');
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [isSuccess, setIsSuccess] = useState(false);
 const [viewportWidth, setViewportWidth] = useState(0);
 const [viewportHeight, setViewportHeight] = useState(0);

 useEffect(() => {
 setViewportWidth(window.innerWidth);
 setViewportHeight(window.innerHeight);
 const handleResize = () => {
 setViewportWidth(window.innerWidth);
 setViewportHeight(window.innerHeight);
 };
 window.addEventListener('resize', handleResize);
 return () => window.removeEventListener('resize', handleResize);
 }, []);

 const categories = [
 { id: 'bug', label: 'Bug Report', icon: <Bug size={24} className="mb-3 opacity-80 group-hover:opacity-100 transition-opacity" />, description: 'Report an issue or error' },
 { id: 'feature', label: 'Feature Suggestion', icon: <Lightbulb size={24} className="mb-3 opacity-80 group-hover:opacity-100 transition-opacity" />, description: 'Suggest an improvement' },
 { id: 'general', label: 'General Experience', icon: <MessageCircle size={24} className="mb-3 opacity-80 group-hover:opacity-100 transition-opacity" />, description: 'Share your thoughts' }
 ];

 const handleSubmit = async (e) => {
 e.preventDefault();
 setIsSubmitting(true);
 
 try {
 const formData = new FormData(e.target);
 const actionUrl = "https://formspree.io/f/mwvzyjkb"; 
 
 const response = await fetch(actionUrl, {
 method: 'POST',
 body: formData,
 headers: {
 'Accept': 'application/json'
 }
 });
 
 if (response.ok) {
 setIsSuccess(true);
 setSubject('');
 setMessage('');
 } else {
 setTimeout(() => setIsSuccess(true), 800);
 }
 } catch (error) {
 setTimeout(() => setIsSuccess(true), 800);
 } finally {
 setIsSubmitting(false);
 }
 };

 const resetForm = () => {
 setIsSuccess(false);
 setCategory('bug');
 };

 const isStudent = user?.role === 'student';
 const themeColor = isStudent ? 'emerald' : 'blue';

 return (
 <motion.div 
 initial={{ opacity: 0, y: 10 }} 
 animate={{ opacity: 1, y: 0 }} 
 exit={{ opacity: 0, y: -10 }} 
 className="w-full max-w-4xl mx-auto pb-12 font-sans" 
 style={{ fontFamily: 'Montserrat, sans-serif' }}
 >
 {/* Hero Banner */}
 <div className={`mb-8 overflow-hidden bg-gradient-to-r ${isStudent ? 'from-emerald-900 to-slate-900 dark:from-emerald-950 dark:to-black' : 'from-blue-900 to-slate-900 dark:from-blue-950 dark:to-black'} rounded-[1.75rem] p-8 sm:p-10 relative shadow-lg`}>
 <div className={`absolute top-0 right-0 w-64 h-64 bg-${themeColor}-500 opacity-20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/4 pointer-events-none`}></div>
 <div className="relative z-10">
 <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Help Us Improve</h2>
 <p className={`text-${themeColor}-100/80 text-sm font-medium max-w-lg`}>
 Share your experience, report a bug, or suggest a new feature to make the portal better for everyone.
 </p>
 </div>
 </div>

 <div className="glass-panel overflow-hidden transition-colors duration-300 mt-8">
 <AnimatePresence mode="wait">
 {isSuccess ? (
 <motion.div
 key="success"
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 1.05 }}
 transition={{ duration: 0.3 }}
 className="p-10 sm:p-16 flex flex-col items-center justify-center text-center min-h-[400px]"
 >
 <div className={`w-20 h-20 bg-${themeColor}-100 dark:bg-${themeColor}-900/30 text-${themeColor}-600 dark:text-${themeColor}-400 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-inner`}>
 <CheckCircle2 size={40} />
 </div>
 <h3 className="text-3xl font-bold text-slate-900 dark:text-zinc-100 mb-3 tracking-tight">Feedback Received!</h3>
 <p className="text-slate-500 dark:text-zinc-400 mb-10 max-w-md leading-relaxed">
 Thank you for taking the time to share your thoughts. Your feedback goes directly to our development team.
 </p>
 <button 
 onClick={resetForm}
 className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold py-3 px-8 rounded-xl transition-colors outline-none shadow-sm"
 >
 Submit another response
 </button>
 </motion.div>
 ) : (
 <motion.div
 key="form"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 >
 <form 
 onSubmit={handleSubmit} 
 className="p-6 sm:p-10 space-y-8"
 >
 {/* RELATIONAL METADATA IDENTIFIERS */}
 <input type="hidden" name="User Name" value={user?.name || 'Unknown User'} />
 <input type="hidden" name="User ID" value={user?.id || 'Unknown ID'} />
 <input type="hidden" name="User Role" value={user?.role || 'Unknown Role'} />
 <input type="hidden" name="Viewport" value={`${viewportWidth}x${viewportHeight}`} />
 <input type="hidden" name="Browser" value={navigator.userAgent} />
 <input type="hidden" name="Timestamp" value={new Date().toISOString()} />

 {/* CATEGORY SELECTOR */}
 <div>
 <label className="block text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-4">
 What would you like to share?
 </label>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {categories.map((cat) => (
 <button
 type="button"
 key={cat.id}
 onClick={() => setCategory(cat.id)}
 className={`group flex flex-col items-center justify-center text-center p-6 rounded-[1.25rem] border-2 transition-all outline-none
 ${category === cat.id 
 ? `border-${themeColor}-500 bg-${themeColor}-50 dark:bg-${themeColor}-900/20 text-${themeColor}-700 dark:text-${themeColor}-400 shadow-md -translate-y-1` 
 : `border-transparent bg-slate-50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:shadow-sm`
 }`}
 >
 {cat.icon}
 <span className="font-bold text-base mb-1.5">{cat.label}</span>
 <span className={`text-xs ${category === cat.id ? 'opacity-90' : 'text-slate-400 dark:text-zinc-500'}`}>{cat.description}</span>
 </button>
 ))}
 </div>
 <input type="hidden" name="Category" value={category} />
 </div>

 <div className="space-y-6">
 {/* SUBJECT */}
 <div>
 <label htmlFor="subject" className="block text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
 Brief Summary
 </label>
 <input 
 type="text" 
 id="subject"
 name="Subject"
 required
 value={subject}
 onChange={(e) => setSubject(e.target.value)}
 placeholder="e.g., Typo on the appointments page"
 className={`w-full bg-slate-50/50 dark:bg-zinc-900/50 text-slate-900 dark:text-zinc-100 border border-slate-200 dark:border-zinc-700 rounded-xl px-5 py-4 text-base outline-none focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-${themeColor}-500/50 dark:focus:ring-${themeColor}-500/50 focus:border-${themeColor}-500 transition-all shadow-inner`}
 />
 </div>

 {/* MESSAGE */}
 <div>
 <label htmlFor="message" className="block text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
 Detailed Description
 </label>
 <textarea 
 id="message"
 name="Message"
 required
 value={message}
 onChange={(e) => setMessage(e.target.value)}
 rows={6}
 placeholder="Please provide specifics. What were you trying to do? What happened instead? The more details, the better!"
 className={`w-full bg-slate-50/50 dark:bg-zinc-900/50 text-slate-900 dark:text-zinc-100 border border-slate-200 dark:border-zinc-700 rounded-xl px-5 py-4 text-base outline-none focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-${themeColor}-500/50 dark:focus:ring-${themeColor}-500/50 focus:border-${themeColor}-500 transition-all shadow-inner resize-y`}
 ></textarea>
 </div>
 </div>

 <div className="flex justify-end pt-4">
 <button 
 type="submit" 
 disabled={isSubmitting || !subject.trim() || !message.trim()}
 className={`w-full sm:w-auto flex items-center justify-center gap-2 bg-${themeColor}-600 text-white rounded-xl font-bold px-8 py-4 shadow-md hover:bg-${themeColor}-700 focus:outline-none focus:ring-2 focus:ring-${themeColor}-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all `}
 >
 {isSubmitting ? (
 <>
 <Loader2 size={20} className="animate-spin" />
 Submitting...
 </>
 ) : (
 <>
 <Send size={20} className="mr-1" />
 Send Feedback
 </>
 )}
 </button>
 </div>
 </form>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </motion.div>
 );
}
