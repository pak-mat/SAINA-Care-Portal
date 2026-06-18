import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarClock, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAllRequests, markAppointmentNotified } from '../../services/localEngine';

interface NotificationData {
  id: string;
  dateStr: string;
  diffMinutes: number;
}

export default function AppointmentNotification() {
  const { user } = useAuth();
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const dismissedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user || user.role !== 'student') return;

    const checkAppointments = () => {
      setNotification((currentNotif) => {
        const requests = getAllRequests();
        const activeRequests = requests.filter((r: any) => 
          r.type === 'appointment' && 
          r.status === 'approved' && 
          !r.notified && 
          r.scheduledAt && 
          !dismissedIds.current.has(r.id)
        );

        const upcoming = activeRequests.find((r: any) => {
          const diffMinutes = (new Date(r.scheduledAt).getTime() - Date.now()) / 1000 / 60;
          return diffMinutes > 0 && diffMinutes <= 60;
        });

        if (upcoming) {
          const diffMinutes = Math.floor((new Date((upcoming as any).scheduledAt).getTime() - Date.now()) / 1000 / 60);
          if (!currentNotif || currentNotif.id !== upcoming.id || currentNotif.diffMinutes !== diffMinutes) {
            return {
              id: upcoming.id,
              dateStr: new Date((upcoming as any).scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              diffMinutes
            };
          }
          return currentNotif;
        }

        return null; // hide if expired or newly dismissed
      });
    };

    checkAppointments();
    const interval = setInterval(checkAppointments, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user]);

  const dismiss = () => {
    if (notification) {
      dismissedIds.current.add(notification.id);
      markAppointmentNotified(notification.id);
      setNotification(null);
    }
  };

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white dark:bg-zinc-800 rounded-xl shadow-2xl border border-emerald-100 dark:border-emerald-900/50 overflow-hidden flex"
        >
          <div className="bg-emerald-500 w-2 shrink-0"></div>
          <div className="p-4 flex gap-4 w-full relative">
            <button onClick={dismiss} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300">
              <X size={16} />
            </button>
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
              <CalendarClock size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 pr-4">Upcoming Appointment Reminder</h4>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                Your counseling session starts in <span className="font-bold text-emerald-600 dark:text-emerald-400">{notification.diffMinutes} minutes</span> at {notification.dateStr}.
              </p>
              <div className="mt-3 flex gap-2">
                <button onClick={dismiss} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
