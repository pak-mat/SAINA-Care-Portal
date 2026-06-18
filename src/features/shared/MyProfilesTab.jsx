// File: src/features/shared/MyProfilesTab.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Link2, Sparkles, Tag, Search, Compass, Shield, Plus, X, Check, Edit2, 
  Linkedin, Twitter, Instagram, Globe, HelpCircle, MessageSquare, Calendar, ChevronRight, CheckCircle, Info, Heart,
  Users, UserPlus, UserCheck, Send, MessageCircle, Smile, Trash2, ArrowLeft, Award, ThumbsUp, MessageSquarePlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile, getAllUsers } from '../../services/localEngine';
import {
  followUser, unfollowUser, getFollowingList, getFollowersList,
  sendFriendRequest, cancelFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend,
  getFriends, getFriendRequestsReceived, getFriendRequestsSent, getFriendshipStatus,
  toggleKudos, getKudosCount, hasGivenKudos,
  sendSocialDM, getSocialDMs, getChatPartners,
  createGroupChat, getGroupChatsForUser, getGroupMessages, sendGroupMessage,
  createTimelinePost, getTimelinePosts, toggleLikeTimelinePost, commentTimelinePost
} from '../../services/localSocialEngine';
import { getRelativeTime } from '../../utils/time';
import { useDatabaseEvent } from '../../hooks/useDatabaseEvent';

export default function MyProfilesTab({ onTabChange }) {
  const { user, updateUser } = useAuth();
  
  // Double sub-tab state inside My Profiles: 'card', 'directory', 'timeline', 'messenger'
  const [subTab, setSubTab] = useState('card');
  const [isEditing, setIsEditing] = useState(false);
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

  // Directory search/filtering states
  const [directory, setDirectory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all'); // 'all', 'student', 'counselor'
  const [selectedTagFilter, setSelectedTagFilter] = useState('');
  const [viewingProfile, setViewingProfile] = useState(null);

  // Dynamic social engine hooks
  const [friendsIds, setFriendsIds] = useState([]);
  const [requestsReceivedIds, setRequestsReceivedIds] = useState([]);
  const [requestsSentIds, setRequestsSentIds] = useState([]);
  const [followingIds, setFollowingIds] = useState([]);
  const [followersIds, setFollowersIds] = useState([]);
  const [myGroupChats, setMyGroupChats] = useState([]);
  const [myTimelinePosts, setMyTimelinePosts] = useState([]);
  const [myKudosCount, setMyKudosCount] = useState(0);

  // Messenger active selections
  const [activeChatType, setActiveChatType] = useState('direct'); // 'direct' or 'group'
  const [activeDMPartnerId, setActiveDMPartnerId] = useState('');
  const [activeGroupId, setActiveGroupId] = useState('');
  const [chatInputText, setChatInputText] = useState('');
  const [groupCreateModalOpen, setGroupCreateModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState([]);

  // Timeline inputs
  const [timelineInput, setTimelineInput] = useState('');
  const [commentInputs, setCommentInputs] = useState({}); // postId -> comment text

  const chatEndRef = useRef(null);

  // Load directory users and local social stats
  const refreshDirectoryAndSocial = React.useCallback(() => {
    const list = getAllUsers();
    setDirectory(list.filter(u => u.id !== user?.id));
    
    if (user?.id) {
      setFriendsIds(getFriends(user.id));
      setRequestsReceivedIds(getFriendRequestsReceived(user.id));
      setRequestsSentIds(getFriendRequestsSent(user.id));
      setFollowingIds(getFollowingList(user.id));
      setFollowersIds(getFollowersList(user.id));
      setMyGroupChats(getGroupChatsForUser(user.id));
      setMyTimelinePosts(getTimelinePosts());
      setMyKudosCount(getKudosCount(user.id));
    }
  }, [user?.id]);

  useEffect(() => {
    refreshDirectoryAndSocial();
  }, [refreshDirectoryAndSocial]);

  useDatabaseEvent('db_updated', refreshDirectoryAndSocial);
  useDatabaseEvent('social_db_updated', refreshDirectoryAndSocial);

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

  // Social action helpers (Follow / Unfollow / Friend Requests)
  const handleToggleFollow = (targetId, e) => {
    if (e) e.stopPropagation();
    if (!user) return;
    const following = followingIds.includes(targetId);
    if (following) {
      unfollowUser(user.id, targetId);
      playBeep(600, 'triangle', 0.08);
    } else {
      followUser(user.id, targetId);
      playBeep(1000, 'sine', 0.08);
    }
  };

  const handleFriendRequestAction = (targetId, action, e) => {
    if (e) e.stopPropagation();
    if (!user) return;
    
    if (action === 'send') {
      sendFriendRequest(user.id, targetId);
      playBeep(950, 'sine', 0.1);
    } else if (action === 'cancel') {
      cancelFriendRequest(user.id, targetId);
      playBeep(600, 'triangle', 0.1);
    } else if (action === 'accept') {
      acceptFriendRequest(user.id, targetId);
      playBeep(1100, 'sine', 0.15);
    } else if (action === 'decline') {
      declineFriendRequest(user.id, targetId);
      playBeep(550, 'triangle', 0.1);
    } else if (action === 'remove') {
      removeFriend(user.id, targetId);
      playBeep(450, 'triangle', 0.15);
    }
  };

  const handleToggleKudos = (targetId, e) => {
    if (e) e.stopPropagation();
    if (!user) return;
    toggleKudos(user.id, targetId);
    const liked = hasGivenKudos(user.id, targetId);
    if (!liked) {
      playBeep(1200, 'sine', 0.12);
    } else {
      playBeep(700, 'triangle', 0.08);
    }
  };

  const startDMChatWithUser = (targetUser, e) => {
    if (e) e.stopPropagation();
    setActiveChatType('direct');
    setActiveDMPartnerId(targetUser.id);
    setSubTab('messenger');
    playBeep(900, 'sine', 0.1);
  };

  // Messenger logic & handlers
  const activeDMPartner = directory.find(u => u.id === activeDMPartnerId);
  const activeGroup = myGroupChats.find(g => g.id === activeGroupId);
  const currentChatMessages = activeChatType === 'direct' && user
    ? getSocialDMs(user.id, activeDMPartnerId)
    : activeGroupId ? getGroupMessages(activeGroupId) : [];

  // Auto-scroll chat to bottom when changing partner, changing group, or when receiving/sending a message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [activeDMPartnerId, activeGroupId, currentChatMessages.length]);

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInputText.trim() || !user) return;
    
    if (activeChatType === 'direct' && activeDMPartnerId) {
      sendSocialDM(user.id, activeDMPartnerId, chatInputText);
      playBeep(1100, 'sine', 0.06);
    } else if (activeChatType === 'group' && activeGroupId) {
      sendGroupMessage(activeGroupId, user.id, user.name, chatInputText);
      playBeep(1050, 'sine', 0.07);
    }
    setChatInputText('');
  };

  const handleCreateGroupSubmit = (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || !user) return;
    
    const newG = createGroupChat(newGroupName, user.id, newGroupMembers);
    playBeep(1150, 'sine', 0.15);
    
    setNewGroupName('');
    setNewGroupMembers([]);
    setGroupCreateModalOpen(false);
    setActiveChatType('group');
    setActiveGroupId(newG.id);
  };

  const toggleGroupMemberCheck = (memberId) => {
    if (newGroupMembers.includes(memberId)) {
      setNewGroupMembers(newGroupMembers.filter(id => id !== memberId));
    } else {
      setNewGroupMembers([...newGroupMembers, memberId]);
    }
    playBeep(850, 'sine', 0.05);
  };

  // Timeline posts logic
  const handleCreateTimelinePost = (e) => {
    e.preventDefault();
    if (!timelineInput.trim() || !user) return;
    
    createTimelinePost(user.id, user.name, user.avatarColor || 'indigo', timelineInput);
    playBeep(1100, 'sine', 0.12);
    setTimelineInput('');
  };

  const handleLikePost = (postId) => {
    if (!user) return;
    toggleLikeTimelinePost(postId, user.id);
    playBeep(1200, 'sine', 0.1);
  };

  const handleCommentSubmit = (postId, e) => {
    e.preventDefault();
    if (!user) return;
    const txt = commentInputs[postId] || '';
    if (!txt.trim()) return;

    commentTimelinePost(postId, user.id, user.name, txt);
    playBeep(1000, 'sine', 0.08);
    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  // Prepopulated short posts
  const quickShares = [
    { label: "Completed Breathing Coach 🧘", text: "Finished structured breathing exercise on the portal! Feeling centered." },
    { label: "Stayed Hydrated today! 💧", text: "Drank 8 glasses of pure water today. Small wins matter!" },
    { label: "Grateful for study group 🎓", text: "Had an extremely encouraging study prep with campus wellness peers today." },
    { label: "Took a mindful walk 🌳", text: "Spent 15 minutes listening to the leaves rustle on the north lawn." }
  ];

  const isMessenger = subTab === 'messenger';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -15 }}
      className={`max-w-none w-full ${isMessenger ? 'h-full flex-1 flex flex-col min-h-0 overflow-hidden pb-1 sm:pb-2' : 'h-full flex-1 flex flex-col min-h-0 overflow-y-auto pb-6 md:pb-12 px-1'}`}
    >
      {/* Tab Header Section */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between ${isMessenger ? 'mb-2 pb-1.5' : 'mb-8 pb-4'} border-b border-slate-200 dark:border-zinc-800 gap-4 shrink-0`}>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Compass className="text-emerald-500 animate-[spin_18s_linear_infinite]" size={28} />
            My profiles
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Build personal connections, follow campus guides, share wellness cards, and link with peers.
          </p>
        </div>

        {/* Dynamic Navigation Sub-Tabs Switches */}
        <div className="flex bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl self-start border border-slate-200/50 dark:border-zinc-850/50 shadow-inner flex-wrap gap-1 md:flex-nowrap">
          <button
            onClick={() => { playBeep(700, 'sine'); setSubTab('card'); }}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 outline-none
              ${subTab === 'card' 
                ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-sm' 
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'}`}
          >
            <User size={14} />
            Slate Card
          </button>
          
          <button
            onClick={() => { playBeep(700, 'sine'); setSubTab('directory'); }}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 outline-none
              ${subTab === 'directory' 
                ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-sm' 
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'}`}
          >
            <Users size={14} />
            Care Deck
            {directory.length > 0 && (
              <span className="bg-emerald-150/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-mono text-[9px] px-1.5 py-0.2 rounded-full">
                {directory.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { playBeep(700, 'sine'); setSubTab('messenger'); }}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 outline-none
              ${subTab === 'messenger' 
                ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-sm' 
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'}`}
          >
            <MessageSquare size={14} />
            Campus Chats
            {requestsReceivedIds.length > 0 && (
              <span className="bg-rose-500 text-white font-mono text-[9px] px-1.5 py-0.2 rounded-full animate-bounce">
                {requestsReceivedIds.length}
              </span>
            )}
          </button>
        </div>
      </div>

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

              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-md transition-colors duration-300">
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
                  <div className={`w-24 h-24 rounded-full -mt-12 border-4 border-white dark:border-zinc-900 flex items-center justify-center font-black text-2xl shadow transition-all duration-500 ${getAvatarClass(avatarColor)}`}>
                    {getInitials(name || user?.name)}
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
                  <div className="mt-4 bg-slate-50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-850/45 p-4 rounded-2xl w-full text-justify italic text-xs leading-relaxed text-slate-600 dark:text-zinc-300">
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

                  {/* Action inline */}
                  {!isEditing && (
                    <button
                      onClick={() => { playBeep(900, 'sine'); setIsEditing(true); }}
                      className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-zinc-100 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Edit2 size={13} />
                      Customize Design
                    </button>
                  )}
                </div>
              </div>

              {saved && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900 rounded-2xl flex items-center gap-2 text-xs font-bold"
                >
                  <CheckCircle size={16} />
                  Saina profile sync successful!
                </motion.div>
              )}
            </div>

            {/* RIGHT COLUMNS: INTERACTIVE CONFIG OR SOCIAL STATUS STATS */}
            <div className="lg:col-span-2 space-y-6">
              {!isEditing ? (
                /* EXTENDED ACCENTS AND RELATIONSHIPS MANAGEMENT DECK */
                <div className="space-y-6">
                  {/* 1. SOCIAL INTERACTION STATS STATS */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 text-center">
                      <Users className="mx-auto text-emerald-500 mb-1" size={18} />
                      <div className="text-xl font-black text-slate-800 dark:text-zinc-100">{friendsIds.length}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Active Friends</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 text-center">
                      <UserPlus className="mx-auto text-sky-500 mb-1" size={18} />
                      <div className="text-xl font-black text-slate-800 dark:text-zinc-100">{followingIds.length}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Following</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 text-center">
                      <Award className="mx-auto text-violet-500 mb-1" size={18} />
                      <div className="text-xl font-black text-slate-800 dark:text-zinc-100">{followersIds.length}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Followers</div>
                    </div>
                  </div>

                  {/* 2. RECONCILE FRIEND REQUESTS INCOMING */}
                  {requestsReceivedIds.length > 0 && (
                    <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/40 p-5 rounded-3xl">
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
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6">
                    <h3 className="text-sm font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Users size={16} className="text-emerald-500" />
                      Active Care Peer Connections
                    </h3>

                    {friendsIds.length === 0 ? (
                      <div className="py-8 text-center border-2 border-dashed border-slate-100 dark:border-zinc-800/80 rounded-2xl">
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
                            <div key={friendId} className="p-3.5 bg-slate-50 dark:bg-zinc-950/50 rounded-2xl border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${getAvatarClass(fr.avatarColor)}`}>
                                  {getInitials(fr.name)}
                                </div>
                                <div className="truncate">
                                  <h4 className="text-xs font-black text-slate-800 dark:text-zinc-200 truncate uppercase">{fr.name}</h4>
                                  <p className="text-[10px] text-slate-400 italic capitalize">{fr.role}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={(e) => startDMChatWithUser(fr, e)}
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

                  {/* 4. FOLLOWING LIST QUICK PANEL */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6">
                    <h3 className="text-sm font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <UserCheck size={16} className="text-sky-500" />
                      Guides I Am Following
                    </h3>

                    {followingIds.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-zinc-500 italic">You aren't following anyone currently.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {followingIds.map(fId => {
                          const fl = directory.find(d => d.id === fId);
                          if (!fl) return null;
                          return (
                            <div key={fId} className="inline-flex items-center gap-2 pl-2 pr-3 py-1 bg-sky-50 dark:bg-sky-950/20 border border-sky-100/50 dark:border-sky-900/30 rounded-full text-xs">
                              <span className="font-bold text-sky-850 dark:text-sky-300">{fl.name}</span>
                              <button
                                onClick={(e) => handleToggleFollow(fId, e)}
                                className="text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                                title="Unfollow"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* STUDIO EDIT FORM FOR SOCIAL CARD CONFIGS */
                <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Care Card Customizer</h2>
                      <p className="text-xs text-slate-400 dark:text-zinc-500">Update branding presets, tag indicators, and networks.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { playBeep(600, 'sine'); setIsEditing(false); }}
                      className="p-1.5 bg-slate-50 hover:bg-slate-150 dark:bg-zinc-805 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 rounded-lg transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Banners presets carousel */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Cover Theme Gradient</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {bannerPresets.map((preset) => {
                        const active = bannerStyle === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => { playBeep(750, 'sine'); setBannerStyle(preset.id); }}
                            className={`p-2.5 rounded-xl border-2 text-left relative overflow-hidden transition-all duration-300 group
                              ${active ? 'border-emerald-500 dark:border-emerald-600 scale-[1.01]' : 'border-slate-200/55 dark:border-zinc-800 hover:border-slate-300'}`}
                          >
                            <div className={`h-6 rounded-md mb-1.5 ${preset.class}`} />
                            <span className="text-[10px] font-bold block text-slate-800 dark:text-zinc-200 truncate">{preset.name}</span>
                            {active && (
                              <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-emerald-600 rounded-full flex items-center justify-center">
                                <Check size={8} className="text-white" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Avatar Colors carousel */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 font-mono">Avatar Colors Accent</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {avatarPresets.map((p) => {
                        const active = avatarColor === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button;button"
                            onClick={() => { playBeep(750, 'sine'); setAvatarColor(p.id); }}
                            className={`flex items-center gap-1.5 p-1.5 rounded-xl border cursor-pointer transition-all ${active ? 'border-emerald-500 bg-emerald-600/10' : 'border-slate-200/50 dark:border-zinc-800'}`}
                          >
                            <div className={`w-4 h-4 rounded-full ${p.bg}`} />
                            <span className="text-[9px] font-bold text-slate-800 dark:text-zinc-200 block truncate">{p.name.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name and active Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Social Avatar Name</label>
                      <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 bg-slate-50 dark:bg-zinc-950 focus:bg-white text-xs text-slate-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-semibold"
                        placeholder="Public name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Active Status Profile</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 bg-slate-50 dark:bg-zinc-950 focus:bg-white text-xs text-slate-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-semibold"
                      >
                        <option value="Available">Available (Active & Accepting DM)</option>
                        <option value="Busy">Busy (Available but delay replies)</option>
                        <option value="Away">Away (Snoozed notifications)</option>
                      </select>
                    </div>
                  </div>

                  {/* BIO text segment with Inspiration assist */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Bio Statement Description</label>
                      <button
                        type="button"
                        onClick={getRandomBio}
                        className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline py-0.5 px-2 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-md transition-all flex items-center gap-1"
                      >
                        <Sparkles size={11} />
                        Auto-populate Idea
                      </button>
                    </div>

                    <textarea
                      required
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value.slice(0, 180))}
                      className="w-full border border-slate-200 dark:border-zinc-800 rounded-xl p-3 bg-slate-50 dark:bg-zinc-950 focus:bg-white text-xs text-slate-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500 transition-all leading-relaxed"
                      placeholder="Share a small description..."
                    />
                    <div className="flex justify-end text-[10px] text-slate-400 mt-1">
                      {bio.length}/180 chars limit
                    </div>
                  </div>

                  {/* Interactive Tags manager */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      {user?.role === 'counselor' ? 'Specialties & Clinical Focus' : 'Campus Care Interests'}
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2 p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-150 dark:border-zinc-800/80 min-h-[50px]">
                      {interests.map((tag) => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-white dark:bg-zinc-850 hover:bg-rose-55 dark:hover:bg-rose-950/20 border border-slate-200/60 dark:border-zinc-700/60 rounded-full text-xs font-semibold flex items-center gap-1 text-slate-750 dark:text-zinc-300 cursor-pointer transition-colors"
                          onClick={() => removeInterest(tag)}
                        >
                          {tag}
                          <X size={11} className="text-slate-400 shrink-0" />
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newInterestInput}
                        onChange={(e) => setNewInterestInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInterest(e); } }}
                        className="flex-1 border border-slate-200 dark:border-zinc-800 rounded-xl p-2 bg-slate-50 dark:bg-zinc-955 text-xs outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-zinc-100"
                        placeholder="Add custom wellness focus..."
                      />
                      <button
                        type="button"
                        onClick={addInterest}
                        className="px-3 bg-slate-900 border border-slate-900 dark:bg-zinc-100 hover:bg-slate-800 text-white dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-xl text-xs font-bold transition-all"
                      >
                        Add Tag
                      </button>
                    </div>
                  </div>

                  {/* Social links handles */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Connected Intranet Channels</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-950">
                        <Linkedin size={14} className="text-sky-600 shrink-0" />
                        <input
                          type="url"
                          value={linkedIn}
                          onChange={(e) => setLinkedIn(e.target.value)}
                          className="w-full bg-transparent border-none outline-none text-xs text-slate-800 dark:text-zinc-200"
                          placeholder="LinkedIn url https://..."
                        />
                      </div>

                      <div className="flex items-center gap-2 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-950">
                        <Twitter size={14} className="text-sky-400 shrink-0" />
                        <input
                          type="text"
                          value={twitter}
                          onChange={(e) => setTwitter(e.target.value)}
                          className="w-full bg-transparent border-none outline-none text-xs text-slate-800 dark:text-zinc-200"
                          placeholder="Twitter handle @..."
                        />
                      </div>

                      <div className="flex items-center gap-2 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-950">
                        <Instagram size={14} className="text-pink-500 shrink-0" />
                        <input
                          type="text"
                          value={instagram}
                          onChange={(e) => setInstagram(e.target.value)}
                          className="w-full bg-transparent border-none outline-none text-xs text-slate-800 dark:text-zinc-200"
                          placeholder="Instagram handle @..."
                        />
                      </div>

                      <div className="flex items-center gap-2 border border-slate-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-950">
                        <Globe size={14} className="text-emerald-500 shrink-0" />
                        <input
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="w-full bg-transparent border-none outline-none text-xs text-slate-800 dark:text-zinc-200"
                          placeholder="Personal URL https://..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Buttons controls */}
                  <div className="flex gap-3 justify-end pt-5 border-t border-slate-150 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => { playBeep(600, 'sine'); setIsEditing(false); }}
                      className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-805 dark:hover:bg-zinc-800 rounded-xl transition-all"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all"
                    >
                      Sync Slate Card
                    </button>
                  </div>
                </form>
              )}
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
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm transition-colors duration-300">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-5 py-3 border border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50 dark:bg-zinc-950 focus:bg-white text-xs sm:text-sm text-slate-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-semibold"
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

                <div className="flex bg-slate-50 dark:bg-zinc-950 p-1.5 rounded-2xl border border-slate-200/65 dark:border-zinc-800 w-full md:w-auto shrink-0 justify-around">
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
                const totalKudosRec = getKudosCount(co.id);
                const hasLikedProfile = user ? hasGivenKudos(user.id, co.id) : false;
                const activeFriendship = user ? getFriendshipStatus(user.id, co.id) : 'none';
                const following = user ? followingIds.includes(co.id) : false;

                return (
                  <motion.div
                    key={co.id}
                    layoutId={`profile-card-${co.id}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => { playBeep(850, 'sine'); setViewingProfile(co); }}
                    className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-350 flex flex-col justify-between hover:-translate-y-1 cursor-pointer group relative"
                  >
                    {/* Hover profile kudos count indicator */}
                    <button
                      onClick={(e) => handleToggleKudos(co.id, e)}
                      className={`absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black backdrop-blur-md shadow-sm border border-white/25 text-white transition-all hover:scale-105 active:scale-95
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
                        <div className={`w-16 h-16 rounded-full -mt-8 border-3 border-white dark:border-zinc-900 flex items-center justify-center font-black text-lg shadow-sm transition-transform group-hover:scale-105 duration-300 ${getAvatarClass(co.avatarColor)}`}>
                          {getInitials(co.name)}
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

                        {/* Social connections and indicators */}
                        <div className="mt-2.5 flex items-center gap-1.5">
                          {following && (
                            <span className="text-[9px] font-bold uppercase text-sky-650 bg-sky-50 dark:bg-sky-950/30 px-1.5 py-0.5 rounded border border-sky-100/40">Following</span>
                          )}
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
                      {/* Social Actions Panel */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleFollow(co.id, e)}
                        className={`px-2 py-1.5 text-[10px] font-bold rounded-lg transition-all border outline-none
                          ${following 
                            ? 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-350' 
                            : 'bg-sky-50 hover:bg-sky-100 border-sky-100 text-sky-800 dark:bg-sky-950/20 dark:border-sky-900 dark:text-sky-400'}`}
                        title={following ? "Unfollow" : "Follow Guide"}
                      >
                        {following ? 'Following' : '+ Follow'}
                      </button>

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

                      {/* Direct Message Anchor */}
                      <button
                        type="button"
                        onClick={(e) => startDMChatWithUser(co, e)}
                        className="px-3 py-1.5 bg-slate-900 border border-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:border-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                      >
                        <MessageSquare size={11} /> DM
                      </button>
                    </div>
                  </motion.div>
                );
              })}

              {filteredDirectory.length === 0 && (
                <div className="col-span-full py-16 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-8">
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

        {subTab === 'messenger' && (
          /* CAMPUS CHATS & GROUPS DESKTOP CLIENT */
          <motion.div 
            key="messenger-slate"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-md flex flex-col md:flex-row flex-1 min-h-0 w-full"
          >
            {/* LEFT CHANNELS DIRECTORY */}
            <div className="w-full md:w-80 border-r border-slate-200 dark:border-zinc-800 flex flex-col justify-between h-full bg-slate-50/40 dark:bg-zinc-950/20 shrink-0">
              <div className="p-4 border-b border-slate-100 dark:border-zinc-805 space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">Channels & Direct</h3>
                  <button
                    onClick={() => { playBeep(900, 'sine'); setGroupCreateModalOpen(true); }}
                    className="p-1 px-2.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-250 font-black text-[10px] uppercase rounded-full flex items-center gap-1 shadow-xs"
                    title="Create Group Chat"
                  >
                    <Plus size={10} /> Group
                  </button>
                </div>

                {/* Sub chat switch type selectors */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl text-center">
                  <button
                    onClick={() => { playBeep(700, 'sine'); setActiveChatType('direct'); }}
                    className={`text-xs font-bold py-1 px-2 rounded-lg transition-all outline-none
                      ${activeChatType === 'direct' ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-xs' : 'text-slate-400'}`}
                  >
                    Direct DMs
                  </button>
                  <button
                    onClick={() => { playBeep(700, 'sine'); setActiveChatType('group'); }}
                    className={`text-xs font-bold py-1 px-2 rounded-lg transition-all outline-none
                      ${activeChatType === 'group' ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-xs' : 'text-slate-400'}`}
                  >
                    Groups ({myGroupChats.length})
                  </button>
                </div>
              </div>

              {/* Chat threads scroll container */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {activeChatType === 'direct' ? (
                  /* Friends lists */
                  friendsIds.length === 0 ? (
                    <div className="p-4 text-center mt-6">
                      <Users className="mx-auto text-slate-300 dark:text-zinc-700 mb-2" size={24} />
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500 italic max-w-[180px] mx-auto">
                        Your direct message partners appear once you accept friend invitations.
                      </p>
                    </div>
                  ) : (
                    friendsIds.map(fId => {
                      const peerObj = directory.find(d => d.id === fId);
                      if (!peerObj) return null;
                      const active = activeDMPartnerId === fId;
                      return (
                        <button
                          key={fId}
                          onClick={() => { playBeep(800, 'sine'); setActiveDMPartnerId(fId); }}
                          className={`w-full p-2.5 rounded-2xl flex items-center gap-3 transition-colors text-left font-sans outline-none
                            ${active 
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100/40 dark:border-emerald-900/10' 
                              : 'hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${getAvatarClass(peerObj.avatarColor)}`}>
                            {getInitials(peerObj.name)}
                          </div>
                          <div className="truncate flex-1">
                            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block truncate uppercase">{peerObj.name}</span>
                            <span className="text-[10px] text-slate-400 block truncate leading-tight capitalize">{peerObj.role} • {peerObj.status || 'Available'}</span>
                          </div>
                        </button>
                      );
                    })
                  )
                ) : (
                  /* Group chats lists */
                  myGroupChats.map(gChat => {
                    const active = activeGroupId === gChat.id;
                    return (
                      <button
                        key={gChat.id}
                        onClick={() => { playBeep(800, 'sine'); setActiveGroupId(gChat.id); }}
                        className={`w-full p-2.5 rounded-2xl flex items-center gap-3 transition-colors text-left outline-none
                          ${active 
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100/40' 
                            : 'hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-violet-600 dark:bg-violet-700 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                          👥
                        </div>
                        <div className="truncate flex-1">
                          <span className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 block truncate">{gChat.name}</span>
                          <span className="text-[10px] text-slate-400 block truncate">{gChat.members.length} participants connected</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT SIDECHAT VIEWERPORT */}
            <div className="flex-1 flex flex-col justify-between h-full relative p-0 bg-white dark:bg-zinc-900">
              {((activeChatType === 'direct' && activeDMPartnerId) || (activeChatType === 'group' && activeGroupId)) ? (
                /* Chat Active viewport */
                <div className="h-full flex flex-col justify-between overflow-hidden">
                  {/* Chat header area */}
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-805 bg-slate-50/20 dark:bg-zinc-950/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      {activeChatType === 'direct' ? (
                        <>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${getAvatarClass(activeDMPartner?.avatarColor)}`}>
                            {getInitials(activeDMPartner?.name)}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-800 dark:text-zinc-100 uppercase">{activeDMPartner?.name}</h4>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold capitalize">{activeDMPartner?.role} • {activeDMPartner?.status || 'Available'}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-xl bg-violet-600 text-white font-black flex items-center justify-center text-xs">
                            👥
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-800 dark:text-zinc-100">{activeGroup?.name}</h4>
                            <p className="text-[10px] text-slate-400">Collaborative Peer Group</p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Exit DM choice trigger button */}
                    <button
                      onClick={() => { playBeep(600, 'triangle'); setActiveDMPartnerId(''); setActiveGroupId(''); }}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 block"
                    >
                      Close Chat
                    </button>
                  </div>

                  {/* Messages Bubble panel */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                    <div className="text-center py-2 shrink-0">
                      <span className="text-[9px] px-2.5 py-0.5 bg-slate-50 dark:bg-zinc-950 text-slate-400 dark:text-zinc-500 rounded-full font-mono uppercase tracking-widest border border-slate-100 dark:border-zinc-850">
                        Secure Intranet Dialogue Enrolled
                      </span>
                    </div>

                    {currentChatMessages.map((msg, idx) => {
                      const isSelf = msg.senderId === user?.id;
                      return (
                        <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm font-medium shadow-xs leading-relaxed
                            ${isSelf 
                              ? 'bg-emerald-600 text-white rounded-br-none' 
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-150 rounded-bl-none border border-slate-200/40 dark:border-zinc-700/50'}`}>
                            
                            {/* Render username label for group DMs */}
                            {activeChatType === 'group' && !isSelf && (
                              <span className="block text-[9px] font-black uppercase text-purple-750 dark:text-purple-400 mb-0.5 tracking-wider">
                                {msg.senderName}
                              </span>
                            )}
                            
                            <p>{msg.text}</p>
                            <span className={`flex items-center justify-between text-[8px] mt-1.5 font-mono select-none gap-2
                              ${isSelf ? 'text-emerald-150' : 'text-slate-400'}`}>
                              <span>{getRelativeTime(msg.timestamp)}</span>
                              <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Message write box */}
                  <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-100 dark:border-zinc-805 bg-slate-50/20 dark:bg-zinc-950/10 flex gap-2 shrink-0">
                    <input
                      required
                      type="text"
                      value={chatInputText}
                      onChange={(e) => setChatInputText(e.target.value)}
                      onFocus={() => {
                        setTimeout(() => {
                          if (chatEndRef.current) {
                            chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
                          }
                        }, 250);
                      }}
                      className="flex-1 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:bg-white outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-semibold font-sans"
                      placeholder="Type secure message message..."
                    />
                    <button
                      type="submit"
                      className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition-transform active:scale-95 shadow-sm"
                    >
                      <Send size={15} />
                    </button>
                  </form>
                </div>
              ) : (
                /* Chat empty viewport state */
                <div className="h-full flex flex-col justify-center items-center p-8 text-center select-none">
                  <MessageCircle size={48} className="text-slate-200 dark:text-zinc-800 mb-4 animate-[pulse_3s_infinite]" />
                  <h3 className="text-sm font-black text-slate-700 dark:text-zinc-300">Intranet Social Communicator</h3>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                    Select any wellness peer or group chat channel from the left menu to read care notes and write secure advice logs.
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
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto"
            >
              <div className={`h-28 w-full relative ${getBannerClass(viewingProfile.bannerStyle)}`}>
                <span className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm border border-white/20 text-white
                  ${viewingProfile.status === 'Available' ? 'bg-emerald-500/80' : viewingProfile.status === 'Busy' ? 'bg-amber-500/80' : 'bg-slate-700/80'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {viewingProfile.status || 'Available'}
                </span>
              </div>
              
              <div className="px-6 pb-6 text-center relative flex flex-col items-center">
                <div className={`w-20 h-20 rounded-full -mt-10 border-4 border-white dark:border-zinc-900 flex items-center justify-center font-black text-xl shadow ${getAvatarClass(viewingProfile.avatarColor)}`}>
                  {getInitials(viewingProfile.name)}
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

                <p className="mt-4 text-xs text-slate-600 dark:text-zinc-300 italic bg-slate-50 dark:bg-zinc-950/45 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/40 w-full leading-relaxed text-justify">
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
                    className="flex-1 bg-slate-100 dark:bg-zinc-800 font-bold text-xs py-3 rounded-2xl transition-all border border-transparent dark:border-zinc-700 text-slate-705"
                  >
                    Close Card
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      setViewingProfile(null);
                      startDMChatWithUser(viewingProfile, e);
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 animate-[pulse_2.5s_infinite]"
                  >
                    <MessageSquare size={12} /> Send DM
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. GROUP CREATE MODAL DIALOG POPUP */}
      <AnimatePresence>
        {groupCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { playBeep(600, 'triangle'); setGroupCreateModalOpen(false); }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Card content */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800 max-h-[85vh] flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 dark:border-zinc-805 shrink-0 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase text-slate-800 dark:text-zinc-200 tracking-wider">Create Group Channel</h3>
                  <p className="text-[11px] text-slate-400">Initiate peer care rooms instantly</p>
                </div>
                <button
                  onClick={() => { playBeep(600, 'triangle'); setGroupCreateModalOpen(false); }}
                  className="p-1 cursor-pointer bg-slate-50 dark:bg-zinc-805 rounded-md hover:bg-slate-100 text-slate-400"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateGroupSubmit} className="flex-1 flex flex-col overflow-hidden p-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Group Title Name</label>
                  <input
                    required
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full border border-slate-200 dark:border-zinc-800 p-2 text-xs bg-slate-50 dark:bg-zinc-950 rounded-xl outline-none focus:bg-white text-slate-900 dark:text-zinc-100 font-semibold"
                    placeholder="e.g., Exam Prep Care Circles 🌸"
                  />
                </div>

                <div className="flex-1 flex flex-col overflow-hidden">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Select friends to invite:</label>
                  
                  <div className="flex-1 overflow-y-auto border border-slate-150 dark:border-zinc-850 bg-slate-50/50 dark:bg-zinc-950/60 rounded-xl p-2.5 space-y-1.5">
                    {friendsIds.length === 0 ? (
                      <p className="text-[11px] text-slate-400 text-center italic py-4">Add some friends first to invite them.</p>
                    ) : (
                      friendsIds.map(fId => {
                        const frObj = directory.find(d => d.id === fId);
                        if (!frObj) return null;
                        const isChecked = newGroupMembers.includes(fId);
                        return (
                          <label key={fId} className="flex items-center justify-between p-2 hover:bg-white dark:hover:bg-zinc-850 rounded-lg cursor-pointer text-xs select-none border border-transparent dark:border-zinc-900">
                            <span className="font-bold text-slate-800 dark:text-zinc-200">{frObj.name}</span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleGroupMemberCheck(fId)}
                              className="w-4 h-4 rounded text-emerald-600 accent-emerald-500"
                            />
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!newGroupName.trim() || newGroupMembers.length === 0}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 hover:disabled:bg-slate-200 dark:disabled:bg-zinc-800 text-white font-bold text-xs uppercase rounded-xl transition-all shrink-0 shadow-sm"
                >
                  Spawn Channel Group
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
