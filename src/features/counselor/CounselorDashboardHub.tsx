import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { MessageSquare, MessageCircle, Settings, KanbanSquare, CalendarDays, Compass, Users, ArrowRight, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useDatabaseEvent } from '../../hooks/useDatabaseEvent';
import Navbar from '../../components/layout/Navbar';
import { useAppointments, useTransfers } from '../../hooks/queries';
import { useDirectory } from '../../hooks/useSocial';

const CounselorSettingsTab = lazy(() => import('./CounselorSettingsTab'));
const CounselorAvailabilityTab = lazy(() => import('./CounselorAvailabilityTab'));
const FeedbackTab = lazy(() => import('../shared/FeedbackTab'));
const MyProfilesTab = lazy(() => import('../shared/MyProfilesTab'));
const CaseDetailSidebar = lazy(() => import('./CaseDetailSidebar'));
const CounselorStudentManagementTab = lazy(() => import('./CounselorStudentManagementTab'));
const KanbanWorkspace = lazy(() => import('./KanbanWorkspace'));
const CounselorChatTab = lazy(() => import('./CounselorChatTab'));
const CounselorArchiveSearchTab = lazy(() => import('./CounselorArchiveSearchTab'));

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
    const apps = (appointmentsData?.data || []).map(a => ({ ...a, studentName: a.studentName || userNameMap.get(a.studentId) || 'Unknown Student' }));
    const trans = (transfersData?.data || []).map(t => ({ ...t, studentName: t.studentName || userNameMap.get(t.studentId) || 'Unknown Student' }));
    return [...apps, ...trans].sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  }, [appointmentsData, transfersData, userNameMap]);

  const [activeTab, setActiveTab] = useState('workspace');
  const [selectedCase, setSelectedCase] = useState(null);
  const [chatStudentId, setChatStudentId] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  if (!user) return null;

  const tabs = [
    { id: 'workspace', label: 'Triage', icon: KanbanSquare },
    { id: 'archive', label: 'Archive & Search', icon: Search },
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
            const badgeCount = tab.id === 'workspace' ? requests.filter(r => (!r.assignedTo && r.status === 'pending') || (r.assignedTo === user.id && r.status === 'in-progress')).length : 0;
            
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
            const badgeCount = tab.id === 'workspace' ? requests.filter(r => (!r.assignedTo && r.status === 'pending') || (r.assignedTo === user.id && r.status === 'in-progress')).length : 0;
            
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
              {activeTab === 'archive' && (
                <div key="archive" className="h-full w-full">
                  <CounselorArchiveSearchTab requests={requests} onSelectCase={setSelectedCase} />
                </div>
              )}
              {activeTab === 'students' && (
                <div key="students" className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8">
                  <CounselorStudentManagementTab onStartChat={(studentId) => {
                    setChatStudentId(studentId);
                    setActiveTab('chat');
                  }} />
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
                setChatStudentId(selectedCase.studentId);
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
