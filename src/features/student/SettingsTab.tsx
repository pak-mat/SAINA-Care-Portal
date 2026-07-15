import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import ProfileSettings from './components/ProfileSettings';
import AppearanceSettings from './components/AppearanceSettings';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
 RefreshCw, Download, CheckCircle, Save, Moon, Sun, 
 Linkedin, Twitter, Instagram, Globe, Sparkles, Plus, 
 Trash2, User, CreditCard, Tag, Link2, Settings2, Info
} from 'lucide-react';

import { supabase } from '../../lib/supabase';

const resetDB = () => {};
const exportDB = () => {};

export default function SettingsTab() {
 const { user, updateUser, logout } = useAuth();
 const { darkMode, toggleDarkMode } = useTheme();
 
 const methods = useForm<any>({
 defaultValues: {
 name: user?.name || '',
 studentId: user?.studentId || '',
 bio: user?.bio || 'Saina Care Student active in campus self-care initiatives.',
 bannerStyle: user?.bannerStyle || 'indigo_dusk',
 avatarColor: user?.avatarColor || 'indigo',
 avatarUrl: user?.avatarUrl || '',
 interests: user?.interests || ['Academics', 'Self-Care', 'Peer Support'],
 linkedIn: user?.socialHandles?.linkedIn || '',
 twitter: user?.socialHandles?.twitter || '',
 instagram: user?.socialHandles?.instagram || '',
 website: user?.socialHandles?.website || '',
 uiSound: user?.preferences?.uiSound ?? true,
 notificationsEnabled: user?.preferences?.notificationsEnabled ?? true,
 }
 });

 const { watch, handleSubmit, setValue, formState: { isDirty }, reset } = methods;
 
 const [saved, setSaved] = useState(false);
 
 // Watch values for preview
 const name = watch('name');
 const studentId = watch('studentId');
 const avatarUrl = watch('avatarUrl');
 const bio = watch('bio');
 const bannerStyle = watch('bannerStyle');
 const avatarColor = watch('avatarColor');
 const interests = watch('interests');
 const linkedIn = watch('linkedIn');
 const twitter = watch('twitter');
 const instagram = watch('instagram');
 const website = watch('website');
 const uiSound = watch('uiSound');
 const notificationsEnabled = watch('notificationsEnabled');

 const bannerPresets = [
 { id: 'indigo_dusk', name: 'Indigo Dusk', class: 'bg-gradient-to-r from-violet-600 to-indigo-600' },
 { id: 'emerald_calm', name: 'Emerald Calm', class: 'bg-gradient-to-r from-teal-500 to-emerald-600' },
 { id: 'sunset_glow', name: 'Sunset Glow', class: 'bg-gradient-to-r from-orange-400 via-rose-500 to-amber-500' },
 { id: 'midnight_blue', name: 'Midnight', class: 'bg-gradient-to-r from-slate-900 via-zinc-800 to-slate-900' },
 { id: 'rose_gold', name: 'Rose Gold', class: 'bg-gradient-to-r from-rose-400 to-orange-300' },
 { id: 'cosmic_neon', name: 'Cosmic Neon', class: 'bg-gradient-to-r from-purple-800 via-fuchsia-700 to-indigo-900' }
 ];

 const avatarPresets = [
 { id: 'indigo', bg: 'bg-indigo-600 text-white' },
 { id: 'emerald', bg: 'bg-emerald-600 text-white' },
 { id: 'violet', bg: 'bg-purple-600 text-white' },
 { id: 'rose', bg: 'bg-rose-600 text-white' },
 { id: 'amber', bg: 'bg-amber-500 text-zinc-950' },
 { id: 'blue', bg: 'bg-blue-600 text-white' }
 ];

 const activeBanner = bannerPresets.find(p => p.id === bannerStyle) || bannerPresets[0];
 const activeAvatar = avatarPresets.find(p => p.id === avatarColor) || avatarPresets[0];

  const handleSave = async (formData: any) => {
  const socialHandles = { 
  linkedIn: formData.linkedIn, 
  twitter: formData.twitter, 
  instagram: formData.instagram, 
  website: formData.website 
  };
  
  const dataToUpdate = {
  name: formData.name,
  studentid: formData.studentId, // Map studentId to studentid database column
  bio: formData.bio,
  banner_style: formData.bannerStyle,
  avatar_color: formData.avatarColor,
  interests: formData.interests,
  social_handles: socialHandles,
  preferences: { 
  ...user.preferences, 
  uiSound: formData.uiSound, 
  notificationsEnabled: formData.notificationsEnabled,
  avatarUrl: formData.avatarUrl,
  }
  };

  // Save to Supabase
  const { error } = await supabase
  .from('users')
  .update(dataToUpdate)
  .eq('id', user.id);

  if (error) {
  console.error("Error saving profile:", error);
  return;
  }

  // Update local context
  updateUser({ 
  ...user, 
  name: formData.name,
  studentId: formData.studentId,
  bio: formData.bio,
  bannerStyle: formData.bannerStyle,
  avatarColor: formData.avatarColor,
  interests: formData.interests,
  socialHandles: socialHandles,
  avatarUrl: formData.avatarUrl,
  preferences: dataToUpdate.preferences
  });
  reset(formData);
  setSaved(true);
  setTimeout(() => setSaved(false), 2000);
  };



 const [activeSettingsTab, setActiveSettingsTab] = useState('profile');
 const [showConfirm, setShowConfirm] = useState(false);

 const handleReset = () => {
 setShowConfirm(true);
 };
 const confirmReset = () => {
 resetDB();
 logout();
 };

 const getInitials = (fullName) => {
 if (!fullName) return '?';
 return fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
 };

 return (
 <FormProvider {...methods}>
 <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="max-w-6xl mx-auto pb-12 px-4 sm:px-6">
 <div className="mb-8 overflow-hidden bg-gradient-to-r from-emerald-900 to-slate-900 dark:from-emerald-950 dark:to-black rounded-[1.75rem] p-8 sm:p-10 relative shadow-lg">
 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 opacity-20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/4 pointer-events-none"></div>
 <div className="relative z-10">
 <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-2 tracking-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
 My Social Care Profile
 </h2>
 <p className="text-emerald-100/80 text-sm font-medium mt-1">Customize how you appear to counselors and peer support teams in the applet.</p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
 
 {/* LEFT COLUMN: SOCIAL PROFILE CARD PREVIEW */}
 <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6 space-y-6">
 <div className="glass-panel overflow-hidden shadow-sm">
 
 {/* Banner Background */}
 <div className={`h-32 w-full transition-all duration-300 ${activeBanner.class} relative`}>
 <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-xs font-semibold px-2.5 py-1 rounded-full text-white tracking-wide uppercase">
 Active Student
 </div>
 </div>

 {/* Profile Info Section */}
 <div className="px-5 pb-6 pt-0 relative flex flex-col items-center text-center">
 
 {/* Avatar Shield */}
 <div className={`w-24 h-24 rounded-full -mt-12 border-4 border-white dark:border-zinc-800 flex items-center justify-center font-bold text-2xl shadow-md transition-all duration-300 overflow-hidden ${activeAvatar.bg}`}>
 {avatarUrl ? (
 <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
 ) : (
 getInitials(name || user?.name || 'Student')
 )}
 </div>

 {/* Name & ID */}
 <h4 className="mt-3 text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 focus:outline-none">
 {name || 'Your Full Name'}
 </h4>
 <p className="text-xs text-slate-400 dark:text-zinc-500 font-mono tracking-wider mt-0.5">
 {studentId ? `@id: ${studentId}` : '@student_id_pending'}
 </p>

 {/* Bio block */}
 <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-zinc-300 italic max-w-xs break-words leading-relaxed font-normal bg-slate-50 dark:bg-zinc-900/40 p-3 rounded-lg border border-slate-100 dark:border-zinc-700/30 w-full">
 "{bio || 'No bio written yet. Introduce yourself to your counselors!'}"
 </p>

 {/* Interests / Themes tags */}
 <div className="mt-5 w-full text-left">
 <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest block mb-2">Interests & Needs</span>
 <div className="flex flex-wrap gap-1.5 min-h-[30px]">
 {interests.map((it) => (
 <span 
 key={it} 
 className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60 text-xs px-2.5 py-1 rounded-full font-medium"
 >
 {it}
 </span>
 ))}
 {interests.length === 0 && (
 <span className="text-xs text-slate-400 italic">No interests chosen</span>
 )}
 </div>
 </div>

 {/* Social Channels buttons */}
 <div className="mt-6 pt-5 border-t border-slate-100 dark:border-zinc-700/50 w-full">
 <div className="flex justify-center gap-3">
 {linkedIn ? (
 <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-700 hover:bg-sky-50 dark:hover:bg-sky-950/30 flex items-center justify-center transition-all group cursor-pointer border border-transparent hover:border-sky-200">
 <Linkedin size={14} className="text-slate-500 group-hover:text-sky-600 dark:group-hover:text-sky-400" />
 </span>
 ) : null}
 {twitter ? (
 <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-700 hover:bg-sky-50 dark:hover:bg-slate-900 flex items-center justify-center transition-all group cursor-pointer border border-transparent hover:border-sky-100">
 <Twitter size={14} className="text-slate-500 group-hover:text-sky-500 dark:group-hover:text-sky-400" />
 </span>
 ) : null}
 {instagram ? (
 <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-700 hover:bg-pink-50 dark:hover:bg-pink-950/20 flex items-center justify-center transition-all group cursor-pointer border border-transparent hover:border-pink-200">
 <Instagram size={14} className="text-slate-500 group-hover:text-pink-600 dark:group-hover:text-pink-400" />
 </span>
 ) : null}
 {website ? (
 <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 flex items-center justify-center transition-all group cursor-pointer border border-transparent hover:border-emerald-200">
 <Globe size={14} className="text-slate-500 group-hover:text-emerald-700 dark:group-hover:text-emerald-400" />
 </span>
 ) : null}
 {!linkedIn && !twitter && !instagram && !website && (
 <p className="text-xs text-slate-400 dark:text-zinc-500 italic">No social media links connected</p>
 )}
 </div>
 </div>

 </div>
 </div>
 
 <div className="bg-white dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700/85 p-2 shadow-sm flex flex-col gap-1">
 <button
 onClick={() => setActiveSettingsTab('profile')}
 className={`text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-3 ${activeSettingsTab === 'profile' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-700/50'}`}
 >
 <User size={16} /> Profile Information
 </button>
 <button
 onClick={() => setActiveSettingsTab('social')}
 className={`text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-3 ${activeSettingsTab === 'social' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-700/50'}`}
 >
 <Link2 size={16} /> Social Links
 </button>
 <button
 onClick={() => setActiveSettingsTab('appearance')}
 className={`text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-3 ${activeSettingsTab === 'appearance' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-700/50'}`}
 >
 <Settings2 size={16} /> Appearance & Sounds
 </button>
 <button
 onClick={() => setActiveSettingsTab('advanced')}
 className={`text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-3 ${activeSettingsTab === 'advanced' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-700/50'}`}
 >
 <RefreshCw size={16} /> Advanced & Safety
 </button>
 </div>
 </div>

 {/* RIGHT COLUMN: CONFIGURATION FORMS */}
 <div className="lg:col-span-7 xl:col-span-8 space-y-6">
 
 {activeSettingsTab === 'profile' && (
 <div className="space-y-6">
 {/* Section 1: Profile customization details */}
 <ProfileSettings />
 </div>
 )}

 {activeSettingsTab === 'social' && (
 <div className="space-y-6">
 {/* Section 2: Social media connectivity paths */}
 <div className="glass-panel shadow-sm overflow-hidden">
 <div className="p-6 border-b border-white/50 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/30 flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
 <Link2 size={18} className="text-emerald-600" />
 </div>
 <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">Social Connections</h3>
 </div>

 <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1 tracking-wide">LinkedIn Profile Link</label>
 <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-sm">
 <span className="bg-slate-100 dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-700 px-3 flex items-center justify-center">
 <Linkedin size={14} className="text-sky-600" />
 </span>
 <input 
 type="text" 
 {...methods.register('linkedIn')}
 className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 outline-none focus:bg-white dark:focus:bg-zinc-800 transition-all font-medium"
 placeholder="https://linkedin.com/in/username"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1 tracking-wide">Twitter / X Handle</label>
 <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-sm">
 <span className="bg-slate-100 dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-700 px-3 flex items-center justify-center">
 <Twitter size={14} className="text-slate-700 dark:text-zinc-300" />
 </span>
 <input 
 type="text" 
 {...methods.register('twitter')}
 className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 outline-none focus:bg-white dark:focus:bg-zinc-800 transition-all font-medium"
 placeholder="@username"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1 tracking-wide">Instagram Profile</label>
 <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-sm">
 <span className="bg-slate-100 dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-700 px-3 flex items-center justify-center">
 <Instagram size={14} className="text-rose-500" />
 </span>
 <input 
 type="text" 
 {...methods.register('instagram')}
 className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 outline-none focus:bg-white dark:focus:bg-zinc-800 transition-all font-medium"
 placeholder="@username"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1 tracking-wide">Personal / Class Portfolio</label>
 <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-sm">
 <span className="bg-slate-100 dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-700 px-3 flex items-center justify-center">
 <Globe size={14} className="text-emerald-600" />
 </span>
 <input 
 type="text" 
 {...methods.register('website')}
 className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 outline-none focus:bg-white dark:focus:bg-zinc-800 transition-all font-medium"
 placeholder="https://mywebsite.com"
 />
 </div>
 </div>
 </div>
 </div>
 </div>
 )}

 {activeSettingsTab === 'appearance' && (
 <div className="space-y-6">
 {/* Section 3: Hardware preferences & system tweaks */}
 <div className="glass-panel shadow-sm overflow-hidden">
 <AppearanceSettings 
 darkMode={darkMode} toggleDarkMode={toggleDarkMode}
 uiSound={uiSound} setUiSound={(v: boolean) => setValue('uiSound', v)}
 notificationsEnabled={notificationsEnabled} setNotificationsEnabled={(v: boolean) => setValue('notificationsEnabled', v)}
 />
 </div>
 </div>
 )}

 {activeSettingsTab === 'advanced' && (
 <div className="space-y-6">
 {/* Dev sandbox tools */}
 <div className="bg-white dark:bg-zinc-800 border border-orange-200 dark:border-orange-900/50 rounded-lg shadow-sm overflow-hidden">
 <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border-b border-orange-200 dark:border-orange-900/50">
 <h4 className="text-sm font-bold text-orange-950 dark:text-orange-400 uppercase tracking-wide">Developer Tools & Data Control</h4>
 <p className="text-xs text-orange-700 dark:text-orange-500/80 mt-0.5">Reset or make local backups of Saina Care database.</p>
 </div>
 
 <div className="p-5 flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-zinc-800">
 <button 
 type="button"
 onClick={exportDB}
 className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 dark:bg-zinc-700 dark:hover:bg-zinc-650 text-slate-700 dark:text-zinc-200 px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-transparent shadow-sm"
 >
 <Download size={14} /> Export Backup JSON
 </button>
 
 <div className="w-full sm:w-auto flex items-center">
 {!showConfirm ? (
 <button 
 type="button"
 onClick={handleReset}
 className="w-full bg-white dark:bg-zinc-800 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
 >
 <RefreshCw size={14} /> Reset Engine Data
 </button>
 ) : (
 <div className="flex w-full overflow-hidden rounded-xl border border-red-500 font-semibold text-xs shadow-sm">
 <button 
 type="button"
 onClick={confirmReset}
 className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 transition-colors duration-150"
 >
 Confirm Reset
 </button>
 <button 
 type="button"
 onClick={() => setShowConfirm(false)}
 className="bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 px-4 py-2 transition-colors duration-150 border-l border-red-100 dark:border-zinc-700"
 >
 Cancel
 </button>
 </div>
 )}
 </div>
 </div>
 </div>
 
 <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg shadow-sm overflow-hidden">
 <div className="p-4 bg-slate-50 dark:bg-zinc-900/20 border-b border-slate-200 dark:border-zinc-700/50">
 <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wide">Account Session</h4>
 </div>
 <div className="p-5">
 <button 
 onClick={logout}
 className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow"
 >
 Log Out Securely
 </button>
 </div>
 </div>
 </div>
 )}

 </div>

 </div>
 </motion.div>

 {/* Floating Action Bar for Unsaved Changes */}
 <AnimatePresence>
 {isDirty && (
 <motion.div 
 initial={{ y: 100, opacity: 0 }} 
 animate={{ y: 0, opacity: 1 }} 
 exit={{ y: 100, opacity: 0 }}
 className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-zinc-900 border border-slate-700 dark:border-zinc-700/50 rounded-full px-4 py-3 shadow-2xl flex items-center gap-6"
 >
 <div className="flex items-center gap-2 px-2 text-white">
 <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
 <span className="text-sm font-medium tracking-wide">Unsaved changes</span>
 </div>
 <div className="flex items-center gap-2">
 <button 
 type="button"
 onClick={() => reset()}
 className="text-slate-300 hover:text-white px-4 py-2 text-sm font-medium transition-colors"
 >
 Discard
 </button>
 <button 
 type="button"
 onClick={handleSubmit(handleSave)}
 className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm px-6 py-2 rounded-full flex items-center gap-2 transition-all shadow-lg active:scale-95"
 >
 {saved ? <><CheckCircle size={16} /> Saved</> : <><Save size={16} /> Save changes</>}
 </button>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 </FormProvider>
 );
}
