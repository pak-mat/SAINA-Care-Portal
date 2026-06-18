// File: src/features/counselor/CounselorDashboardHub.jsx
import React, { useState, useEffect } from 'react';
import { Inbox, MessageSquare, Bug, Settings, KanbanSquare, CalendarDays, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getAllUsers, fetchMessagesByCounselor, sendChatMessage } from '../../services/localEngine';
import { useAuth } from '../../context/AuthContext';
import { useDatabaseEvent } from '../../hooks/useDatabaseEvent';
import Navbar from '../../components/layout/Navbar';
import CounselorSettingsTab from './CounselorSettingsTab';
import CounselorAvailabilityTab from './CounselorAvailabilityTab';
import FeedbackTab from '../shared/FeedbackTab';
import PriorityCard from '../../components/ui/PriorityCard';
import MyProfilesTab from '../shared/MyProfilesTab';
import CaseDetailSidebar from './CaseDetailSidebar';
import { ChevronRight, ImagePlus, Send, X } from 'lucide-react';
import { getRelativeTime } from '../../utils/time';

export default function CounselorDashboardHub() {
  const { user, requests, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('workspace');
  const [selectedCase, setSelectedCase] = useState(null);
  const [chatStudentId, setChatStudentId] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  if (!user) return null;

  const tabs = [
    { id: 'workspace', label: 'Triage Workspace', icon: KanbanSquare },
    { id: 'profiles', label: 'My profiles', icon: Compass },
    { id: 'chat', label: 'Student Chat Hub', icon: MessageSquare },
    { id: 'availability', label: 'Availability', icon: CalendarDays },
    { id: 'feedback', label: 'Feedback', icon: Bug },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="flex flex-col h-full w-full font-sans bg-slate-50/50 dark:bg-black transition-all duration-200 relative overflow-hidden" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Ambient Background Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-blue-400/30 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-40 -right-20 w-[30rem] h-[30rem] bg-indigo-400/20 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-40 left-1/4 w-[40rem] h-[40rem] bg-violet-400/20 rounded-full blur-[150px]"
        />
      </div>

      <div className="relative z-10 flex flex-col h-full w-full">
        <Navbar title="Counselor Workspace">
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border outline-none ${
            isOnline 
              ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-blue-500 animate-[pulse_2s_ease-in-out_infinite]' : 'bg-slate-400'}`} />
          {isOnline ? 'Active' : 'Away'}
        </button>
      </Navbar>

      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative pb-[72px] md:pb-0 z-10">
        <nav className="hidden md:flex bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl border-r border-white/60 dark:border-zinc-800/50 shadow-[4px_0_24px_rgba(59,130,246,0.03)] md:w-64 flex-shrink-0 flex-col overflow-y-auto p-4 gap-1 transition-colors duration-300 relative">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            const badgeCount = tab.id === 'workspace' ? requests.filter(r => (!r.assignedTo && r.status === 'pending') || (r.assignedTo === user.id && r.status === 'in-progress')).length : 0;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium whitespace-nowrap transition-colors outline-none
                  ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/50 hover:text-slate-900 dark:hover:text-zinc-100'}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-counselor-desktop-tab"
                    className="absolute inset-0 bg-blue-50 dark:bg-blue-900/10 rounded-md"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3 w-full">
                  <Icon size={18} className={isActive ? "text-blue-500 dark:text-blue-400" : "text-slate-400 dark:text-zinc-500"} />
                  {tab.label}
                  {badgeCount > 0 && (
                    <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' : 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-400'}`}>
                      {badgeCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
        
        <nav className="flex md:hidden fixed bottom-0 left-0 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-white/60 dark:border-zinc-800/50 overflow-x-auto overflow-y-hidden items-center z-50 py-2 px-2 shadow-[0_-8px_32px_-1px_rgba(59,130,246,0.08)] dark:shadow-none transition-colors duration-300 gap-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            const badgeCount = tab.id === 'workspace' ? requests.filter(r => (!r.assignedTo && r.status === 'pending') || (r.assignedTo === user.id && r.status === 'in-progress')).length : 0;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-shrink-0 flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-xs font-medium transition-colors w-[72px]
                  ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-300'}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-counselor-mobile-tab"
                    className="absolute top-1 bottom-1 left-2 right-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg pointer-events-none"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="relative">
                    <Icon size={20} className={isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-zinc-500"} />
                    {badgeCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-blue-500 dark:bg-blue-600 text-white w-3 h-3 rounded-full border border-white dark:border-zinc-900 shadow-sm"></span>
                    )}
                  </div>
                  <span className="text-[9px] text-center leading-tight whitespace-break-spaces">{tab.label.split(' ')[0]}</span>
                </div>
              </button>
            );
          })}
        </nav>
        
        {/* Mobile Navigation Gradient Mask */}
        <div className="md:hidden fixed bottom-0 right-0 h-[64px] w-12 bg-gradient-to-l from-white dark:from-zinc-900 to-transparent z-[60] pointer-events-none" />

        <main className="flex-1 overflow-hidden min-h-0 bg-transparent flex flex-col relative w-full">
          <AnimatePresence mode="wait">
            {activeTab === 'workspace' && <KanbanWorkspace key="workspace" requests={requests} user={user} onSelectCase={setSelectedCase} />}
            {activeTab === 'profiles' && (
              <div key="profiles" className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8">
                <MyProfilesTab onTabChange={setActiveTab} />
              </div>
            )}
            {activeTab === 'chat' && <CounselorChatTab key="chat" user={user} defaultStudentId={chatStudentId} />}
            {activeTab === 'feedback' && (
              <div key="feedback" className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8">
                <FeedbackTab />
              </div>
            )}
            {activeTab === 'availability' && (
              <div key="availability" className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8">
                <CounselorAvailabilityTab />
              </div>
            )}
            {activeTab === 'settings' && (
              <div key="settings" className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8">
                <CounselorSettingsTab />
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {selectedCase && (
          <CaseDetailSidebar 
            request={selectedCase} 
            onClose={() => setSelectedCase(null)} 
            user={user} 
            onStartChat={() => {
              setChatStudentId(selectedCase.studentId);
              setActiveTab('chat');
              setSelectedCase(null);
            }}
          />
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

function KanbanWorkspace({ requests, user, onSelectCase }) {
  const pool = requests.filter(r => r.status === 'pending' && !r.assignedTo);
  const active = requests.filter(r => r.status === 'in-progress' && r.assignedTo === user.id);
  const awaiting = requests.filter(r => r.status === 'pending' && r.assignedTo === user.id);
  const archived = requests.filter(r => ['approved', 'rejected'].includes(r.status));

  const columns = [
    { title: 'Triage Pool', count: pool.length, items: pool },
    { title: 'Active Processing', count: active.length, items: active },
    { title: 'Awaiting Response', count: awaiting.length, items: awaiting },
    { title: 'Archived Cases', count: archived.length, items: archived }
  ];

  return (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="h-full flex flex-col p-4 sm:p-6 overflow-hidden">
      <div className="mb-4 shrink-0">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">Kanban Pipeline</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 font-medium">Manage student cases through dynamic routing states.</p>
      </div>
      
      <div className="flex-1 flex overflow-x-auto gap-4 md:gap-6 pb-2 scroll-smooth">
        {columns.map(col => (
          <div key={col.title} className="w-80 min-w-[320px] flex flex-col max-h-full">
            <div className="flex items-center gap-2 mb-3 px-1 pt-1 shrink-0">
              <h3 className="font-bold text-sm text-slate-700 dark:text-zinc-300 uppercase tracking-wider">{col.title}</h3>
              <span className="bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">{col.count}</span>
            </div>
            
            <div className="flex-1 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-white/60 dark:border-zinc-800/50 rounded-2xl p-3 overflow-y-auto space-y-3 shadow-[inset_0_2px_12px_rgba(0,0,0,0.02)]">
              {col.items.length === 0 ? (
                <div className="text-center text-xs font-medium text-slate-400 dark:text-zinc-600 mt-6 select-none bg-white/50 dark:bg-zinc-800/50 p-4 rounded-lg border border-dashed border-slate-200 dark:border-zinc-700">Drop Zone Empty</div>
              ) : (
                col.items.map(req => (
                  <PriorityCard key={req.id} request={req} onClick={() => onSelectCase(req)} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function CounselorChatTab({ user, defaultStudentId }) {
  const [activeStudentId, setActiveStudentId] = useState(defaultStudentId || null);
  const [text, setText] = useState('');
  const [imageBase64, setImageBase64] = useState(null);
  const [messages, setMessages] = useState([]);
  const chatEndRef = React.useRef(null);
  
  const loadMessages = React.useCallback(() => {
    setMessages(fetchMessagesByCounselor(user.id));
  }, [user.id]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useDatabaseEvent('db_updated', loadMessages);
  
  const allUsers = getAllUsers().filter(u => u.role === 'student');

  const distinctStudentIds = Array.from(new Set(messages.map(m => m.studentId)));
  const studentsToDisplay = allUsers.filter(u => distinctStudentIds.includes(u.id));
  
  if (activeStudentId && !studentsToDisplay.find(s => s.id === activeStudentId)) {
    const actS = allUsers.find(s => s.id === activeStudentId);
    if (actS) studentsToDisplay.push(actS);
  }

  const sidebarStudents = studentsToDisplay.length > 0 ? studentsToDisplay : allUsers;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageBase64(reader.result);
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleSend = (e) => {
    e.preventDefault();
    if ((!text.trim() && !imageBase64) || !activeStudentId) return;
    sendChatMessage(activeStudentId, user.id, user.id, text, imageBase64 || undefined);
    setText('');
    setImageBase64(null);
  };

  const activeMessages = messages.filter(m => m.studentId === activeStudentId).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [activeStudentId, activeMessages.length]);

  return (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="w-full h-full flex-1 min-h-0 max-w-none flex flex-col md:flex-row md:gap-8 relative drop-shadow-xl p-4 sm:p-6 lg:p-8">
      <div className={`w-full md:w-1/3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200/60 dark:border-zinc-800/60 md:rounded-3xl shadow-sm overflow-hidden flex-col transition-all duration-300 ${activeStudentId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-5 border-b border-slate-200/50 dark:border-zinc-800/50 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-zinc-800/20">
          <h3 className="font-bold tracking-tight text-xl text-slate-900 dark:text-zinc-100 mb-1">Active Channels</h3>
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Manage student communications</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {sidebarStudents.map(s => (
            <motion.div 
              whileHover={{ scale: 1.01, backgroundColor: activeStudentId !== s.id ? 'rgba(241, 245, 249, 0.8)' : undefined }}
              key={s.id} 
              onClick={() => setActiveStudentId(s.id)}
              className={`p-3 rounded-2xl cursor-pointer transition-all duration-300 flex items-center gap-4 group
                ${activeStudentId === s.id 
                  ? 'bg-slate-900 dark:bg-zinc-800 border border-slate-800 dark:border-zinc-700 shadow-md ring-1 ring-slate-900/10' 
                  : 'border border-transparent text-slate-700 dark:text-zinc-300'}`}
            >
              <div className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-all duration-300 ${activeStudentId === s.id ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-slate-900/30' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 group-hover:scale-105'}`}>
                {s.name.charAt(0)}
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 ${activeStudentId === s.id ? 'bg-blue-400' : 'bg-slate-300 dark:bg-zinc-600'}`}></span>
              </div>
              <div className="flex-1 overflow-hidden">
                <span className={`block truncate font-bold text-sm transition-colors ${activeStudentId === s.id ? 'text-white' : 'text-slate-800 dark:text-zinc-200'}`}>{s.name}</span>
                <span className={`text-xs block font-medium mt-0.5 ${activeStudentId === s.id ? 'text-slate-400' : 'text-slate-500 dark:text-zinc-500'}`}>{s.studentId}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className={`w-full md:w-2/3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200/60 dark:border-zinc-800/60 md:rounded-3xl shadow-sm overflow-hidden flex-col transition-all duration-300 relative ${!activeStudentId ? 'hidden md:flex' : 'flex'}`}>
        {!activeStudentId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 text-sm p-8 text-center bg-slate-50/50 dark:bg-zinc-900/50">
            <div className="w-20 h-20 mb-6 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-inner relative overflow-hidden">
              <MessageSquare size={32} className="text-slate-400/50" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-zinc-300 mb-2">Student Channels</h3>
            <p className="max-w-xs">Select a student from the sidebar to view or reply to their secure messages.</p>
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
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-gradient-to-b from-slate-50/30 to-slate-100/50 dark:from-zinc-900/30 dark:to-zinc-950/50 flex flex-col scroll-smooth">
              {activeMessages.length === 0 && <div className="text-center text-sm font-medium text-slate-400 dark:text-zinc-500 my-auto bg-white/60 dark:bg-zinc-800/60 p-4 rounded-2xl mx-auto backdrop-blur-sm border border-slate-100 dark:border-zinc-700/50 shadow-sm">No messages in this channel yet.</div>}
              {activeMessages.map((m, i) => {
                const isMe = m.senderId === user.id;
                const showAvatar = !isMe && (i === 0 || activeMessages[i-1].senderId !== m.senderId);
                return (
                  <div key={m.id} className={`flex max-w-[85%] md:max-w-[75%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'} gap-2 group`}>
                    {!isMe && (
                      <div className="w-8 shrink-0 flex flex-col justify-end">
                        {showAvatar && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm mb-1">
                            {sidebarStudents.find(s=>s.id===m.senderId)?.name.charAt(0) || 'S'}
                          </div>
                        )}
                      </div>
                    )}

                    <div className={`p-3.5 md:p-4 shadow-sm backdrop-blur-sm
                      ${isMe 
                        ? 'bg-gradient-to-br from-slate-800 to-slate-900 dark:from-zinc-700 dark:to-zinc-800 text-white rounded-2xl rounded-br-sm border border-slate-700/50' 
                        : 'bg-white dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60 text-slate-800 dark:text-zinc-100 rounded-2xl rounded-bl-sm'}
                    `}>
                      {m.imageBase64 && (
                        <div className="relative rounded-xl overflow-hidden mb-2 shadow-inner border border-black/5 dark:border-white/5 bg-black/5">
                          <img src={m.imageBase64} alt="Attachment" className="max-w-full object-cover max-h-64 rounded-xl hover:scale-105 transition-transform duration-500 cursor-zoom-in" />
                        </div>
                      )}
                      
                      {m.text && <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{m.text}</p>}
                      
                      <div className={`text-[10px] mt-1.5 font-medium flex items-center justify-between gap-2 ${isMe ? 'text-slate-300/80' : 'text-slate-400 dark:text-zinc-500'}`}>
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
                 <label className="cursor-pointer text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 h-12 w-12 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-700 shrink-0">
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
                     className="w-full border border-slate-200 dark:border-zinc-700 rounded-full pl-5 pr-14 py-3.5 bg-slate-50 dark:bg-zinc-900/80 focus:bg-white dark:focus:bg-zinc-800 text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-slate-900/50 dark:focus:ring-zinc-600/50 text-[15px] transition-all shadow-inner" 
                     placeholder="Type reply to student..."
                   />
                   <button 
                     type="submit" 
                     disabled={!text.trim() && !imageBase64} 
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
    </motion.div>
  );
}

