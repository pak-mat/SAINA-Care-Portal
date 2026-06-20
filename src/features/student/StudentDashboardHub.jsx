// File: src/features/student/StudentDashboardHub.jsx
import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Home, History, CalendarPlus, FileInput, MessageSquare, Settings, BookOpen, Bug, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { markNotificationsAsRead, fetchNotifications } from '../../services/localEngine';
import Navbar from '../../components/layout/Navbar';

const AppointmentForm = lazy(() => import('./components/AppointmentForm'));
const PermissionForm = lazy(() => import('./components/PermissionForm'));
const RequestHistoryHub = lazy(() => import('./components/RequestHistoryHub'));
const StudentChatTab = lazy(() => import('./components/StudentChatTab'));
const SettingsTab = lazy(() => import('./SettingsTab'));
const ResourceVault = lazy(() => import('./ResourceVault'));
import FeedbackTab from '../shared/FeedbackTab';
import AppointmentNotification from '../../components/ui/AppointmentNotification';
import MyProfilesTab from '../shared/MyProfilesTab';

export default function StudentDashboardHub() {
  const { user, requests, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [notifications, setNotifications] = useState([]);

  // Unified Context Notifications
  useEffect(() => {
    if (user?.id) {
      setNotifications(fetchNotifications(user.id));
    }
  }, [user?.id, requests]);

  const notificationsOn = user?.preferences?.notificationsEnabled ?? true;
  const unreadNotificationsCount = useMemo(() => {
    return notificationsOn ? notifications.filter(n => !n.read).length : 0;
  }, [notifications, notificationsOn]);

  if (!user) return null;

  const studentRequests = useMemo(() => requests.filter(r => r.studentId === user.id), [requests, user.id]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'home' && unreadNotificationsCount > 0) {
      markNotificationsAsRead(user.id);
      setNotifications(fetchNotifications(user.id));
    }
  };

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'profiles', label: 'My profiles', icon: Compass },
    { id: 'history', label: 'History', icon: History },
    { id: 'appointment', label: 'Appointment', icon: CalendarPlus },
    { id: 'transfer', label: 'Transfer', icon: FileInput },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'resources', label: 'Vault', icon: BookOpen },
    { id: 'feedback', label: 'Feedback', icon: Bug },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="flex flex-col h-full w-full font-sans bg-slate-50/50 dark:bg-black transition-all duration-200 relative overflow-hidden" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Ambient Background Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-400/30 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-40 -right-20 w-[30rem] h-[30rem] bg-teal-400/20 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-40 left-1/4 w-[40rem] h-[40rem] bg-lime-300/20 rounded-full blur-[150px]"
        />
      </div>

      <div className="relative z-10 flex flex-col h-full w-full">
        <AppointmentNotification />
      <Navbar title="Saina Care Portal" />

      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative pb-[72px] md:pb-0 z-10">
        <nav className="hidden md:flex bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl border-r border-white/60 dark:border-zinc-800/50 shadow-[4px_0_24px_rgba(16,185,129,0.03)] md:w-64 flex-shrink-0 flex-col overflow-y-auto p-4 gap-1 transition-colors duration-300 relative">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            const badgeCount = tab.id === 'home' ? unreadNotificationsCount : 0;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium whitespace-nowrap transition-colors outline-none
                  ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 hover:bg-slate-50/50 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/50'}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-desktop-tab"
                    className="absolute inset-0 bg-emerald-50 dark:bg-emerald-900/30 rounded-md"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3 w-full">
                  <Icon size={18} className={isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-500"} />
                  {tab.label}
                  {badgeCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      {badgeCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
        
        <nav className="flex md:hidden fixed bottom-0 left-0 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-white/60 dark:border-zinc-800/50 overflow-x-auto overflow-y-hidden items-center z-50 py-2 px-2 shadow-[0_-8px_32px_-1px_rgba(16,185,129,0.08)] dark:shadow-none transition-colors duration-300 gap-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            const badgeCount = tab.id === 'home' ? unreadNotificationsCount : 0;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative flex-shrink-0 flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-xs font-medium transition-colors min-h-[48px] min-w-[48px] w-[72px]
                  ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-mobile-tab"
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

        {/* Mobile Navigation Gradient Mask */}
        <div className="md:hidden fixed bottom-0 right-0 h-[64px] w-12 bg-gradient-to-l from-white dark:from-zinc-800 to-transparent z-[60] pointer-events-none" />

        <main className={`flex-1 min-h-0 ${(activeTab === 'chat' || activeTab === 'profiles') ? 'overflow-hidden p-0 sm:p-2 md:p-3' : 'overflow-y-auto p-4 sm:p-6 lg:p-8'} bg-transparent flex flex-col`}>
          <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>}>
            <AnimatePresence mode="wait">
              {activeTab === 'home' && <HomeTab key="home" user={user} requests={studentRequests} notifications={notifications} />}
              {activeTab === 'profiles' && <MyProfilesTab key="profiles" onTabChange={handleTabChange} />}
              {activeTab === 'history' && <RequestHistoryHub key="history" requests={studentRequests} />}
              {activeTab === 'appointment' && <AppointmentForm key="appointment" onDone={() => setActiveTab('history')} user={user} />}
              {activeTab === 'transfer' && <PermissionForm key="transfer" onDone={() => setActiveTab('history')} user={user} />}
              {activeTab === 'chat' && <StudentChatTab key="chat" user={user} requests={studentRequests} />}
              {activeTab === 'resources' && <ResourceVault key="resources" />}
              {activeTab === 'feedback' && <FeedbackTab key="feedback" />}
              {activeTab === 'settings' && <SettingsTab key="settings" />}
            </AnimatePresence>
          </Suspense>
        </main>
      </div>
      </div>
    </div>
  );
}


function HomeTab({ user, requests, notifications }) {
  const recentRequests = useMemo(() => {
    return requests.slice().reverse().slice(0, 3);
  }, [requests]);

  const pendingCount = useMemo(() => {
    return requests.filter(r => r.status === 'pending').length;
  }, [requests]);

  const notificationsOn = user?.preferences?.notificationsEnabled ?? true;

  return (
    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} transition={{ duration: 0.4, ease: "easeOut" }} className="w-full">
      <div className="flex flex-col space-y-6">
        
        {/* Hero Section */}
        <motion.div 
          whileHover={{ scale: 1.005, y: -2 }}
          className="bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 dark:from-emerald-950 dark:via-black dark:to-teal-950 rounded-[2rem] p-8 lg:p-12 text-white shadow-2xl overflow-hidden relative border border-emerald-800/30 transition-all duration-500 hover:shadow-emerald-900/40"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500 opacity-10 rounded-full blur-2xl transform -translate-x-1/4 translate-y-1/4"></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div>
              <h2 className="text-4xl font-bold mb-3 tracking-tight">Welcome back, {user.name.split(' ')[0]}</h2>
              <p className="text-emerald-100/80 text-lg max-w-xl">
                Manage your requests and counseling sessions efficiently.
              </p>
            </div>
            
            <div className="flex gap-4">
              <motion.div whileHover={{ y: -5, scale: 1.05 }} className="bg-white/5 rounded-xl p-6 backdrop-blur-md border border-white/10 w-32 flex flex-col items-center justify-center text-center cursor-default transition-all shadow-xl hover:shadow-emerald-900/20">
                <div className="text-4xl font-black text-white">{requests.length}</div>
                <div className="text-xs text-emerald-200 font-semibold uppercase tracking-wider mt-2">Total Req</div>
              </motion.div>
              <motion.div whileHover={{ y: -5, scale: 1.05 }} className="bg-white/5 rounded-xl p-6 backdrop-blur-md border border-white/10 w-32 flex flex-col items-center justify-center text-center cursor-default transition-all shadow-xl hover:shadow-emerald-900/20">
                 <div className="text-4xl font-black text-emerald-400">{pendingCount}</div>
                 <div className="text-xs text-emerald-200 font-semibold uppercase tracking-wider mt-2">Pending</div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Bento Layout Below Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
            className="lg:col-span-2 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-[2rem] border border-white/80 dark:border-zinc-800/50 p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(16,185,129,0.05)] transition-all hover:shadow-[0_8px_32px_0_rgba(16,185,129,0.1)]"
          >
            <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-100 mb-6 flex items-center gap-2">
              <Bug className="text-slate-400" size={20} />
              Recent Activity
            </h3>
            
            <div className="space-y-4">
              {recentRequests.length === 0 ? (
                <div className="text-sm text-slate-500 dark:text-zinc-400 py-12 text-center bg-slate-50 dark:bg-zinc-900/50 rounded-lg border border-dashed border-slate-200 dark:border-zinc-700">
                  No requests active. Need help? Try booking a counseling appointment.
                </div>
              ) : (
                recentRequests.map((req, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + (idx * 0.1) }}
                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(241, 245, 249, 0.8)' }} // slate-100ish
                    key={req.id} 
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-700/50 cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-zinc-100 capitalize">{req.type}</span>
                      <span className="text-xs text-slate-500 dark:text-zinc-400">{new Date(req.submissionDate).toLocaleDateString()}</span>
                      {req.scheduledAt && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase mt-0.5">Scheduled: {new Date(req.scheduledAt).toLocaleDateString()}</span>}
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full border font-bold capitalize ${
                      req.status?.toLowerCase() === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50' : 
                      req.status?.toLowerCase() === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50' :
                      req.status?.toLowerCase() === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50' :
                      req.status?.toLowerCase() === 'rejected' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50' :
                      'bg-slate-50 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                    }`}>
                      {req.status}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
            className="lg:col-span-1 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-[2rem] border border-white/80 dark:border-zinc-800/50 p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(16,185,129,0.05)] flex flex-col h-full transition-all hover:shadow-[0_8px_32px_0_rgba(16,185,129,0.1)]"
          >
            <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-100 mb-6">Notifications</h3>
            
            <div className="space-y-4 flex-1">
              {!notificationsOn ? (
                 <div className="h-full min-h-[200px] flex items-center justify-center bg-slate-50 dark:bg-zinc-900/50 rounded-lg border border-dashed border-slate-200 dark:border-zinc-700 p-8 text-center text-slate-500 dark:text-zinc-400 text-sm">
                   Notifications are paused. You can re-enable them in Settings.
                 </div>
              ) : notifications.length === 0 ? (
                <div className="h-full min-h-[200px] flex items-center justify-center bg-slate-50 dark:bg-zinc-900/50 rounded-lg border border-dashed border-slate-200 dark:border-zinc-700 p-8 text-center text-slate-500 dark:text-zinc-400 text-sm">
                  You have no new notifications.
                </div>
              ) : (
                notifications.slice(0, 5).map((n, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 + (idx * 0.08) }}
                    whileHover={{ scale: 1.02 }}
                    key={n.id} 
                    className="bg-slate-50 dark:bg-zinc-900/50 rounded-lg border border-slate-100 dark:border-zinc-700/50 p-4 shadow-sm flex items-start gap-3 cursor-pointer"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-slate-800 dark:text-zinc-200 text-sm font-medium leading-snug">{n.message}</p>
                      <p className="text-xs font-mono text-slate-400 dark:text-zinc-500 mt-1">{new Date(n.date).toLocaleString([], {hour: '2-digit', minute:'2-digit', month:'short', day:'numeric'})}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
}

