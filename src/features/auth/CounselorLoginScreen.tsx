import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function CounselorLoginScreen() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  useEffect(() => {
    if (user && user.role === 'counselor') {
      navigate('/counselor/dashboard', { replace: true });
    }
  }, [user, navigate]);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    setTimeout(async () => {
      try {
        if (isRegistering) {
          if (!fullName || !email || !password) throw new Error('Please fill out all fields.');
          
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: fullName,
                role: 'counselor'
              }
            }
          });
          if (error) throw error;
          // Let the AuthContext useEffect handle the redirect
        } else {
          if (!email || !password) throw new Error('Please enter email and password.');
          
          const { error, data } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          
          const userRole = data.user?.app_metadata?.role || data.user?.user_metadata?.role;
          if (userRole !== 'counselor') {
            await supabase.auth.signOut();
            throw new Error('Access denied. This portal is for staff only.');
          }
          // Let the AuthContext useEffect handle the redirect
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred.');
        setLoading(false);
      }
    }, 500); 
  };

  const handleDemoCounselor = async () => {
    setLoading(true);
    setError('');
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email: 'nor@demo.com', password: 'demo1234' });
      if (error) throw error;
      const userRole = data.user?.app_metadata?.role || data.user?.user_metadata?.role;
      if (userRole !== 'counselor') {
        await supabase.auth.signOut();
        throw new Error('Access denied. This portal is for staff only.');
      }
      setIsFadingOut(true);
    } catch (err: any) {
      setError(err.message || 'Error logging in as demo counselor.');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden font-sans transition-colors duration-300"
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.35 }}
      >
          {/* Animated Background Gradients & Orbs for Premium feel */}
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100 dark:from-[#022c22] dark:via-[#064e3b] dark:to-[#0f172a]" />
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
             {/* Top Right Circle */}
             <motion.div animate={{ scale: [1,1.15,1], opacity:[0.1,0.2,0.1] }} transition={{ duration: 8, repeat: Infinity, ease:'easeInOut' }}
              className="absolute right-[-10%] top-[-10%] w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[140px]" />
            {/* Bottom Left Circle */}
            <motion.div animate={{ scale: [1,1.2,1], opacity:[0.05,0.15,0.05] }} transition={{ duration: 11, repeat: Infinity, ease:'easeInOut', delay:2 }}
              className="absolute left-[-10%] bottom-[-10%] w-[600px] h-[600px] bg-teal-400 rounded-full blur-[120px]" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNCkiLz48L3N2Zz4=')] opacity-40 dark:opacity-20" />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="w-full max-w-[420px] relative z-10"
          >
            <div className="flex flex-col items-center mx-auto mb-8 text-center">
              <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-inner mb-4">
                <Sparkles size={24} className="text-emerald-500 dark:text-emerald-400" />
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold tracking-[0.25em] mb-2 uppercase">SAINA CARE STAFF</span>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Counselor Portal</h1>
            </div>

            <div className="glass-panel p-8 sm:p-10 shadow-2xl relative">
               <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
                 {/* Inputs */}
                 <div className="space-y-4">
                   {isRegistering && (
                     <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} className="space-y-4 overflow-hidden">
                       <input 
                         type="text" 
                         value={fullName}
                         onChange={(e) => setFullName(e.target.value)}
                         className="w-full glass-input text-sm"
                         placeholder="Full Name"
                       />
                     </motion.div>
                   )}
                   <input 
                     type="email" 
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full glass-input text-sm"
                     placeholder="Corporate Email"
                   />
                   <input 
                     type="password" 
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full glass-input text-sm"
                     placeholder="Password"
                   />
                 </div>

                 <AnimatePresence>
                   {error && (
                     <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className="overflow-hidden">
                        <div className="bg-red-50/80 backdrop-blur-md dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs font-bold px-4 py-3 rounded-xl shadow-sm">
                          {error}
                        </div>
                     </motion.div>
                   )}
                 </AnimatePresence>

                 {/* Action Buttons */}
                 <div className="flex items-center gap-3 pt-3">
                   <button 
                     type="button"
                     onClick={() => setIsRegistering(!isRegistering)}
                     className="flex-[1] glass-input py-3 text-sm font-bold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                   >
                     {isRegistering ? 'Login Instead' : 'Sign Up'}
                   </button>
                   <button 
                     type="submit"
                     disabled={loading}
                     className="flex-[1.2] glass-button py-3 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                   >
                     {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegistering ? 'Register Staff' : 'Login Staff')}
                   </button>
                 </div>
               </form>
            </div>

            <div className="flex flex-col items-center gap-2 mt-8 text-slate-400 dark:text-zinc-500 text-[10px] sm:text-xs font-bold tracking-wide uppercase">
               <button type="button" onClick={handleDemoCounselor} disabled={loading} className="hover:text-emerald-500 transition-colors leading-none outline-none cursor-pointer">
                  Dev: Bypass as Counselor
               </button>
            </div>

            <div className="mt-8 text-center">
              <a href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 text-xs font-bold transition-colors">
                <ArrowLeft size={12} /> Return to Student Portal
              </a>
            </div>
          </motion.div>
        </motion.div>
    </AnimatePresence>
  );
}
