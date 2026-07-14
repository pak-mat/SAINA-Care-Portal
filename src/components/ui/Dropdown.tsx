import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Dropdown({ icon: Icon, label, options, value, onChange }: { icon: any, label: string, options: (string | {value: string, label: string})[], value: string, onChange: (val: string) => void }) {
 const [isOpen, setIsOpen] = useState(false);
 const ref = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (ref.current && !ref.current.contains(event.target as Node)) {
 setIsOpen(false);
 }
 };
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 return (
 <div className="relative min-w-[140px]" ref={ref}>
 <button 
 onClick={() => setIsOpen(!isOpen)}
 className="w-full flex items-center justify-between gap-4 px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
 >
 <div className="flex items-center gap-2 overflow-hidden">
 <span className="text-gray-400 shrink-0">
 {typeof Icon === 'string' ? <span className="font-serif italic font-bold text-[16px] leading-none">{Icon}</span> : <Icon size={16}/>}
 </span>
 <span className="truncate font-semibold">{value || label}</span>
 </div>
 <ChevronDown size={16} className={`text-gray-400 transition-${isOpen ? 'rotate-180' : ''}`}/>
 </button>

 <AnimatePresence>
 {isOpen && (
 <motion.div 
 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
 className="absolute top-full left-0 mt-2 w-full z-50 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl shadow-xl py-1 max-h-60 overflow-y-auto"
 >
 <button 
 onClick={() => { onChange(''); setIsOpen(false); }}
 className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 flex items-center justify-between font-medium"
 >
 All {label}s
 {!value && <Check size={14} className="text-emerald-500" />}
 </button>
 {options.map((opt: any) => (
 <button 
 key={opt}
 onClick={() => { onChange(opt); setIsOpen(false); }}
 className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 flex items-center justify-between font-medium"
 >
 {opt}
 {value === opt && <Check size={14} className="text-emerald-500" />}
 </button>
 ))}
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
