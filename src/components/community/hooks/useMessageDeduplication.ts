import { useState, useRef, useCallback } from 'react';
import type { Message } from '@/types/chat';

interface MessageState {
  processing: Set<string>;
  sent: Set<string>;
  failed: Set<string>;
}

export function useMessageDeduplication() {
  const [messageState] = useState<MessageState>(() => ({
    processing: new Set(),
    sent: new Set(),
    failed: new Set()
  }));

  const messageTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const maxRetries = 3;
  const retryDelay = 2000;

  const isDuplicate = useCallback((message: Message) => {
    return messageState.processing.has(message.id) || 
           messageState.sent.has(message.id);
  }, [messageState]);

  const markProcessing = useCallback((messageId: string) => {
    messageState.processing.add(messageId);
    
    // Set timeout for processing messages
    const timeout = setTimeout(() => {
      messageState.processing.delete(messageId);
      messageState.failed.add(messageId);
      console.warn(`⚠️ Message ${messageId} processing timeout`);
    }, 10000); // 10 second timeout
    
    messageTimeoutsRef.current.set(messageId, timeout);
  }, [messageState]);

  const markSent = useCallback((messageId: string) => {
    messageState.processing.delete(messageId);
    messageState.sent.add(messageId);
    messageState.failed.delete(messageId);
    
    // Clear timeout
    const timeout = messageTimeoutsRef.current.get(messageId);
    if (timeout) {
      clearTimeout(timeout);
      messageTimeoutsRef.current.delete(messageId);
    }
  }, [messageState]);

  const markFailed = useCallback((messageId: string) => {
    messageState.processing.delete(messageId);
    messageState.failed.add(messageId);
    
    // Clear timeout
    const timeout = messageTimeoutsRef.current.get(messageId);
    if (timeout) {
      clearTimeout(timeout);
      messageTimeoutsRef.current.delete(messageId);
    }
  }, [messageState]);

  const canRetry = useCallback((messageId: string) => {
    const failedCount = Array.from(messageState.failed).filter(id => 
      id.startsWith(messageId.split('_')[0])
    ).length;
    
    return failedCount < maxRetries;
  }, [messageState]);

  const deduplicateMessages = useCallback((messages: Message[]) => {
    const seen = new Set<string>();
    const deduped: Message[] = [];
    
    // Process messages in reverse to keep latest version
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      const key = `${message.sender_id}-${message.content}-${message.created_at}`;
      
      if (!seen.has(key) && !seen.has(message.id)) {
        seen.add(key);
        seen.add(message.id);
        deduped.unshift(message);
      }
    }
    
    return deduped;
  }, []);

  const cleanup = useCallback(() => {
    messageTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    messageTimeoutsRef.current.clear();
    messageState.processing.clear();
    messageState.sent.clear();
    messageState.failed.clear();
  }, [messageState]);

  return {
    isDuplicate,
    markProcessing,
    markSent,
    markFailed,
    canRetry,
    deduplicateMessages,
    cleanup,
    getStats: () => ({
      processing: messageState.processing.size,
      sent: messageState.sent.size,
      failed: messageState.failed.size
    })
  };
}
