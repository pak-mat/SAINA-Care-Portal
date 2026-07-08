// @ts-nocheck
// File: src/features/counselor/CounselorDashboardHub.jsx
import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Inbox, MessageSquare, MessageCircle, Settings, KanbanSquare, CalendarDays, Compass, Users, InboxIcon, Loader2, ArrowRight, FileDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useDatabaseEvent } from '../../hooks/useDatabaseEvent';
import Navbar from '../../components/layout/Navbar';

const CounselorSettingsTab = lazy(() => import('./CounselorSettingsTab'));
const CounselorAvailabilityTab = lazy(() => import('./CounselorAvailabilityTab'));
const FeedbackTab = lazy(() => import('../shared/FeedbackTab'));
const MyProfilesTab = lazy(() => import('../shared/MyProfilesTab'));
const CaseDetailSidebar = lazy(() => import('./CaseDetailSidebar'));
const CounselorStudentManagementTab = lazy(() => import('./CounselorStudentManagementTab'));
import PriorityCard from '../../components/ui/PriorityCard';
import { ChevronRight, ImagePlus, Send, X } from 'lucide-react';
import { getRelativeTime } from '../../utils/time';
import { useAppointments, useTransfers } from '../../hooks/queries';
import { useDirectMessages, useCounselorConversations } from '../../hooks/useGroupChat';
import { useDirectory, usePresence } from '../../hooks/useSocial';
import { supabase } from '../../lib/supabase';
import { generateAppointmentPDF } from './AppointmentPDFReport';

export default function CounselorDashboardHub() {
  const { user, logout } = useAuth();
  const { data: appointmentsData } = useAppointments(1, 1000);
  const { data: transfersData } = useTransfers(1, 1000);
  const { data: directoryUsers } = useDirectory();
  
  // Build a lookup map for user names
  const userNameMap = useMemo(() => {
    const map = new Map<string, string>();
    (directoryUsers || []).forEach(u => map.set(u.id, u.name));
    return map;
  }, [directoryUsers]);
  
  const requests = useMemo(() => {
    const apps = (appointmentsData?.data || []).map(a => ({ ...a, type: 'Appointment', studentName: userNameMap.get(a.studentid) || 'Unknown Student', submissionDate: a.created_at }));
    const trans = (transfersData?.data || []).map(t => ({ ...t, type: 'Transfer', studentName: userNameMap.get(t.studentid) || 'Unknown Student', submissionDate: t.created_at }));
    return [...apps, ...trans].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [appointmentsData, transfersData, userNameMap]);

  const [activeTab, setActiveTab] = useState('workspace');
  const [selectedCase, setSelectedCase] = useState(null);
  const [chatStudentId, setChatStudentId] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  if (!user) return null;

  const tabs = [
    { id: 'workspace', label: 'Triage', icon: KanbanSquare },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'profiles', label: 'My Profiles', icon: Compass },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'availability', label: 'Availability', icon: CalendarDays },
    { id: 'feedback', label: 'Feedback', icon: MessageCircle },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="flex flex-col h-full w-full bg-transparent transition-all duration-200 relative overflow-hidden">
      {/* Ambient Background Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-400/30 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-40 -right-20 w-[30rem] h-[30rem] bg-teal-400/20 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-40 left-1/4 w-[40rem] h-[40rem] bg-cyan-400/20 rounded-full blur-[150px]"
        />
      </div>

      <div className="relative z-10 flex flex-col h-full w-full">
        <Navbar title="Counselor Workspace">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border outline-none ${
                isOnline 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]' : 'bg-slate-400'}`} />
              <span className="hidden sm:inline">{isOnline ? 'Active' : 'Away'}</span>
            </button>
            <button
              onClick={logout}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              Sign out
            </button>
          </div>
        </Navbar>

      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative pb-[72px] md:pb-0 z-10">
        <nav className="hidden md:flex glass-panel border-y-0 border-l-0 rounded-none md:w-56 flex-shrink-0 flex-col overflow-y-auto p-3 gap-0.5 transition-colors duration-300 relative z-20">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            const badgeCount = tab.id === 'workspace' ? requests.filter(r => (!r.counselorid && r.status === 'pending') || (r.counselorid === user.id && r.status === 'in-progress')).length : 0;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors outline-none
                  ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 hover:text-slate-900 dark:hover:text-zinc-100'}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-counselor-desktop-tab"
                    className="absolute inset-0 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3 w-full">
                  <Icon size={17} className={isActive ? "text-emerald-500 dark:text-emerald-400" : "text-slate-400"} />
                  {tab.label}
                  {badgeCount > 0 && (
                    <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' : 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-400'}`}>
                      {badgeCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          
          <div className="mt-auto pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <ArrowRight size={17} className="rotate-180" />
              Sign Out
            </button>
          </div>
        </nav>
        
        <nav className="flex md:hidden fixed bottom-0 left-0 w-full glass-panel border-b-0 rounded-t-2xl rounded-b-none overflow-x-auto overflow-y-hidden items-center z-50 py-2 pb-safe px-2 shadow-[0_-8px_32px_-1px_rgba(59,130,246,0.08)] dark:shadow-none transition-colors duration-300 gap-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            const badgeCount = tab.id === 'workspace' ? requests.filter(r => (!r.counselorid && r.status === 'pending') || (r.counselorid === user.id && r.status === 'in-progress')).length : 0;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-shrink-0 flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-xs font-medium transition-colors min-h-[48px] min-w-[48px] w-[72px]
                  ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-counselor-mobile-tab"
                    className="absolute top-1 bottom-1 left-2 right-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg pointer-events-none"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="relative">
                    <Icon size={20} className={isActive ? "text-emerald-600" : "text-slate-500"} />
                    {badgeCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white w-3 h-3 rounded-full border border-white dark:border-zinc-800 shadow-sm"></span>
                    )}
                  </div>
                  <span className="text-[9px] text-center leading-tight">{tab.label.split(' ')[0]}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="md:hidden fixed bottom-0 right-0 h-[64px] w-12 bg-gradient-to-l from-white dark:from-zinc-800 to-transparent z-[60] pointer-events-none" />

        <main className={`flex-1 min-h-0 ${(activeTab === 'chat' || activeTab === 'students' || activeTab === 'profiles') ? 'overflow-hidden p-0 sm:p-2 md:p-3' : 'overflow-hidden'} bg-transparent flex flex-col`}>
          <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>}>
            <AnimatePresence mode="wait">
              {activeTab === 'workspace' && <KanbanWorkspace key="workspace" requests={requests} user={user} onSelectCase={setSelectedCase} />}
              {activeTab === 'students' && (
                <div key="students" className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8">
                  <CounselorStudentManagementTab />
                </div>
              )}
              {activeTab === 'profiles' && (
                <div key="profiles" className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8">
                  <MyProfilesTab onTabChange={setActiveTab} />
                </div>
              )}
              {activeTab === 'chat' && <CounselorChatTab key="chat" user={user} defaultStudentId={chatStudentId} requests={requests} />}
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
          </Suspense>
        </main>
      </div>

      <AnimatePresence>
        {selectedCase && (
          <Suspense fallback={<div className="absolute right-0 top-0 bottom-0 w-96 bg-white flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>}>
            <CaseDetailSidebar 
              request={selectedCase} 
              onClose={() => setSelectedCase(null)} 
              user={user} 
              onStartChat={() => {
                setChatStudentId(selectedCase.studentid);
                setActiveTab('chat');
                setSelectedCase(null);
              }}
            />
          </Suspense>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

const EMPTY_STATES = {
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

function ExportPDFButton({ requests, userName }: { requests: any[], userName: string }) {
  const [generating, setGenerating] = React.useState(false);

  const handleExport = async () => {
    setGenerating(true);
    try {
      await generateAppointmentPDF(requests, userName);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
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

function KanbanWorkspace({ requests, user, onSelectCase }) {
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

function CounselorChatTab({ user, defaultStudentId, requests }) {
  const [activeStudentId, setActiveStudentId] = useState(defaultStudentId || null);
  const [text, setText] = useState('');
  const [imageBase64, setImageBase64] = useState(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const chatEndRef = React.useRef(null);
  
  // Use the same real-time hook as StudentChatTab.
  // For the counselor, the student is the "studentid" and the counselor is the "counselorid".
  // useDirectMessages(userId, partnerId) queries where (studentid=userId AND counselorid=partnerId) OR vice versa.
  // The student side calls useDirectMessages(student.id, counselor.id).
  // To match the same rows, the counselor side must call useDirectMessages(activeStudentId, user.id)
  // so the query becomes: (studentid=activeStudentId AND counselorid=user.id) OR (studentid=user.id AND counselorid=activeStudentId).
  const { messages: activeMessages, sendMessage } = useDirectMessages(activeStudentId, user.id);
  
  // Build sidebar student list from the user directory (students who have had any interaction)
  const { data: directoryData } = useDirectory();
  const { isUserOnline } = usePresence();
  
  // Fetch all student IDs this counselor has message history with
  const conversationStudentIds = useCounselorConversations(user?.id);
  
  // Collect unique student IDs from requests
  const studentIdsFromRequests = useMemo(() => {
    const ids = new Set<string>();
    requests.forEach(r => {
      if (r.studentid) ids.add(r.studentid);
    });
    return ids;
  }, [requests]);
  
  // Build sidebar from directory, filtering to students who have submitted requests OR sent a message
  const sidebarStudents = useMemo(() => {
    if (!directoryData) return [];
    
    // Combine IDs from requests and active conversations
    const allRelevantIds = new Set([...studentIdsFromRequests, ...conversationStudentIds]);
    
    return directoryData
      .filter(u => u.role === 'student' && allRelevantIds.has(u.id))
      .map(u => ({ id: u.id, name: u.name, studentid: u.studentid }));
  }, [directoryData, studentIdsFromRequests, conversationStudentIds]);

  // Set default active student when list loads if none selected
  useEffect(() => {
    if (!activeStudentId && sidebarStudents.length > 0) {
      setActiveStudentId(defaultStudentId || sidebarStudents[0].id);
    }
  }, [sidebarStudents.length, activeStudentId, defaultStudentId]);

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
    supabase.from('messages').insert({
      studentid: activeStudentId,
      counselorid: user.id,
      senderid: user.id,
      text: text.trim() || null,
      imagebase64: imageBase64 || null,
    }).then(({ error }) => {
      if (error) console.error('Failed to send message:', error);
    });
    setText('');
    setImageBase64(null);
  };

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
          {sidebarStudents.length === 0 && (
            <div className="text-center text-sm text-slate-400 dark:text-zinc-500 py-10">No student conversations yet.</div>
          )}
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
              <div className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-all duration-300 ${activeStudentId === s.id ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-emerald-900/30' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 group-hover:scale-105'}`}>
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

      <div className={`w-full md:w-2/3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200/60 dark:border-zinc-800/60 md:rounded-3xl shadow-sm overflow-hidden flex-col transition-all duration-300 relative ${!activeStudentId ? 'hidden md:flex' : 'flex'}`}>
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
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-gradient-to-b from-slate-50/30 to-slate-100/50 dark:from-zinc-900/30 dark:to-zinc-950/50 flex flex-col scroll-smooth">
              {activeMessages.length === 0 && <div className="text-center text-sm font-medium text-slate-400 dark:text-zinc-500 my-auto bg-white/60 dark:bg-zinc-800/60 p-4 rounded-2xl mx-auto backdrop-blur-sm border border-slate-100 dark:border-zinc-700/50 shadow-sm">No messages in this channel yet.</div>}
              {activeMessages.map((m, i) => {
                const isMe = m.senderid === user.id;
                const showAvatar = !isMe && (i === 0 || activeMessages[i-1].senderid !== m.senderid);
                return (
                  <div key={m.id} className={`flex max-w-[85%] md:max-w-[75%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'} gap-2 group`}>
                    {!isMe && (
                      <div className="w-8 shrink-0 flex flex-col justify-end">
                        {showAvatar && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-sm mb-1">
                            {sidebarStudents.find(s=>s.id===m.senderid)?.name.charAt(0) || 'S'}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col">
                      <div className={`p-3.5 md:p-4 shadow-sm backdrop-blur-sm
                        ${isMe 
                          ? 'bg-gradient-to-br from-slate-800 to-slate-900 dark:from-zinc-700 dark:to-zinc-800 text-white rounded-2xl rounded-br-sm border border-slate-700/50' 
                          : 'bg-white dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60 text-slate-800 dark:text-zinc-100 rounded-2xl rounded-bl-sm'}
                      `}>
                        {m.imagebase64 && (
                          <div className="relative rounded-xl overflow-hidden mb-2 shadow-inner border border-black/5 dark:border-white/5 bg-black/5">
                            <img 
                              src={m.imagebase64} 
                              alt="Attachment" 
                              onClick={() => setSelectedImage(m.imagebase64)}
                              className="max-w-full object-cover max-h-64 rounded-xl hover:scale-105 transition-transform duration-500 cursor-zoom-in" 
                            />
                          </div>
                        )}
                        
                        {m.text && <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{m.text}</p>}
                      </div>
                      
                      <span className={`text-[10px] mt-1.5 font-medium flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'text-slate-400' : 'text-slate-400 dark:text-zinc-500'}`}>
                        <span>{getRelativeTime(m.timestamp)}</span>
                        <span>{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </span>
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
