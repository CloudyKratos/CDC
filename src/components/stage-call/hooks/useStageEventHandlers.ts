
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import RealTimeStageService from '@/services/RealTimeStageService';
import { StageParticipant, ChatMessage } from '@/services/core/types/StageTypes';

export const useStageEventHandlers = () => {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<StageParticipant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Listen for participant updates
    const unsubscribeParticipants = RealTimeStageService.onParticipantUpdate((update) => {
      setParticipants(prev => {
        const existingIndex = prev.findIndex(p => p.id === update.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], ...update };
          return updated;
        } else {
          return [...prev, update as StageParticipant];
        }
      });
    });

    // Listen for participant leaving
    const unsubscribeParticipantLeft = RealTimeStageService.onParticipantLeft((participantId) => {
      setParticipants(prev => prev.filter(p => p.id !== participantId));
    });

    // Listen for chat messages
    const unsubscribeChatMessages = RealTimeStageService.onChatMessage((message) => {
      setChatMessages(prev => [...prev, message]);
    });

    // Listen for stage events
    const unsubscribeStageEvents = RealTimeStageService.onStageEvent((event) => {
      switch (event.type) {
        case 'recording_started':
          setIsRecording(true);
          break;
        case 'recording_stopped':
          setIsRecording(false);
          if (event.data?.url) {
            setRecordingUrl(event.data.url);
          }
          break;
        case 'stage_ended':
          // Handle stage ending
          break;
      }
    });

    return () => {
      unsubscribeParticipants();
      unsubscribeParticipantLeft();
      unsubscribeChatMessages();
      unsubscribeStageEvents();
    };
  }, [user]);

  const clearChat = () => {
    setChatMessages([]);
  };

  const addSystemMessage = (message: string) => {
    const systemMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      message,
      userId: 'system',
      userName: 'System',
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    setChatMessages(prev => [...prev, systemMessage]);
  };

  return {
    participants,
    chatMessages,
    isRecording,
    recordingUrl,
    clearChat,
    addSystemMessage,
    setParticipants
  };
};
