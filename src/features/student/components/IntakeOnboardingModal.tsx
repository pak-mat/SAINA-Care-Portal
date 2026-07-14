import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, HeartPulse, UserCircle, Target, CheckCircle2 } from 'lucide-react';
import { useHasCompletedIntake, useSubmitIntake } from '../../../hooks/queries';

export default function IntakeOnboardingModal({ userId, userName }: { userId: string, userName?: string }) {
  const { data: hasCompletedIntake, isLoading } = useHasCompletedIntake(userId);
  const submitIntake = useSubmitIntake();
  
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  // Form State
  const [familyBackground, setFamilyBackground] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [previousCounseling, setPreviousCounseling] = useState<boolean | null>(null);
  const [counselingGoals, setCounselingGoals] = useState('');

  useEffect(() => {
    // Show modal if they haven't completed intake and it's not loading
    if (hasCompletedIntake === false && !isLoading) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedIntake, isLoading]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    submitIntake.mutate(
      { 
        studentId: userId, 
        familyBackground, 
        medicalHistory, 
        previousCounseling: previousCounseling || false, 
        counselingGoals 
      },
      {
        onSuccess: () => {
          setStep(4); // Success step
          setTimeout(() => setIsOpen(false), 2500);
        },
        onError: (err: any) => {
          alert(`Error saving intake form: ${err.message || 'Unknown error'}`);
        }
      }
    );
  };

  const nextStep = () => {
    if (step < 3) setStep(s => s + 1);
    else handleSubmit();
  };

  const prevStep = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const steps = [
    {
      title: "Family & Living Situation",
      subtitle: "Help us understand your home environment.",
      icon: UserCircle,
      content: (
        <div className="space-y-3 text-left">
          <p className="text-sm text-slate-500 dark:text-zinc-400 mb-2">
            Who do you currently live with?
          </p>
          {[
            "Living with both parents",
            "Living with one parent",
            "Living with relatives/guardians",
            "Living independently / Other"
          ].map(option => (
            <button
              key={option}
              onClick={() => setFamilyBackground(option)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                familyBackground === option 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                  : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:border-emerald-200'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Health & Medical History",
      subtitle: "Your well-being is our priority.",
      icon: HeartPulse,
      content: (
        <div className="space-y-3 text-left">
          <p className="text-sm text-slate-500 dark:text-zinc-400 mb-2">
            Do you have any ongoing medical or mental health conditions?
          </p>
          {[
            "No known conditions",
            "Physical health condition (e.g., asthma, migraines)",
            "Mental health condition (e.g., anxiety, ADHD)",
            "Both physical and mental health conditions"
          ].map(option => (
            <button
              key={option}
              onClick={() => setMedicalHistory(option)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                medicalHistory === option 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                  : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:border-emerald-200'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Previous Counseling",
      subtitle: "Have you seen a counselor before?",
      icon: ShieldCheck,
      content: (
        <div className="space-y-4 text-left">
          <p className="text-sm text-slate-500 dark:text-zinc-400 mb-2">
            Have you ever received counseling or therapy in the past?
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setPreviousCounseling(true)}
              className={`flex-1 py-4 rounded-xl border-2 transition-all font-bold ${previousCounseling === true ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 dark:border-zinc-800 text-slate-500 hover:border-emerald-200'}`}
            >
              Yes
            </button>
            <button
              onClick={() => setPreviousCounseling(false)}
              className={`flex-1 py-4 rounded-xl border-2 transition-all font-bold ${previousCounseling === false ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 dark:border-zinc-800 text-slate-500 hover:border-emerald-200'}`}
            >
              No
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Your Goals",
      subtitle: "What do you hope to achieve?",
      icon: Target,
      content: (
        <div className="space-y-3 text-left">
          <p className="text-sm text-slate-500 dark:text-zinc-400 mb-2">
            What are your main reasons for joining Saina Care?
          </p>
          {[
            "Manage academic stress & pressure",
            "Improve focus, productivity & habits",
            "Deal with personal or family issues",
            "Work on mental health (e.g., anxiety, mood)",
            "Career guidance and future planning"
          ].map(option => (
            <button
              key={option}
              onClick={() => setCounselingGoals(option)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                counselingGoals === option 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                  : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:border-emerald-200'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )
    }
  ];

  const CurrentIcon = step < 4 ? steps[step].icon : CheckCircle2;

  const isStepValid = () => {
    if (step === 0) return familyBackground !== '';
    if (step === 1) return medicalHistory !== '';
    if (step === 2) return previousCounseling !== null;
    if (step === 3) return counselingGoals !== '';
    return true;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blurred background overlay prevents clicking outside */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden relative z-10 border border-slate-100 dark:border-zinc-800 flex flex-col max-h-[90vh]"
      >
        <div className="p-8 text-center space-y-6 flex-1 overflow-y-auto scrollbar-hide">
          {step < 4 ? (
            <>
              <div className="flex justify-center mb-2">
                <div className="flex items-center gap-2">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-emerald-500' : i < step ? 'w-2 bg-emerald-300 dark:bg-emerald-800' : 'w-2 bg-slate-200 dark:bg-zinc-800'}`} />
                  ))}
                </div>
              </div>

              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg mx-auto flex items-center justify-center">
                <CurrentIcon size={32} />
              </div>
              
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {step === 0 && userName ? `Welcome, ${userName.split(' ')[0]}!` : steps[step].title}
                </h2>
                <p className="text-slate-500 dark:text-zinc-400 mt-2 font-medium">
                  {step === 0 && userName ? "Let's personalize your experience. " : ""}{steps[step].subtitle}
                </p>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {steps[step].content}
                </motion.div>
              </AnimatePresence>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center justify-center"
            >
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
                <Sparkles size={40} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-3">All Set!</h2>
              <p className="text-slate-500 dark:text-zinc-400 font-medium">Your profile is complete. Redirecting to dashboard...</p>
            </motion.div>
          )}
        </div>

        {step < 4 && (
          <div className="p-6 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 flex justify-between gap-4">
            <button
              onClick={prevStep}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${step > 0 ? 'text-slate-600 hover:bg-slate-200 dark:text-zinc-300 dark:hover:bg-zinc-800' : 'text-transparent cursor-default'}`}
              disabled={step === 0 || submitIntake.isPending}
            >
              Back
            </button>
            <button
              onClick={nextStep}
              disabled={submitIntake.isPending || !isStepValid()}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitIntake.isPending ? 'Saving...' : step === 3 ? 'Complete Setup' : 'Continue'}
              {!submitIntake.isPending && step < 3 && <ArrowRight size={18} />}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
