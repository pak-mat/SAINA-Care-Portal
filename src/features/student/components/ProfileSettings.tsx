import React, { useState } from 'react';
import { User, CreditCard, Sparkles, CheckCircle, Tag, Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

export const bannerPresets = [
 { id: 'indigo_dusk', name: 'Indigo Dusk', class: 'bg-gradient-to-r from-violet-600 to-indigo-600' },
 { id: 'emerald_calm', name: 'Emerald Calm', class: 'bg-gradient-to-r from-teal-500 to-emerald-600' },
 { id: 'sunset_glow', name: 'Sunset Glow', class: 'bg-gradient-to-r from-orange-400 via-rose-500 to-amber-500' },
 { id: 'midnight_blue', name: 'Midnight', class: 'bg-gradient-to-r from-slate-900 via-zinc-800 to-slate-900' },
 { id: 'rose_gold', name: 'Rose Gold', class: 'bg-gradient-to-r from-rose-400 to-orange-300' },
 { id: 'cosmic_neon', name: 'Cosmic Neon', class: 'bg-gradient-to-r from-purple-800 via-fuchsia-700 to-indigo-900' }
];

export const avatarPresets = [
 { id: 'indigo', bg: 'bg-indigo-600 text-white' },
 { id: 'emerald', bg: 'bg-emerald-600 text-white' },
 { id: 'violet', bg: 'bg-purple-600 text-white' },
 { id: 'rose', bg: 'bg-rose-600 text-white' },
 { id: 'amber', bg: 'bg-amber-500 text-zinc-950' },
 { id: 'blue', bg: 'bg-blue-600 text-white' }
];

export default function ProfileSettings() {
 const { register, watch, setValue } = useFormContext();
 const { user } = useAuth();
 const [newInterest, setNewInterest] = useState('');
 const [uploading, setUploading] = useState(false);
 
 const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
 try {
 setUploading(true);
 if (!event.target.files || event.target.files.length === 0) {
 throw new Error('You must select an image to upload.');
 }

 const file = event.target.files[0];
 const fileExt = file.name.split('.').pop();
 const fileName = `${user.id}-${Math.random()}.${fileExt}`;
 const filePath = `${fileName}`;

 const { error: uploadError } = await supabase.storage
 .from('avatars')
 .upload(filePath, file);

 if (uploadError) {
 throw uploadError;
 }

 const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
 setValue('avatarUrl', data.publicUrl);
 } catch (error: any) {
 alert(error.message || 'Error uploading image. Make sure the avatars bucket exists and is public.');
 } finally {
 setUploading(false);
 }
 };
 
 const interests = watch('interests') || [];
 const bannerStyle = watch('bannerStyle');
 const avatarColor = watch('avatarColor');
 const bio = watch('bio') || '';

 const handleAddInterest = (e: React.FormEvent) => {
 e.preventDefault();
 if (!newInterest.trim()) return;
 if (interests.includes(newInterest.trim())) {
 setNewInterest('');
 return;
 }
 setValue('interests', [...interests, newInterest.trim()]);
 setNewInterest('');
 };

 const handleRemoveInterest = (item: string) => {
 setValue('interests', interests.filter((i: string) => i !== item));
 };

 return (
 <div className="space-y-6">
 <div className="glass-panel shadow-sm overflow-hidden">
 <div className="p-6 border-b border-white/50 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/30 flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
 <User size={18} className="text-emerald-600" />
 </div>
 <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">Customize Social Presence</h3>
 </div>

 <div className="p-6 space-y-6">
 
 <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-700">
 <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden relative group">
 {watch('avatarUrl') ? (
 <img src={watch('avatarUrl')} alt="Profile" className="w-full h-full object-cover" />
 ) : (
 <User className="text-slate-400" />
 )}
 <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center pointer-events-none">
 <Upload size={16} className="text-white" />
 </div>
 </div>
 <div>
 <p className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-1">Profile Picture</p>
 <label className="cursor-pointer text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors inline-flex items-center gap-2">
 {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
 {uploading ? 'Uploading...' : 'Upload Image'}
 <input 
 type="file" 
 accept="image/*"
 className="hidden" 
 onChange={uploadAvatar}
 disabled={uploading}
 />
 </label>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
 <User size={12} /> Full Display Name
 </label>
 <input 
 type="text" 
 {...register('name')}
 className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 dark:bg-zinc-900/60 text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-800 transition-all shadow-inner"
 placeholder="e.g. Sarah Connor"
 />
 </div>
 
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
 <CreditCard size={12} /> Student ID String
 </label>
 <input 
 type="text" 
 {...register('studentId')}
 className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 dark:bg-zinc-900/60 text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-800 transition-all shadow-inner"
 placeholder="e.g. S91280X"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
 My Bio / Introduction
 </label>
 <textarea 
 {...register('bio')}
 onChange={(e) => setValue('bio', e.target.value.slice(0, 160))}
 className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 dark:bg-zinc-900/60 text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-800 transition-all shadow-inner h-24 resize-none"
 placeholder="Introduce yourself to counselors, e.g., 'Freshman studying clinical psychology. Enjoy quiet study spots and mental health advocacy.'"
 />
 <div className="flex justify-between mt-1 text-[11px] text-slate-400 dark:text-zinc-500">
 <span>Show off your vibe to counselors when booking sessions.</span>
 <span>{bio.length}/160 characters</span>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
 <div>
 <span className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2.5">
 Cover Banner Styling
 </span>
 <div className="flex flex-wrap gap-2.5">
 {bannerPresets.map((preset: any) => (
 <button 
 key={preset.id}
 type="button"
 onClick={() => setValue('bannerStyle', preset.id)}
 className={`w-9 h-9 rounded-full ${preset.class} transition-flex items-center justify-center border-2 ${bannerStyle === preset.id ? 'border-emerald-600 scale-110 shadow-md ring-2 ring-emerald-500/20' : 'border-transparent '}`}
 title={preset.name}
 >
 {bannerStyle === preset.id && <Sparkles size={11} className="text-white" />}
 </button>
 ))}
 </div>
 </div>

 <div>
 <span className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2.5">
 Profile Avatar Accent
 </span>
 <div className="flex flex-wrap gap-2.5">
 {avatarPresets.map((preset: any) => (
 <button 
 key={preset.id}
 type="button"
 onClick={() => setValue('avatarColor', preset.id)}
 className={`w-9 h-9 rounded-full ${preset.bg} transition-all flex items-center justify-center border-2 ${avatarColor === preset.id ? 'border-slate-800 dark:border-zinc-100 scale-110 ring-2 ring-slate-400/20 shadow' : 'border-transparent '}`}
 >
 {avatarColor === preset.id && <CheckCircle size={12} />}
 </button>
 ))}
 </div>
 </div>
 </div>

 <div className="pt-2">
 <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
 <Tag size={12} /> Add Focus Interests & Skills
 </label>
 <div className="flex gap-2 mb-3">
 <input 
 type="text"
 value={newInterest}
 onChange={(e) => setNewInterest(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === 'Enter') {
 e.preventDefault();
 handleAddInterest(e as unknown as React.FormEvent);
 }
 }}
 placeholder="e.g. Stress Relief, Meditation, Peer Tutoring"
 className="flex-1 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 transition-all"
 />
 <button 
 type="button"
 onClick={handleAddInterest}
 className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 rounded-xl flex items-center gap-1.5 transition-colors"
 >
 <Plus size={14} /> Add Choice
 </button>
 </div>

 <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 dark:bg-zinc-900/40 rounded-xl border border-slate-150 dark:border-zinc-700/45 min-h-[50px]">
 {interests.map((it: any) => (
 <span 
 key={it}
 onClick={() => handleRemoveInterest(it)}
 className="bg-slate-200 dark:bg-zinc-700 hover:bg-red-100 dark:hover:bg-red-950/40 text-slate-700 dark:text-zinc-300 hover:text-red-700 dark:hover:text-red-400 text-xs px-2.5 py-1.5 rounded-full font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
 title="Click to remove"
 >
 {it}
 <Trash2 size={11} className="opacity-70" />
 </span>
 ))}
 {interests.length === 0 && (
 <span className="text-xs text-slate-400 dark:text-zinc-500 italic p-1">No custom interests entered. Add some tags above to stand out!</span>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
