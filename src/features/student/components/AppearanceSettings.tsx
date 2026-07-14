import React from 'react';
import { Settings2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function AppearanceSettings({
  darkMode, toggleDarkMode, uiSound, setUiSound, notificationsEnabled, setNotificationsEnabled
}: any) {
  return (
    <div className="space-y-6">
      {/* Section 3: Hardware preferences & system tweaks */}
      
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

          </div>
    </div>
  );
}
