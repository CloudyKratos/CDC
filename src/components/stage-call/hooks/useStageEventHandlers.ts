
import { useState, useEffect } from 'react';
import RealTimeStageService from '@/services/RealTimeStageService';
import { StageParticipant, ChatMessage } from '@/services/core/types/StageTypes';

export const useStageEventHandlers = () => {
  const [participants, setParticipants] = useState<StageParticipant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    // Set up real-time event handlers
    RealTimeStageService.on('participantUpdate', (payload) => {
      console.log('Participant update:', payload);
      // Refresh participants list
      setParticipants(RealTimeStageService.getParticipants());
    });

    RealTimeStageService.on('chatMessage', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    });

    return () => {
      // Clean up event handlers
      RealTimeStageService.off('participantUpdate', () => {});
      RealTimeStageService.off('chatMessage', () => {});
    };
  }, []);

  return {
    participants,
    chatMessages
  };
};
