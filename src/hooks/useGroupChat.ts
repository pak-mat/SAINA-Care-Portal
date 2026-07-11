import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';

export function useDirectMessages(userId?: string, partnerId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId || !partnerId) return;
    const channel = supabase.channel(`dm_${userId}_${partnerId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as any;
        if ((msg.studentid === userId && msg.counselorid === partnerId) || 
            (msg.studentid === partnerId && msg.counselorid === userId)) {
          queryClient.invalidateQueries({ queryKey: ['messages', userId, partnerId] });
        }
      })
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [userId, partnerId, queryClient]);

  const messagesQuery = useQuery({
    queryKey: ['messages', userId, partnerId],
    enabled: !!userId && !!partnerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(studentid.eq.${userId},counselorid.eq.${partnerId}),and(studentid.eq.${partnerId},counselorid.eq.${userId})`)
        .order('timestamp', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const sendMessage = useMutation({
    mutationFn: async ({ text, imagebase64, senderId, file }: { text: string; imagebase64?: string; senderId?: string; file?: File }) => {
      if (!userId || !partnerId) throw new Error('Missing IDs');
      const actualSenderId = senderId || userId;
      
      let fileUrl = null;
      let fileName = null;
      let fileType = null;
      let fileSize = null;
      
      if (file) {
        if (file.size > 10 * 1024 * 1024) throw new Error('File size exceeds 10MB limit');
        
        fileName = `${actualSenderId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        fileType = file.type;
        fileSize = file.size;
        
        const { error: uploadError } = await supabase.storage.from('chat-attachments').upload(fileName, file);
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from('chat-attachments').getPublicUrl(fileName);
        fileUrl = data.publicUrl;
      }

      const { error } = await supabase.from('messages').insert({
        studentid: userId,
        counselorid: partnerId,
        senderid: actualSenderId,
        text,
        imagebase64: imagebase64 || null,
        file_url: fileUrl,
        file_name: file ? file.name : null,
        file_type: fileType,
        file_size: fileSize
      });
      if (error) throw error;
    },
    onMutate: async (newMsg) => {
      await queryClient.cancelQueries({ queryKey: ['messages', userId, partnerId] });
      const previousMessages = queryClient.getQueryData(['messages', userId, partnerId]);
      
      let optimisticUrl = null;
      if (newMsg.file) {
         optimisticUrl = URL.createObjectURL(newMsg.file);
      }

      const optimisticMsg = {
        id: `temp-${Date.now()}`,
        studentid: userId,
        counselorid: partnerId,
        senderid: newMsg.senderId || userId,
        text: newMsg.text,
        imagebase64: newMsg.imagebase64 || null,
        file_url: optimisticUrl,
        file_name: newMsg.file?.name || null,
        file_type: newMsg.file?.type || null,
        file_size: newMsg.file?.size || null,
        timestamp: new Date().toISOString(),
      };

      queryClient.setQueryData(['messages', userId, partnerId], (old: any) => {
        return [...(old || []), optimisticMsg];
      });

      return { previousMessages };
    },
    onError: (err, newMsg, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', userId, partnerId], context.previousMessages);
      }
    }
  });

  return {
    messages: messagesQuery.data || [],
    sendMessage
  };
}

export function useGroupChats(userId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    const channel = supabase.channel('group_chats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members' }, () => {
        queryClient.invalidateQueries({ queryKey: ['groups', userId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, queryClient]);

  const groupsQuery = useQuery({
    queryKey: ['groups', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: members, error: memErr } = await supabase.from('group_members').select('group_id').eq('user_id', userId);
      if (memErr) throw memErr;
      
      const groupIds = members.map(m => m.group_id);
      if (groupIds.length === 0) return [];

      const { data: groups, error: grpErr } = await supabase.from('group_chats').select('*').in('id', groupIds);
      if (grpErr) throw grpErr;
      
      return groups;
    }
  });

  const createGroup = useMutation({
    mutationFn: async ({ name, members }: { name: string, members: string[] }) => {
      if (!userId) throw new Error('Not logged in');
      const { data: group, error: grpErr } = await supabase.from('group_chats').insert({ name, created_by: userId }).select().single();
      if (grpErr) throw grpErr;

      const allMembers = [...new Set([userId, ...members])];
      const memberInserts = allMembers.map(id => ({ group_id: group.id, user_id: id }));
      
      const { error: memErr } = await supabase.from('group_members').insert(memberInserts);
      if (memErr) throw memErr;
      
      return group;
    }
  });

  return {
    groups: groupsQuery.data || [],
    createGroup
  };
}

export function useGroupMessages(groupId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!groupId) return;
    const channel = supabase.channel(`group_${groupId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['groupMessages', groupId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [groupId, queryClient]);

  const query = useQuery({
    queryKey: ['groupMessages', groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase.from('group_messages').select('*').eq('group_id', groupId).order('timestamp', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const sendMessage = useMutation({
    mutationFn: async ({ senderId, senderName, text, imagebase64, file }: { senderId: string, senderName: string, text: string, imagebase64?: string, file?: File }) => {
      let fileUrl = null;
      let fileName = null;
      let fileType = null;
      let fileSize = null;
      
      if (file) {
        if (file.size > 10 * 1024 * 1024) throw new Error('File size exceeds 10MB limit');
        
        fileName = `${senderId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        fileType = file.type;
        fileSize = file.size;
        
        const { error: uploadError } = await supabase.storage.from('chat-attachments').upload(fileName, file);
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from('chat-attachments').getPublicUrl(fileName);
        fileUrl = data.publicUrl;
      }

      const { error } = await supabase.from('group_messages').insert({
        group_id: groupId!,
        sender_id: senderId,
        sender_name: senderName,
        text,
        imagebase64: imagebase64 || null,
        file_url: fileUrl,
        file_name: file ? file.name : null,
        file_type: fileType,
        file_size: fileSize
      });
      if (error) throw error;
    },
    onMutate: async (newMsg) => {
      await queryClient.cancelQueries({ queryKey: ['groupMessages', groupId] });
      const previousMessages = queryClient.getQueryData(['groupMessages', groupId]);
      
      let optimisticUrl = null;
      if (newMsg.file) {
         optimisticUrl = URL.createObjectURL(newMsg.file);
      }

      const optimisticMsg = {
        id: `temp-${Date.now()}`,
        group_id: groupId!,
        sender_id: newMsg.senderId,
        sender_name: newMsg.senderName,
        text: newMsg.text,
        imagebase64: newMsg.imagebase64 || null,
        file_url: optimisticUrl,
        file_name: newMsg.file?.name || null,
        file_type: newMsg.file?.type || null,
        file_size: newMsg.file?.size || null,
        timestamp: new Date().toISOString(),
      };

      queryClient.setQueryData(['groupMessages', groupId], (old: any) => {
        return [...(old || []), optimisticMsg];
      });

      return { previousMessages };
    },
    onError: (err, newMsg, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['groupMessages', groupId], context.previousMessages);
      }
    }
  });

  return {
    messages: query.data || [],
    sendMessage
  };
}

export function useCounselorConversations(counselorId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!counselorId) return;
    const channel = supabase.channel(`counselor_conversations_${counselorId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `counselorid=eq.${counselorId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['counselorConversations', counselorId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [counselorId, queryClient]);

  const query = useQuery({
    queryKey: ['counselorConversations', counselorId],
    enabled: !!counselorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('studentid')
        .eq('counselorid', counselorId);
      if (error) throw error;
      
      const uniqueStudentIds = [...new Set(data.map(m => m.studentid))];
      return uniqueStudentIds as string[];
    }
  });

  return query.data || [];
}
