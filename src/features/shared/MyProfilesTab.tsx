// @ts-nocheck
// File: src/features/shared/MyProfilesTab.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
 User, Link2, Sparkles, Tag, Search, Compass, Shield, Plus, X, Check, Edit2, 
 Linkedin, Twitter, Instagram, Globe, HelpCircle, MessageSquare, Calendar, ChevronRight, CheckCircle, Info, Heart,
 Users, UserPlus, UserCheck, Send, MessageCircle, Smile, Trash2, ArrowLeft, Award, ThumbsUp, MessageSquarePlus,
 LayoutList, ImagePlus, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getRelativeTime } from '../../utils/time';
import { useDatabaseEvent } from '../../hooks/useDatabaseEvent';
import { useDirectory, useSocialNetwork, usePresence } from '../../hooks/useSocial';
import { useGroupChats, useGroupMessages, useDirectMessages } from '../../hooks/useGroupChat';
import { useInView } from 'react-intersection-observer';

export default function MyProfilesTab({ onTabChange }) {
 const { user, updateUser } = useAuth();
 
 // Double sub-tab state inside My Profiles: 'card', 'directory', 'messenger'
 const [subTab, setSubTab] = useState('card');
 const [saved, setSaved] = useState(false);

 // Edit fields
 const [name, setName] = useState(user?.name || '');
 const [bio, setBio] = useState(user?.bio || '');
 const [bannerStyle, setBannerStyle] = useState(user?.bannerStyle || 'indigo_dusk');
 const [avatarColor, setAvatarColor] = useState(user?.avatarColor || 'indigo');
 const [status, setStatus] = useState(user?.status || 'Available');
 const [interests, setInterests] = useState(user?.interests || []);
 const [newInterestInput, setNewInterestInput] = useState('');
 
 // Social states
 const [linkedIn, setLinkedIn] = useState(user?.socialHandles?.linkedIn || '');
 const [twitter, setTwitter] = useState(user?.socialHandles?.twitter || '');
 const [instagram, setInstagram] = useState(user?.socialHandles?.instagram || '');
 const [website, setWebsite] = useState(user?.socialHandles?.website || '');
 const [viewingProfile, setViewingProfile] = useState<any>(null);

 // Directory search/filtering states
 const [searchQuery, setSearchQuery] = useState('');
 const [filterRole, setFilterRole] = useState('all');
 const [selectedTagFilter, setSelectedTagFilter] = useState('');
 
 // Dynamic social engine hooks powered by Supabase & React Query
 const { data: directoryData } = useDirectory();
 const directory = directoryData?.filter(u => u.id !== user?.id) || [];
 
 const { isUserOnline } = usePresence();

 const { 
 friends: friendsData, 
 requestsReceived, 
 requestsSent, 
 kudosCount,
 sendRequest, 
 cancelRequest,
 acceptRequest, 
 declineRequest, 
 removeFriend, 
 sendKudos 
 } = useSocialNetwork(user?.id);

 const { ref: loadMoreRef, inView } = useInView();

 // Derive IDs for the UI to remain identical
 const friendsIds = friendsData?.map(f => f.user_id === user?.id ? f.friend_id : f.user_id) || [];
 const requestsReceivedIds = requestsReceived?.map(r => r.sender_id) || [];
 const requestsSentIds = requestsSent?.map(r => r.receiver_id) || [];
 const myKudosCount = kudosCount || 0;

 // Sync edits if user changes in background
 useEffect(() => {
 if (user) {
 setName(user.name || '');
 setBio(user.bio || '');
 setBannerStyle(user.bannerStyle || 'indigo_dusk');
 setAvatarColor(user.avatarColor || 'indigo');
 setStatus(user.status || 'Available');
 setInterests(user.interests || []);
 setLinkedIn(user.socialHandles?.linkedIn || '');
 setTwitter(user.socialHandles?.twitter || '');
 setInstagram(user.socialHandles?.instagram || '');
 setWebsite(user.socialHandles?.website || '');
 }
 }, [user]);

 // UI Sound effect synthesizer
 const playBeep = (freq = 800, type = 'sine', duration = 0.08) => {
 if (!(user?.preferences?.uiSound ?? true)) return;
 try {
 const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
 const oscillator = audioCtx.createOscillator();
 const gainNode = audioCtx.createGain();
 
 oscillator.type = type;
 oscillator.frequency.value = freq;
 
 gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
 gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
 
 oscillator.connect(gainNode);
 gainNode.connect(audioCtx.destination);
 
 oscillator.start();
 oscillator.stop(audioCtx.currentTime + duration);
 } catch (e) {
 // AudioContext might be blocked by browser policy
 }
 };

 const bannerPresets = [
 { id: 'indigo_dusk', name: 'Indigo Dusk', class: 'bg-gradient-to-r from-violet-600 to-indigo-600' },
 { id: 'emerald_calm', name: 'Emerald Calm', class: 'bg-gradient-to-r from-teal-500 to-emerald-600' },
 { id: 'sunset_glow', name: 'Sunset Glow', class: 'bg-gradient-to-r from-orange-400 via-rose-500 to-amber-500' },
 { id: 'midnight_blue', name: 'Midnight', class: 'bg-gradient-to-r from-slate-900 via-zinc-800 to-slate-900' },
 { id: 'rose_gold', name: 'Rose Gold', class: 'bg-gradient-to-r from-rose-400 to-orange-300' },
 { id: 'cosmic_neon', name: 'Cosmic Neon', class: 'bg-gradient-to-r from-purple-800 via-fuchsia-700 to-indigo-900' }
 ];

 const avatarPresets = [
 { id: 'indigo', name: 'Indigo Light', bg: 'bg-indigo-600 text-white' },
 { id: 'emerald', name: 'Emerald Calmer', bg: 'bg-emerald-600 text-white' },
 { id: 'violet', name: 'Violet Velvet', bg: 'bg-purple-600 text-white' },
 { id: 'rose', name: 'Blooming Rose', bg: 'bg-rose-600 text-white' },
 { id: 'amber', name: 'Warm Amber', bg: 'bg-amber-500 text-zinc-950' },
 { id: 'blue', name: 'Oceanic Blue', bg: 'bg-blue-600 text-white' }
 ];

 // Bio suggestions presets
 const bioSuggestions = {
 student: [
 "Focused on engineering a positive study-life balance. Big seeker of mindfulness practices and hot herbal teas.",
 "Dedicated peer-wellness advocate. Loving campus self-care hours, peer support circles, and positive writing.",
 "Just trying to navigate finals week with a healthy mental state! Saina Peer Supporter and active hiker.",
 "Mindfulness practitioner, studying computer science and trying to get 8 hours of sleep. Coffee enthusiast.",
 "Passionate about environmental sciences and clinical psychology. Saina student trying to grow every day."
 ],
 counselor: [
 "Licensed clinical counselor committed to supporting students' resilience. Let's work on self-compassion tools together.",
 "Saina Care counselor focused on academic growth, stress management, and anxiety guidance models.",
 "Saina clinical specialist dedicated to fostering positive mental frameworks, peer guidance, and mental health pathways.",
 "Experienced advisor offering empathetic support in distress management and career/academic optimization strategies.",
 "Compassionate mental wellness coach specializing in behavioral therapy, anxiety relaxation, and peer mediation."
 ]
 };

 const getRandomBio = () => {
 playBeep(900, 'triangle', 0.12);
 const category = user?.role === 'counselor' ? 'counselor' : 'student';
 const list = bioSuggestions[category];
 const randomIndex = Math.floor(Math.random() * list.length);
 setBio(list[randomIndex]);
 };

 const getBannerClass = (id) => {
 return bannerPresets.find(p => p.id === id)?.class || 'bg-gradient-to-r from-violet-600 to-indigo-600';
 };

 const getAvatarClass = (id) => {
 return avatarPresets.find(p => p.id === id)?.bg || 'bg-indigo-600 text-white';
 };

 const handleSave = (e) => {
 e.preventDefault();
 playBeep(1100, 'sine', 0.15);
 
 // Save to DB
 const updatedUser = updateUserProfile(user.id, {
 name,
 bio,
 bannerStyle,
 avatarColor,
 status,
 interests,
 socialHandles: { linkedIn, twitter, instagram, website }
 });

 if (updatedUser) {
 updateUser(updatedUser);
 setSaved(true);
 setIsEditing(false);
 setTimeout(() => setSaved(false), 3000);
 window.dispatchEvent(new Event('db_updated'));
 }
 };

 const addInterest = (e) => {
 e.preventDefault();
 const tag = newInterestInput.trim();
 if (tag && !interests.includes(tag)) {
 playBeep(850, 'sine', 0.05);
 setInterests([...interests, tag]);
 }
 setNewInterestInput('');
 };

 const removeInterest = (tag) => {
 playBeep(650, 'sine', 0.05);
 setInterests(interests.filter(i => i !== tag));
 };

 const getInitials = (fullName) => {
 if (!fullName) return '?';
 return fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
 };

 // Directory Filter calculations
 const filteredDirectory = directory.filter(u => {
 const query = searchQuery.toLowerCase();
 const matchesSearch = 
 u.name.toLowerCase().includes(query) || 
 (u.bio || '').toLowerCase().includes(query) ||
 (u.role || '').toLowerCase().includes(query) ||
 (u.studentId || '').includes(query);
 
 const matchesRole = filterRole === 'all' || u.role === filterRole;
 const matchesTag = !selectedTagFilter || (u.interests || []).includes(selectedTagFilter);

 return matchesSearch && matchesRole && matchesTag;
 });

 // Extract all interests in directory for filter chips
 const allUniqueTags = Array.from(
 new Set(directory.flatMap(u => u.interests || []))
 ).slice(0, 10);

 // Social action helpers (Friend Requests)
 const handleFriendRequestAction = (targetId, action, e) => {
 if (e) e.stopPropagation();
 if (!user) return;
 
 if (action === 'send') {
 sendRequest.mutate(targetId);
 playBeep(950, 'sine', 0.1);
 } else if (action === 'cancel') {
 cancelRequest.mutate(targetId);
 playBeep(600, 'triangle', 0.1);
 } else if (action === 'accept') {
 acceptRequest.mutate(targetId);
 playBeep(1100, 'sine', 0.15);
 } else if (action === 'decline') {
 declineRequest.mutate(targetId);
 playBeep(550, 'triangle', 0.1);
 } else if (action === 'remove') {
 removeFriend.mutate(targetId);
 playBeep(450, 'triangle', 0.15);
 }
 };

 const handleToggleKudos = (targetId, e) => {
 if (e) e.stopPropagation();
 if (!user) return;
 sendKudos.mutate(targetId);
 playBeep(1200, 'sine', 0.12);
 };

 const isStudent = user?.role === 'student';
 const themeColor = isStudent ? 'emerald' : 'blue';

 return (
 <motion.div 
 initial={{ opacity: 0, y: 15 }} 
 animate={{ opacity: 1, y: 0 }} 
 exit={{ opacity: 0, y: -15 }}
 className={`max-w-none w-full ${subTab === 'messenger' ? 'h-full flex-1 flex flex-col min-h-0 overflow-hidden pb-1 sm:pb-2' : 'h-full flex-1 flex flex-col min-h-0 overflow-y-auto pb-6 md:pb-12'}`}
 >
 {/* Tab Header Section */}
 <div className={`mb-8 overflow-hidden bg-gradient-to-r ${isStudent ? 'from-emerald-900 to-slate-900 dark:from-emerald-950 dark:to-black' : 'from-blue-900 to-slate-900 dark:from-blue-950 dark:to-black'} rounded-[1.75rem] p-8 sm:p-10 relative shadow-lg shrink-0 mx-2 mt-2 sm:mx-4 sm:mt-4`}>
 <div className={`absolute top-0 right-0 w-64 h-64 bg-${themeColor}-500 opacity-20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/4 pointer-events-none`}></div>
 <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
 <div>
 <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3 tracking-tight">
 <Compass className={`text-${themeColor}-400 animate-[spin_18s_linear_infinite]`} size={32} />
 My Profiles
 </h1>
 <p className={`text-${themeColor}-100/80 text-sm font-medium max-w-lg`}>
 Build personal connections, follow campus guides, share wellness cards, and link with peers.
 </p>
 </div>

 {/* Dynamic Navigation Sub-Tabs Switches */}
 <div className="flex bg-black/20 backdrop-blur-md p-1.5 rounded-xl self-start border border-white/10 shadow-inner flex-wrap gap-1 md:flex-nowrap">
 <button
 onClick={() => { playBeep(700, 'sine'); setSubTab('card'); }}
 className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-2 outline-none
 ${subTab === 'card' 
 ? 'bg-white text-slate-900 shadow-md' 
 : 'text-white/70 hover:text-white hover:bg-white/10'}`}
 >
 <User size={16} />
 Slate Card
 </button>
 
 <button
 onClick={() => { playBeep(700, 'sine'); setSubTab('directory'); }}
 className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-2 outline-none
 ${subTab === 'directory' 
 ? 'bg-white text-slate-900 shadow-md' 
 : 'text-white/70 hover:text-white hover:bg-white/10'}`}
 >
 <Users size={16} />
 Care Deck
 {directory.length > 0 && (
 <span className={`bg-${themeColor}-100 text-${themeColor}-700 font-mono text-[10px] px-2 py-0.5 rounded-full ml-1`}>
 {directory.length}
 </span>
 )}
 </button>


 </div>
 </div>
 </div>

 <div className="px-2 sm:px-4 flex-1 flex flex-col min-h-0">
 <AnimatePresence mode="wait">
 {subTab === 'card' && (
 /* PERSONAL STATE & CONNECTIONS TIMELINE */
 <motion.div 
 key="profile-slate"
 initial={{ opacity: 0, x: -10 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 10 }}
 className="grid grid-cols-1 lg:grid-cols-3 gap-8"
 >
 {/* LEFT COLUMN: LIVE RENDER CARD (SOCIAL MEDIA PREVIEW) */}
 <div className="lg:col-span-1 space-y-6">
 <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
 <Heart size={11} className="text-emerald-500 fill-emerald-500" />
 Live Card representation
 </h3>

 <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-md transition-colors duration-300">
 {/* Banner */}
 <div className={`h-32 w-full relative transition-all duration-500 ${getBannerClass(bannerStyle)}`}>
 {/* Floating badge for live/away */}
 <span className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm border border-white/20 text-white
 ${status === 'Available' ? 'bg-emerald-500/80' : status === 'Busy' ? 'bg-amber-500/80' : 'bg-slate-700/80'}`}>
 <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
 {status}
 </span>
 </div>

 {/* Profile Details Container */}
 <div className="px-6 pb-6 text-center relative flex flex-col items-center">
 {/* Avatar wrapper */}
 <div className={`w-24 h-24 rounded-full -mt-12 border-4 border-white dark:border-zinc-900 flex items-center justify-center font-black text-2xl shadow transition-all duration-500 relative group ${!user?.avatarUrl ? getAvatarClass(avatarColor) : 'bg-slate-200 dark:bg-zinc-800'}`}>
 {user?.avatarUrl ? (
 <img src={user.avatarUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
 ) : (
 getInitials(name || user?.name)
 )}
 </div>

 {/* Role Header */}
 <div className="mt-3.5">
 <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border
 ${user?.role === 'counselor' 
 ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-100/40 dark:border-purple-900/40' 
 : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100/40 dark:border-emerald-900/40'}`}>
 <Shield size={10} />
 {user?.role === 'counselor' ? 'Certified Counselor' : 'Wellness Peer'}
 </span>
 </div>

 {/* Name */}
 <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-zinc-100">{name || user?.name || "Anonymous Student"}</h2>
 <p className="text-xs text-slate-400 dark:text-zinc-500 font-mono mt-0.5 flex items-center justify-center gap-1">
 {user?.role === 'counselor' ? 'Saina Pro Team' : 'Wellness Peer'}
 </p>

 {/* Kudos Heart Count */}
 <div className="mt-2.5 flex items-center gap-1 px-3 py-1 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 rounded-full text-xs font-black">
 <Heart size={12} className="fill-rose-500 text-rose-500" />
 <span>{myKudosCount} Profile Kudos Received</span>
 </div>

 {/* Bio */}
 <div className="mt-4 bg-slate-50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-850/45 p-4 rounded-lg w-full text-justify italic text-xs leading-relaxed text-slate-600 dark:text-zinc-300">
 "{bio || "No profile bio crafted yet. Start adding one to link, share, and express your wellness journey."}"
 </div>

 {/* Specialties List */}
 <div className="w-full text-left mt-5 text-xs font-semibold text-slate-500">
 <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest block mb-1.5">
 {user?.role === 'counselor' ? 'Specialist Coaching' : 'Self-Care Focus'}
 </span>
 <div className="flex flex-wrap gap-1">
 {interests.map((spec) => (
 <span key={spec} className="bg-teal-50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-900/50 text-[10px] px-2 py-0.5 rounded-full font-bold">
 {spec}
 </span>
 ))}
 {interests.length === 0 && (
 <span className="text-xs text-slate-400 dark:text-zinc-650 italic">No tags selected.</span>
 )}
 </div>
 </div>

 {/* Connected handles preview */}
 <div className="flex justify-center gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/50 w-full font-sans">
 {linkedIn && (
 <a href={linkedIn} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center hover:bg-sky-50 dark:hover:bg-sky-950/20 text-slate-400 hover:text-sky-600 transition-colors">
 <Linkedin size={13} />
 </a>
 )}
 {twitter && (
 <a href={`https://twitter.com/${twitter.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center hover:bg-sky-50 dark:hover:bg-sky-900 text-slate-400 hover:text-sky-500 transition-colors">
 <Twitter size={13} />
 </a>
 )}
 {instagram && (
 <a href={`https://instagram.com/${instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center hover:bg-pink-50 dark:hover:bg-pink-950/20 text-slate-400 hover:text-pink-500 transition-colors">
 <Instagram size={13} />
 </a>
 )}
 {website && (
 <a href={website} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-400 hover:text-emerald-500 transition-colors">
 <Globe size={13} />
 </a>
 )}
 {!linkedIn && !twitter && !instagram && !website && (
 <span className="text-[10px] text-slate-400 dark:text-zinc-600 italic">No virtual social channels attached</span>
 )}
 </div>

 </div>
 </div>

 {saved && (
 <motion.div 
 initial={{ opacity: 0, y: 10 }} 
 animate={{ opacity: 1, y: 0 }} 
 className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900 rounded-lg flex items-center gap-2 text-xs font-bold"
 >
 <CheckCircle size={16} />
 Saina profile sync successful!
 </motion.div>
 )}
 </div>

 {/* RIGHT COLUMNS: INTERACTIVE CONFIG OR SOCIAL STATUS STATS */}
 <div className="lg:col-span-2 space-y-6">
 {/* EXTENDED ACCENTS AND RELATIONSHIPS MANAGEMENT DECK */}
 <div className="space-y-6">
 {/* 1. SOCIAL INTERACTION STATS STATS */}
 <div className="grid grid-cols-3 gap-4">
 <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 text-center">
 <Users className="mx-auto text-emerald-500 mb-1" size={18} />
 <div className="text-xl font-black text-slate-800 dark:text-zinc-100">{friendsIds.length}</div>
 <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Active Friends</div>
 </div>
 <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 text-center">
 <UserPlus className="mx-auto text-sky-500 mb-1" size={18} />
 <div className="text-xl font-black text-slate-800 dark:text-zinc-100">{requestsReceivedIds.length}</div>
 <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Pending</div>
 </div>
 <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 text-center">
 <Award className="mx-auto text-violet-500 mb-1" size={18} />
 <div className="text-xl font-black text-slate-800 dark:text-zinc-100">{myKudosCount}</div>
 <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Kudos</div>
 </div>
 </div>

 {/* 2. RECONCILE FRIEND REQUESTS INCOMING */}
 {requestsReceivedIds.length > 0 && (
 <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/40 p-5 rounded-xl">
 <h4 className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
 <Smile size={14} className="animate-bounce" />
 Pending Client & Friend Invites ({requestsReceivedIds.length})
 </h4>
 <div className="divide-y divide-amber-100 dark:divide-amber-900/40">
 {requestsReceivedIds.map(reqId => {
 const requestor = directory.find(d => d.id === reqId) || { name: 'Wellness User', role: 'student' };
 return (
 <div key={reqId} className="py-2.5 flex items-center justify-between gap-2 text-xs">
 <div className="flex items-center gap-2">
 <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
 <span className="font-bold text-slate-800 dark:text-zinc-100">{requestor.name}</span>
 <span className="text-[9px] px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded font-bold uppercase">{requestor.role}</span>
 </div>
 <div className="flex gap-1.5">
 <button
 onClick={(e) => handleFriendRequestAction(reqId, 'accept', e)}
 className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
 >
 <Check size={11} /> Accept
 </button>
 <button
 onClick={(e) => handleFriendRequestAction(reqId, 'decline', e)}
 className="px-2.5 py-1 bg-slate-250 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-[10px] font-bold rounded-lg transition-colors"
 >
 Decline
 </button>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 )}

 {/* 3. FRIENDS LIST DIRECTORY PANEL */}
 <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6">
 <h3 className="text-sm font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
 <Users size={16} className="text-emerald-500" />
 Active Care Peer Connections
 </h3>

 {friendsIds.length === 0 ? (
 <div className="py-8 text-center border-2 border-dashed border-slate-100 dark:border-zinc-800/80 rounded-lg">
 <Users className="mx-auto text-slate-300 dark:text-zinc-700 mb-2" size={24} />
 <p className="text-xs text-slate-400 dark:text-zinc-550 max-w-xs mx-auto">
 You haven't added friends yet! Head over to the <strong className="text-emerald-600 dark:text-emerald-400 cursor-pointer" onClick={() => setSubTab('directory')}>Care Deck</strong> to find guides and peer advocates.
 </p>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {friendsIds.map(friendId => {
 const fr = directory.find(d => d.id === friendId);
 if (!fr) return null;
 return (
 <div key={friendId} className="p-3.5 bg-slate-50 dark:bg-zinc-950/50 rounded-lg border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
 <div className="flex items-center gap-2.5 overflow-hidden">
 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 relative ${!fr.avatarUrl ? getAvatarClass(fr.avatarColor) : 'bg-slate-200 dark:bg-zinc-800'}`}>
 {fr.avatarUrl ? (
 <img src={fr.avatarUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
 ) : (
 getInitials(fr.name)
 )}
 </div>
 <div className="truncate">
 <h4 className="text-xs font-black text-slate-800 dark:text-zinc-200 truncate uppercase">{fr.name}</h4>
 <p className="text-[10px] text-slate-400 italic capitalize">{fr.role}</p>
 </div>
 </div>

 <div className="flex items-center gap-1 shrink-0">
 <button
 onClick={(e) => { e.stopPropagation(); playBeep(900, 'sine', 0.1); if (onTabChange) onTabChange('chat'); }}
 className="p-1 px-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 rounded-lg text-[10px] font-bold transition-all"
 title="Send Message"
 >
 DM
 </button>
 <button
 onClick={(e) => handleFriendRequestAction(friendId, 'remove', e)}
 className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
 title="Remove Friend"
 >
 <Trash2 size={13} />
 </button>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>


 </div>
 </div>
 </motion.div>
 )}
 {subTab === 'directory' && (
 /* COMMUNITY CARE DIRECTORY WITH ADVANCED SOCIAL BADGES */
 <motion.div 
 key="directory-slate"
 initial={{ opacity: 0, x: 10 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -10 }}
 className="space-y-6"
 >
 {/* SEARCH AND FILTERS TOOLBAR */}
 <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm transition-colors duration-300">
 <div className="flex flex-col md:flex-row gap-4 items-center">
 <div className="relative w-full md:flex-1">
 <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-11 pr-5 py-3 border border-slate-200 dark:border-zinc-800 rounded-lg bg-slate-50 dark:bg-zinc-950 focus:bg-white text-xs sm:text-sm text-slate-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-semibold"
 placeholder="Search directory by name, role, interest tags..."
 />
 {searchQuery && (
 <button
 onClick={() => setSearchQuery('')}
 className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
 >
 <X size={14} />
 </button>
 )}
 </div>

 <div className="flex bg-slate-50 dark:bg-zinc-950 p-1.5 rounded-lg border border-slate-200/65 dark:border-zinc-800 w-full md:w-auto shrink-0 justify-around">
 {[
 { id: 'all', name: 'All Cards' },
 { id: 'counselor', name: 'Counselors' },
 { id: 'student', name: 'Advocates' }
 ].map((r) => {
 const active = filterRole === r.id;
 return (
 <button
 key={r.id}
 type="button"
 onClick={() => { playBeep(700, 'sine'); setFilterRole(r.id); }}
 className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all outline-none whitespace-nowrap
 ${active ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'}`}
 >
 {r.name}
 </button>
 );
 })}
 </div>
 </div>

 {allUniqueTags.length > 0 && (
 <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800/60">
 <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-wider self-center mr-1">Interests Filter:</span>
 <button
 onClick={() => { playBeep(700, 'sine'); setSelectedTagFilter(''); }}
 className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all
 ${!selectedTagFilter 
 ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
 : 'bg-slate-50 dark:bg-zinc-950 text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300 border-slate-200/50 dark:border-zinc-805'}`}
 >
 All Focuses
 </button>

 {allUniqueTags.map((tag) => {
 const active = selectedTagFilter === tag;
 return (
 <button
 key={tag}
 onClick={() => { playBeep(700, 'sine'); setSelectedTagFilter(active ? '' : tag); }}
 className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all
 ${active 
 ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
 : 'bg-slate-50 dark:bg-zinc-950 text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300 border-slate-200/50 dark:border-zinc-850'}`}
 >
 {tag}
 </button>
 );
 })}
 </div>
 )}
 </div>

 {/* DIRECTORY LISTINGS GRID */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 {filteredDirectory.map((co) => {
 const totalKudosRec = 0; // TODO: Implement getKudosCount
 const hasLikedProfile = false; // TODO: Implement hasGivenKudos
 
 let activeFriendship = 'none';
 if (user) {
 if (friendsIds.includes(co.id)) activeFriendship = 'friends';
 else if (requestsSentIds.includes(co.id)) activeFriendship = 'sent';
 else if (requestsReceivedIds.includes(co.id)) activeFriendship = 'received';
 }


 const isCardUserOnline = isUserOnline(co.id);

 return (
 <motion.div
 key={co.id}
 layoutId={`profile-card-${co.id}`}
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 onClick={() => { playBeep(850, 'sine'); setViewingProfile(co); }}
 className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-350 flex flex-col justify-between cursor-pointer group relative"
 >
 {/* Hover profile kudos count indicator */}
 <button
 onClick={(e) => handleToggleKudos(co.id, e)}
 className={`absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black backdrop-blur-md shadow-sm border border-white/25 text-white transition-all 
 ${hasLikedProfile ? 'bg-rose-500/80 border-rose-400' : 'bg-slate-800/85 hover:bg-slate-900'}`}
 >
 <Heart size={12} className={`${hasLikedProfile ? 'fill-white text-white' : 'text-slate-350'}`} />
 <span>{totalKudosRec}</span>
 </button>

 <div>
 {/* Cover Theme Banner */}
 <div className={`h-24 w-full relative ${getBannerClass(co.bannerStyle || 'indigo_dusk')}`}>
 {/* active status indicator pill */}
 <span className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border border-white/20 text-white
 ${co.status === 'Available' ? 'bg-emerald-500/80' : co.status === 'Busy' ? 'bg-amber-500/80' : 'bg-slate-700/80'}`}>
 <span className="w-1 h-1 rounded-full bg-white" />
 {co.status || 'Available'}
 </span>
 </div>

 {/* Content profile container */}
 <div className="px-5 pb-1 relative flex flex-col items-center">
 {/* Mini floating avatar */}
 <div className={`relative w-16 h-16 rounded-full -mt-8 border-3 border-white dark:border-zinc-900 flex items-center justify-center font-black text-lg shadow-sm transition-all duration-300 ${!co.avatarUrl ? getAvatarClass(co.avatarColor) : 'bg-slate-200 dark:bg-zinc-800'}`}>
 {co.avatarUrl ? (
 <img src={co.avatarUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
 ) : (
 getInitials(co.name)
 )}
 {isCardUserOnline && <div className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full z-10" />}
 </div>

 {/* Role tag */}
 <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border mt-2.5
 ${co.role === 'counselor' 
 ? 'bg-purple-50 dark:bg-purple-950/25 text-purple-700 dark:text-purple-400 border-purple-100/50 dark:border-purple-900/30' 
 : 'bg-emerald-50 dark:bg-emerald-950/25 text-emerald-700 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-900/30'}`}>
 {co.role === 'counselor' ? 'Certified Counselor' : 'Wellness Advocate'}
 </span>

 <h3 className="mt-1.5 text-md font-bold text-slate-900 dark:text-zinc-100 tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase">
 {co.name}
 </h3>

 <p className="mt-3 text-xs text-slate-500 dark:text-zinc-400 text-center line-clamp-2 h-10 leading-relaxed italic">
 "{co.bio || 'Wellness member ready to encourage and synchronize coordinates.'}"
 </p>

 {/* Social connections indicators */}
 <div className="mt-2.5 flex items-center gap-1.5">
 {activeFriendship === 'friends' && (
 <span className="text-[9px] font-bold uppercase text-emerald-650 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-100/40">Friend</span>
 )}
 </div>

 {/* Specialties Mini Row */}
 <div className="w-full text-left mt-3 pt-3 border-t border-slate-50 dark:border-zinc-800/45">
 <div className="flex flex-wrap gap-1 min-h-[38px]">
 {(co.interests || []).slice(0, 3).map((tag) => (
 <span key={tag} className="bg-slate-50 border border-slate-200/40 dark:bg-zinc-800/45 dark:border-zinc-805 text-slate-600 dark:text-zinc-400 text-[9px] px-2 py-0.5 rounded font-semibold whitespace-nowrap">
 {tag}
 </span>
 ))}
 {(co.interests || []).length > 3 && (
 <span className="text-[9px] text-slate-400 dark:text-zinc-500 self-center font-bold pl-1 font-mono">
 +{(co.interests || []).length - 3}
 </span>
 )}
 </div>
 </div>
 </div>
 </div>

 {/* Bottom action controls */}
 <div className="px-4 pb-4 pt-3.5 border-t border-slate-50 dark:border-zinc-805 bg-slate-55/40 dark:bg-zinc-950/20 flex items-center justify-between gap-1.5 shrink-0 select-none">
 {/* Friend Request Trigger Button */}
 {activeFriendship === 'none' && (
 <button
 type="button"
 onClick={(e) => handleFriendRequestAction(co.id, 'send', e)}
 className="px-2 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-150 text-[10px] font-bold text-slate-800 dark:text-zinc-200 rounded-lg flex items-center gap-1 transition-colors border border-transparent dark:border-zinc-700"
 >
 <UserPlus size={11} /> +Friend
 </button>
 )}
 {activeFriendship === 'sent' && (
 <button
 type="button"
 onClick={(e) => handleFriendRequestAction(co.id, 'cancel', e)}
 className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 text-amber-800 dark:text-amber-450 text-[10px] font-bold rounded-lg transition-colors border border-dashed border-amber-200"
 >
 Requested
 </button>
 )}
 {activeFriendship === 'received' && (
 <button
 type="button"
 onClick={(e) => handleFriendRequestAction(co.id, 'accept', e)}
 className="px-2 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors"
 >
 Accept Invite
 </button>
 )}
 {activeFriendship === 'friends' && (
 <span className="px-2 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-[10px] font-black flex items-center gap-1 border border-emerald-100/50">
 <UserCheck size={11} /> Friends
 </span>
 )}

 {/* Direct Message - navigates to Chat tab */}
 <button
 type="button"
 onClick={(e) => { e.stopPropagation(); playBeep(900, 'sine', 0.1); if (onTabChange) onTabChange('chat'); }}
 className="px-3 py-1.5 bg-slate-900 border border-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:border-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
 >
 <MessageSquare size={11} /> DM
 </button>
 </div>
 </motion.div>
 );
 })}

 {filteredDirectory.length === 0 && (
 <div className="col-span-full py-16 text-center bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-8">
 <Compass size={40} className="text-slate-300 dark:text-zinc-750 mx-auto mb-4 animate-spin" />
 <h3 className="text-md font-bold text-slate-700 dark:text-zinc-300 mb-1">No Profiles Identified</h3>
 <p className="text-xs text-slate-400 dark:text-zinc-550 max-w-sm mx-auto">
 We couldn't identify any other wellness slates matching "{searchQuery}" under the selected filters.
 </p>
 </div>
 )}
 </div>
 </motion.div>
 )}


 </AnimatePresence>

 {/* 1. DIRECTORY LISTINGS CARD DIALOG DETAIL OVERLAY */}
 <AnimatePresence>
 {viewingProfile && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setViewingProfile(null)}
 className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
 />
 
 <motion.div 
 initial={{ scale: 0.95, opacity: 0, y: 15 }}
 animate={{ scale: 1, opacity: 1, y: 0 }}
 exit={{ scale: 0.95, opacity: 0, y: 15 }}
 className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto"
 >
 <div className={`h-28 w-full relative ${getBannerClass(viewingProfile.bannerStyle)}`}>
 <span className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm border border-white/20 text-white
 ${viewingProfile.status === 'Available' ? 'bg-emerald-500/80' : viewingProfile.status === 'Busy' ? 'bg-amber-500/80' : 'bg-slate-700/80'}`}>
 <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
 {viewingProfile.status || 'Available'}
 </span>
 </div>
 
 <div className="px-6 pb-6 text-center relative flex flex-col items-center">
  <div className={`w-20 h-20 rounded-full -mt-10 border-4 border-white dark:border-zinc-900 flex items-center justify-center font-black text-xl shadow relative ${!viewingProfile.avatarUrl ? getAvatarClass(viewingProfile.avatarColor) : 'bg-slate-200 dark:bg-zinc-800'}`}>
  {viewingProfile.avatarUrl ? (
    <img src={viewingProfile.avatarUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
  ) : (
    getInitials(viewingProfile.name)
  )}
  </div>

 <div className="mt-3">
 <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border
 ${viewingProfile.role === 'counselor' 
 ? 'bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border-purple-100/55' 
 : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100/55'}`}>
 {viewingProfile.role === 'counselor' ? 'Certified Counselor' : 'Wellness Advocate'}
 </span>
 </div>

 <h3 className="mt-2.5 text-lg font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-tight">{viewingProfile.name}</h3>
 <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
 {viewingProfile.role === 'counselor' ? 'Saina Clinical Pro Coach' : `Student ID: ${viewingProfile.studentId || 'N/A'}`}
 </p>

 <p className="mt-4 text-xs text-slate-600 dark:text-zinc-300 italic bg-slate-50 dark:bg-zinc-950/45 p-4 rounded-lg border border-slate-100 dark:border-zinc-800/40 w-full leading-relaxed text-justify">
 "{viewingProfile.bio || 'Wellness member ready to encourage and synchronize coordinates.'}"
 </p>

 {/* Specialties list */}
 <div className="w-full text-left mt-5 text-xs font-semibold text-slate-500">
 <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest block mb-1.5">
 {viewingProfile.role === 'counselor' ? 'Licensed Focus Area' : 'Self-Care Focus'}
 </span>
 <div className="flex flex-wrap gap-1">
 {(viewingProfile.interests || []).map((spec) => (
 <span key={spec} className="bg-teal-50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-900/50 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
 {spec}
 </span>
 ))}
 </div>
 </div>

 {/* Direct action CTA button and Close buttons */}
 <div className="flex gap-2.5 w-full mt-6">
 <button 
 type="button"
 onClick={() => setViewingProfile(null)}
 className="flex-1 bg-slate-100 dark:bg-zinc-800 font-bold text-xs py-3 rounded-lg transition-all border border-transparent dark:border-zinc-700 text-slate-705"
 >
 Close Card
 </button>
 <button 
 type="button"
 onClick={() => {
 setViewingProfile(null);
 playBeep(900, 'sine', 0.1);
 if (onTabChange) onTabChange('chat');
 }}
 className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5 animate-[pulse_2.5s_infinite]"
 >
 <MessageSquare size={12} /> Send DM
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>


 </div>
 </motion.div>
 );
}
