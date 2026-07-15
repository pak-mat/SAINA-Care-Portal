import React, { useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, UserPlus } from 'lucide-react';

export function GlobalNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    // Listen for new direct messages
    const messageChannel = supabase.channel(`global_messages_${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as any;
        // If the message is intended for the current user and not sent by them
        if ((msg.studentid === user.id || msg.counselorid === user.id) && msg.senderid !== user.id) {
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-zinc-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black/5 dark:ring-white/10`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <MessageSquare size={20} />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">New Message</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 truncate">{msg.text}</p>
                  </div>
                </div>
              </div>
            </div>
          ), { duration: 4000 });
        }
      })
      .subscribe();

    // Listen for new friend requests
    const friendChannel = supabase.channel(`global_friends_${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'friend_requests', filter: `receiver_id=eq.${user.id}` }, (payload) => {
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-zinc-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black/5 dark:ring-white/10`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <UserPlus size={20} />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">New Care Peer Request</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Someone wants to connect with you.</p>
                </div>
              </div>
            </div>
          </div>
        ), { duration: 5000 });
      })
      .subscribe();

    // Listen for global data changes (real-time sync)
    const globalDataChannel = supabase.channel('global_data_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        queryClient.invalidateQueries({ queryKey: ['appointments'] });
        queryClient.invalidateQueries({ queryKey: ['student_timeline'] }); // If applicable
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'school_transfers' }, () => {
        queryClient.invalidateQueries({ queryKey: ['school_transfers'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(friendChannel);
      supabase.removeChannel(globalDataChannel);
    };
  }, [user?.id, queryClient]);

  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0
        }
      }}
    />
  );
}
