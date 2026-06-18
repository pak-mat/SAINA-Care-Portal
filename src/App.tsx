// File: src/App.tsx
import React, { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppLayoutWrapper from './components/layout/AppLayoutWrapper';
import { Loader2 } from 'lucide-react';

const LoginScreen = lazy(() => import('./features/auth/LoginScreen'));
const CounselorLoginScreen = lazy(() => import('./features/auth/CounselorLoginScreen'));
const StudentDashboardHub = lazy(() => import('./features/student/StudentDashboardHub'));
const CounselorDashboardHub = lazy(() => import('./features/counselor/CounselorDashboardHub'));

function LoadingFallback() {
  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-black transition-colors duration-200">
      {/* Navbar Skeleton */}
      <div className="h-16 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-700 animate-pulse"></div>
          <div className="w-32 h-6 rounded-md bg-slate-200 dark:bg-zinc-700 animate-pulse"></div>
        </div>
        <div className="flex gap-4">
          <div className="w-24 h-8 rounded-full bg-slate-200 dark:bg-zinc-700 animate-pulse"></div>
          <div className="hidden sm:block w-32 h-8 rounded-md bg-slate-200 dark:bg-zinc-700 animate-pulse"></div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Skeleton (Hidden on Mobile) */}
        <div className="hidden md:flex w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 p-4 flex-col gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3 items-center px-4 py-3">
              <div className="w-5 h-5 rounded-md bg-slate-200 dark:bg-zinc-700 animate-pulse"></div>
              <div className="w-24 h-4 rounded-md bg-slate-200 dark:bg-zinc-700 animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
          {/* Hero Widget Skeleton */}
          <div className="w-full h-48 sm:h-56 rounded-2xl bg-slate-200 dark:bg-zinc-800/80 animate-pulse"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Area Skeleton */}
            <div className="lg:col-span-2 space-y-4">
              <div className="w-full h-32 rounded-xl bg-slate-200 dark:bg-zinc-800/60 animate-pulse"></div>
              <div className="w-full h-32 rounded-xl bg-slate-200 dark:bg-zinc-800/60 animate-pulse"></div>
              <div className="w-full h-32 rounded-xl bg-slate-200 dark:bg-zinc-800/60 animate-pulse"></div>
            </div>
            
            {/* Sidebar Data Skeleton */}
            <div className="lg:col-span-1 space-y-4">
              <div className="w-full h-64 rounded-xl bg-slate-200 dark:bg-zinc-800/60 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Nav Skeleton */}
        <div className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex justify-around items-center px-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-zinc-700 animate-pulse flex flex-col items-center justify-center gap-1"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, loadingApp } = useAuth();

  if (loadingApp) {
    return (
      <AppLayoutWrapper>
        <LoadingFallback />
      </AppLayoutWrapper>
    );
  }

  if (!user) {
    const isCounselorRoute = window.location.pathname.startsWith('/counselor');

    if (isCounselorRoute) {
      return (
        <AppLayoutWrapper>
          <Suspense fallback={<LoadingFallback />}>
            <CounselorLoginScreen />
          </Suspense>
        </AppLayoutWrapper>
      );
    }

    return (
      <AppLayoutWrapper>
        <Suspense fallback={<LoadingFallback />}>
          <LoginScreen />
        </Suspense>
      </AppLayoutWrapper>
    );
  }

  if (user.role === 'student') {
    return (
      <AppLayoutWrapper>
        <Suspense fallback={<LoadingFallback />}>
          <StudentDashboardHub />
        </Suspense>
      </AppLayoutWrapper>
    );
  } else {
    return (
      <AppLayoutWrapper>
        <Suspense fallback={<LoadingFallback />}>
          <CounselorDashboardHub />
        </Suspense>
      </AppLayoutWrapper>
    );
  }
}


export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

