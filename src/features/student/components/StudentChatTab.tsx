// File: src/features/student/components/StudentChatTab.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getRelativeTime } from '../../../utils/time';
import { ChevronRight, ImagePlus, Send, X, MessageSquare } from 'lucide-react';
import { getAllUsers, fetchMessagesByStudent, sendChatMessage } from '../../../services/localEngine';
import { useDatabaseEvent } from '../../../hooks/useDatabaseEvent';

export default function StudentChatTab({ user, requests }) {
  const [text, setText] = useState('');
  const [imageBase64, setImageBase64] = useState(null);
  const [messages, setMessages] = useState([]);
  const chatEndRef = React.useRef<HTMLDivElement | null>(null);
  
  const loadMessages = React.useCallback(() => {
    setMessages(fetchMessagesByStudent(user.id));
  }, [user.id]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useDatabaseEvent('db_updated', loadMessages);

  const counselors = getAllUsers().filter(u => u.role === 'counselor');
  
  const assignedRequest = requests.find(r => r.assignedTo);
  const [activeCounselorId, setActiveCounselorId] = useState(assignedRequest?.assignedTo || counselors[0]?.id || null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleSend = (e) => {
    e.preventDefault();
    if ((!text.trim() && !imageBase64) || !activeCounselorId) return;
    sendChatMessage(user.id, activeCounselorId, user.id, text, imageBase64 || undefined);
    setText('');
    setImageBase64(null);
  };

  const activeMessages = messages.filter(m => m.counselorId === activeCounselorId)
    .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [activeCounselorId, activeMessages.length]);

  return (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="max-w-none w-full h-full flex-1 flex md:gap-8 relative drop-shadow-xl overflow-hidden rounded-3xl md:border md:border-slate-200/40 dark:md:border-zinc-800/40">
      <div className={`w-full md:w-1/3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200/60 dark:border-zinc-800/60 md:rounded-3xl shadow-sm overflow-hidden flex-col transition-all duration-300 ${activeCounselorId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-5 border-b border-slate-200/50 dark:border-zinc-800/50 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-zinc-800/20">
          <h3 className="font-bold tracking-tight text-xl text-slate-900 dark:text-zinc-100 mb-1">Messages</h3>
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Secure end-to-end encryption</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {counselors.map(c => (
            <div 
              key={c.id} 
              onClick={() => setActiveCounselorId(c.id)}
              className={`p-3 rounded-2xl cursor-pointer transition-all duration-300 flex items-center gap-4 group
                ${activeCounselorId === c.id 
                  ? 'bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200/50 dark:border-emerald-800/50 shadow-sm ring-1 ring-emerald-500/20' 
                  : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50 border border-transparent text-slate-700 dark:text-zinc-300'}`}
            >
              <div className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-all duration-300 ${activeCounselorId === c.id ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/30' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 group-hover:scale-105'}`}>
                {c.name.charAt(0)}
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 ${activeCounselorId === c.id ? 'bg-emerald-400' : 'bg-emerald-400'}`}></span>
              </div>
              <div className="flex-1 overflow-hidden">
                <span className={`block truncate font-bold text-sm transition-colors ${activeCounselorId === c.id ? 'text-emerald-900 dark:text-emerald-100' : 'text-slate-800 dark:text-zinc-200'}`}>{c.name}</span>
                <span className="text-xs block font-medium mt-0.5 text-slate-500 dark:text-zinc-500">Active now</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`w-full md:w-2/3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200/60 dark:border-zinc-800/60 md:rounded-3xl shadow-sm overflow-hidden flex-col transition-all duration-300 relative ${!activeCounselorId ? 'hidden md:flex' : 'flex'}`}>
        {!activeCounselorId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 text-sm p-8 text-center bg-slate-50/50 dark:bg-zinc-900/50">
            <div className="w-20 h-20 mb-6 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-inner">
              <MessageSquare size={32} className="text-emerald-500/50" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-zinc-300 mb-2">Your Conversations</h3>
            <p className="max-w-xs">Select a counselor from the sidebar to begin a secure messaging session.</p>
          </div>
        ) : (
          <>
            <div className="p-4 md:px-6 md:py-5 border-b border-slate-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm flex items-center gap-4 z-10">
              <button onClick={() => setActiveCounselorId(null)} className="md:hidden p-2 -ml-2 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                <ChevronRight className="rotate-180" size={20} />
              </button>
              <div className="relative w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm shadow-emerald-500/30">
                {counselors.find(c => c.id === activeCounselorId)?.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm md:text-base tracking-tight">{counselors.find(c => c.id === activeCounselorId)?.name}</h3>
                <span className="text-[11px] md:text-xs text-emerald-600 dark:text-emerald-500 font-semibold tracking-wider uppercase">Secure Session</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-gradient-to-b from-slate-50/30 to-slate-100/50 dark:from-zinc-900/30 dark:to-zinc-950/50 flex flex-col scroll-smooth">
              {activeMessages.length === 0 && <div className="text-center text-sm font-medium text-slate-400 dark:text-zinc-500 my-auto bg-white/60 dark:bg-zinc-800/60 p-4 rounded-2xl mx-auto backdrop-blur-sm border border-slate-100 dark:border-zinc-700/50 shadow-sm">This is the beginning of your secure conversation.</div>}
              {activeMessages.map((m, i) => {
                const isMe = m.senderId === user.id;
                const showAvatar = !isMe && (i === 0 || activeMessages[i-1].senderId !== m.senderId);
                return (
                  <div key={m.id} className={`flex max-w-[85%] md:max-w-[75%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'} gap-2 group`}>
                    {!isMe && (
                      <div className="w-8 shrink-0 flex flex-col justify-end">
                        {showAvatar && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm mb-1">
                            {counselors.find(c => c.id === m.senderId)?.name.charAt(0) || 'C'}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className={`p-3.5 md:p-4 shadow-sm backdrop-blur-sm
                      ${isMe 
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl rounded-br-sm border border-emerald-400/20' 
                        : 'bg-white dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60 text-slate-800 dark:text-zinc-100 rounded-2xl rounded-bl-sm'}
                    `}>
                      {m.imageBase64 && (
                        <div className="relative rounded-xl overflow-hidden mb-2 shadow-inner border border-black/5 dark:border-white/5 bg-black/5">
                          <img src={m.imageBase64} alt="Attachment" className="max-w-full object-cover max-h-64 rounded-xl hover:scale-105 transition-transform duration-500 cursor-zoom-in" />
                        </div>
                      )}
                      
                      {m.text && <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{m.text}</p>}
                      
                      <div className={`text-[10px] mt-1.5 font-medium flex items-center justify-between gap-2 ${isMe ? 'text-emerald-100/80' : 'text-slate-400 dark:text-zinc-500'}`}>
                        <span>{getRelativeTime(m.timestamp)}</span>
                        <span>{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-t border-slate-200/60 dark:border-zinc-800/60 z-10">
               {imageBase64 && (
                 <motion.div initial={{opacity:0, y:10, scale:0.95}} animate={{opacity:1, y:0, scale:1}} className="mb-3 relative inline-block p-1 bg-white dark:bg-zinc-800 rounded-xl rounded-bl-sm shadow-md border border-slate-200 dark:border-zinc-700">
                   <img src={imageBase64} alt="Preview" className="h-20 w-auto object-cover rounded-lg shadow-inner" />
                   <button onClick={() => setImageBase64(null)} type="button" className="absolute -top-2 -right-2 bg-slate-800 dark:bg-zinc-100 text-white dark:text-slate-900 rounded-full p-1 border border-white dark:border-zinc-900 hover:scale-110 transition-transform shadow-sm">
                     <X size={14} strokeWidth={3} />
                   </button>
                 </motion.div>
               )}
               <form onSubmit={handleSend} className="flex gap-2.5 items-end">
                 <label className="cursor-pointer text-slate-400 dark:text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 h-12 w-12 rounded-full flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-zinc-700 shrink-0">
                    <ImagePlus size={20} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                 </label>
                 
                 <div className="flex-1 relative">
                   <input 
                     type="text" 
                     value={text} 
                     onChange={e => setText(e.target.value)} 
                     onFocus={() => {
                        setTimeout(() => {
                          if (chatEndRef.current) {
                            chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
                          }
                        }, 250);
                     }}
                     className="w-full border border-slate-200 dark:border-zinc-700 rounded-full pl-5 pr-14 py-3.5 bg-slate-50 dark:bg-zinc-900/80 text-slate-900 dark:text-zinc-100 outline-none focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-600/50 text-[15px] transition-all shadow-inner" 
                     placeholder="Message..."
                   />
                   <button 
                     type="submit" 
                     disabled={!text.trim() && !imageBase64} 
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
    </motion.div>
  );
}
