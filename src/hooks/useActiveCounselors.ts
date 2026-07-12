import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { User } from '../types';

export function useActiveCounselors() {
  return useQuery({
    queryKey: ['activeCounselors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'counselor')
        .neq('status', 'Away');

      if (error) {
        throw new Error(error.message);
      }
      
      return (data || []) as User[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
