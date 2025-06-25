
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StageService from '@/services/StageService';
import { toast } from 'sonner';
import { StageHeader } from './ui/StageHeader';
import { ParticipantGrid } from './ui/ParticipantGrid';
import { StageControls } from './ui/StageControls';
import { StageChat } from './ui/StageChat';
import { StageParticipant } from '@/types/supabase-extended';

interface SimpleStageRoomProps {
  stageId: string;
  onLeave: () => void;
}

interface Participant {
  id: string;
  name: string;
  role: 'speaker' | 'audience' | 'moderator';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isHandRaised: boolean;
  avatarUrl?: string;
}

export const SimpleStageRoom: React.FC<SimpleStageRoomProps> = ({
  stageId,
  onLeave
}) => {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [userRole, setUserRole] = useState<'speaker' | 'audience' | 'moderator'>('audience');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  const loadParticipants = useCallback(async () => {
    try {
      const participantData: StageParticipant[] = await StageService.getStageParticipants(stageId);
      
      const formattedParticipants: Participant[] = participantData.map(p => ({
        id: p.user_id,
        name: p.profiles?.full_name || p.profiles?.username || 'Anonymous',
        role: p.role as 'speaker' | 'audience' | 'moderator',
        isAudioEnabled: !p.is_muted,
        isVideoEnabled: p.is_video_enabled || false,
        isHandRaised: p.is_hand_raised || false,
        avatarUrl: p.profiles?.avatar_url || undefined
      }));
      
      setParticipants(formattedParticipants);
      
      // Set current user's role
      const currentUserParticipant = participantData.find(p => p.user_id === user?.id);
      if (currentUserParticipant) {
        setUserRole(currentUserParticipant.role as 'speaker' | 'audience' | 'moderator');
        setIsHandRaised(currentUserParticipant.is_hand_raised || false);
        setIsAudioEnabled(!currentUserParticipant.is_muted);
        setIsVideoEnabled(currentUserParticipant.is_video_enabled || false);
      }
    } catch (error) {
      console.error('Error loading participants:', error);
      toast.error('Failed to load participants');
    }
  }, [stageId, user?.id]);

  const initializeStage = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Join the stage
      const joinResult = await StageService.joinStage(stageId, 'audience');
      if (!joinResult.success) {
        throw new Error(joinResult.error || 'Failed to join stage');
      }
      
      await loadParticipants();
      
      // Set up real-time subscriptions
      const participantSub = StageService.subscribeToParticipants(stageId, () => {
        loadParticipants();
      });
      
      return () => {
        participantSub.unsubscribe();
      };
    } catch (error) {
      console.error('Error initializing stage:', error);
      toast.error('Failed to join stage');
    } finally {
      setIsLoading(false);
    }
  }, [stageId, loadParticipants]);

  useEffect(() => {
    const cleanup = initializeStage();
    return () => {
      cleanup?.then(fn => fn?.());
    };
  }, [initializeStage]);

  const handleToggleAudio = async () => {
    if (!user) return;
    
    const newState = !isAudioEnabled;
    try {
      setIsAudioEnabled(newState);
      await StageService.toggleMute(stageId, user.id, !newState);
      toast.success(newState ? 'Microphone on' : 'Microphone off');
    } catch (error) {
      setIsAudioEnabled(!newState);
      toast.error('Failed to toggle microphone');
    }
  };

  const handleToggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    toast.success(!isVideoEnabled ? 'Camera on' : 'Camera off');
  };

  const handleRaiseHand = async () => {
    const newState = !isHandRaised;
    try {
      setIsHandRaised(newState);
      await StageService.raiseHand(stageId, newState);
      toast.success(newState ? 'Hand raised' : 'Hand lowered');
    } catch (error) {
      setIsHandRaised(!newState);
      toast.error('Failed to update hand status');
    }
  };

  const handleLeave = async () => {
    try {
      if (user) {
        await StageService.leaveStage(stageId);
      }
      onLeave();
    } catch (error) {
      console.error('Error leaving stage:', error);
      onLeave(); // Leave anyway
    }
  };

  const handleSendMessage = (message: string) => {
    const newMessage = {
      id: Date.now().toString(),
      userId: user?.id || '',
      userName: user?.email || 'Anonymous',
      message,
      timestamp: new Date().toISOString(),
      type: 'text' as const
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4 mx-auto"></div>
            <h3 className="text-xl font-semibold mb-2">Joining Stage...</h3>
            <p className="text-white/60">Setting up your connection</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <StageHeader
        status="connected"
        participantCount={participants.length + 1}
        onLeave={handleLeave}
      />
      
      <div className="flex-1 flex">
        <div className="flex-1 p-4">
          <ParticipantGrid
            participants={participants}
            userRole={userRole}
            className="h-full"
          />
        </div>
        
        {isChatOpen && (
          <StageChat
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isOpen={isChatOpen}
            onToggle={() => setIsChatOpen(false)}
            participantCount={participants.length + 1}
            connectionState="connected"
          />
        )}
      </div>
      
      <StageControls
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        isHandRaised={isHandRaised}
        userRole={userRole}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onRaiseHand={handleRaiseHand}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        onLeave={handleLeave}
      />
    </div>
  );
};

export default SimpleStageRoom;
