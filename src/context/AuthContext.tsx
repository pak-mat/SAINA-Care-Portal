import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

import { User as AppUser } from '../types';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loadingApp, setLoadingApp] = useState(true);

  // Helper to resolve role from auth session (app_metadata first, then user_metadata)
  const resolveRole = (sessionUser: User): string => {
    return sessionUser.app_metadata?.role
      || sessionUser.user_metadata?.role
      || 'student';
  };

  // Helper to fetch the extended profile
  const fetchProfile = async (sessionUser: User) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', sessionUser.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to minimal user metadata if profile fetch fails
      setUser({
        id: sessionUser.id,
        email: sessionUser.email!,
        name: sessionUser.user_metadata?.name || sessionUser.email || '',
        role: resolveRole(sessionUser),
      });
    } else if (data) {
      // Map snake_case db fields to camelCase
      const mappedUser: AppUser = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        studentId: data.studentid,
        status: data.status,
        signature: data.signature,
        bio: data.bio || data.preferences?.bio || '',
        bannerStyle: data.banner_style || data.preferences?.bannerStyle || 'indigo_dusk',
        avatarColor: data.avatar_color || data.preferences?.avatarColor || 'indigo',
        avatarUrl: data.preferences?.avatarUrl || '',
        interests: data.interests || data.preferences?.interests || [],
        socialHandles: data.social_handles || data.preferences?.socialHandles || {},
        preferences: data.preferences,
        form: data.form,
        gender: data.gender,
        age: data.age,
        riskLevel: data.risklevel,
        accountStatus: data.account_status,
        guardianName: data.guardian_name,
        emergencyContact: data.emergency_contact,
        assignedCounselor: data.assigned_counselor,
      };
      setUser(mappedUser);
    }
    setLoadingApp(false);
  };

  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setUser(null);
        setLoadingApp(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = (u: any) => setUser(u);
  
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateUser = (u: any) => {
    setUser(u);
  };

  return (
    <AuthContext.Provider value={{ user, loadingApp, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
