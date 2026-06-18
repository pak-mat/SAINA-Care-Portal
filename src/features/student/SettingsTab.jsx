import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { updateUserProfile, resetDB, exportDB } from '../../services/localEngine';
import { 
  RefreshCw, Download, CheckCircle, Save, Moon, Sun, 
  Linkedin, Twitter, Instagram, Globe, Sparkles, Plus, 
  Trash2, User, CreditCard, Tag, Link2, Settings2, Info
} from 'lucide-react';

export default function SettingsTab() {
  const { user, updateUser, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  
  const [name, setName] = useState(user?.name || '');
  const [studentId, setStudentId] = useState(user?.studentId || '');
  const [bio, setBio] = useState(user?.bio || 'Saina Care Student active in campus self-care initiatives.');
  const [bannerStyle, setBannerStyle] = useState(user?.bannerStyle || 'indigo_dusk');
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || 'indigo');
  const [interests, setInterests] = useState(user?.interests || ['Academics', 'Self-Care', 'Peer Support']);
  const [newInterest, setNewInterest] = useState('');
  
  const [linkedIn, setLinkedIn] = useState(user?.socialHandles?.linkedIn || '');
  const [twitter, setTwitter] = useState(user?.socialHandles?.twitter || '');
  const [instagram, setInstagram] = useState(user?.socialHandles?.instagram || '');
  const [website, setWebsite] = useState(user?.socialHandles?.website || '');
  
  const [uiSound, setUiSound] = useState(user?.preferences?.uiSound ?? true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.preferences?.notificationsEnabled ?? true);
  const [saved, setSaved] = useState(false);

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

  const handleSave = () => {
    const updatedUser = updateUserProfile(user.id, {
      name,
      studentId,
      bio,
      bannerStyle,
      avatarColor,
      interests,
      socialHandles: { linkedIn, twitter, instagram, website },
      preferences: { ...user.preferences, uiSound, notificationsEnabled }
    });
    if (updatedUser) {
      updateUser(updatedUser);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleAddInterest = (e) => {
    e.preventDefault();
    if (!newInterest.trim()) return;
    if (interests.includes(newInterest.trim())) {
      setNewInterest('');
      return;
    }
    setInterests([...interests, newInterest.trim()]);
    setNewInterest('');
  };

  const handleRemoveInterest = (item) => {
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

  return (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="max-w-6xl mx-auto pb-12 px-4 sm:px-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-zinc-500 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          My Social Care Profile
        </h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 font-medium">Customize how you appear to counselors and peer support teams in the applet.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: SOCIAL PROFILE CARD PREVIEW */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6 space-y-6">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700/85 overflow-hidden shadow-md">
            
            {/* Banner Background */}
            <div className={`h-32 w-full transition-all duration-300 ${activeBanner.class} relative`}>
              <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-xs font-semibold px-2.5 py-1 rounded-full text-white tracking-wide uppercase">
                Active Student
              </div>
            </div>

            {/* Profile Info Section */}
            <div className="px-5 pb-6 pt-0 relative flex flex-col items-center text-center">
              
              {/* Avatar Shield */}
              <div className={`w-24 h-24 rounded-full -mt-12 border-4 border-white dark:border-zinc-800 flex items-center justify-center font-bold text-2xl shadow-md transition-all duration-300 ${activeAvatar.bg}`}>
                {getInitials(name || user?.name || 'Student')}
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
          
          <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700/85 p-2 shadow-sm flex flex-col gap-1">
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
          <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-zinc-700/60 bg-slate-50/50 dark:bg-zinc-900/20 flex items-center gap-2">
              <User size={18} className="text-emerald-600" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Customize Social Presence</h3>
            </div>

            <div className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <User size={12} /> Full Display Name
                  </label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 dark:bg-zinc-900/60 text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-800 transition-all shadow-inner"
                    placeholder="e.g. S91280X"
                  />
                </div>
              </div>

              {/* Bio design */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  My Bio / Introduction
                </label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 160))}
                  className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 dark:bg-zinc-900/60 text-slate-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-800 transition-all shadow-inner h-24 resize-none"
                  placeholder="Introduce yourself to counselors, e.g., 'Freshman studying clinical psychology. Enjoy quiet study spots and mental health advocacy.'"
                />
                <div className="flex justify-between mt-1 text-[11px] text-slate-400 dark:text-zinc-500">
                  <span>Show off your vibe to counselors when booking sessions.</span>
                  <span>{bio.length}/160 characters</span>
                </div>
              </div>

              {/* Gradient Banner and Avatar Colors Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <span className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2.5">
                    Cover Banner Styling
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {bannerPresets.map(preset => (
                      <button 
                        key={preset.id}
                        type="button"
                        onClick={() => setBannerStyle(preset.id)}
                        className={`w-9 h-9 rounded-full ${preset.class} transition-transform flex items-center justify-center border-2 ${bannerStyle === preset.id ? 'border-emerald-600 scale-110 shadow-md ring-2 ring-emerald-500/20' : 'border-transparent hover:scale-105'}`}
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
                    {avatarPresets.map(preset => (
                      <button 
                        key={preset.id}
                        type="button"
                        onClick={() => setAvatarColor(preset.id)}
                        className={`w-9 h-9 rounded-full ${preset.bg} transition-all flex items-center justify-center border-2 ${avatarColor === preset.id ? 'border-slate-800 dark:border-zinc-100 scale-110 ring-2 ring-slate-400/20 shadow' : 'border-transparent hover:scale-105'}`}
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
                  <Tag size={12} /> Add Focus Interests & Skills
                </label>
                <form onSubmit={handleAddInterest} className="flex gap-2 mb-3">
                  <input 
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="e.g. Stress Relief, Meditation, Peer Tutoring"
                    className="flex-1 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 transition-all"
                  />
                  <button 
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Plus size={14} /> Add Choice
                  </button>
                </form>

                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 dark:bg-zinc-900/40 rounded-xl border border-slate-150 dark:border-zinc-700/45 min-h-[50px]">
                  {interests.map((it) => (
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
          )}

          {activeSettingsTab === 'social' && (
            <div className="space-y-6">
          {/* Section 2: Social media connectivity paths */}
          <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-zinc-700/60 bg-slate-50/50 dark:bg-zinc-900/20 flex items-center gap-2">
              <Link2 size={18} className="text-emerald-600" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Social Connections</h3>
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
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
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
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
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
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
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
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
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
          <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-zinc-700/60 bg-slate-50/50 dark:bg-zinc-900/20 flex items-center gap-2">
              <Settings2 size={18} className="text-emerald-600" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Appearance & Settings</h3>
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
                  className={`shrink-0 w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${darkMode ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-600'}`}
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
                  className={`shrink-0 w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${uiSound ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-600'}`}
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
                  className={`shrink-0 w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${notificationsEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-600'}`}
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

            {/* Bottom Form Actions bar */}
            <div className="p-5 border-t border-slate-150 dark:border-zinc-700/60 bg-slate-50 dark:bg-zinc-900/40 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-500 max-w-xs sm:max-w-md">
                <Info size={13} className="shrink-0 text-emerald-600" />
                <span>Saved properties are automatically mirrored onto server.</span>
              </div>
              <button 
                type="button"
                onClick={handleSave}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] shadow"
              >
                {saved ? <><CheckCircle size={16} /> Saved Successfully</> : <><Save size={16} /> Update Profile</>}
              </button>
            </div>
          </div>
          </div>
          )}

          {activeSettingsTab === 'advanced' && (
            <div className="space-y-6">
          {/* Dev sandbox tools */}
          <div className="bg-white dark:bg-zinc-800 border border-orange-200 dark:border-orange-900/50 rounded-2xl shadow-sm overflow-hidden">
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
          
          <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-sm overflow-hidden">
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
  );
}
