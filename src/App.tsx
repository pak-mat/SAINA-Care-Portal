// File: src/App.tsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import GlobalErrorBoundary from './components/layout/GlobalErrorBoundary';
import { GlobalNotifications } from './components/GlobalNotifications';
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

function RequireAuth({ children, role }: { children: React.ReactNode, role?: string }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    if (role === 'counselor' || location.pathname.startsWith('/counselor')) {
      return <Navigate to="/counselor/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'counselor') return <Navigate to="/counselor/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  const { loadingApp } = useAuth();

  if (loadingApp) {
    return (
      <AppLayoutWrapper>
        <LoadingFallback />
      </AppLayoutWrapper>
    );
  }

  return (
    <Suspense fallback={<AppLayoutWrapper><LoadingFallback /></AppLayoutWrapper>}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={
          <AppLayoutWrapper>
            <LoginScreen />
          </AppLayoutWrapper>
        } />
        
        <Route path="/counselor/login" element={
          <AppLayoutWrapper>
            <CounselorLoginScreen />
          </AppLayoutWrapper>
        } />
        
        <Route path="/student/dashboard/*" element={
          <RequireAuth role="student">
            <AppLayoutWrapper>
              <StudentDashboardHub />
            </AppLayoutWrapper>
          </RequireAuth>
        } />
        
        <Route path="/counselor/dashboard/*" element={
          <RequireAuth role="counselor">
            <AppLayoutWrapper>
              <CounselorDashboardHub />
            </AppLayoutWrapper>
          </RequireAuth>
        } />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <GlobalErrorBoundary>
            <GlobalNotifications />
            <Router>
              <AppRoutes />
            </Router>
          </GlobalErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
