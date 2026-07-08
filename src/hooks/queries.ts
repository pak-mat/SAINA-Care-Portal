import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useStudents(page = 1, limit = 20, search = '', form = '', risk = '', activeStatus = 'active') {
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

      if (error) throw error;
      
      return {
        data: data || [],
        total: count || 0,
        page,
        limit
      };
    },
    staleTime: 30000,
  });
}

export function useAppointments(page = 1, limit = 20, status = '', studentId = '') {
  return useQuery({
    queryKey: ['appointments', page, limit, status, studentId],
    queryFn: async () => {
      let query = supabase.from('appointments').select('*, users:counselorid (name)', { count: 'exact' });

      if (status) query = query.eq('status', status);
      if (studentId) query = query.eq('studentid', studentId);

      const from = (page - 1) * limit;
      const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, from + limit - 1);

      if (error) throw error;
      return { data: data || [], total: count || 0, page, limit };
    },
    staleTime: 10000,
  });
}

export function useTransfers(page = 1, limit = 20, status = '', studentId = '') {
  return useQuery({
    queryKey: ['school_transfers', page, limit, status, studentId],
    queryFn: async () => {
      let query = supabase.from('school_transfers').select('*', { count: 'exact' });

      if (status) query = query.eq('status', status);
      if (studentId) query = query.eq('studentid', studentId);

      const from = (page - 1) * limit;
      const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, from + limit - 1);

      if (error) throw error;
      return { data: data || [], total: count || 0, page, limit };
    },
    staleTime: 10000,
  });
}

export function useCheckins(page = 1, limit = 20, studentId = '') {
  return useQuery({
    queryKey: ['wellness_checkins', page, limit, studentId],
    queryFn: async () => {
      let query = supabase.from('wellness_checkins').select('*', { count: 'exact' });
      if (studentId) query = query.eq('studentid', studentId);

      const from = (page - 1) * limit;
      const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, from + limit - 1);

      if (error) throw error;
      return { data: data || [], total: count || 0, page, limit };
    },
    staleTime: 10000,
  });
}

export function useMessages(studentId: string) {
  return useQuery({
    queryKey: ['messages', studentId],
    queryFn: async () => {
      let query = supabase.from('messages').select('*');
      
      if (studentId) {
        query = query.eq('studentid', studentId);
      }

      const { data, error } = await query.order('timestamp', { ascending: true });
      if (error) throw error;
      
      return { data: data || [] };
    },
    enabled: !!studentId,
    refetchInterval: 5000,
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
        
      if (error) throw error;
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
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('wellness_checkins')
        .select('id')
        .eq('studentid', studentId)
        .gte('created_at', today.toISOString())
        .limit(1);
        
      if (error) throw error;
      return data && data.length > 0;
    },
    enabled: !!studentId
  });
}

export function useSubmitWellnessCheckin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { studentid: string, mood_score: number, checkin_notes?: string }) => {
      const { error } = await supabase.from('wellness_checkins').insert({
        studentid: data.studentid,
        mood_score: data.mood_score,
        checkin_notes: data.checkin_notes || null,
        status: 'pending'
      });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hasCheckedInToday', variables.studentid] });
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
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!studentId
  });
}

export function useSubmitCaseNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { studentid: string, counselorid: string, title?: string, content: string, note_type: string }) => {
      const { error } = await supabase.from('case_notes').insert({
        studentid: data.studentid,
        counselorid: data.counselorid,
        title: data.title || null,
        content: data.content,
        note_type: data.note_type
      });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['case_notes', variables.studentid] });
      queryClient.invalidateQueries({ queryKey: ['student_timeline', variables.studentid] });
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
        supabase.from('appointments').select('*').eq('studentid', studentId),
        supabase.from('school_transfers').select('*').eq('studentid', studentId),
        supabase.from('wellness_checkins').select('*').eq('studentid', studentId),
        supabase.from('case_notes').select('id, created_at, title, note_type, users:counselorid(name)').eq('studentid', studentId)
      ]);
      
      const timeline: any[] = [];
      
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
