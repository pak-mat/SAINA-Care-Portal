import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
 RefreshCw, Download, CheckCircle, Save, Moon, Sun, 
 Linkedin, Twitter, Instagram, Globe, Sparkles, Plus, 
 Trash2, User, HelpCircle, Briefcase, Tag, Link2, Settings2, Info, Upload, Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { supabase } from '../../lib/supabase';

const resetDB = () => {};
const exportDB = () => {};

export default function CounselorSettingsTab() {
 const { t } = useTranslation();
 const { user, updateUser, logout } = useAuth();
 const { darkMode, toggleDarkMode } = useTheme();
 
 const [name, setName] = useState(user?.name || '');
 const [status, setStatus] = useState(user?.status || 'Available');
 const [signature, setSignature] = useState(user?.signature || '');
 const [bio, setBio] = useState(user?.bio || 'Professional Saina Care Counselor specializing in student educational guidance, anxiety, and private therapeutic wellness.');
 const [bannerStyle, setBannerStyle] = useState(user?.bannerStyle || 'blue_calm');
 const [avatarColor, setAvatarColor] = useState(user?.avatarColor || 'blue');
 const [interests, setInterests] = useState(user?.interests || ['Anxiety & Stress', 'Educational Guideline', 'Career Pathway', 'Conflict Resolve']);
 const [newInterest, setNewInterest] = useState('');
 
 const [linkedIn, setLinkedIn] = useState(user?.socialHandles?.linkedIn || '');
 const [twitter, setTwitter] = useState(user?.socialHandles?.twitter || '');
 const [instagram, setInstagram] = useState(user?.socialHandles?.instagram || '');
 const [website, setWebsite] = useState(user?.socialHandles?.website || '');
 
 const [uiSound, setUiSound] = useState(user?.preferences?.uiSound ?? true);
 const [notificationsEnabled, setNotificationsEnabled] = useState(user?.preferences?.notificationsEnabled ?? true);
 const [saved, setSaved] = useState(false);
  
 const [avatarUrl, setAvatarUrl] = useState(user?.preferences?.avatarUrl || '');
 const [uploading, setUploading] = useState(false);

  const isDirty = 
    name !== (user?.name || '') ||
    status !== (user?.status || 'Available') ||
    signature !== (user?.signature || '') ||
    bio !== (user?.bio || 'Professional Saina Care Counselor specializing in student educational guidance, anxiety, and private therapeutic wellness.') ||
    bannerStyle !== (user?.bannerStyle || 'blue_calm') ||
    avatarColor !== (user?.avatarColor || 'blue') ||
    JSON.stringify(interests) !== JSON.stringify(user?.interests || ['Anxiety & Stress', 'Educational Guideline', 'Career Pathway', 'Conflict Resolve']) ||
    linkedIn !== (user?.socialHandles?.linkedIn || '') ||
    twitter !== (user?.socialHandles?.twitter || '') ||
    instagram !== (user?.socialHandles?.instagram || '') ||
    website !== (user?.socialHandles?.website || '') ||
    uiSound !== (user?.preferences?.uiSound ?? true) ||
    notificationsEnabled !== (user?.preferences?.notificationsEnabled ?? true) ||
    avatarUrl !== (user?.preferences?.avatarUrl || '');

  const handleDiscard = () => {
    setName(user?.name || '');
    setStatus(user?.status || 'Available');
    setSignature(user?.signature || '');
    setBio(user?.bio || 'Professional Saina Care Counselor specializing in student educational guidance, anxiety, and private therapeutic wellness.');
    setBannerStyle(user?.bannerStyle || 'blue_calm');
    setAvatarColor(user?.avatarColor || 'blue');
    setInterests(user?.interests || ['Anxiety & Stress', 'Educational Guideline', 'Career Pathway', 'Conflict Resolve']);
    setLinkedIn(user?.socialHandles?.linkedIn || '');
    setTwitter(user?.socialHandles?.twitter || '');
    setInstagram(user?.socialHandles?.instagram || '');
    setWebsite(user?.socialHandles?.website || '');
    setUiSound(user?.preferences?.uiSound ?? true);
    setNotificationsEnabled(user?.preferences?.notificationsEnabled ?? true);
    setAvatarUrl(user?.preferences?.avatarUrl || '');
  };

 const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
   try {
     setUploading(true);
     if (!event.target.files || event.target.files.length === 0) {
       throw new Error('You must select an image to upload.');
     }
     const file = event.target.files[0];
     const fileExt = file.name.split('.').pop();
     const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
     const filePath = `${fileName}`;
     const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
     if (uploadError) throw uploadError;
     const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
     setAvatarUrl(data.publicUrl);
   } catch (error: any) {
     alert(error.message || 'Error uploading image.');
   } finally {
     setUploading(false);
   }
 };

 const bannerPresets = [
 { id: 'blue_calm', name: 'Emerald Calm', class: 'bg-gradient-to-r from-teal-500 to-blue-600' },
 { id: 'indigo_dusk', name: 'Indigo Dusk', class: 'bg-gradient-to-r from-violet-600 to-indigo-600' },
 { id: 'sunset_glow', name: 'Sunset Glow', class: 'bg-gradient-to-r from-orange-400 via-rose-500 to-amber-500' },
 { id: 'midnight_blue', name: 'Midnight', class: 'bg-gradient-to-r from-slate-900 via-zinc-800 to-slate-900' },
 { id: 'rose_gold', name: 'Rose Gold', class: 'bg-gradient-to-r from-rose-400 to-orange-300' },
 { id: 'cosmic_neon', name: 'Cosmic Neon', class: 'bg-gradient-to-r from-purple-800 via-fuchsia-700 to-indigo-900' }
 ];

 const avatarPresets = [
 { id: 'blue', bg: 'bg-blue-600 text-white' },
 { id: 'indigo', bg: 'bg-indigo-600 text-white' },
 { id: 'violet', bg: 'bg-purple-600 text-white' },
 { id: 'rose', bg: 'bg-rose-600 text-white' },
 { id: 'amber', bg: 'bg-amber-500 text-zinc-950' },
 { id: 'blue', bg: 'bg-blue-600 text-white' }
 ];

 const activeBanner = bannerPresets.find(p => p.id === bannerStyle) || bannerPresets[0];
 const activeAvatar = avatarPresets.find(p => p.id === avatarColor) || avatarPresets[0];

 const handleSave = async () => {
 const dataToUpdate = {
 name,
 status,
 bio,
 bannerStyle,
 avatarColor,
 interests,
 socialHandles: { linkedIn, twitter, instagram, website },
 preferences: { ...user.preferences, uiSound, notificationsEnabled, avatarUrl }
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
 updateUser({ ...user, ...dataToUpdate });
 setSaved(true);
 setTimeout(() => setSaved(false), 2000);
 };

 const handleAddSpecialty = (e) => {
 e.preventDefault();
 if (!newInterest.trim()) return;
 if (interests.includes(newInterest.trim())) {
 setNewInterest('');
 return;
 }
 setInterests([...interests, newInterest.trim()]);
 setNewInterest('');
 };

 const handleRemoveSpecialty = (item) => {
 setInterests(interests.filter(i => i !== item));
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

 const statuses = ['Available', 'Busy', 'Away'];

 return (
 <>
 <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="max-w-6xl mx-auto pb-12 px-4 sm:px-6">
 <div className="mb-8 overflow-hidden bg-gradient-to-r from-emerald-900 to-slate-900 dark:from-emerald-950 dark:to-black rounded-[1.75rem] p-8 sm:p-10 relative shadow-lg">
 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 opacity-20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/4 pointer-events-none"></div>
 <div className="relative z-10">
 <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-2 tracking-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
 {t('counselor_settings.title')}
 </h2>
 <p className="text-emerald-100/80 text-sm font-medium mt-1">{t('counselor_settings.subtitle')}</p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
 
 {/* LEFT COLUMN: SOCIAL PROFILE CARD PREVIEW */}
 <div className="lg:col-span-4 xl:col-span-4 lg:sticky lg:top-6 space-y-6">
 <div className="glass-panel overflow-hidden shadow-sm">
 
 {/* Banner Background */}
 <div className={`h-32 w-full transition-all duration-300 ${activeBanner.class} relative`}>
 <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-xs font-semibold px-2.5 py-1 rounded-full text-white tracking-wide uppercase">
 Care Counselor
 </div>
 </div>

 {/* Profile Info Section */}
 <div className="px-5 pb-6 pt-0 relative flex flex-col items-center text-center">
 
 {/* Avatar Shield */}
 <div className={`w-24 h-24 rounded-full -mt-12 border-4 border-white dark:border-zinc-800 flex items-center justify-center font-bold text-2xl shadow-md transition-all duration-300 overflow-hidden relative group ${!avatarUrl ? activeAvatar.bg : 'bg-slate-200 dark:bg-zinc-800'}`}>
   {avatarUrl ? (
     <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
   ) : (
     getInitials(name || user?.name || 'Counselor')
   )}
 </div>

 {/* Status Badge */}
 <div className="mt-2.5">
 <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize select-none shadow-sm
 ${status === 'Available' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200/50' : 
 status === 'Busy' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50' : 
 'bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'}`}>
 <span className={`w-1.5 h-1.5 rounded-full ${status === 'Available' ? 'bg-blue-500' : status === 'Busy' ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
 {status}
 </span>
 </div>

 {/* Name & ID */}
 <h4 className="mt-3 text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 focus:outline-none">
 {name || 'Counselor Name'}
 </h4>
 <p className="text-xs text-slate-400 dark:text-zinc-500 tracking-wider">
 Certified Professional Counselor
 </p>

 {/* Bio block */}
 <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-zinc-300 italic max-w-xs break-words leading-relaxed font-normal bg-slate-50 dark:bg-zinc-900/40 p-3 rounded-lg border border-slate-100 dark:border-zinc-700/30 w-full">
 "{bio || 'No counselor bio customized yet.'}"
 </p>

 {/* Specialty Areas */}
 <div className="mt-5 w-full text-left">
 <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest block mb-2">My Specialty Areas</span>
 <div className="flex flex-wrap gap-1.5 min-h-[30px]">
 {interests.map((it) => (
 <span 
 key={it} 
 className="bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-900/60 text-xs px-2.5 py-1 rounded-full font-medium"
 >
 {it}
 </span>
 ))}
 {interests.length === 0 && (
 <span className="text-xs text-slate-400 italic">No specialties chosen</span>
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
 <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-700 hover:bg-blue-50 dark:hover:bg-blue-950/20 flex items-center justify-center transition-all group cursor-pointer border border-transparent hover:border-blue-200">
 <Globe size={14} className="text-slate-500 group-hover:text-blue-700 dark:group-hover:text-blue-400" />
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
 className={`text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-3 ${activeSettingsTab === 'profile' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-700/50'}`}
 >
 <User size={16} /> {t('settings.tab_profile')}
 </button>
 <button
 onClick={() => setActiveSettingsTab('social')}
 className={`text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-3 ${activeSettingsTab === 'social' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-700/50'}`}
 >
 <Link2 size={16} /> {t('settings.tab_social')}
 </button>
 <button
 onClick={() => setActiveSettingsTab('appearance')}
 className={`text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-3 ${activeSettingsTab === 'appearance' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-700/50'}`}
 >
 <Settings2 size={16} /> {t('settings.tab_appearance')}
 </button>
 <button
 onClick={() => setActiveSettingsTab('advanced')}
 className={`text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-3 ${activeSettingsTab === 'advanced' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-700/50'}`}
 >
 <RefreshCw size={16} /> {t('settings.tab_advanced')}
 </button>
 </div>
 </div>

 {/* RIGHT COLUMN: CONFIGURATION FORMS */}
 <div className="lg:col-span-8 xl:col-span-8 space-y-6">
 
 {activeSettingsTab === 'profile' && (
 <div className="space-y-6">
 {/* Section 1: Profile customization details */}
 <div className="glass-panel shadow-sm overflow-hidden">
 <div className="p-6 border-b border-white/50 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/30 flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
 <User size={18} className="text-emerald-600" />
 </div>
 <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">{t('counselor_settings.profile_card')}</h3>
 </div>

 <div className="p-6 space-y-6">
                
                {/* Profile Picture Upload Section */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-700">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center overflow-hidden relative group ${!avatarUrl ? activeAvatar.bg : 'bg-slate-200 dark:bg-zinc-800'}`}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-lg">{getInitials(name || user?.name || 'Counselor')}</span>
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
 <User size={12} /> {t('counselor_settings.name_label')}
 </label>
 <input 
 type="text" 
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-zinc-900/60 text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-800 transition-all shadow-inner"
 placeholder="e.g. Encik Ali"
 />
 </div>
 
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
 {t('counselor_settings.status_label')}
 </label>
 <div className="flex gap-2 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl inline-flex w-full">
 {statuses.map(s => (
 <button
 type="button"
 key={s}
 onClick={() => setStatus(s)}
 className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all outline-none
 ${status === s 
 ? 'bg-white dark:bg-zinc-800 text-slate-950 dark:text-zinc-100 shadow' 
 : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-zinc-805/50'
 }
 `}
 >
 {s}
 </button>
 ))}
 </div>
 </div>
 </div>

 {/* Bio design */}
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
 {t('counselor_settings.bio_label')}
 </label>
 <textarea 
 value={bio}
 onChange={(e) => setBio(e.target.value.slice(0, 160))}
 className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-zinc-900/60 text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-800 transition-all shadow-inner h-24 resize-none"
 placeholder="Introduce yourself. What is your counseling philosophy?"
 />
 <div className="flex justify-between mt-1 text-[11px] text-slate-400 dark:text-zinc-500">
 <span>This bio will assist students who are selecting care counselors.</span>
 <span>{bio.length}/160 characters</span>
 </div>
 </div>

 {/* Gradient Banner and Avatar Colors Presets */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
 <div>
 <span className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2.5">
 {t('counselor_settings.banner_label')}
 </span>
 <div className="flex flex-wrap gap-2.5">
 {bannerPresets.map(preset => (
 <button 
 key={preset.id}
 type="button"
 onClick={() => setBannerStyle(preset.id)}
 className={`w-9 h-9 rounded-full ${preset.class} transition-flex items-center justify-center border-2 ${bannerStyle === preset.id ? 'border-blue-600 scale-110 shadow-md ring-2 ring-blue-500/20' : 'border-transparent '}`}
 title={preset.name}
 >
 {bannerStyle === preset.id && <Sparkles size={11} className="text-white" />}
 </button>
 ))}
 </div>
 </div>

 <div>
 <span className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2.5">
 {t('counselor_settings.avatar_label')}
 </span>
 <div className="flex flex-wrap gap-2.5">
 {avatarPresets.map(preset => (
 <button 
 key={preset.id}
 type="button"
 onClick={() => setAvatarColor(preset.id)}
 className={`w-9 h-9 rounded-full ${preset.bg} transition-all flex items-center justify-center border-2 ${avatarColor === preset.id ? 'border-slate-800 dark:border-zinc-100 scale-110 ring-2 ring-slate-400/20 shadow' : 'border-transparent '}`}
 >
 {avatarColor === preset.id && <CheckCircle size={12} />}
 </button>
 ))}
 </div>
 </div>
 </div>

 {/* Tags Interactivity */}
 <div className="pt-2">
 <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
 <Tag size={12} /> {t('counselor_settings.specialties_label')}
 </label>
 <form onSubmit={handleAddSpecialty} className="flex gap-2 mb-3">
 <input 
 type="text"
 value={newInterest}
 onChange={(e) => setNewInterest(e.target.value)}
 placeholder="e.g. Cognitive Therapy, Teen Anxiety, Career Coaching"
 className="flex-1 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 transition-all"
 />
 <button 
 type="submit"
 className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 rounded-xl flex items-center gap-1.5 transition-colors"
 >
 <Plus size={14} /> Add Focus
 </button>
 </form>

 <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 dark:bg-zinc-900/40 rounded-xl border border-slate-150 dark:border-zinc-700/45 min-h-[50px]">
 {interests.map((it) => (
 <span 
 key={it}
 onClick={() => handleRemoveSpecialty(it)}
 className="bg-slate-200 dark:bg-zinc-700 hover:bg-red-100 dark:hover:bg-red-950/40 text-slate-700 dark:text-zinc-300 hover:text-red-700 dark:hover:text-red-400 text-xs px-2.5 py-1.5 rounded-full font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
 title="Click to remove"
 >
 {it}
 <Trash2 size={11} className="opacity-70" />
 </span>
 ))}
 {interests.length === 0 && (
 <span className="text-xs text-slate-400 dark:text-zinc-500 italic p-1">No custom specialties entered. Add focus tags to display on student forms.</span>
 )}
 </div>
 </div>

 </div>
 </div>

 {/* Section 2: Counselor Automated Signature Template */}
 <div className="glass-panel shadow-sm overflow-hidden">
 <div className="p-6 border-b border-white/50 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/30 flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
 <Briefcase size={18} className="text-emerald-600" />
 </div>
 <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">{t('counselor_settings.signature_title')}</h3>
 </div>

 <div className="p-6">
 <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">{t('counselor_settings.signature_label')}</label>
 <p className="text-xs text-slate-500 dark:text-zinc-400 mb-2.5">This credentials text will be appended automatically to resolved advice feedback reports.</p>
 <textarea 
 value={signature}
 onChange={(e) => setSignature(e.target.value)}
 className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-zinc-900/60 text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-800 transition-all shadow-inner h-20"
 placeholder="e.g. Lead Clinical Psychologist, Saina Care Mental Health Unit..."
 />
 </div>
 </div>
 </div>
 )}

 {activeSettingsTab === 'social' && (
 <div className="space-y-6">
 {/* Section 3: Social media connectivity paths */}
 <div className="glass-panel shadow-sm overflow-hidden">
 <div className="p-6 border-b border-white/50 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/30 flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
 <Link2 size={18} className="text-emerald-600" />
 </div>
 <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">{t('settings.social_connections')}</h3>
 </div>

 <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1 tracking-wide">{t('settings.linkedin_label')}</label>
 <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-sm">
 <span className="bg-slate-100 dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-700 px-3 flex items-center justify-center">
 <Linkedin size={14} className="text-sky-600" />
 </span>
 <input 
 type="text" 
 value={linkedIn}
 onChange={(e) => setLinkedIn(e.target.value)}
 className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 outline-none focus:bg-white dark:focus:bg-zinc-800 transition-all font-medium"
 placeholder="https://linkedin.com/in/username"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1 tracking-wide">{t('settings.twitter_label')}</label>
 <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-sm">
 <span className="bg-slate-100 dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-700 px-3 flex items-center justify-center">
 <Twitter size={14} className="text-slate-700 dark:text-zinc-300" />
 </span>
 <input 
 type="text" 
 value={twitter}
 onChange={(e) => setTwitter(e.target.value)}
 className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 outline-none focus:bg-white dark:focus:bg-zinc-800 transition-all font-medium"
 placeholder="@username"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1 tracking-wide">{t('settings.instagram_label')}</label>
 <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-sm">
 <span className="bg-slate-100 dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-700 px-3 flex items-center justify-center">
 <Instagram size={14} className="text-rose-500" />
 </span>
 <input 
 type="text" 
 value={instagram}
 onChange={(e) => setInstagram(e.target.value)}
 className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 outline-none focus:bg-white dark:focus:bg-zinc-800 transition-all font-medium"
 placeholder="@username"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1 tracking-wide">{t('settings.website_label')}</label>
 <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-sm">
 <span className="bg-slate-100 dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-700 px-3 flex items-center justify-center">
 <Globe size={14} className="text-blue-600" />
 </span>
 <input 
 type="text" 
 value={website}
 onChange={(e) => setWebsite(e.target.value)}
 className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 outline-none focus:bg-white dark:focus:bg-zinc-800 transition-all font-medium"
 placeholder="https://myfaculty.com/username"
 />
 </div>
 </div>
 </div>
 </div>
 </div>
 )}

 {activeSettingsTab === 'appearance' && (
 <div className="space-y-6">
 {/* Section 4: Physical preferences & system tweaks */}
 <div className="glass-panel shadow-sm overflow-hidden">
 <div className="p-6 border-b border-white/50 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/30 flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
 <Settings2 size={18} className="text-emerald-600" />
 </div>
 <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">Appearance & Settings</h3>
 </div>

 <div className="p-6 space-y-6">
 <div className="flex items-center justify-between gap-4 max-w-xl">
 <div>
 <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">Dark Application Theme</p>
 <p className="text-xs text-slate-400 dark:text-zinc-500">Enable deep eye-friendly dark colors for evening sessions</p>
 </div>
 <motion.button 
 type="button"
 onClick={toggleDarkMode}
 className={`shrink-0 w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${darkMode ? 'bg-blue-600' : 'bg-slate-300 dark:bg-zinc-600'}`}
 layout
 >
 <motion.div 
 className="bg-white w-4 h-4 rounded-full shadow"
 layout
 initial={false}
 animate={{ x: darkMode ? 24 : 0 }}
 />
 </motion.button>
 </div>

 <div className="flex items-center justify-between gap-4 max-w-xl border-t border-slate-100 dark:border-zinc-700/40 pt-4">
 <div>
 <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">Haptic UI Chimes</p>
 <p className="text-xs text-slate-400 dark:text-zinc-500">Triggers calming, subtle therapeutic chimes on key events</p>
 </div>
 <motion.button 
 type="button"
 onClick={() => setUiSound(!uiSound)}
 className={`shrink-0 w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${uiSound ? 'bg-blue-600' : 'bg-slate-300 dark:bg-zinc-600'}`}
 layout
 >
 <motion.div 
 className="bg-white w-4 h-4 rounded-full shadow"
 layout
 initial={false}
 animate={{ x: uiSound ? 24 : 0 }}
 />
 </motion.button>
 </div>

 <div className="flex items-center justify-between gap-4 max-w-xl border-t border-slate-100 dark:border-zinc-700/40 pt-4">
 <div>
 <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">Live Workspace Signals</p>
 <p className="text-xs text-slate-400 dark:text-zinc-500">Pop dynamic notifications and chat updates automatically</p>
 </div>
 <motion.button 
 type="button"
 onClick={() => setNotificationsEnabled(!notificationsEnabled)}
 className={`shrink-0 w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${notificationsEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-zinc-600'}`}
 layout
 >
 <motion.div 
 className="bg-white w-4 h-4 rounded-full shadow"
 layout
 initial={false}
 animate={{ x: notificationsEnabled ? 24 : 0 }}
 />
 </motion.button>
 </div>
 </div>

 </div>
 </div>
 )}

 {activeSettingsTab === 'advanced' && (
 <div className="space-y-6">
 {/* Dev sandbox tools */}
 <div className="bg-white dark:bg-zinc-800 border border-orange-200 dark:border-orange-900/50 rounded-xl shadow-sm overflow-hidden">
 <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border-b border-orange-200 dark:border-orange-900/50">
 <h4 className="text-sm font-bold text-orange-950 dark:text-orange-400 uppercase tracking-wide">{t('settings.developer_tools')}</h4>
 <p className="text-xs text-orange-700 dark:text-orange-500/80 mt-0.5">{t('settings.developer_desc')}</p>
 </div>
 
 <div className="p-5 flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-zinc-800">
 <button 
 type="button"
 onClick={exportDB}
 className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 dark:bg-zinc-700 dark:hover:bg-zinc-650 text-slate-700 dark:text-zinc-200 px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-transparent shadow-sm"
 >
 <Download size={14} /> {t('settings.export_backup')}
 </button>
 
 <div className="w-full sm:w-auto flex items-center">
 {!showConfirm ? (
 <button 
 type="button"
 onClick={handleReset}
 className="w-full bg-white dark:bg-zinc-800 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
 >
 <RefreshCw size={14} /> {t('settings.reset_engine')}
 </button>
 ) : (
 <div className="flex w-full overflow-hidden rounded-xl border border-red-500 font-semibold text-xs shadow-sm">
 <button 
 type="button"
 onClick={confirmReset}
 className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 transition-colors duration-150"
 >
 {t('settings.confirm_reset')}
 </button>
 <button 
 type="button"
 onClick={() => setShowConfirm(false)}
 className="bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 px-4 py-2 transition-colors duration-150 border-l border-red-100 dark:border-zinc-700"
 >
 {t('common.cancel')}
 </button>
 </div>
 )}
 </div>
 </div>
 </div>
 
 <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg shadow-sm overflow-hidden">
 <div className="p-4 bg-slate-50 dark:bg-zinc-900/20 border-b border-slate-200 dark:border-zinc-700/50">
 <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wide">{t('settings.account_session')}</h4>
 </div>
 <div className="p-5">
 <button 
 onClick={logout}
 className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow"
 >
 {t('settings.logout_securely')}
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
  <span className="text-sm font-medium tracking-wide">{t('settings.unsaved_changes')}</span>
  </div>
  <div className="flex items-center gap-2">
  <button 
  type="button"
  onClick={handleDiscard}
  className="text-slate-300 hover:text-white px-4 py-2 text-sm font-medium transition-colors"
  >
  {t('settings.discard')}
  </button>
  <button 
  type="button"
  onClick={handleSave}
  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2 rounded-full flex items-center gap-2 transition-all shadow-lg active:scale-95"
  >
  {saved ? <><CheckCircle size={16} /> {t('settings.saved')}</> : <><Save size={16} /> {t('settings.save_changes')}</>}
  </button>
  </div>
  </motion.div>
  )}
  </AnimatePresence>
  </>
 );
}
