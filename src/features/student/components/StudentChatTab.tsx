import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { getRelativeTime } from '../../../utils/time';
import { ChevronRight, ImagePlus, Send, X, MessageSquare, Loader2, Paperclip, FileText, Download, Search, Plus, Users, Check } from 'lucide-react';
import { useDirectory, usePresence, useSocialNetwork } from '../../../hooks/useSocial';
import { useDirectMessages, useGroupChats, useGroupMessages } from '../../../hooks/useGroupChat';
import { supabase } from '../../../lib/supabase';

export default function StudentChatTab({ user, requests }) {
 const [text, setText] = useState('');
 const [imageBase64, setImageBase64] = useState(null);
 const [file, setFile] = useState<File | null>(null);
 const [isTyping, setIsTyping] = useState(false);
 const [selectedImage, setSelectedImage] = useState<string | null>(null);
 
 const [activeChat, setActiveChat] = useState<{type: 'direct'|'group', id: string, name: string} | null>(null);
 const [searchQuery, setSearchQuery] = useState('');
 const [isCreatingGroup, setIsCreatingGroup] = useState(false);
 const [newGroupName, setNewGroupName] = useState('');
 const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

 const chatEndRef = React.useRef<HTMLDivElement | null>(null);
 
 const { isUserOnline } = usePresence();
 const { data: directoryData } = useDirectory();
 const counselors = directoryData?.filter(u => u.role === 'counselor') || [];
 
 const { friends: friendsData } = useSocialNetwork(user?.id);
 const friendsIds = friendsData?.map(f => f.user_id === user?.id ? f.friend_id : f.user_id) || [];
 const friends = directoryData?.filter(u => friendsIds.includes(u.id)) || [];
 
 const { groups, createGroup } = useGroupChats(user.id);
 
 const assignedRequest = requests?.find(r => r.assignedTo);

 // Set default active partner when directory loads if none selected
 useEffect(() => {
 if (!activeChat && counselors.length > 0) {
 const defaultId = assignedRequest?.assignedTo || counselors[0].id;
 const defaultName = directoryData?.find(d => d.id === defaultId)?.name || 'Counselor';
 setActiveChat({ type: 'direct', id: defaultId, name: defaultName });
 }
 }, [counselors.length, activeChat, assignedRequest, directoryData]);

 const { messages: directMessages, sendMessage: sendDirect } = useDirectMessages(user.id, activeChat?.type === 'direct' ? activeChat.id : undefined);
 const { messages: groupMessages, sendMessage: sendGroup } = useGroupMessages(activeChat?.type === 'group' ? activeChat.id : undefined);
 
 const activeMessages = activeChat?.type === 'group' ? groupMessages : directMessages;

 // Typing indicator sync (only for direct messages for now)
 useEffect(() => {
 if (activeChat?.type !== 'direct') {
 setIsTyping(false);
 return;
 }
 const room = [user.id, activeChat.id].sort().join('_');
 const channel = supabase.channel(`typing_${room}`);
 
 channel.on('broadcast', { event: 'typing' }, (payload) => {
 if (payload.payload.userId === activeChat.id) {
 setIsTyping(payload.payload.isTyping);
 }
 }).subscribe();

 return () => { supabase.removeChannel(channel); };
 }, [activeChat, user.id]);

 const handleTyping = (e) => {
 setText(e.target.value);
 if (activeChat?.type !== 'direct') return; // Group typing broadcast can be added later
 const room = [user.id, activeChat.id].sort().join('_');
 supabase.channel(`typing_${room}`).send({
 type: 'broadcast',
 event: 'typing',
 payload: { userId: user.id, isTyping: e.target.value.length > 0 }
 });
 };

 const handleFileUpload = (e) => {
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
 reader.onloadend = () => setImageBase64(reader.result);
 reader.readAsDataURL(selectedFile);
 } else {
 setImageBase64(null);
 }
 }
 e.target.value = '';
 };

 const handleSend = (e) => {
 e.preventDefault();
 if ((!text.trim() && !file && !imageBase64) || !activeChat) return;
 
 if (activeChat.type === 'direct') {
 sendDirect.mutate({ text: text.trim(), file: file || undefined, imagebase64: (!file && imageBase64) ? imageBase64 : undefined }); 
 
 const room = [user.id, activeChat.id].sort().join('_');
 supabase.channel(`typing_${room}`).send({
 type: 'broadcast',
 event: 'typing',
 payload: { userId: user.id, isTyping: false }
 });
 } else {
 sendGroup.mutate({ senderId: user.id, senderName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User', text: text.trim(), file: file || undefined, imagebase64: (!file && imageBase64) ? imageBase64 : undefined });
 }

 setText('');
 setImageBase64(null);
 setFile(null);
 };

 const handleCreateGroup = () => {
 if (!newGroupName.trim() || selectedMembers.length === 0) return;
 createGroup.mutate({ name: newGroupName, members: selectedMembers }, {
 onSuccess: (newGroup) => {
 setIsCreatingGroup(false);
 setNewGroupName('');
 setSelectedMembers([]);
 setActiveChat({ type: 'group', id: newGroup.id, name: newGroup.name });
 }
 });
 };

 useEffect(() => {
 if (chatEndRef.current) {
 chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
 }
 }, [activeChat, activeMessages.length]);

 const filteredCounselors = counselors.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
 const filteredFriends = friends.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
 const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

 const SidebarItem = ({ peer, type }: { key?: string | number, peer: any, type: 'direct'|'group' }) => {
 const isActive = activeChat?.id === peer.id;
 return (
 <div 
 onClick={() => setActiveChat({ type, id: peer.id, name: peer.name })}
 className={`p-3 rounded-lg cursor-pointer transition-all duration-300 flex items-center gap-4 group
 ${isActive 
 ? 'bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200/50 dark:border-emerald-800/50 shadow-sm ring-1 ring-emerald-500/20' 
 : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50 border border-transparent text-slate-700 dark:text-zinc-300'}`}
 >
 <div className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-all duration-300 ${isActive ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/30' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 group-'}`}>
 {type === 'group' ? <Users size={20} /> : peer.name.charAt(0)}
 {type === 'direct' && <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 ${isUserOnline(peer.id) ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-zinc-600'}`}></span>}
 </div>
 <div className="flex-1 overflow-hidden">
 <span className={`block truncate font-bold text-sm transition-colors ${isActive ? 'text-emerald-900 dark:text-emerald-100' : 'text-slate-800 dark:text-zinc-200'}`}>{peer.name}</span>
 <span className={`text-xs block font-medium mt-0.5 ${type === 'direct' ? (isUserOnline(peer.id) ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-400 dark:text-zinc-500') : 'text-slate-400 dark:text-zinc-500'}`}>
 {type === 'direct' ? (isUserOnline(peer.id) ? 'Active now' : 'Offline') : 'Group Chat'}
 </span>
 </div>
 </div>
 );
 };

 return (
 <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="max-w-none w-full h-full flex-1 flex md:gap-8 relative drop-shadow-xl overflow-hidden rounded-xl md:border md:border-slate-200/40 dark:md:border-zinc-800/40">
 <div className={`w-full md:w-1/3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200/60 dark:border-zinc-800/60 md:rounded-xl shadow-sm overflow-hidden flex-col transition-all duration-300 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
 <div className="p-4 border-b border-slate-200/50 dark:border-zinc-800/50 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-zinc-800/20">
 <div className="flex items-center justify-between mb-4">
 <div>
 <h3 className="font-bold tracking-tight text-xl text-slate-900 dark:text-zinc-100">Messages</h3>
 </div>
 <button onClick={() => setIsCreatingGroup(true)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-700 dark:text-zinc-300 transition-colors">
 <Plus size={18} />
 </button>
 </div>
 
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
 <input 
 type="text" 
 placeholder="Search chats..." 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-900 dark:text-zinc-100"
 />
 </div>
 </div>
 <div className="flex-1 overflow-y-auto p-3 space-y-4">
 {filteredGroups.length > 0 && (
 <div>
 <h4 className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2 px-2 mt-2">Groups</h4>
 <div className="space-y-1">
 {filteredGroups.map(g => (
 <SidebarItem key={g.id} peer={g} type="group" />
 ))}
 </div>
 </div>
 )}

 {filteredCounselors.length > 0 && (
 <div>
 <h4 className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2 px-2 mt-4">Counselors</h4>
 <div className="space-y-1">
 {filteredCounselors.map(c => (
 <SidebarItem key={c.id} peer={c} type="direct" />
 ))}
 </div>
 </div>
 )}

 {filteredFriends.length > 0 && (
 <div>
 <h4 className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2 px-2 mt-4">Friends</h4>
 <div className="space-y-1">
 {filteredFriends.map(f => (
 <SidebarItem key={f.id} peer={f} type="direct" />
 ))}
 </div>
 </div>
 )}
 </div>
 </div>

 <div className={`w-full md:w-2/3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200/60 dark:border-zinc-800/60 md:rounded-xl shadow-sm overflow-hidden flex-col transition-all duration-300 relative ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
 {!activeChat ? (
 <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 text-sm p-8 text-center bg-slate-50/50 dark:bg-zinc-900/50 h-full">
 <div className="w-20 h-20 mb-6 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-inner border border-slate-200 dark:border-zinc-700 relative overflow-hidden">
 <MessageSquare size={32} className="text-emerald-500/60 dark:text-emerald-400/50" />
 </div>
 <h3 className="text-lg font-semibold text-slate-700 dark:text-zinc-300 mb-2">Secure Channels</h3>
 <p className="max-w-xs text-slate-500">Select a connection from the sidebar to begin messaging.</p>
 </div>
 ) : (
 <>
 <div className="p-4 md:px-6 md:py-5 border-b border-slate-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm flex items-center gap-4 z-10">
 <button onClick={() => setActiveChat(null)} className="md:hidden p-2 -ml-2 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
 <ChevronRight className="rotate-180" size={20} />
 </button>
 <div className="relative w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm shadow-emerald-500/30">
 {activeChat.type === 'group' ? <Users size={16} /> : activeChat.name.charAt(0)}
 </div>
 <div>
 <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm md:text-base tracking-tight">{activeChat.name}</h3>
 <span className="text-[11px] md:text-xs text-emerald-600 dark:text-emerald-500 font-semibold tracking-wider uppercase">{activeChat.type === 'group' ? 'Group Chat' : 'Secure Session'}</span>
 </div>
 </div>
 
 <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-slate-50/30 to-slate-100/50 dark:from-zinc-900/30 dark:to-zinc-950/50 flex flex-col scroll-smooth">
 {activeMessages.length === 0 && <div className="text-center text-sm font-medium text-slate-400 dark:text-zinc-500 my-auto bg-white/60 dark:bg-zinc-800/60 p-4 rounded-lg mx-auto backdrop-blur-sm border border-slate-100 dark:border-zinc-700/50 shadow-sm">This is the beginning of your conversation.</div>}
 {activeMessages.map((m, i) => {
 const isGroup = activeChat.type === 'group';
 const msgSenderId = isGroup ? m.sender_id : m.senderid;
 const msgSenderName = isGroup ? m.sender_name : directoryData?.find(c => c.id === msgSenderId)?.name;
 const isMe = msgSenderId === user.id;
 const prevMsgSenderId = i > 0 ? (isGroup ? activeMessages[i-1].sender_id : activeMessages[i-1].senderid) : null;
 const showAvatar = !isMe && (i === 0 || prevMsgSenderId !== msgSenderId);
 
 const currentMsgDate = new Date(m.timestamp).toLocaleDateString();
 const prevMsgDate = i > 0 ? new Date(activeMessages[i-1].timestamp).toLocaleDateString() : null;
 const showDateSeparator = currentMsgDate !== prevMsgDate;
 
 const nextMsgSenderId = i < activeMessages.length - 1 ? (isGroup ? activeMessages[i+1].sender_id : activeMessages[i+1].senderid) : null;
 const isNextSameSender = nextMsgSenderId === msgSenderId;

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
 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm mb-1 overflow-hidden" title={msgSenderName}>
 {(() => {
   const sender = directoryData?.find(c => c.id === msgSenderId);
   if (sender?.avatarUrl) {
     return <img src={sender.avatarUrl} alt="Profile" className="w-full h-full object-cover" />;
   }
   return msgSenderName?.charAt(0) || 'U';
 })()}
 </div>
 )}
 </div>
 )}
 
 <div className="flex flex-col">
 {showAvatar && isGroup && !isMe && (
 <span className="text-[10px] text-slate-500 dark:text-zinc-400 ml-1 mb-1 font-medium">{msgSenderName}</span>
 )}
 <div className={`p-3.5 md:p-4 shadow-sm backdrop-blur-sm
 ${isMe 
 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg rounded-br-sm border border-emerald-400/20' 
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
 <a href={m.file_url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-3 rounded-xl mb-2 transition-colors ${isMe ? 'bg-black/10 hover:bg-black/20 text-white' : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-100'}`}>
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
 <span className={`text-[11px] font-medium mt-1.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'justify-end text-emerald-600/70 dark:text-emerald-400/70' : 'justify-start text-slate-400 dark:text-zinc-500'}`}>
 {getRelativeTime(m.timestamp)}
 {isMe && <span className="w-3 h-3 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center"><ChevronRight size={8} className="text-emerald-600 dark:text-emerald-400"/></span>}
 </span>
 </div>
 </motion.div>
 </React.Fragment>
 );
 })}
 
 {isTyping && activeChat.type === 'direct' && (
 <div className="flex justify-start">
 <div className="w-10"></div>
 <div className="bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700/50 p-4 rounded-lg rounded-tl-sm shadow-sm flex items-center gap-1.5">
 <span className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
 <span className="w-1.5 h-1.5 bg-emerald-500/70 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
 <span className="w-1.5 h-1.5 bg-emerald-500/90 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
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
 <label className="cursor-pointer text-slate-400 dark:text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 h-12 w-12 rounded-full flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-zinc-700 shrink-0">
 <Paperclip size={20} />
 <input type="file" className="hidden" onChange={handleFileUpload} />
 </label>
 
 <div className="flex-1 relative">
 <input 
 type="text" 
 value={text} 
 onChange={handleTyping} 
 className="w-full border border-slate-200 dark:border-zinc-700 rounded-full pl-5 pr-14 py-3.5 bg-slate-50 dark:bg-zinc-900/80 text-slate-900 dark:text-zinc-100 outline-none focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-600/50 text-[15px] transition-all shadow-inner" 
 placeholder="Message..."
 />
 <button 
 type="submit" 
 disabled={!text.trim() && !file && !imageBase64} 
 className="absolute right-1.5 top-1.5 bottom-1.5 w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-600 flex items-center justify-center text-white disabled:opacity-40 disabled:grayscale transition-all shadow-sm outline-none shrink-0 hover:shadow-emerald-500/25 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
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

 <AnimatePresence>
 {isCreatingGroup && (
 <motion.div 
 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
 className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
 >
 <motion.div 
 initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
 className="bg-white dark:bg-zinc-900 rounded-xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-zinc-800"
 >
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100">New Group Chat</h3>
 <button onClick={() => setIsCreatingGroup(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
 <X size={20} />
 </button>
 </div>

 <div className="space-y-4 mb-6">
 <div>
 <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Group Name</label>
 <input 
 type="text" 
 value={newGroupName}
 onChange={(e) => setNewGroupName(e.target.value)}
 placeholder="E.g. Math Study Group"
 className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500/50 outline-none"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Select Members</label>
 <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
 {[...counselors, ...friends].map(person => {
 const isSelected = selectedMembers.includes(person.id);
 return (
 <div 
 key={person.id}
 onClick={() => {
 if (isSelected) {
 setSelectedMembers(selectedMembers.filter(id => id !== person.id));
 } else {
 setSelectedMembers([...selectedMembers, person.id]);
 }
 }}
 className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors border ${isSelected ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-zinc-800/50 border-transparent hover:border-slate-200 dark:hover:border-zinc-700'}`}
 >
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-slate-600 dark:text-zinc-300 text-xs">
 {person.name.charAt(0)}
 </div>
 <span className="text-sm font-medium text-slate-800 dark:text-zinc-200">{person.name}</span>
 </div>
 {isSelected && <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center"><Check size={12} /></div>}
 </div>
 )
 })}
 </div>
 </div>
 </div>

 <div className="flex justify-end gap-3">
 <button 
 onClick={() => setIsCreatingGroup(false)}
 className="px-4 py-2 text-slate-600 dark:text-zinc-400 font-medium hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
 >
 Cancel
 </button>
 <button 
 onClick={handleCreateGroup}
 disabled={!newGroupName.trim() || selectedMembers.length === 0 || createGroup.isPending}
 className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-colors flex items-center gap-2"
 >
 {createGroup.isPending && <Loader2 size={16} className="animate-spin" />}
 Create Group
 </button>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 </motion.div>
 );
}
