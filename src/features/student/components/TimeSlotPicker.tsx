import React from 'react';
import { motion } from 'motion/react';
import { Clock, CheckCircle, User } from 'lucide-react';

interface TimeSlotPickerProps {
  selectedDate: Date;
  slots: any[];
  selectedSlot: { time: string; counselor: string } | null;
  onSelectSlot: (slot: { time: string; counselor: string }) => void;
}

export default function TimeSlotPicker({ selectedDate, slots, selectedSlot, onSelectSlot }: TimeSlotPickerProps) {
  return (
    <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="mt-8 rounded-lg">
      <h4 className="text-sm font-semibold text-slate-800 dark:text-zinc-200 mb-3 flex items-center gap-2">
        <Clock className="text-emerald-500" size={16} /> 
        Available Slots for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </h4>
      
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
        {slots.length === 0 ? (
          <p className="text-sm text-slate-500 italic p-4 bg-slate-50 dark:bg-zinc-900 rounded-lg text-center">No slots available on this day.</p>
        ) : (
          slots.map((slot, i) => {
            const isSlotSelected = selectedSlot?.time === slot.time && selectedSlot?.counselor === slot.counselor;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelectSlot(slot)}
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
  );
}
