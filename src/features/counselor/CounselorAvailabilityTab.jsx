import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../services/localEngine';
import { CheckCircle, Save, Clock, Trash2, Plus } from 'lucide-react';

export default function CounselorAvailabilityTab() {
  const { user, updateUser } = useAuth();
  
  // Base default schedule map (0: Sunday, 6: Saturday)
  const defaultSchedule = {
    1: ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM'],
    2: ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM'],
    3: ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM'],
    4: ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM'],
    5: ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM']
  };

  const [schedule, setSchedule] = useState(user?.preferences?.availabilitySchedule || defaultSchedule);
  const [saved, setSaved] = useState(false);

  // Available time slots pool to select from
  const timePool = [
    '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', 
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', 
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'
  ];

  const handleSave = () => {
    const updatedUser = updateUserProfile(user.id, {
      preferences: { ...user.preferences, availabilitySchedule: schedule }
    });
    if (updatedUser) {
      updateUser(updatedUser);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const toggleDay = (dayIndex) => {
    setSchedule(prev => {
      const newSchedule = { ...prev };
      if (newSchedule[dayIndex]) {
        delete newSchedule[dayIndex]; // Disable day
      } else {
        newSchedule[dayIndex] = ['09:00 AM', '12:00 PM', '03:00 PM']; // Default when enabled
      }
      return newSchedule;
    });
  };

  const toggleTimeInDay = (dayIndex, time) => {
    setSchedule(prev => {
      const newSchedule = { ...prev };
      if (!newSchedule[dayIndex]) return prev;

      let dayTimes = [...newSchedule[dayIndex]];
      if (dayTimes.includes(time)) {
        dayTimes = dayTimes.filter(t => t !== time);
      } else {
        dayTimes.push(time);
        dayTimes.sort((a,b) => {
          const ta = new Date(`1970/01/01 ${a}`);
          const tb = new Date(`1970/01/01 ${b}`);
          return ta.getTime() - tb.getTime();
        });
      }
      newSchedule[dayIndex] = dayTimes;
      return newSchedule;
    });
  };

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="max-w-5xl mx-auto pb-8">
      <div className="mb-8 overflow-hidden bg-gradient-to-r from-blue-900 to-slate-900 dark:from-blue-950 dark:to-black rounded-2xl p-8 relative shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/4"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Schedule Appointments</h2>
            <p className="text-blue-100/80 text-sm font-medium max-w-lg">Configure your availability matrix. This determines when students can request counseling sessions with you.</p>
          </div>
          <button 
            onClick={handleSave}
            className="hidden sm:flex bg-blue-500 hover:bg-blue-400 text-slate-900 font-bold text-sm px-6 py-3 rounded-lg items-center gap-2 transition-all shadow-xl hover:shadow-blue-500/20"
          >
            {saved ? <><CheckCircle size={18} /> Saved</> : <><Save size={18} /> Update Schedule</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {daysOfWeek.map((dayName, index) => {
          const isWorking = !!schedule[index];
          const times = schedule[index] || [];
          return (
            <motion.div 
              whileHover={{ scale: isWorking ? 1.01 : 1 }}
              key={dayName} 
              className={`rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col ${isWorking ? 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 shadow-sm' : 'bg-slate-50 border-slate-200/50 dark:bg-zinc-900/40 dark:border-zinc-800/50 opacity-60'}`}
            >
              <div className={`p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between transition-colors ${isWorking ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'bg-transparent'}`}>
                <div className="flex items-center gap-3">
                  <span className={`font-bold text-base tracking-tight ${isWorking ? 'text-blue-900 dark:text-blue-100' : 'text-slate-500 dark:text-zinc-500'}`}>
                    {dayName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDay(index)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${isWorking ? 'bg-blue-600' : 'bg-slate-300 dark:bg-zinc-700'}`}
                  role="switch"
                  aria-checked={isWorking}
                >
                  <span className="sr-only">Toggle {dayName}</span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isWorking ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
              </div>

              <div className="p-4 flex-1">
                {isWorking ? (
                  <div>
                    <div className="flex flex-wrap gap-2">
                      {timePool.map((time) => {
                        const isSelected = times.includes(time);
                        return (
                          <button
                            key={time}
                            onClick={() => toggleTimeInDay(index, time)}
                            className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all border
                              ${isSelected
                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:border-blue-300 hover:bg-blue-50 dark:hover:border-blue-700 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 cursor-pointer'
                              }
                            `}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                    {times.length === 0 && (
                      <div className="flex items-center gap-2 mt-4 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 border border-amber-200 dark:border-amber-800/50 rounded-lg">
                        <CheckCircle size={14} /> Please select at least one time slot.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-zinc-600 min-h-[100px] text-sm font-medium">
                    <Clock className="w-8 h-8 mb-2 opacity-50" />
                    Off-Duty
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 flex sm:hidden">
        <button 
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-4 rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg"
        >
          {saved ? <><CheckCircle size={18} /> Saved</> : <><Save size={18} /> Update Schedule</>}
        </button>
      </div>

    </motion.div>
  );
}
