import React, { useState, useEffect, useRef, useMemo } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, ChevronRight, FileText, Download, X, Paperclip, Send } from 'lucide-react';
import { useDirectMessages, useCounselorConversations } from '../../hooks/useGroupChat';
import { useDirectory, usePresence } from '../../hooks/useSocial';
import { supabase } from '../../lib/supabase';
import { getRelativeTime } from '../../utils/time';
import { User } from '../../types';

interface CounselorChatTabProps {
 user: User;
 defaultStudentId: string | null;
 requests: any[];
}

export default function CounselorChatTab({ user, defaultStudentId, requests }: CounselorChatTabProps) {
 const [activeStudentId, setActiveStudentId] = useState<string | null>(defaultStudentId || null);
 const [text, setText] = useState('');
 const [imageBase64, setImageBase64] = useState<string | null>(null);
 const [file, setFile] = useState<File | null>(null);
 const [selectedImage, setSelectedImage] = useState<string | null>(null);
 const [isTyping, setIsTyping] = useState(false);
 const chatEndRef = useRef<HTMLDivElement>(null);
 
 const { messages: activeMessages, sendMessage } = useDirectMessages(activeStudentId, user.id);
 
 // Typing indicator sync
 useEffect(() => {
 if (!activeStudentId) return;
 const room = [user.id, activeStudentId].sort().join('_');
 const channel = supabase.channel(`typing_${room}`);
 
 channel.on('broadcast', { event: 'typing' }, (payload) => {
 if (payload.payload.userId === activeStudentId) {
 setIsTyping(payload.payload.isTyping);
 }
 }).subscribe();

 return () => { supabase.removeChannel(channel); };
 }, [activeStudentId, user.id]);

 const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
 setText(e.target.value);
 if (!activeStudentId) return;
 const room = [user.id, activeStudentId].sort().join('_');
 supabase.channel(`typing_${room}`).send({
 type: 'broadcast',
 event: 'typing',
 payload: { userId: user.id, isTyping: e.target.value.length > 0 }
 });
 };
 
 const { data: directoryData } = useDirectory();
 const { isUserOnline } = usePresence();
 
 const conversationStudentIds = useCounselorConversations(user?.id);
 
 const studentIdsFromRequests = useMemo(() => {
 const ids = new Set<string>();
 requests.forEach(r => {
 if (r.studentid) ids.add(r.studentid);
 });
 return ids;
 }, [requests]);
 
 const sidebarStudents = useMemo(() => {
 if (!directoryData) return [];
 
 const allRelevantIds = new Set([...studentIdsFromRequests, ...conversationStudentIds]);
 
 return directoryData
 .filter(u => u.role === 'student' && allRelevantIds.has(u.id))
 .map(u => ({ id: u.id, name: u.name, studentid: u.studentId, avatarUrl: u.avatarUrl }));
 }, [directoryData, studentIdsFromRequests, conversationStudentIds]);

 // Sync activeStudentId when defaultStudentId changes (e.g. "Jump to Case Comms Thread")
 useEffect(() => {
 if (defaultStudentId) {
 setActiveStudentId(defaultStudentId);
 }
 }, [defaultStudentId]);

 // Auto-select first student if none is active
 useEffect(() => {
 if (!activeStudentId && sidebarStudents.length > 0) {
 setActiveStudentId(sidebarStudents[0].id);
 }
 }, [sidebarStudents.length, activeStudentId]);

 const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
 const selectedFile = e.target.files?.[0];
 if (selectedFile) {
 if (selectedFile.size > 10 * 1024 * 1024) {
 toast.error('File size exceeds 10MB limit.');
 e.target.value = '';
 return;
 }
 setFile(selectedFile);
 if (selectedFile.type.startsWith('image/')) {
 const reader = new FileReader();
 reader.onloadend = () => setImageBase64(reader.result as string);
 reader.readAsDataURL(selectedFile);
 } else {
 setImageBase64(null);
 }
 }
 e.target.value = '';
 };

 const handleSend = (e: React.FormEvent) => {
 e.preventDefault();
 if ((!text.trim() && !file && !imageBase64) || !activeStudentId) return;
 
 sendMessage.mutate({ 
 text: text.trim(), 
 file: file || undefined, 
 imagebase64: (!file && imageBase64) ? imageBase64 : undefined, 
 senderId: user.id 
 });
 
 const room = [user.id, activeStudentId].sort().join('_');
 supabase.channel(`typing_${room}`).send({
 type: 'broadcast',
 event: 'typing',
 payload: { userId: user.id, isTyping: false }
 });

 setText('');
 setImageBase64(null);
 setFile(null);
 };

 useEffect(() => {
 if (chatEndRef.current) {
 chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
 }
 }, [activeStudentId, activeMessages.length]);

 return (
 <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="w-full h-full flex-1 min-h-0 max-w-none flex flex-col md:flex-row md:gap-8 relative drop-shadow-xl p-4 sm:p-6 lg:p-8">
 <div className={`w-full md:w-1/3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200/60 dark:border-zinc-800/60 md:rounded-xl shadow-sm overflow-hidden flex-col transition-all duration-300 ${activeStudentId ? 'hidden md:flex' : 'flex'}`}>
 <div className="p-5 border-b border-slate-200/50 dark:border-zinc-800/50 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-zinc-800/20">
 <h3 className="font-bold tracking-tight text-xl text-slate-900 dark:text-zinc-100 mb-1">Active Channels</h3>
 <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Manage student communications</p>
 </div>
 <div className="flex-1 overflow-y-auto p-3 space-y-2">
 {sidebarStudents.length === 0 && (
 <div className="text-center text-sm text-slate-400 dark:text-zinc-500 py-10">No student conversations yet.</div>
 )}
 {sidebarStudents.map(s => (
 <motion.div 
 whileHover={{ scale: 1.01, backgroundColor: activeStudentId !== s.id ? 'rgba(241, 245, 249, 0.8)' : undefined }}
 key={s.id} 
 onClick={() => setActiveStudentId(s.id)}
 className={`p-3 rounded-lg cursor-pointer transition-all duration-300 flex items-center gap-4 group
 ${activeStudentId === s.id 
 ? 'bg-slate-900 dark:bg-zinc-800 border border-slate-800 dark:border-zinc-700 shadow-md ring-1 ring-slate-900/10' 
 : 'border border-transparent text-slate-700 dark:text-zinc-300'}`}
 >
 <div className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-all duration-300 ${activeStudentId === s.id ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-emerald-900/30' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 group-'}`}>
 {s.name.charAt(0)}
 <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 ${isUserOnline(s.id) ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-zinc-600'}`}></span>
 </div>
 <div className="flex-1 overflow-hidden">
 <span className={`block truncate font-bold text-sm transition-colors ${activeStudentId === s.id ? 'text-white' : 'text-slate-800 dark:text-zinc-200'}`}>{s.name}</span>
 <span className={`text-xs block font-medium mt-0.5 ${activeStudentId === s.id ? 'text-slate-400' : 'text-slate-500 dark:text-zinc-500'}`}>
 {isUserOnline(s.id) ? 'Active now' : 'Offline'}
 </span>
 </div>
 </motion.div>
 ))}
 </div>
 </div>

 <div className={`w-full md:w-2/3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200/60 dark:border-zinc-800/60 md:rounded-xl shadow-sm overflow-hidden flex-col transition-all duration-300 relative ${!activeStudentId ? 'hidden md:flex' : 'flex'}`}>
 {!activeStudentId ? (
 <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 text-sm p-8 text-center bg-slate-50/50 dark:bg-zinc-900/50 h-full">
 <div className="w-20 h-20 mb-6 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-inner relative overflow-hidden border border-slate-200 dark:border-zinc-700">
 <MessageSquare size={32} className="text-slate-400/60 dark:text-zinc-500" />
 </div>
 <h3 className="text-lg font-semibold text-slate-700 dark:text-zinc-300 mb-2">Student Channels</h3>
 <p className="max-w-xs text-slate-500">Select a student from the sidebar to view or reply to their secure messages.</p>
 </div>
 ) : (
 <>
 <div className="p-4 md:px-6 md:py-5 border-b border-slate-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm flex items-center gap-4 z-10">
 <button onClick={() => setActiveStudentId(null)} className="md:hidden p-2 -ml-2 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
 <ChevronRight className="rotate-180" size={20} />
 </button>
 <div className="relative w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-slate-700 to-slate-800 shadow-sm shadow-slate-900/20">
 {sidebarStudents.find(s=>s.id===activeStudentId)?.name.charAt(0)}
 </div>
 <div>
 <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm md:text-base tracking-tight">{sidebarStudents.find(s=>s.id===activeStudentId)?.name}</h3>
 <span className="text-[11px] md:text-xs text-slate-500 dark:text-zinc-400 font-semibold tracking-wider uppercase">Secure Direct Message</span>
 </div>
 </div>
 
 <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-slate-50/30 to-slate-100/50 dark:from-zinc-900/30 dark:to-zinc-950/50 flex flex-col scroll-smooth">
 {activeMessages.length === 0 && <div className="text-center text-sm font-medium text-slate-400 dark:text-zinc-500 my-auto bg-white/60 dark:bg-zinc-800/60 p-4 rounded-lg mx-auto backdrop-blur-sm border border-slate-100 dark:border-zinc-700/50 shadow-sm">No messages in this channel yet.</div>}
 {activeMessages.map((m: any, i: number) => {
 const isMe = m.senderid === user.id;
 const showAvatar = !isMe && (i === 0 || activeMessages[i-1].senderid !== m.senderid);
 
 const currentMsgDate = new Date(m.timestamp).toLocaleDateString();
 const prevMsgDate = i > 0 ? new Date(activeMessages[i-1].timestamp).toLocaleDateString() : null;
 const showDateSeparator = currentMsgDate !== prevMsgDate;
 
 const isNextSameSender = i < activeMessages.length - 1 && activeMessages[i+1].senderid === m.senderid;

 return (
 <React.Fragment key={m.id || i}>
 {showDateSeparator && (
 <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="flex justify-center my-6">
 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 bg-slate-200/50 dark:bg-zinc-800/50 px-3 py-1 rounded-full backdrop-blur-md">
 {currentMsgDate === new Date().toLocaleDateString() ? 'Today' : 
 currentMsgDate === new Date(Date.now() - 86400000).toLocaleDateString() ? 'Yesterday' : 
 currentMsgDate}
 </span>
 </motion.div>
 )}
 <motion.div initial={{opacity:0, y:10, scale:0.95}} animate={{opacity:1, y:0, scale:1}} transition={{duration: 0.2}} className={`flex max-w-[85%] md:max-w-[75%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'} gap-2 group ${isNextSameSender ? 'mb-1' : 'mb-5'}`}>
 {!isMe && (
 <div className="w-8 shrink-0 flex flex-col justify-end">
 {showAvatar && (
 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-sm mb-1 overflow-hidden">
 {(() => {
   const sender = sidebarStudents.find(s=>s.id===m.senderid);
   if (sender?.avatarUrl) {
     return <img src={sender.avatarUrl} alt="Profile" className="w-full h-full object-cover" />;
   }
   return sender?.name?.charAt(0) || 'S';
 })()}
 </div>
 )}
 </div>
 )}

 <div className="flex flex-col">
 <div className={`p-3.5 md:p-4 shadow-sm backdrop-blur-sm
 ${isMe 
 ? 'bg-gradient-to-br from-slate-800 to-slate-900 dark:from-zinc-700 dark:to-zinc-800 text-white rounded-lg rounded-br-sm border border-slate-700/50' 
 : 'bg-white dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60 text-slate-800 dark:text-zinc-100 rounded-lg rounded-bl-sm'}
 `}>
 {(m.imagebase64 || (m.file_type && m.file_type.startsWith('image/'))) && (
 <div className="relative rounded-xl overflow-hidden mb-2 shadow-inner border border-black/5 dark:border-white/5 bg-black/5">
 <img 
 src={m.file_url || m.imagebase64} 
 alt="Attachment" 
 onClick={() => setSelectedImage(m.file_url || m.imagebase64)}
 className="max-w-full object-cover max-h-64 rounded-xl transition-duration-500 cursor-zoom-in" 
 />
 </div>
 )}
 {m.file_url && !m.file_type?.startsWith('image/') && (
 <a href={m.file_url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-3 rounded-xl mb-2 transition-colors ${isMe ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-100'}`}>
 <div className={`p-2 rounded-lg ${isMe ? 'bg-white/20' : 'bg-white dark:bg-zinc-800 shadow-sm'}`}>
 <FileText size={20} />
 </div>
 <div className="flex-1 overflow-hidden">
 <p className="text-sm font-bold truncate">{m.file_name || 'Document'}</p>
 <p className="text-[10px] opacity-70">{(m.file_size / 1024 / 1024).toFixed(2)} MB</p>
 </div>
 <Download size={16} className="opacity-70" />
 </a>
 )}
 
 {m.text && <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{m.text}</p>}
 </div>
 
 <span className={`text-[10px] mt-1.5 font-medium flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'text-slate-400' : 'text-slate-400 dark:text-zinc-500'}`}>
 <span>{getRelativeTime(m.timestamp)}</span>
 <span>{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
 </span>
 </div>
 </motion.div>
 </React.Fragment>
 );
 })}
 
 {isTyping && (
 <div className="flex justify-start">
 <div className="w-10"></div>
 <div className="bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700/50 p-4 rounded-lg rounded-tl-sm shadow-sm flex items-center gap-1.5">
 <span className="w-1.5 h-1.5 bg-slate-500/50 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
 <span className="w-1.5 h-1.5 bg-slate-500/70 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
 <span className="w-1.5 h-1.5 bg-slate-500/90 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
 </div>
 </div>
 )}
 
 <div ref={chatEndRef} />
 </div>

 <div className="p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-t border-slate-200/60 dark:border-zinc-800/60 z-10">
 {file && (
 <motion.div initial={{opacity:0, y:10, scale:0.95}} animate={{opacity:1, y:0, scale:1}} className="mb-3 relative inline-flex items-center gap-3 p-2 pr-4 bg-white dark:bg-zinc-800 rounded-xl rounded-bl-sm shadow-md border border-slate-200 dark:border-zinc-700">
 {imageBase64 ? (
 <img src={imageBase64} alt="Preview" className="h-12 w-12 object-cover rounded-lg shadow-inner" />
 ) : (
 <div className="h-12 w-12 bg-slate-100 dark:bg-zinc-700 rounded-lg flex items-center justify-center text-slate-500 dark:text-zinc-400">
 <FileText size={24} />
 </div>
 )}
 <div className="flex flex-col max-w-[200px]">
 <span className="text-sm font-bold text-slate-700 dark:text-zinc-200 truncate">{file.name}</span>
 <span className="text-xs text-slate-500 dark:text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
 </div>
 <button onClick={() => { setFile(null); setImageBase64(null); }} type="button" className="absolute -top-2 -right-2 bg-slate-800 dark:bg-zinc-100 text-white dark:text-slate-900 rounded-full p-1 border border-white dark:border-zinc-900 transition-shadow-sm">
 <X size={14} strokeWidth={3} />
 </button>
 </motion.div>
 )}
 <form onSubmit={handleSend} className="flex gap-2.5 items-end">
 <label className="cursor-pointer text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 h-12 w-12 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-700 shrink-0">
 <Paperclip size={20} />
 <input type="file" className="hidden" onChange={handleFileUpload} />
 </label>
 
 <div className="flex-1 relative">
 <input 
 type="text" 
 value={text} 
 onChange={handleTyping} 
 onFocus={() => {
 setTimeout(() => {
 if (chatEndRef.current) {
 chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
 }
 }, 250);
 }}
 className="w-full border border-slate-200 dark:border-zinc-700 rounded-full pl-5 pr-14 py-3.5 bg-slate-50 dark:bg-zinc-900/80 focus:bg-white dark:focus:bg-zinc-800 text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-slate-900/50 dark:focus:ring-zinc-600/50 text-[15px] transition-all shadow-inner" 
 placeholder="Type reply to student..."
 />
 <button 
 type="submit" 
 disabled={!text.trim() && !file && !imageBase64} 
 className="absolute right-1.5 top-1.5 bottom-1.5 w-10 h-10 rounded-full bg-gradient-to-tr from-slate-800 to-slate-900 dark:from-zinc-100 dark:to-zinc-200 flex items-center justify-center text-white dark:text-slate-900 disabled:opacity-40 disabled:grayscale transition-all shadow-sm outline-none shrink-0 hover:shadow-slate-900/25 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
 >
 <Send size={18} className="translate-x-[1px]" />
 </button>
 </div>
 </form>
 </div>
 </>
 )}
 </div>

 <AnimatePresence>
 {selectedImage && (
 <motion.div 
 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
 className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
 onClick={() => setSelectedImage(null)}
 >
 <button 
 className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
 onClick={() => setSelectedImage(null)}
 >
 <X size={24} />
 </button>
 <motion.img 
 initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
 src={selectedImage} 
 alt="Fullscreen view" 
 className="max-w-full max-h-full object-contain rounded-lg shadow-2xl cursor-zoom-out"
 onClick={(e) => e.stopPropagation()}
 />
 </motion.div>
 )}
 </AnimatePresence>
 </motion.div>
 );
}
