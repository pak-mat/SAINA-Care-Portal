// File: src/features/student/components/AppointmentForm.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, Clock, CheckCircle, Info, ChevronLeft, 
  ChevronRight, User, Sparkles, Linkedin, Twitter, Instagram, Globe 
} from 'lucide-react';
import { createAppointment, getAllUsers } from '../../../services/localEngine';

export default function AppointmentForm({ onDone, user }: any) {
  const [category, setCategory] = useState('');
  const [details, setDetails] = useState('');
  const [counselors, setCounselors] = useState<any[]>([]);
  const [viewingProfile, setViewingProfile] = useState<any | null>(null);
  
  useEffect(() => {
    // Fetch all active counselors when the form loads
    const allUsers = getAllUsers();
    const activeCounselors = allUsers.filter(u => u.role === 'counselor' && u.status !== 'Away');
    setCounselors(activeCounselors);
  }, []);
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{time: string, counselor: string} | null>(null);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const generateDays = () => {
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return date < today;
  };

  const categories = ['Academics', 'Career Guidance', 'Anxiety & Stress', 'Personal Issues'];

  // Presets mapping helper
  const getBannerClass = (styleId: string) => {
    const presets: Record<string, string> = {
      emerald_calm: 'bg-gradient-to-r from-teal-500 to-emerald-600',
      indigo_dusk: 'bg-gradient-to-r from-violet-600 to-indigo-600',
      sunset_glow: 'bg-gradient-to-r from-orange-400 via-rose-500 to-amber-500',
      midnight_blue: 'bg-gradient-to-r from-slate-900 via-zinc-800 to-slate-900',
      rose_gold: 'bg-gradient-to-r from-rose-400 to-orange-300',
      cosmic_neon: 'bg-gradient-to-r from-purple-800 via-fuchsia-700 to-indigo-900'
    };
    return presets[styleId] || presets['emerald_calm'];
  };

  const getAvatarClass = (colorId: string) => {
    const presets: Record<string, string> = {
      emerald: 'bg-emerald-600 text-white',
      indigo: 'bg-indigo-600 text-white',
      violet: 'bg-purple-600 text-white',
      rose: 'bg-rose-600 text-white',
      amber: 'bg-amber-500 text-zinc-950',
      blue: 'bg-blue-600 text-white'
    };
    return presets[colorId] || presets['emerald'];
  };

  // Dynamically generate slots based on the counselors working today
  const getAvailableSlots = (date: Date) => {
    const day = date.getDay();
    
    // Check which counselors are available on this day
    const workingCounselors = counselors.filter(c => {
      const schedule = c.preferences?.availabilitySchedule;
      if (schedule) {
        return !!schedule[day];
      }
      // Fallback
      const availableDays = c.preferences?.availableDays || [1, 2, 3, 4, 5];
      return availableDays.includes(day);
    });

    if (workingCounselors.length === 0) return []; // No counselors working today
    
    let slots: any[] = [];
    
    workingCounselors.forEach((c) => {
      const schedule = c.preferences?.availabilitySchedule;
      let times: string[] = [];
      
      if (schedule && schedule[day]) {
        times = schedule[day];
      } else {
        // Fallback
        times = c.preferences?.availableSlots || ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM'];
      }

      times.forEach((time: string) => {
        slots.push({ time, available: true, counselor: c.name });
      });
    });
    
    // Sort chronologically
    return slots.sort((a,b) => {
      const ta = new Date(`1970/01/01 ${a.time}`);
      const tb = new Date(`1970/01/01 ${b.time}`);
      return ta.getTime() - tb.getTime();
    });
  };

  const submit = (e: any) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return;
    
    const formattedDate = selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const slotStr = `${formattedDate}, ${selectedSlot.time} with ${selectedSlot.counselor}`;
    
    createAppointment({ 
      choice1: slotStr, 
      reasonCategory: category, 
      details, 
      studentId: user.id, 
      studentName: user.name 
    });
    onDone();
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const selectedCounselorProfile = counselors.find(c => c.name === selectedSlot?.counselor);

  return (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="w-full">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-700 overflow-hidden transition-colors duration-300">
        <div className="flex flex-col lg:flex-row">
          
          {/* Left Column: Context & Calendar */}
          <div className="lg:w-1/2 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-zinc-700">
            <div className="mb-6">
               <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2 mb-2">
                 <CalendarIcon className="text-emerald-500" size={22} />
                 Select a Date
               </h2>
               <p className="text-sm text-slate-500 dark:text-zinc-400">
                 Choose an available day on the calendar to see counselor availability. Green days have open slots.
               </p>
            </div>

            {/* Counselors Quick Profile Directory */}
            <div className="mb-6 bg-slate-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-slate-200 dark:border-zinc-700/50">
              <h3 className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Sparkles size={11} className="text-emerald-500" />
                Featured Care Counselors
              </h3>
              <div className="flex flex-wrap gap-4">
                {counselors.map((c) => {
                  const initials = c.name.split(' ').map((n: any) => n[0]).slice(0, 2).join('').toUpperCase();
                  const avatarBg = getAvatarClass(c.avatarColor || 'emerald');
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

            {/* Calendar UI */}
            <div className="bg-slate-50 dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-zinc-700/50">
              <div className="flex justify-between items-center mb-6">
                <button type="button" onClick={prevMonth} className="px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-md transition-colors">
                  <ChevronLeft size={20} className="text-slate-600 dark:text-zinc-400" />
                </button>
                <h3 className="text-slate-900 dark:text-zinc-100 font-semibold tracking-wide">
                  {monthNames[month]} {year}
                </h3>
                <button type="button" onClick={nextMonth} className="px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-md transition-colors">
                  <ChevronRight size={20} className="text-slate-600 dark:text-zinc-400" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <div key={d} className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2 text-sm text-slate-700 dark:text-zinc-300">
                <AnimatePresence mode="popLayout">
                  {generateDays().map((date, idx) => {
                    if (!date) return <div key={idx} className="p-2" />;
                    const hasSlots = getAvailableSlots(date).length > 0;
                    const disabled = (isPast(date) && !isToday(date)) || !hasSlots;
                    const isSelected = selectedDate?.toDateString() === date.toDateString();

                    let btnClass = "relative w-full h-10 sm:h-12 flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 ";
                    
                    if (disabled) {
                      btnClass += "text-slate-400 dark:text-zinc-600 cursor-not-allowed opacity-50 bg-slate-100 dark:bg-zinc-800/50 ";
                    } else if (isSelected) {
                      btnClass += "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 transform scale-[1.05] ";
                    } else {
                      btnClass += "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/40 dark:to-emerald-800/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50 shadow-sm hover:shadow-md hover:shadow-emerald-500/10 hover:-translate-y-0.5 hover:from-emerald-100 hover:to-emerald-200/50 dark:hover:from-emerald-800/50 dark:hover:to-emerald-700/30 ";
                      if (isToday(date)) btnClass += "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-zinc-900 border-none ";
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={disabled}
                        onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                        className={btnClass}
                      >
                         {date.getDate()}
                      </button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Time Slot Selection */}
            {selectedDate && (
               <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="mt-8 rounded-lg">
                 <h4 className="text-sm font-semibold text-slate-800 dark:text-zinc-200 mb-3 flex items-center gap-2">
                   <Clock className="text-emerald-500" size={16} /> 
                   Available Slots for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                 </h4>
                 
                 <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                   {getAvailableSlots(selectedDate).length === 0 ? (
                     <p className="text-sm text-slate-500 italic p-4 bg-slate-50 dark:bg-zinc-900 rounded-lg text-center">No slots available on this day.</p>
                   ) : (
                     getAvailableSlots(selectedDate).map((slot, i) => {
                       const isSlotSelected = selectedSlot?.time === slot.time && selectedSlot?.counselor === slot.counselor;
                       return (
                         <button
                           key={i}
                           type="button"
                           onClick={() => setSelectedSlot(slot)}
                           className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all duration-200
                             ${isSlotSelected 
                               ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-600' 
                               : 'border-slate-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'}`}
                         >
                           <div className="flex items-center gap-3">
                             <span className="text-sm font-bold">{slot.time}</span>
                             <span className="text-xs flex items-center gap-1 opacity-80">
                               <User size={12} /> {slot.counselor}
                             </span>
                           </div>
                           {isSlotSelected && <CheckCircle size={16} className="text-emerald-600" />}
                         </button>
                       );
                     })
                   )}
                 </div>
               </motion.div>
            )}
          </div>

          {/* Right Column: details */}
          <div className="lg:w-1/2 p-6 sm:p-8 bg-slate-50/50 dark:bg-zinc-900/30">
            <form onSubmit={submit} className="space-y-6 h-full flex flex-col">
              
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-zinc-200 mb-3">Topic Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium border transition-all duration-200 outline-none
                        ${category === cat ? 'bg-emerald-600 dark:bg-emerald-600 border-emerald-600 text-white shadow-sm' : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:border-emerald-300 dark:hover:border-emerald-700'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Private Notes Context</label>
                <textarea 
                  required 
                  value={details} 
                  onChange={e => setDetails(e.target.value)} 
                  rows={4} 
                  placeholder="Share a brief context of what you'd like to discuss so your counselor can prepare..." 
                  className="w-full h-32 border border-slate-300 dark:border-zinc-700 rounded-lg p-3 sm:p-4 bg-white dark:bg-zinc-900 focus:bg-white dark:focus:bg-zinc-800 text-sm text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500 transition-colors resize-none placeholder:text-slate-400"
                />
                 <div className="mt-3 flex items-start gap-2 text-xs text-slate-500 dark:text-zinc-400">
                    <Info className="flex-shrink-0 text-emerald-500 mt-0.5" size={14} />
                    <p>All information provided is strictly confidential and end-to-end encrypted before syncing.</p>
                 </div>
              </div>

              {/* Counselor Social Card Embedded Preview */}
              {selectedSlot && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-4 flex gap-3 shadow-inner"
                >
                  <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center font-bold text-sm shadow-sm ${getAvatarClass(selectedCounselorProfile?.avatarColor || 'emerald')}`}>
                    {selectedSlot.counselor.split(' ').map((n: any) => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="font-bold text-sm text-slate-900 dark:text-zinc-100 truncate">{selectedSlot.counselor}</div>
                      <span className="text-[10px] uppercase font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 px-2 py-0.5 rounded-md self-center">
                        Selected Counselor
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                      {selectedCounselorProfile?.bio || "Assigned Saina Care counselor."}
                    </p>
                    {selectedCounselorProfile?.interests && selectedCounselorProfile.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedCounselorProfile.interests.slice(0, 3).map((spec: string) => (
                          <span key={spec} className="bg-slate-150 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 text-[9px] px-1.5 py-0.5 rounded font-semibold">
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              <div className="pt-4 mt-auto">
                <button 
                  type="submit" 
                  disabled={!category || !selectedDate || !selectedSlot || !details} 
                  className="bg-slate-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold py-3.5 px-6 rounded-lg transition-all shadow-md focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 w-full flex items-center justify-center gap-2"
                >
                  Confirm Appointment
                  {selectedSlot && <span className="opacity-80 font-normal">({selectedSlot.time})</span>}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* Dynamic Counselor Profile Dialog Backdrop */}
      <AnimatePresence>
        {viewingProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingProfile(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-sm bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-700 max-h-[90vh] overflow-y-auto"
            >
              <div className={`h-28 w-full ${getBannerClass(viewingProfile.bannerStyle)}`}></div>
              
              <div className="px-5 pb-6 text-center relative flex flex-col items-center">
                <div className={`w-20 h-20 rounded-full -mt-10 border-4 border-white dark:border-zinc-800 flex items-center justify-center font-bold text-xl shadow ${getAvatarClass(viewingProfile.avatarColor)}`}>
                  {viewingProfile.name.split(' ').map((n: any) => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>

                <div className="mt-2.5">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border
                    ${viewingProfile.status === 'Available' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-100'}`}>
                    {viewingProfile.status || 'Available'}
                  </span>
                </div>

                <h3 className="mt-2 text-md font-bold text-slate-900 dark:text-zinc-100">{viewingProfile.name}</h3>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Saina Care Counselor</p>

                <p className="mt-3 text-xs text-slate-600 dark:text-zinc-300 italic bg-slate-50 dark:bg-zinc-900/30 p-3 rounded-lg border border-slate-100 dark:border-zinc-700/30 w-full">
                  "{viewingProfile.bio || 'Professional care counselor designated to support Saina Care students.'}"
                </p>

                {/* Specialties */}
                <div className="w-full text-left mt-4 text-xs font-semibold text-slate-500">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest block mb-1.5Packed">Coaching Focus</span>
                  <div className="flex flex-wrap gap-1">
                    {(viewingProfile.interests || []).map((spec: string) => (
                      <span key={spec} className="bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-900/60 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                        {spec}
                      </span>
                    ))}
                    {(!viewingProfile.interests || viewingProfile.interests.length === 0) && (
                      <span className="text-xs text-slate-400 italic font-mono">General Care</span>
                    )}
                  </div>
                </div>

                {/* Socials inside modal */}
                {viewingProfile.socialHandles && (
                  <div className="flex justify-center gap-2.5 mt-5 pt-3 border-t border-slate-100 dark:border-zinc-700/50 w-full">
                    {viewingProfile.socialHandles.linkedIn && (
                      <a href={viewingProfile.socialHandles.linkedIn} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-slate-50 dark:bg-zinc-750 flex items-center justify-center hover:bg-sky-50 dark:hover:bg-sky-950/20 text-slate-400 hover:text-sky-600 dark:hover:text-sky-450">
                        <Linkedin size={12} />
                      </a>
                    )}
                    {viewingProfile.socialHandles.twitter && (
                      <a href={`https://twitter.com/${viewingProfile.socialHandles.twitter.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-slate-50 dark:bg-zinc-750 flex items-center justify-center hover:bg-sky-50 dark:hover:bg-sky-900 text-slate-400 hover:text-sky-500">
                        <Twitter size={12} />
                      </a>
                    )}
                    {viewingProfile.socialHandles.instagram && (
                      <a href={`https://instagram.com/${viewingProfile.socialHandles.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-slate-50 dark:bg-zinc-750 flex items-center justify-center hover:bg-pink-50 dark:hover:bg-pink-950/20 text-slate-400 hover:text-pink-500">
                        <Instagram size={12} />
                      </a>
                    )}
                    {viewingProfile.socialHandles.website && (
                      <a href={viewingProfile.socialHandles.website} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-slate-50 dark:bg-zinc-750 flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-400 hover:text-emerald-500">
                        <Globe size={12} />
                      </a>
                    )}
                  </div>
                )}

                <button 
                  type="button"
                  onClick={() => setViewingProfile(null)}
                  className="mt-5 w-full bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 text-white dark:text-slate-900 font-bold text-xs py-2.5 rounded-xl transition-all"
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
