
import { useState, useEffect } from 'react';
import RealTimeStageService from '@/services/RealTimeStageService';
import { ChatMessage } from '@/services/core/types/StageTypes';

export const useStageEventHandlers = () => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    // Update participants from real-time service
    const updateParticipants = () => {
      const connectedUsers = RealTimeStageService.getConnectedUsers();
      setParticipants(connectedUsers);
    };

    // Set up periodic updates (in a real implementation, this would be event-driven)
    const interval = setInterval(updateParticipants, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return {
    participants,
    chatMessages
  };
};
