import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Info, Sparkles } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { User } from '../../../types';
import { useActiveCounselors } from '../../../hooks/useActiveCounselors';
import { getAvatarClass } from '../../../utils/uiUtils';
import CalendarPicker from './CalendarPicker';
import TimeSlotPicker from './TimeSlotPicker';
import CounselorProfileModal from './CounselorProfileModal';

interface AppointmentFormProps {
  onDone: () => void;
  user: User;
}

export default function AppointmentForm({ onDone, user }: AppointmentFormProps) {
  const [category, setCategory] = useState('');
  const [details, setDetails] = useState('');
  const [viewingProfile, setViewingProfile] = useState<User | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{time: string, counselor: string} | null>(null);

  const { data: counselors = [] } = useActiveCounselors();

  const categories = ['Academics', 'Career Guidance', 'Anxiety & Stress', 'Personal Issues'];

  // Dynamically generate slots based on the counselors working on the given date
  const getAvailableSlots = (date: Date) => {
    const day = date.getDay();
    
    const workingCounselors = counselors.filter(c => {
      const schedule = c.preferences?.availabilitySchedule;
      if (schedule) {
        return !!schedule[day];
      }
      const availableDays = c.preferences?.availableDays || [1, 2, 3, 4, 5];
      return availableDays.includes(day);
    });

    if (workingCounselors.length === 0) return []; 
    
    let slots: any[] = [];
    
    workingCounselors.forEach((c) => {
      const schedule = c.preferences?.availabilitySchedule;
      let times: string[] = [];
      
      if (schedule && schedule[day]) {
        times = schedule[day];
      } else {
        times = c.preferences?.availableSlots || ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM'];
      }

      times.forEach((time: string) => {
        slots.push({ time, available: true, counselor: c.name });
      });
    });
    
    return slots.sort((a,b) => {
      const ta = new Date(`1970/01/01 ${a.time}`);
      const tb = new Date(`1970/01/01 ${b.time}`);
      return ta.getTime() - tb.getTime();
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return;
    
    const counselor = counselors.find(c => c.name === selectedSlot.counselor);
    
    const timeParts = selectedSlot.time.match(/(\d+):(\d+)\s+(AM|PM)/);
    let hours = 0;
    let mins = 0;
    if (timeParts) {
      hours = parseInt(timeParts[1]);
      mins = parseInt(timeParts[2]);
      if (timeParts[3] === 'PM' && hours < 12) hours += 12;
      if (timeParts[3] === 'AM' && hours === 12) hours = 0;
    }
    
    const scheduledDate = new Date(selectedDate);
    scheduledDate.setHours(hours, mins, 0, 0);

    const { error } = await supabase.from('appointments').insert({
      studentid: user.id,
      counselorid: counselor ? counselor.id : null,
      status: 'pending',
      scheduled_date: scheduledDate.toISOString(),
      topic_category: category,
      private_notes: details
    });
    
    if (!error) {
      onDone();
    } else {
      console.error("Error creating appointment:", error);
      alert("Failed to schedule appointment. Please try again.");
    }
  };

  const selectedCounselorProfile = counselors.find(c => c.name === selectedSlot?.counselor);

  return (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="w-full">
      <div className="glass-panel shadow-lg overflow-hidden transition-colors duration-300">
        <div className="flex flex-col lg:flex-row">
          
          {/* Left Column: Context & Calendar */}
          <div className="lg:w-1/2 p-6 sm:p-10 border-b lg:border-b-0 lg:border-r border-slate-200/50 dark:border-zinc-800/50 relative">
            <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            
            <div className="mb-8 relative z-10">
               <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-3 mb-3 tracking-tight">
                 <div className="w-10 h-10 rounded-[1rem] bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                   <CalendarIcon className="text-emerald-500" size={20} />
                 </div>
                 Select a Date
               </h2>
               <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 max-w-md leading-relaxed">
                 Choose an available day on the calendar to see counselor availability. Green days have open slots.
               </p>
            </div>

            {/* Counselors Quick Profile Directory */}
            <div className="mb-8 bg-slate-50/80 dark:bg-zinc-900/40 p-5 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 shadow-sm relative z-10">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Sparkles size={12} className="text-emerald-500" />
                Featured Care Counselors
              </h3>
              <div className="flex flex-wrap gap-4">
                {counselors.map((c) => {
                  const initials = c.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
                  const avatarBg = getAvatarClass(c.avatarColor);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setViewingProfile(c)}
                      className="flex items-center gap-2.5 p-1.5 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-all border border-transparent hover:border-slate-200 dark:hover:border-zinc-700 group cursor-pointer text-left focus:outline-none"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] ring-1 ring-slate-100 dark:ring-zinc-700 shadow-sm ${avatarBg}`}>
                        {initials}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200 group-hover:text-emerald-600 transition-colors">
                          {c.name}
                        </div>
                        <div className="text-[9px] text-slate-400 dark:text-zinc-500 flex items-center gap-1 capitalize">
                          <span className={`w-1 h-1 rounded-full ${c.status === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          {c.status || 'Available'}
                        </div>
                      </div>
                    </button>
                  );
                })}
                {counselors.length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-zinc-500 italic">No counselors listed currently.</p>
                )}
              </div>
            </div>

            {/* Calendar UI Component */}
            <CalendarPicker 
              selectedDate={selectedDate} 
              onSelectDate={(date) => {
                setSelectedDate(date);
                setSelectedSlot(null);
              }} 
              getAvailableSlots={getAvailableSlots} 
            />
            
            {/* Time Slot Selection Component */}
            {selectedDate && (
              <TimeSlotPicker 
                selectedDate={selectedDate}
                slots={getAvailableSlots(selectedDate)}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
              />
            )}
          </div>

          {/* Right Column: details */}
          <div className="lg:w-1/2 p-6 sm:p-10 bg-slate-50/30 dark:bg-zinc-900/10 backdrop-blur-sm">
            <form onSubmit={submit} className="space-y-8 h-full flex flex-col">
              
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-zinc-400 mb-4">Topic Categories</label>
                <div className="flex flex-wrap gap-2.5">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all duration-300 outline-none
                        ${category === cat ? 'bg-emerald-600 dark:bg-emerald-600 border-emerald-600 text-white shadow-md transform -translate-y-0.5' : 'bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border-slate-200/60 dark:border-zinc-700/60 text-slate-600 dark:text-zinc-400 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-sm hover:bg-white dark:hover:bg-zinc-800'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-zinc-400 mb-3">Private Notes Context</label>
                <textarea 
                  required 
                  value={details} 
                  onChange={e => setDetails(e.target.value)} 
                  rows={4} 
                  placeholder="Share a brief context of what you'd like to discuss so your counselor can prepare..." 
                  className="w-full h-36 glass-panel border-slate-200/80 dark:border-zinc-700/80 rounded-2xl p-5 focus:bg-white dark:focus:bg-zinc-800 text-sm font-medium text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-sm transition-all resize-none placeholder:text-slate-400"
                />
                 <div className="mt-4 flex items-start gap-2.5 text-xs text-slate-500 dark:text-zinc-400 font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                      <Info className="text-emerald-500" size={12} />
                    </div>
                    <p className="pt-0.5">All information provided is strictly confidential and end-to-end encrypted before syncing.</p>
                 </div>
              </div>

              {/* Counselor Social Card Embedded Preview */}
              {selectedSlot && selectedCounselorProfile && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-slate-200/60 dark:border-zinc-700/60 rounded-2xl p-5 flex gap-4 shadow-sm"
                >
                  <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center font-black text-lg shadow-inner ${getAvatarClass(selectedCounselorProfile.avatarColor)}`}>
                    {selectedSlot.counselor.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="font-bold text-base text-slate-900 dark:text-zinc-100 truncate tracking-tight">{selectedSlot.counselor}</div>
                      <span className="text-[9px] uppercase font-black tracking-widest bg-emerald-100/50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-lg self-center border border-emerald-200/50 dark:border-emerald-800/50">
                        Selected Counselor
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                      {selectedCounselorProfile.bio || "Assigned Saina Care counselor."}
                    </p>
                    {selectedCounselorProfile.interests && selectedCounselorProfile.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {selectedCounselorProfile.interests.slice(0, 3).map((spec: string) => (
                          <span key={spec} className="bg-slate-100 dark:bg-zinc-700/50 text-slate-600 dark:text-zinc-300 text-[10px] px-2 py-0.5 rounded-md font-bold tracking-wide">
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              <div className="pt-6 mt-auto">
                <button 
                  type="submit" 
                  disabled={!category || !selectedDate || !selectedSlot || !details} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 w-full flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                >
                  Confirm Appointment
                  {selectedSlot && <span className="opacity-90 font-semibold bg-white/20 px-2 py-0.5 rounded-md text-xs">{selectedSlot.time}</span>}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      <CounselorProfileModal profile={viewingProfile} onClose={() => setViewingProfile(null)} />

    </motion.div>
  );
}
