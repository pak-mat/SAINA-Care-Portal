// File: src/features/auth/LoginScreen.tsx
import React, { useState, useEffect } from 'react';
import { Loader2, ShieldCheck, BookOpen, MessageCircleHeart, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  { icon: ShieldCheck, title: 'Secure & Confidential', desc: 'End-to-end encrypted sessions between you and your counselor.' },
  { icon: MessageCircleHeart, title: 'Real-Time Support', desc: 'Chat directly with your assigned counselor anytime.' },
  { icon: Calendar, title: 'Easy Scheduling', desc: 'Book appointments with just a few taps on the calendar.' },
  { icon: BookOpen, title: 'Personal Vault', desc: 'Store your journal entries and resources privately.' },
];

export default function LoginScreen() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [form, setForm] = useState('');
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    if (user) {
      if (user.role === 'student') navigate('/student/dashboard', { replace: true });
      else navigate('/counselor/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Auto-rotate feature cards
  useEffect(() => {
    const t = setInterval(() => setActiveFeature(p => (p + 1) % FEATURES.length), 3000);
    return () => clearInterval(t);
  }, []);

  const doLogin = async (fn: () => Promise<any>) => {
    setLoading(true);
    setError('');
    try {
      await fn();
      // Keep loading true while context fetches profile and navigates
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      if (!fullName || !email || !password || !studentId) { setError('Please fill out all fields.'); return; }
      doLogin(async () => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: fullName,
              studentId,
              form: form || null,
              role: 'student'
            }
          }
        });
        if (error) throw error;
        
        if (!data.session) {
          // signUp succeeded but no session = email confirmation required
          setLoading(false);
          setError('Sign up successful! Please check your email to verify your account before logging in.');
          setIsRegistering(false);
        }
      });
    } else {
      if (!email || !password) { setError('Please enter email and password.'); return; }
      doLogin(async () => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="min-h-screen flex font-sans relative overflow-hidden"
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.35 }}
      >
          {/* Animated Background Gradients & Orbs for Premium feel */}
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100 dark:from-[#022c22] dark:via-[#064e3b] dark:to-[#0f172a]" />
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <motion.div animate={{ scale: [1,1.15,1], opacity:[0.1,0.2,0.1] }} transition={{ duration: 8, repeat: Infinity, ease:'easeInOut' }}
              className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-emerald-400 rounded-full blur-[140px]" />
            <motion.div animate={{ scale: [1,1.2,1], opacity:[0.05,0.15,0.05] }} transition={{ duration: 11, repeat: Infinity, ease:'easeInOut', delay:2 }}
              className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-teal-300 rounded-full blur-[120px]" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNCkiLz48L3N2Zz4=')] opacity-40 dark:opacity-20" />
          </div>

          {/* ── LEFT CONTENT (Text/Features) ── */}
          <div className="hidden lg:flex flex-col justify-center w-[50%] relative z-10 p-12 xl:p-20">
            {/* Logo + Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/30 rounded-xl flex items-center justify-center shadow-inner">
                  <Sparkles size={20} className="text-emerald-500 dark:text-emerald-400" />
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm tracking-widest uppercase">SAINA Care</span>
              </div>
              <h1 className="text-5xl xl:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight mt-6">
                Your wellbeing<br />
                <span className="text-emerald-500 dark:text-emerald-400">starts here.</span>
              </h1>
              <p className="text-slate-600 dark:text-emerald-100/60 mt-6 text-lg leading-relaxed max-w-md font-medium">
                A safe, confidential portal connecting students with professional counselors at your school.
              </p>
            </div>

            {/* Feature showcase */}
            <div className="space-y-4 mt-12 max-w-md">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                const isActive = i === activeFeature;
                return (
                  <motion.div
                    key={i}
                    onClick={() => setActiveFeature(i)}
                    animate={{ opacity: isActive ? 1 : 0.6, x: isActive ? 0 : -4 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-start gap-5 p-5 rounded-lg cursor-pointer transition-all ${isActive ? 'glass-card' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${isActive ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/30' : 'bg-black/5 dark:bg-white/5'}`}>
                      <Icon size={18} className={isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-white/40'} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-white/50'}`}>{f.title}</p>
                      <AnimatePresence>
                        {isActive && (
                          <motion.p initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                            className="text-sm text-slate-600 dark:text-emerald-100/70 leading-relaxed mt-1 overflow-hidden font-medium">
                            {f.desc}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 mt-2 shrink-0 animate-pulse" />}
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom trust badges */}
            <div className="flex items-center gap-6 mt-16">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-white/40 font-bold uppercase tracking-wider">
                <ShieldCheck size={14} className="text-emerald-600/70 dark:text-emerald-500/60" /> End-to-End Encrypted
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/10" />
              <div className="text-xs text-slate-500 dark:text-white/40 font-bold uppercase tracking-wider">MOE Endorsed</div>
            </div>
          </div>

          {/* ── RIGHT PANEL (Auth Form) ── */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative z-10 w-full lg:w-[50%]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="w-full max-w-[420px] glass-panel p-8 sm:p-10 shadow-2xl"
            >
              {/* Mobile logo */}
              <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
                <div className="w-10 h-10 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/30 rounded-xl flex items-center justify-center">
                  <Sparkles size={20} className="text-emerald-500" />
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-widest uppercase">SAINA Care</span>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {isRegistering ? 'Create account' : 'Welcome back'}
                </h2>
                <p className="text-slate-500 dark:text-zinc-400 font-medium text-sm mt-2">
                  {isRegistering ? 'Join your school counseling portal.' : 'Sign in to your student portal.'}
                </p>
              </div>

              {/* OAuth Buttons (Removed as per user request to keep only the bottom small green bypass button) */}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegistering && (
                  <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} className="space-y-4 overflow-hidden">
                    <input
                      type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                      maxLength={100} placeholder="Full name"
                      className="w-full glass-input text-sm"
                    />
                    <input
                      type="text" value={studentId} onChange={e => setStudentId(e.target.value)}
                      maxLength={30} placeholder="Student ID / Registration No."
                      className="w-full glass-input text-sm"
                    />
                    <select
                      value={form} onChange={e => setForm(e.target.value)}
                      className="w-full glass-input text-sm text-slate-500"
                    >
                      <option value="">Select Form (Optional)</option>
                      <option value="1">Form 1</option>
                      <option value="2">Form 2</option>
                      <option value="3">Form 3</option>
                      <option value="4">Form 4</option>
                      <option value="5">Form 5</option>
                    </select>
                  </motion.div>
                )}
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  maxLength={254} placeholder="Email address"
                  className="w-full glass-input text-sm"
                />
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  maxLength={128} placeholder="Password"
                  className="w-full glass-input text-sm"
                />

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className="overflow-hidden">
                      <div className="bg-red-50/80 backdrop-blur-md dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs font-bold px-4 py-3 rounded-xl shadow-sm">
                        {error}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                    className="flex-[1] glass-input py-3 text-sm font-bold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                  >
                    {isRegistering ? 'Login Instead' : 'Sign Up'}
                  </button>
                  <button
                    type="submit" disabled={loading}
                    className="flex-[1.5] glass-button py-3 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        {isRegistering ? 'Create Account' : 'Sign In'}
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Bypass */}
              <div className="mt-10 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col items-center gap-3">
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-widest">Dev Access</p>
                <button
                  type="button" 
                  onClick={() => {
                    doLogin(async () => {
                      const { error } = await supabase.auth.signInWithPassword({ email: 'adam@demo.com', password: 'demo1234' });
                      if (error) throw error;
                    });
                  }} 
                  disabled={loading}
                  className="text-emerald-600/80 hover:text-emerald-600 dark:text-emerald-400/70 dark:hover:text-emerald-400 text-xs font-bold transition-colors cursor-pointer"
                >
                  Bypass as Student
                </button>
              </div>

              <div className="mt-6 text-center">
                <a href="/counselor/login" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 text-xs font-bold transition-colors">
                  Staff &amp; Counselors Login <ArrowRight size={12} />
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>
    </AnimatePresence>
  );
}
