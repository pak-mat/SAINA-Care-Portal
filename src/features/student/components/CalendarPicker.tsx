import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarPickerProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  getAvailableSlots: (date: Date) => any[];
}

export default function CalendarPicker({ selectedDate, onSelectDate, getAvailableSlots }: CalendarPickerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="bg-slate-50/80 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-slate-200/50 dark:border-zinc-800/50 shadow-sm relative z-10">
      <div className="flex justify-between items-center mb-6">
        <button type="button" onClick={prevMonth} className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-xl shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-zinc-700 transition-all">
          <ChevronLeft size={18} className="text-slate-600 dark:text-zinc-400" />
        </button>
        <h3 className="text-slate-900 dark:text-zinc-100 font-bold tracking-wide uppercase text-sm">
          {monthNames[month]} {year}
        </h3>
        <button type="button" onClick={nextMonth} className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-xl shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-zinc-700 transition-all">
          <ChevronRight size={18} className="text-slate-600 dark:text-zinc-400" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-3 text-sm text-slate-700 dark:text-zinc-300">
        <AnimatePresence mode="popLayout">
          {generateDays().map((date, idx) => {
            if (!date) return <div key={idx} className="p-2" />;
            const hasSlots = getAvailableSlots(date).length > 0;
            const disabled = (isPast(date) && !isToday(date)) || !hasSlots;
            const isSelected = selectedDate?.toDateString() === date.toDateString();

            let btnClass = "relative w-full h-10 sm:h-12 flex items-center justify-center rounded-xl font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ";
            
            if (disabled) {
              btnClass += "text-slate-400 dark:text-zinc-600 cursor-not-allowed opacity-40 bg-slate-100/50 dark:bg-zinc-800/30 ";
            } else if (isSelected) {
              btnClass += "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transform scale-[1.05] ";
            } else {
              btnClass += "bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 ";
              if (isToday(date)) btnClass += "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-zinc-900 border-none ";
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={disabled}
                onClick={() => onSelectDate(date)}
                className={btnClass}
              >
                 {date.getDate()}
              </button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
