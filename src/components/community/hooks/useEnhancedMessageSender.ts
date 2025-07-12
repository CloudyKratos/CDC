import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';

interface SendMessageOptions {
  channelId: string | null;
  content: string;
  maxRetries?: number;
  retryDelay?: number;
}

export function useEnhancedMessageSender() {
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();

  const validateSendConditions = useCallback((channelId: string | null, content: string) => {
    // Check authentication
    if (!user?.id) {
      console.error('❌ Send validation: User not authenticated');
      toast.error('Please sign in to send messages');
      return false;
    }

    // Check channel ID
    if (!channelId) {
      console.error('❌ Send validation: No channel ID provided');
      toast.error('Channel not available');
      return false;
    }

    // Check content
    if (!content.trim()) {
      console.error('❌ Send validation: Empty message content');
      toast.error('Message cannot be empty');
      return false;
    }

    // Check session validity
    const session = supabase.auth.getSession();
    if (!session) {
      console.error('❌ Send validation: No valid session');
      toast.error('Session expired. Please refresh and try again');
      return false;
    }

    return true;
  }, [user?.id]);

  const sendMessageWithRetry = useCallback(async ({
    channelId,
    content,
    maxRetries = 3,
    retryDelay = 1000
  }: SendMessageOptions): Promise<boolean> => {
    if (!validateSendConditions(channelId, content)) {
      return false;
    }

    setIsSending(true);
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📤 Sending message (attempt ${attempt}/${maxRetries}):`, {
          channelId,
          userId: user!.id,
          contentLength: content.trim().length
        });

        // Create the message object
        const messageData = {
          channel_id: channelId!,
          sender_id: user!.id,
          content: content.trim(),
          is_deleted: false
        };

        console.log('📝 Message data:', messageData);

        // Send with timeout protection
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error(`Send timeout after ${5000}ms`)), 5000)
        );

        const sendPromise = supabase
          .from('community_messages')
          .insert(messageData)
          .select('id, created_at');

        const { data, error } = await Promise.race([sendPromise, timeoutPromise]);

        if (error) {
          console.error(`❌ Send attempt ${attempt} failed:`, error);
          
          // Handle specific error types
          if (error.message.includes('infinite recursion')) {
            throw new Error('Database configuration issue. Please contact support.');
          } else if (error.message.includes('violates row-level security')) {
            throw new Error('Permission denied. Please sign in again.');
          } else if (error.message.includes('duplicate key')) {
            throw new Error('Message already sent.');
          } else {
            throw new Error(`Failed to send message: ${error.message}`);
          }
        }

        if (!data || data.length === 0) {
          throw new Error('Message sent but no confirmation received');
        }

        console.log('✅ Message sent successfully:', data[0]);
        toast.success('Message sent!', { duration: 1000 });
        setIsSending(false);
        return true;

      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Send attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          console.log(`⏳ Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retryDelay *= 1.5; // Exponential backoff
        }
      }
    }

    // All attempts failed
    setIsSending(false);
    const errorMessage = lastError?.message || 'Unknown error occurred';
    console.error('💥 All send attempts failed:', errorMessage);
    
    // Show user-friendly error message
    if (errorMessage.includes('timeout')) {
      toast.error('Send timeout. Please check your connection and try again.');
    } else if (errorMessage.includes('Permission denied') || errorMessage.includes('sign in')) {
      toast.error('Please sign in again to send messages.');
    } else if (errorMessage.includes('Database configuration')) {
      toast.error('Chat service temporarily unavailable. Please try again later.');
    } else {
      toast.error(`Failed to send message: ${errorMessage}`);
    }
    
    return false;
  }, [user, validateSendConditions]);

  return {
    sendMessage: sendMessageWithRetry,
    isSending,
    isReady: !!user?.id
  };
}
