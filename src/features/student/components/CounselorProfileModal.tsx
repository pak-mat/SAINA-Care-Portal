import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Linkedin, Twitter, Instagram, Globe } from 'lucide-react';
import { User } from '../../../types';
import { getBannerClass, getAvatarClass } from '../../../utils/uiUtils';

interface CounselorProfileModalProps {
  profile: User | null;
  onClose: () => void;
}

export default function CounselorProfileModal({ profile, onClose }: CounselorProfileModalProps) {
  return (
    <AnimatePresence>
      {profile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="relative w-full max-w-sm bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-700 max-h-[90vh] overflow-y-auto"
          >
            <div className={`h-28 w-full ${getBannerClass(profile.bannerStyle)}`}></div>
            
            <div className="px-5 pb-6 text-center relative flex flex-col items-center">
              <div className={`w-20 h-20 rounded-full -mt-10 border-4 border-white dark:border-zinc-800 flex items-center justify-center font-bold text-xl shadow ${getAvatarClass(profile.avatarColor)}`}>
                {profile.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
              </div>

              <div className="mt-2.5">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border
                  ${profile.status === 'Available' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-100'}`}>
                  {profile.status || 'Available'}
                </span>
              </div>

              <h3 className="mt-2 text-md font-bold text-slate-900 dark:text-zinc-100">{profile.name}</h3>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Saina Care Counselor</p>

              <p className="mt-3 text-xs text-slate-600 dark:text-zinc-300 italic bg-slate-50 dark:bg-zinc-900/30 p-3 rounded-lg border border-slate-100 dark:border-zinc-700/30 w-full">
                "{profile.bio || 'Professional care counselor designated to support Saina Care students.'}"
              </p>

              <div className="w-full text-left mt-4 text-xs font-semibold text-slate-500">
                <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest block mb-1.5">Coaching Focus</span>
                <div className="flex flex-wrap gap-1">
                  {(profile.interests || []).map((spec: string) => (
                    <span key={spec} className="bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-900/60 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                      {spec}
                    </span>
                  ))}
                  {(!profile.interests || profile.interests.length === 0) && (
                    <span className="text-xs text-slate-400 italic font-mono">General Care</span>
                  )}
                </div>
              </div>

              {profile.socialHandles && (
                <div className="flex justify-center gap-2.5 mt-5 pt-3 border-t border-slate-100 dark:border-zinc-700/50 w-full">
                  {profile.socialHandles.linkedIn && (
                    <a href={profile.socialHandles.linkedIn} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center hover:bg-sky-50 dark:hover:bg-sky-950/20 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400">
                      <Linkedin size={12} />
                    </a>
                  )}
                  {profile.socialHandles.twitter && (
                    <a href={`https://twitter.com/${profile.socialHandles.twitter.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center hover:bg-sky-50 dark:hover:bg-sky-900 text-slate-400 hover:text-sky-500">
                      <Twitter size={12} />
                    </a>
                  )}
                  {profile.socialHandles.instagram && (
                    <a href={`https://instagram.com/${profile.socialHandles.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center hover:bg-pink-50 dark:hover:bg-pink-950/20 text-slate-400 hover:text-pink-500">
                      <Instagram size={12} />
                    </a>
                  )}
                  {profile.socialHandles.website && (
                    <a href={profile.socialHandles.website} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-400 hover:text-emerald-500">
                      <Globe size={12} />
                    </a>
                  )}
                </div>
              )}

              <button 
                type="button"
                onClick={onClose}
                className="mt-5 w-full bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 text-white dark:text-slate-900 font-bold text-xs py-2.5 rounded-xl transition-all"
              >
                Close Profile
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
