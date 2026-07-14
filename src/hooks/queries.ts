import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { PAGINATION, CACHE_TIMES } from '../utils/constants';
import { handleSupabaseError } from '../utils/errors';

import { User, AppointmentRequest, PermissionRequest } from '../types';

export const mapUserDTO = (dbUser: any): User => ({
  id: dbUser.id,
  name: dbUser.name,
  email: dbUser.email,
  role: dbUser.role,
  studentId: dbUser.studentid,
  status: dbUser.status,
  bio: dbUser.bio,
  bannerStyle: dbUser.banner_style || dbUser.bannerStyle,
  avatarColor: dbUser.avatar_color || dbUser.avatarColor,
  interests: dbUser.interests,
  socialHandles: dbUser.social_handles || dbUser.socialHandles,
  preferences: dbUser.preferences,
  form: dbUser.form,
  gender: dbUser.gender,
  age: dbUser.age,
  riskLevel: dbUser.risklevel,
  accountStatus: dbUser.account_status || dbUser.preferences?.accountStatus || dbUser.status,
  guardianName: dbUser.guardian_name || dbUser.preferences?.guardianName,
  emergencyContact: dbUser.emergency_contact || dbUser.preferences?.emergencyContact,
  assignedCounselor: dbUser.assigned_counselor
});

export const mapAppointmentDTO = (dbAppt: any): AppointmentRequest => ({
  id: dbAppt.id,
  studentId: dbAppt.studentid,
  studentName: dbAppt.studentname || dbAppt.users?.name || 'Unknown',
  status: dbAppt.status,
  submissionDate: dbAppt.created_at,
  assignedTo: dbAppt.assignedto,
  claimedAt: dbAppt.claimedat,
  resolvedBy: dbAppt.resolvedby,
  resolvedAt: dbAppt.resolvedat,
  counselorNotes: dbAppt.counselornotes,
  privateCounselorNotes: dbAppt.privatecounselornotes,
  type: 'appointment',
  choice1: dbAppt.choice1,
  choice2: dbAppt.choice2,
  choice3: dbAppt.choice3,
  reasonCategory: dbAppt.reasoncategory,
  details: dbAppt.details,
  scheduledAt: dbAppt.scheduledat,
  notified: dbAppt.notified,
});

export const mapTransferDTO = (dbTrans: any): PermissionRequest => ({
  id: dbTrans.id,
  studentId: dbTrans.studentid,
  studentName: dbTrans.studentname || dbTrans.users?.name || 'Unknown',
  status: dbTrans.status,
  submissionDate: dbTrans.created_at,
  assignedTo: dbTrans.assignedto,
  claimedAt: dbTrans.claimedat,
  resolvedBy: dbTrans.resolvedby,
  resolvedAt: dbTrans.resolvedat,
  counselorNotes: dbTrans.counselornotes,
  privateCounselorNotes: dbTrans.privatecounselornotes,
  type: 'permission',
  targetSchool: dbTrans.targetschool,
  reason: dbTrans.reason,
  transferFormsFile: dbTrans.transferformsfile,
  academicRecordsFile: dbTrans.academicrecordsfile,
  idDocumentsFile: dbTrans.iddocumentsfile,
});


export function useStudents(page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, search = '', form = '', risk = '', activeStatus = 'active') {
  return useQuery({
    queryKey: ['students', page, limit, search, form, risk, activeStatus],
    queryFn: async () => {
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('role', 'student');

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      if (form) {
        query = query.eq('form', form);
      }
      if (risk) {
        query = query.eq('risklevel', risk);
      }
      if (activeStatus === 'active') {
        query = query.neq('status', 'Archived');
      } else if (activeStatus === 'archived') {
        query = query.eq('status', 'Archived');
      }

      // Pagination logic
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) handleSupabaseError(error, 'Failed to fetch data');
      
      return {
        data: (data || []).map(mapUserDTO),
        total: count || 0,
        page,
        limit
      };
    },
    staleTime: CACHE_TIMES.STUDENTS_STALE_TIME,
  });
}

export function useAppointments(page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, status = '', studentId = '') {
  return useQuery({
    queryKey: ['appointments', page, limit, status, studentId],
    queryFn: async () => {
      let query = supabase.from('appointments').select('*, users:counselorid (name)', { count: 'exact' });

      if (status) query = query.eq('status', status);
      if (studentId) query = query.eq('studentid', studentId);

      const from = (page - 1) * limit;
      const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, from + limit - 1);

      if (error) handleSupabaseError(error, 'Failed to fetch data');
      return { data: (data || []).map(mapAppointmentDTO), total: count || 0, page, limit };
    },
    staleTime: CACHE_TIMES.APPOINTMENTS_STALE_TIME,
  });
}

export function useTransfers(page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, status = '', studentId = '') {
  return useQuery({
    queryKey: ['school_transfers', page, limit, status, studentId],
    queryFn: async () => {
      let query = supabase.from('school_transfers').select('*', { count: 'exact' });

      if (status) query = query.eq('status', status);
      if (studentId) query = query.eq('studentid', studentId);

      const from = (page - 1) * limit;
      const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, from + limit - 1);

      if (error) handleSupabaseError(error, 'Failed to fetch data');
      return { data: (data || []).map(mapTransferDTO), total: count || 0, page, limit };
    },
    staleTime: CACHE_TIMES.TRANSFERS_STALE_TIME,
  });
}

export function useCheckins(page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, studentId = '') {
  return useQuery({
    queryKey: ['wellness_checkins', page, limit, studentId],
    queryFn: async () => {
      let query = supabase.from('wellness_checkins').select('*', { count: 'exact' });
      if (studentId) query = query.eq('studentid', studentId);

      const from = (page - 1) * limit;
      const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, from + limit - 1);

      if (error) handleSupabaseError(error, 'Failed to fetch data');
      return { data: data || [], total: count || 0, page, limit };
    },
    staleTime: 10000,
  });
}

export function useMessages(studentId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!studentId) return;
    const channel = supabase
      .channel(`messages-${studentId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `studentid=eq.${studentId}` },
        (payload) => {
          queryClient.setQueryData(['messages', studentId], (old: any) => {
            if (!old) return { data: [payload.new] };
            return { data: [...old.data, payload.new] };
          });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId, queryClient]);

  return useQuery({
    queryKey: ['messages', studentId],
    queryFn: async () => {
      let query = supabase.from('messages').select('*');
      
      if (studentId) {
        query = query.eq('studentid', studentId);
      }

      const { data, error } = await query.order('timestamp', { ascending: true });
      if (error) handleSupabaseError(error, 'Failed to fetch data');
      
      return { data: data || [] };
    },
    enabled: !!studentId,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('date', { ascending: false });
        
      if (error) handleSupabaseError(error, 'Failed to fetch data');
      return { data: data || [] };
    },
    refetchInterval: 15000,
  });
}

export function useHasCheckedInToday(studentId: string) {
  return useQuery({
    queryKey: ['hasCheckedInToday', studentId],
    queryFn: async () => {
      if (!studentId) return false;
      const today = new Date();
      const startOfDayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
      
      const { data, error } = await supabase
        .from('wellness_checkins')
        .select('id')
        .eq('studentid', studentId)
        .gte('created_at', startOfDayUTC.toISOString())
        .limit(1);
        
      if (error) handleSupabaseError(error, 'Failed to fetch data');
      return data && data.length > 0;
    },
    enabled: !!studentId
  });
}

export function useSubmitWellnessCheckin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { studentId: string, moodScore: number, checkinNotes?: string }) => {
      const { error } = await supabase.from('wellness_checkins').insert({
        studentid: data.studentId,
        mood_score: data.moodScore,
        checkin_notes: data.checkinNotes || null,
        status: 'pending'
      });
      if (error) handleSupabaseError(error, 'Failed to fetch data');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hasCheckedInToday', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['wellness_checkins'] });
    }
  });
}

export function useCaseNotes(studentId: string) {
  return useQuery({
    queryKey: ['case_notes', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data, error } = await supabase
        .from('case_notes')
        .select(`
          *,
          users:counselorid (name)
        `)
        .eq('studentid', studentId)
        .order('created_at', { ascending: false });
        
      if (error) handleSupabaseError(error, 'Failed to fetch data');
      return data || [];
    },
    enabled: !!studentId
  });
}

export function useSubmitCaseNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { studentId: string, counselorId: string, title?: string, content: string, noteType: string }) => {
      const { error } = await supabase.from('case_notes').insert({
        studentid: data.studentId,
        counselorid: data.counselorId,
        title: data.title || null,
        content: data.content,
        note_type: data.noteType
      });
      if (error) handleSupabaseError(error, 'Failed to fetch data');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['case_notes', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['student_timeline', variables.studentId] });
    }
  });
}

// Aggregates Timeline events for a student
export function useStudentTimeline(studentId: string) {
  return useQuery({
    queryKey: ['student_timeline', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      const [appointments, transfers, checkins, caseNotes] = await Promise.all([
        supabase.from('appointments').select('*').eq('studentid', studentId).limit(50),
        supabase.from('school_transfers').select('*').eq('studentid', studentId).limit(50),
        supabase.from('wellness_checkins').select('*').eq('studentid', studentId).limit(50),
        supabase.from('case_notes').select('id, created_at, title, note_type, users:counselorid(name)').eq('studentid', studentId).limit(50)
      ]);
      
      const timeline: Array<{ type: string; date: Date; data: any }> = [];
      
      appointments.data?.forEach(a => timeline.push({ type: 'appointment', date: new Date(a.created_at), data: a }));
      transfers.data?.forEach(t => timeline.push({ type: 'transfer', date: new Date(t.created_at), data: t }));
      checkins.data?.forEach(c => timeline.push({ type: 'checkin', date: new Date(c.created_at), data: c }));
      caseNotes.data?.forEach(cn => timeline.push({ type: 'case_note', date: new Date(cn.created_at), data: cn }));
      
      // Sort descending by date
      return timeline.sort((a, b) => b.date.getTime() - a.date.getTime());
    },
    enabled: !!studentId
  });
}

export function useHasCompletedIntake(studentId: string) {
  return useQuery({
    queryKey: ['hasCompletedIntake', studentId],
    queryFn: async () => {
      if (!studentId) return false;
      const { data, error } = await supabase
        .from('student_intakes')
        .select('id')
        .eq('studentid', studentId)
        .limit(1);
        
      if (error && error.code !== 'PGRST116') {
        handleSupabaseError(error, 'Failed to fetch intake status');
      }
      return data && data.length > 0;
    },
    enabled: !!studentId
  });
}

export function useSubmitIntake() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { 
      studentId: string, 
      familyBackground?: string, 
      medicalHistory?: string, 
      previousCounseling?: boolean, 
      counselingGoals?: string 
    }) => {
      const { error } = await supabase.from('student_intakes').upsert({
        studentid: data.studentId,
        family_background: data.familyBackground || null,
        medical_history: data.medicalHistory || null,
        previous_counseling: data.previousCounseling || false,
        counseling_goals: data.counselingGoals || null
      }, { onConflict: 'studentid' });
      if (error) handleSupabaseError(error, 'Failed to submit intake form');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hasCompletedIntake', variables.studentId] });
    }
  });
}

export function useStudentIntake(studentId: string) {
  return useQuery({
    queryKey: ['studentIntake', studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const { data, error } = await supabase
        .from('student_intakes')
        .select('*')
        .eq('studentid', studentId)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        handleSupabaseError(error, 'Failed to fetch intake data');
      }
      return data || null;
    },
    enabled: !!studentId
  });
}
