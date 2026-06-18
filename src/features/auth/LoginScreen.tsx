// File: src/features/auth/LoginScreen.jsx
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { loginUser, registerUser, bypassDemoStudent, bypassDemoCounselor } from '../../services/localEngine';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export default function LoginScreen() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    setTimeout(async () => {
      try {
        if (isRegistering) {
          if (!fullName || !email || !password || !studentId) throw new Error('Please fill out all fields.');
          const user = await registerUser(fullName, email, studentId, password);
          setIsFadingOut(true);
          setTimeout(() => login(user), 400); 
        } else {
          if (!email || !password) throw new Error('Please enter email and password.');
          const user = await loginUser(email, password);
          if (!user) throw new Error('Invalid credentials or user not found.');
          setIsFadingOut(true);
          setTimeout(() => login(user), 400); 
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred.');
      } finally {
        setLoading(false);
      }
    }, 500); 
  };

  const handleOAuthLogin = async (provider: 'google' | 'moe') => {
    setLoading(true);
    setError('');
    
    // Simulate OAuth redirect & connection wait time
    setTimeout(async () => {
      try {
        const user = await bypassDemoStudent();
        setIsFadingOut(true);
        setTimeout(() => login(user), 400); 
      } catch (err) {
        setError(`Error authenticating with ${provider === 'google' ? 'Google' : 'DELIMa'}.`);
        setLoading(false);
      }
    }, 1200);
  };

  const handleDemoStudent = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await bypassDemoStudent();
      setIsFadingOut(true);
      setTimeout(() => login(user), 400); 
    } catch (err) {
      setError('Error logging in as demo student.');
      setLoading(false);
    }
  };

  const handleDemoCounselor = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await bypassDemoCounselor();
      setIsFadingOut(true);
      setTimeout(() => login(user), 400); 
    } catch (err) {
      setError('Error logging in as demo counselor.');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {!isFadingOut && (
        <motion.div 
          className="min-h-screen relative flex items-center justify-center bg-[#eefaf7] p-4 overflow-hidden font-sans transition-colors duration-300"
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Top Right Circle */}
            <div className="absolute right-[-5%] top-[-5%] w-48 sm:w-[250px] h-48 sm:h-[250px] rounded-full bg-gradient-to-br from-[#1dd88b] to-[#04a05b] opacity-90 shadow-2xl blur-[0.5px]"></div>
            {/* Bottom Left Circle */}
            <div className="absolute left-[-10%] sm:left-[-5%] bottom-[-5%] w-56 sm:w-[280px] h-56 sm:h-[280px] rounded-full bg-gradient-to-tr from-[#029553] to-[#25df95] opacity-90 shadow-2xl blur-[0.5px]"></div>
            {/* Right Middle shape piece */}
            <div className="absolute right-[-5%] top-[50%] w-[80px] h-[120px] rounded-l-full bg-gradient-to-b from-[#1cdb8b] to-[#049d5b] opacity-80 backdrop-blur-sm -translate-y-1/2"></div>
            {/* Small horizontal pill protruding */}
            <div className="absolute right-[20px] sm:right-[50px] top-[50%] w-[70px] h-[16px] rounded-l-full bg-[#10b981] opacity-70 backdrop-blur-sm -translate-y-1/2"></div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[20rem] sm:max-w-[22rem] w-full relative z-10 px-2 sm:px-0"
          >
            <div className="flex flex-col items-center mx-auto mb-5 text-center">
              <span className="text-[#0eaf72] text-[9px] font-bold tracking-[0.25em] mb-1.5 uppercase">SAINA CARE STUDENT</span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight">Student Portal</h1>
            </div>

            <div className="bg-white/70 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_0_rgba(25,160,115,0.08)] border border-white p-5 sm:p-6 mb-6 relative">
               <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
                 {/* Social Buttons */}
                 <div className="space-y-3">
                   <button 
                     type="button" 
                     onClick={() => handleOAuthLogin('google')}
                     disabled={loading}
                     className="w-full flex items-center justify-center gap-2.5 bg-white text-slate-700 py-2.5 rounded-lg text-[13px] font-bold shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-70"
                   >
                     {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : <span className="text-[#4285F4] font-extrabold text-[15px] leading-none">G</span>}
                     {loading ? 'Connecting...' : 'Continue with Google'}
                   </button>
                   
                   <button 
                     type="button" 
                     onClick={() => handleOAuthLogin('moe')}
                     disabled={loading}
                     className="w-full flex items-center justify-center bg-gradient-to-r from-[#6b46f0] to-[#b360f0] text-white py-2.5 rounded-lg text-[13px] font-bold shadow-md hover:opacity-90 transition-opacity disabled:opacity-70"
                   >
                     {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In via DELIMa (MOE)'}
                   </button>
                 </div>

                 <div className="flex flex-row items-center gap-3 text-[9px] font-bold text-slate-300 uppercase tracking-widest pt-1 pb-1">
                   <div className="flex-1 border-t border-slate-200"></div>
                   <span>OR CONNECT VIA EMAIL</span>
                   <div className="flex-1 border-t border-slate-200"></div>
                 </div>

                 {/* Inputs */}
                 <div className="space-y-3">
                   {isRegistering && (
                     <>
                       <div>
                         <input 
                           type="text" 
                           value={fullName}
                           onChange={(e) => setFullName(e.target.value)}
                           className="w-full bg-white/60 border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-medium text-slate-800 outline-none focus:bg-white focus:border-[#0eaf72] focus:ring-2 focus:ring-[#0eaf72]/20 transition-all placeholder:text-slate-400 shadow-sm"
                           placeholder="Full Name"
                         />
                       </div>
                       <div>
                         <input 
                           type="text" 
                           value={studentId}
                           onChange={(e) => setStudentId(e.target.value)}
                           className="w-full bg-white/60 border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-medium text-slate-800 outline-none focus:bg-white focus:border-[#0eaf72] focus:ring-2 focus:ring-[#0eaf72]/20 transition-all placeholder:text-slate-400 shadow-sm"
                           placeholder="Student ID"
                         />
                       </div>
                     </>
                   )}
                   <div>
                     <input 
                       type="email" 
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       className="w-full bg-white/60 border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-medium text-slate-800 outline-none focus:bg-white focus:border-[#0eaf72] focus:ring-2 focus:ring-[#0eaf72]/20 transition-all placeholder:text-slate-400 shadow-sm"
                       placeholder="Email address"
                     />
                   </div>
                   <div>
                     <input 
                       type="password" 
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       className="w-full bg-white/60 border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-medium text-slate-800 outline-none focus:bg-white focus:border-[#0eaf72] focus:ring-2 focus:ring-[#0eaf72]/20 transition-all placeholder:text-slate-400 shadow-sm"
                       placeholder="Password"
                     />
                   </div>
                 </div>

                 <AnimatePresence>
                   {error && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       exit={{ opacity: 0, height: 0 }}
                       className="overflow-hidden"
                     >
                       <div className="text-red-500 text-xs font-bold text-center mt-2">
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
                     className="flex-[1] bg-white text-slate-800 py-2.5 rounded-lg text-[13px] font-bold shadow-sm transition-all hover:bg-slate-50 text-center border border-slate-100"
                   >
                     {isRegistering ? 'Login Instead' : 'Sign Up'}
                   </button>
                   <button 
                     type="submit"
                     disabled={loading}
                     className="flex-[1.2] bg-[#0eaa70] text-white py-2.5 rounded-lg text-[13px] font-bold shadow-md transition-all hover:bg-[#0d9964] flex items-center justify-center disabled:opacity-70"
                   >
                     {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isRegistering ? 'Register' : 'Login')}
                   </button>
                 </div>
               </form>
            </div>

            <div className="flex flex-col items-center gap-2 mt-6 text-[#0eaa70]/60 text-[10px] sm:text-xs font-semibold tracking-wide">
               <button onClick={handleDemoStudent} disabled={loading} className="hover:text-[#0eaa70] transition-colors leading-none outline-none">
                  Dev: Bypass as Student
               </button>
            </div>

            <div className="mt-8 text-center">
              <a href="/counselor" className="text-slate-500 hover:text-slate-700 text-xs font-medium transition-colors">
                Staff & Counselors Login &rarr;
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
