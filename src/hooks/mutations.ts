import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../utils/errors';
import toast from 'react-hot-toast';

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('users').update(data).eq('id', id);
      if (error) handleSupabaseError(error, 'Database mutation failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error: Error) => {
      console.error('Update error:', error);
      toast.error(`Failed to update profile: ${error.message}`);
    }
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('appointments').insert(data);
      if (error) handleSupabaseError(error, 'Database mutation failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['student_timeline'] });
    },
    onError: (error: Error) => {
      console.error('Create appointment error:', error);
      toast.error('Failed to schedule appointment. Please try again.');
    }
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('school_transfers').insert(data);
      if (error) handleSupabaseError(error, 'Database mutation failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school_transfers'] });
      queryClient.invalidateQueries({ queryKey: ['student_timeline'] });
      toast.success("Transfer request submitted successfully.");
    },
    onError: (error: Error) => {
      console.error('Transfer error:', error);
      toast.error('Failed to submit transfer request.');
    }
  });
}

export function useUpdateCaseStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ table, id, data }: { table: string; id: string; data: any }) => {
      const { error } = await supabase.from(table).update(data).eq('id', id);
      if (error) handleSupabaseError(error, 'Database mutation failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['school_transfers'] });
      toast.success("Status updated successfully.");
    },
    onError: (error: Error) => {
      console.error('Update status error:', error);
      toast.error(`Failed to update status: ${error.message}`);
    }
  });
}
