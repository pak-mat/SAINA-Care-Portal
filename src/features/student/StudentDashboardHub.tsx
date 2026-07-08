// @ts-nocheck
// File: src/features/student/StudentDashboardHub.jsx
import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Home, History, CalendarPlus, FileInput, MessageSquare, Settings, BookOpen, MessageCircle, Compass, CalendarCheck, ArrowRight, Bell, ChevronRight, Sparkles, Clock, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import { useNavigate } from 'react-router-dom';

const AppointmentForm = lazy(() => import('./components/AppointmentForm'));
const PermissionForm = lazy(() => import('./components/PermissionForm'));
const RequestHistoryHub = lazy(() => import('./components/RequestHistoryHub'));
const StudentChatTab = lazy(() => import('./components/StudentChatTab'));
const SettingsTab = lazy(() => import('./SettingsTab'));
const ResourceVault = lazy(() => import('./ResourceVault'));
import FeedbackTab from '../shared/FeedbackTab';
import AppointmentNotification from '../../components/ui/AppointmentNotification';
import MyProfilesTab from '../shared/MyProfilesTab';
import { useAppointments, useTransfers, useHasCheckedInToday, useSubmitWellnessCheckin } from '../../hooks/queries';

// ─────────────────────────────────────────────
// DAILY WELLNESS CHECK-IN MODAL
// ─────────────────────────────────────────────
function DailyWellnessCheckin({ userId }: { userId: string }) {
  const { data: hasCheckedIn, isLoading } = useHasCheckedInToday(userId);
  const submitCheckin = useSubmitWellnessCheckin();
  const [isOpen, setIsOpen] = useState(false);
  const [mood, setMood] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Show modal if they haven't checked in and it's not loading
    if (hasCheckedIn === false && !isLoading) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [hasCheckedIn, isLoading]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!mood) return;
    submitCheckin.mutate(
      { studentid: userId, mood_score: mood, checkin_notes: notes },
      {
        onSuccess: () => setIsOpen(false)
      }
    );
  };

  const MOODS = [
    { value: 1, emoji: '😫', label: 'Terrible' },
    { value: 2, emoji: '😕', label: 'Not Great' },
    { value: 3, emoji: '😐', label: 'Okay' },
    { value: 4, emoji: '🙂', label: 'Good' },
    { value: 5, emoji: '😁', label: 'Great!' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-slate-100 dark:border-zinc-800"
      >
        <div className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl mx-auto flex items-center justify-center">
            <Sparkles size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Daily Check-in</h2>
            <p className="text-slate-500 dark:text-zinc-400 mt-2 font-medium">How are you feeling today?</p>
          </div>

          <div className="flex justify-between gap-2 px-2">
            {MOODS.map(m => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${mood === m.value ? 'bg-emerald-50 dark:bg-emerald-900/30 scale-110 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-zinc-800 grayscale hover:grayscale-0 opacity-60 hover:opacity-100'}`}
              >
                <span className="text-3xl filter drop-shadow-sm">{m.emoji}</span>
                <span className={`text-[10px] font-bold ${mood === m.value ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>{m.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {mood && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Anything you'd like to share? (Optional)"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white"
                  rows={2}
                />
                <button
                  onClick={handleSubmit}
                  disabled={submitCheckin.isPending}
                  className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitCheckin.isPending ? 'Saving...' : 'Complete Check-in'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// Mock implementations for missing notification functions
const fetchNotifications = (userId) => [];
const markNotificationsAsRead = (userId) => {};

export default function StudentDashboardHub() {
  const { user, logout } = useAuth();
  const { data: appointmentsData } = useAppointments(1, 100, '', user?.id || '');
  const { data: transfersData } = useTransfers(1, 100, '', user?.id || '');
  const appointments = appointmentsData?.data || [];
  const transfers = transfersData?.data || [];

  const [activeTab, setActiveTab] = useState('home');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user?.id) setNotifications(fetchNotifications(user.id));
  }, [user?.id, appointments]);

  const notificationsOn = user?.preferences?.notificationsEnabled ?? true;
  const unreadNotificationsCount = useMemo(() =>
    notificationsOn ? notifications.filter(n => !n.read).length : 0,
  [notifications, notificationsOn]);

  if (!user) return null;

  const studentRequests = useMemo(() => {
    const apps = appointments.map(a => ({
      id: a.id,
      type: 'appointment',
      status: a.status,
      submissionDate: a.created_at,
      reasonCategory: a.topic_category,
      details: a.private_notes,
      choice1: a.scheduled_date ? new Date(a.scheduled_date).toLocaleString() : 'N/A',
      scheduledAt: a.scheduled_date,
      counselorNotes: null,
      resolvedByName: a.users?.name || 'N/A',
      assignedTo: a.counselorid || null
    }));
    
    const trans = transfers.map(t => ({
      id: t.id,
      type: 'permission',
      status: t.status,
      submissionDate: t.created_at,
      targetSchool: t.target_school,
      reason: t.detailed_reason,
      counselorNotes: null,
      assignedTo: t.counselorid || null
    }));
    
    return [...apps, ...trans].sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  }, [appointments, transfers]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'home' && unreadNotificationsCount > 0) {
      markNotificationsAsRead(user.id);
      setNotifications(fetchNotifications(user.id));
    }
  };

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'profiles', label: 'My Profile', icon: Compass },
    { id: 'history', label: 'History', icon: History },
    { id: 'appointment', label: 'Appointment', icon: CalendarPlus },
    { id: 'transfer', label: 'Transfer', icon: FileInput },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'resources', label: 'Vault', icon: BookOpen },
    { id: 'feedback', label: 'Feedback', icon: MessageCircle },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="flex flex-col h-full w-full bg-transparent transition-all duration-200 relative overflow-hidden">
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
        <Navbar title="Saina Care Portal">
          {unreadNotificationsCount > 0 && (
            <button
              onClick={() => handleTabChange('home')}
              className="relative flex items-center gap-1.5 p-2 text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
            >
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-zinc-900" />
            </button>
          )}
          <button
            onClick={logout}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            Sign out
          </button>
        </Navbar>

      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative pb-[72px] md:pb-0 z-10">
        <nav className="hidden md:flex glass-panel border-y-0 border-l-0 rounded-none md:w-56 flex-shrink-0 flex-col overflow-y-auto p-3 gap-0.5 transition-colors duration-300 relative z-20">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            const badgeCount = tab.id === 'home' ? unreadNotificationsCount : 0;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors outline-none
                  ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 hover:bg-slate-50/50 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/50'}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-desktop-tab"
                    className="absolute inset-0 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3 w-full">
                  <Icon size={17} className={isActive ? "text-emerald-600" : "text-slate-400"} />
                  {tab.label}
                  {badgeCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                      {badgeCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {/* Logout at bottom of sidebar */}
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
        
        <nav className="flex md:hidden fixed bottom-0 left-0 w-full glass-panel border-b-0 rounded-t-2xl rounded-b-none overflow-x-auto overflow-y-hidden items-center z-50 py-2 pb-safe px-2 shadow-[0_-8px_32px_-1px_rgba(16,185,129,0.08)] dark:shadow-none transition-colors duration-300 gap-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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

        <div className="md:hidden fixed bottom-0 right-0 h-[64px] w-12 bg-gradient-to-l from-white dark:from-zinc-800 to-transparent z-[60] pointer-events-none" />

        <main className={`flex-1 min-h-0 ${(activeTab === 'chat' || activeTab === 'profiles') ? 'overflow-hidden p-0 sm:p-2 md:p-3' : 'overflow-y-auto p-4 sm:p-6 lg:p-8'} bg-transparent flex flex-col`}>
          <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>}>
            <AnimatePresence mode="wait">
              {activeTab === 'home' && <HomeTab key="home" user={user} requests={studentRequests} notifications={notifications} onNavigate={handleTabChange} />}
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


// ─────────────────────────────────────────────
// HOME TAB
// ─────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    id: 'appointment',
    icon: CalendarCheck,
    label: 'Book Appointment',
    desc: 'Schedule a session with your counselor',
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-100 dark:border-emerald-900/40',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'chat',
    icon: MessageSquare,
    label: 'Message Counselor',
    desc: 'Send a secure message to your team',
    gradient: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-100 dark:border-blue-900/40',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'transfer',
    icon: FileInput,
    label: 'School Transfer',
    desc: 'Submit a transfer request form',
    gradient: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    border: 'border-violet-100 dark:border-violet-900/40',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'resources',
    icon: BookOpen,
    label: 'Resource Vault',
    desc: 'Browse guides, articles and tools',
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-100 dark:border-amber-900/40',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
];

const ONBOARDING_STEPS = [
  { label: 'Complete your profile', tab: 'profiles' },
  { label: 'Book your first counseling session', tab: 'appointment' },
  { label: 'Say hello to your counselor', tab: 'chat' },
];

const TIPS = [
  "Feeling overwhelmed? Try breaking your day into small, achievable tasks.",
  "Remember: it's okay to ask for help. That's what we're here for.",
  "Taking 5 minutes to breathe deeply can significantly reduce anxiety.",
  "Your mental health matters as much as your grades. Balance is key.",
  "A problem shared is a problem halved — reach out to your counselor today.",
];

function HomeTab({ user, requests, notifications, onNavigate }) {
  const recentRequests = useMemo(() => requests.slice().reverse().slice(0, 3), [requests]);
  const pendingCount = useMemo(() => requests.filter(r => r.status === 'pending').length, [requests]);
  const notificationsOn = user?.preferences?.notificationsEnabled ?? true;
  const tip = useMemo(() => TIPS[Math.floor(Math.random() * TIPS.length)], []);
  const hasRequests = requests.length > 0;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full space-y-6"
    >
      {/* ── HERO BANNER ── */}
      <motion.div
        whileHover={{ scale: 1.003 }}
        className="bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 dark:from-emerald-950 dark:via-black dark:to-teal-950 rounded-[2rem] p-7 lg:p-10 text-white shadow-2xl overflow-hidden relative border border-emerald-800/30 transition-all duration-500"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500 opacity-10 rounded-full blur-2xl transform -translate-x-1/4 translate-y-1/4" />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_rgba(255,255,255,0.15)_1px,_transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className="text-emerald-400/80 text-[11px] font-bold uppercase tracking-widest mb-2">{today}</p>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-2">
              Hey, {user.name.split(' ')[0]} 👋
            </h2>
            <p className="text-emerald-100/70 text-base max-w-md">
              {hasRequests
                ? `You have ${pendingCount} pending request${pendingCount !== 1 ? 's' : ''}. Your counselor is here to help.`
                : "Your wellness journey starts here. What would you like to do today?"}
            </p>
          </div>

          <div className="flex gap-3">
            {[
              { value: requests.length, label: 'Total Requests', color: 'text-white' },
              { value: pendingCount, label: 'Pending', color: 'text-emerald-400' },
            ].map(({ value, label, color }) => (
              <motion.div
                key={label}
                whileHover={{ y: -4, scale: 1.05 }}
                className="bg-white/5 rounded-2xl p-5 backdrop-blur-md border border-white/10 min-w-[110px] flex flex-col items-center text-center shadow-xl"
              >
                <div className={`text-4xl font-black ${color}`}>{value}</div>
                <div className="text-[10px] text-emerald-200/70 font-bold uppercase tracking-wider mt-1.5">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Daily tip strip */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex items-center gap-3">
          <Sparkles size={14} className="text-emerald-400 shrink-0" />
          <p className="text-[12px] text-emerald-100/60 italic">{tip}</p>
        </div>
      </motion.div>

      {/* ── QUICK ACTIONS ── */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.35 }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate(action.id)}
                className={`glass-card p-4 flex flex-col items-start gap-3 text-left shadow-sm hover:shadow-md transition-all group`}
              >
                <div className={`w-10 h-10 ${action.iconBg} rounded-xl flex items-center justify-center`}>
                  <Icon size={19} className={action.iconColor} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-zinc-100 leading-tight">{action.label}</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-snug">{action.desc}</p>
                </div>
                <ChevronRight size={14} className={`${action.iconColor} mt-auto group-hover:translate-x-1 transition-transform`} />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── BENTO ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
          className="lg:col-span-2 glass-card p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100">Recent Activity</h3>
            {hasRequests && (
              <button onClick={() => onNavigate('history')} className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                View all <ChevronRight size={12} />
              </button>
            )}
          </div>

          {recentRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                <Clock size={24} className="text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">No activity yet</p>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">Your submitted requests will appear here.</p>
              </div>
              <button
                onClick={() => onNavigate('appointment')}
                className="mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
              >
                Book your first appointment <ArrowRight size={12} />
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentRequests.map((req, idx) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + idx * 0.08 }}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                      <CalendarCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-800 dark:text-zinc-100 capitalize">{req.type}</span>
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500">{new Date(req.submissionDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full border font-bold capitalize ${
                    req.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50' :
                    req.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50' :
                    req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50' :
                    'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50'
                  }`}>{req.status}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right Column: Notifications + Onboarding */}
        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
          className="lg:col-span-1 flex flex-col gap-4"
        >
          {/* Notifications */}
          <div className="glass-card p-5 shadow-sm flex-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <Bell size={16} className="text-slate-400" /> Notifications
            </h3>
            {!notificationsOn ? (
              <div className="text-center py-6 text-xs text-slate-400">Notifications paused in Settings.</div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Bell size={18} className="text-slate-300 dark:text-zinc-600" />
                </div>
                <p className="text-xs text-slate-400 text-center">All clear — no new notifications.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {notifications.slice(0, 4).map((n, idx) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 + idx * 0.07 }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-700/50 flex items-start gap-2.5"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-slate-700 dark:text-zinc-300 text-[12px] font-medium leading-snug">{n.message}</p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">{new Date(n.date).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Onboarding checklist (only when no requests) */}
          {!hasRequests && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10 border border-emerald-100 dark:border-emerald-900/40 rounded-[1.75rem] p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-emerald-500" />
                <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Getting Started</h4>
              </div>
              <div className="space-y-2.5">
                {ONBOARDING_STEPS.map((step, i) => (
                  <button
                    key={i}
                    onClick={() => onNavigate(step.tab)}
                    className="flex items-center gap-3 w-full text-left group"
                  >
                    <Circle size={16} className="text-emerald-300 dark:text-emerald-700 shrink-0 group-hover:text-emerald-500 transition-colors" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-600 transition-colors">{step.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
