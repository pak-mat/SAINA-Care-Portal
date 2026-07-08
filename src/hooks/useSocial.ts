import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

type UserProfile = Database['public']['Tables']['users']['Row'];

export function usePresence() {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlineUsers(state);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    onlineUsers,
    isUserOnline: (userId: string) => !!onlineUsers[userId]
  };
}

export function useDirectory() {
  return useQuery({
    queryKey: ['directory'],
    queryFn: async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      return data as UserProfile[];
    }
  });
}

export function useSocialNetwork(userId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    const channel = supabase.channel('friend_requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friend_requests' }, () => {
        queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
        queryClient.invalidateQueries({ queryKey: ['friends'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kudos' }, () => {
        queryClient.invalidateQueries({ queryKey: ['kudos'] });
      })
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [userId, queryClient]);

  const friendsQuery = useQuery({
    queryKey: ['friends', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);
      if (error) throw error;
      return data;
    }
  });

  const requestsReceivedQuery = useQuery({
    queryKey: ['friendRequests', 'received', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('receiver_id', userId)
        .eq('status', 'pending');
      if (error) throw error;
      return data;
    }
  });

  const requestsSentQuery = useQuery({
    queryKey: ['friendRequests', 'sent', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('sender_id', userId)
        .eq('status', 'pending');
      if (error) throw error;
      return data;
    }
  });

  const kudosReceivedQuery = useQuery({
    queryKey: ['kudos', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('kudos')
        .select('*', { count: 'exact' })
        .eq('receiver_id', userId);
      if (error) throw error;
      return count || 0;
    }
  });

  const sendRequest = useMutation({
    mutationFn: async (receiverId: string) => {
      if (!userId) throw new Error('Not logged in');
      const { error } = await supabase.from('friend_requests').insert({
        sender_id: userId,
        receiver_id: receiverId
      });
      if (error) throw error;
    }
  });

  const acceptRequest = useMutation({
    mutationFn: async (senderId: string) => {
      if (!userId) throw new Error('Not logged in');
      const { error: err1 } = await supabase.from('friend_requests')
        .update({ status: 'accepted' })
        .match({ sender_id: senderId, receiver_id: userId });
      if (err1) throw err1;

      const { error: err2 } = await supabase.from('friends').insert({
        user_id: senderId,
        friend_id: userId
      });
      if (err2) throw err2;
    }
  });

  const declineRequest = useMutation({
    mutationFn: async (senderId: string) => {
      if (!userId) throw new Error('Not logged in');
      const { error } = await supabase.from('friend_requests')
        .update({ status: 'declined' })
        .match({ sender_id: senderId, receiver_id: userId });
      if (error) throw error;
    }
  });

  const removeFriend = useMutation({
    mutationFn: async (friendId: string) => {
      if (!userId) throw new Error('Not logged in');
      const { error } = await supabase.from('friends')
        .delete()
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);
      if (error) throw error;
    }
  });

  const sendKudos = useMutation({
    mutationFn: async (receiverId: string) => {
      if (!userId) throw new Error('Not logged in');
      const { error } = await supabase.from('kudos').insert({
        sender_id: userId,
        receiver_id: receiverId
      });
      if (error) throw error;
    }
  });

  return {
    friends: friendsQuery.data || [],
    requestsReceived: requestsReceivedQuery.data || [],
    requestsSent: requestsSentQuery.data || [],
    kudosCount: kudosReceivedQuery.data || 0,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
    sendKudos
  };
}

export function useTimeline() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase.channel('timeline_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timeline_posts' }, () => {
        queryClient.invalidateQueries({ queryKey: ['timeline'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timeline_likes' }, () => {
        queryClient.invalidateQueries({ queryKey: ['timeline'] });
      })
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const PAGE_SIZE = 10;

  const timelineQuery = useInfiniteQuery({
    queryKey: ['timeline'],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      const { data, error } = await supabase
        .from('timeline_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);
        
      if (error) throw error;
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    }
  });

  const createPost = useMutation({
    mutationFn: async (post: { author_id: string; author_name: string; author_avatar_color: string; content: string; image_url?: string }) => {
      const { error } = await supabase.from('timeline_posts').insert(post);
      if (error) throw error;
    }
  });

  const toggleLike = useMutation({
    mutationFn: async ({ postId, userId }: { postId: string, userId: string }) => {
      const { data, error: fetchErr } = await supabase.from('timeline_likes').select('*').match({ post_id: postId, user_id: userId }).single();
      if (fetchErr && fetchErr.code !== 'PGRST116') throw fetchErr;
      
      if (data) {
        await supabase.from('timeline_likes').delete().match({ post_id: postId, user_id: userId });
        await supabase.rpc('decrement_likes', { p_id: postId });
      } else {
        await supabase.from('timeline_likes').insert({ post_id: postId, user_id: userId });
        await supabase.rpc('increment_likes', { p_id: postId });
      }
    }
  });

  return {
    posts: timelineQuery.data?.pages.flat() || [],
    fetchNextPage: timelineQuery.fetchNextPage,
    hasNextPage: timelineQuery.hasNextPage,
    isFetchingNextPage: timelineQuery.isFetchingNextPage,
    createPost,
    toggleLike
  };
}
