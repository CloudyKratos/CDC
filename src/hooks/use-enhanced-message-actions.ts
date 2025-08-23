import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Message, Reaction } from '@/types/chat';

export function useEnhancedMessageActions() {
  const { user } = useAuth();

  const editMessage = useCallback(async (messageId: string, content: string) => {
    if (!user?.id || !content.trim()) return false;

    try {
      console.log('✏️ Editing message:', messageId);
      
      const { error } = await supabase
        .from('community_messages')
        .update({ 
          content: content.trim(), 
          edited: true, 
          edited_at: new Date().toISOString() 
        })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) throw error;

      console.log('✅ Message edited successfully');
      toast.success('Message edited');
      return true;
    } catch (error) {
      console.error('❌ Failed to edit message:', error);
      toast.error('Failed to edit message');
      return false;
    }
  }, [user?.id]);

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user?.id) return;

    try {
      console.log('😀 Adding reaction:', emoji, 'to message:', messageId);
      
      // Check if reaction already exists
      const { data: existingReaction } = await supabase
        .from('message_reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .maybeSingle();

      if (existingReaction) {
        // Remove existing reaction
        const { error } = await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (error) throw error;
        console.log('✅ Reaction removed');
        toast.success('Reaction removed');
      } else {
        // Add new reaction
        const { error } = await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            emoji: emoji
          });

        if (error) throw error;
        console.log('✅ Reaction added');
        toast.success('Reaction added');
      }
    } catch (error) {
      console.error('❌ Failed to handle reaction:', error);
      toast.error('Failed to add reaction');
    }
  }, [user?.id]);

  const replyToMessage = useCallback(async (parentMessageId: string, content: string, channelId: string) => {
    if (!user?.id || !content.trim()) return false;

    try {
      console.log('💬 Replying to message:', parentMessageId);
      
      const { error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelId,
          sender_id: user.id,
          content: content.trim(),
          parent_message_id: parentMessageId
        });

      if (error) throw error;

      console.log('✅ Reply sent successfully');
      toast.success('Reply sent');
      return true;
    } catch (error) {
      console.error('❌ Failed to send reply:', error);
      toast.error('Failed to send reply');
      return false;
    }
  }, [user?.id]);

  const fetchMessageReactions = useCallback(async (messageIds: string[]): Promise<Map<string, Reaction[]>> => {
    if (messageIds.length === 0) return new Map();

    try {
      const { data: reactions, error } = await supabase
        .from('message_reactions')
        .select(`
          message_id,
          emoji,
          user_id,
          profiles!message_reactions_user_id_fkey(username, full_name)
        `)
        .in('message_id', messageIds);

      if (error) throw error;

      const reactionMap = new Map<string, Reaction[]>();
      
      // Group reactions by message and emoji
      const groupedReactions = new Map<string, Map<string, { count: number; users: string[]; hasReacted: boolean }>>();
      
      reactions?.forEach((reaction) => {
        const key = `${reaction.message_id}-${reaction.emoji}`;
        if (!groupedReactions.has(reaction.message_id)) {
          groupedReactions.set(reaction.message_id, new Map());
        }
        
        const messageReactions = groupedReactions.get(reaction.message_id)!;
        if (!messageReactions.has(reaction.emoji)) {
          messageReactions.set(reaction.emoji, {
            count: 0,
            users: [],
            hasReacted: false
          });
        }
        
        const emojiData = messageReactions.get(reaction.emoji)!;
        emojiData.count++;
        emojiData.users.push(reaction.user_id);
        if (reaction.user_id === user?.id) {
          emojiData.hasReacted = true;
        }
      });

      // Convert to final format
      groupedReactions.forEach((emojiMap, messageId) => {
        const messageReactions: Reaction[] = [];
        emojiMap.forEach((data, emoji) => {
          messageReactions.push({
            emoji,
            count: data.count,
            users: data.users,
            hasReacted: data.hasReacted
          });
        });
        reactionMap.set(messageId, messageReactions);
      });

      return reactionMap;
    } catch (error) {
      console.error('❌ Failed to fetch reactions:', error);
      return new Map();
    }
  }, [user?.id]);

  const fetchMessageReplies = useCallback(async (messageId: string): Promise<Message[]> => {
    try {
      const { data: replies, error } = await supabase
        .from('community_messages')
        .select(`
          id,
          content,
          created_at,
          updated_at,
          sender_id,
          is_deleted,
          deleted_at,
          edited,
          edited_at,
          profiles!community_messages_sender_id_fkey(id, username, full_name, avatar_url)
        `)
        .eq('parent_message_id', messageId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return replies?.map(reply => ({
        id: reply.id,
        content: reply.content,
        created_at: reply.created_at,
        updated_at: reply.updated_at,
        sender_id: reply.sender_id,
        is_deleted: reply.is_deleted,
        deleted_at: reply.deleted_at,
        edited: reply.edited,
        edited_at: reply.edited_at,
        sender: reply.profiles ? {
          id: reply.profiles.id,
          username: reply.profiles.username,
          full_name: reply.profiles.full_name,
          avatar_url: reply.profiles.avatar_url
        } : undefined
      })) || [];
    } catch (error) {
      console.error('❌ Failed to fetch replies:', error);
      return [];
    }
  }, []);

  return {
    editMessage,
    addReaction,
    replyToMessage,
    fetchMessageReactions,
    fetchMessageReplies
  };
}