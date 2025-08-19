import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import StageService, { StageParticipant, StageSettings } from '@/services/core/StageService';

interface UseStageRoomReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  
  // Participants
  participants: StageParticipant[];
  localParticipant: StageParticipant | null;
  
  // Media state
  localStream: MediaStream | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isHandRaised: boolean;
  isScreenSharing: boolean;
  
  // Stage settings
  stageSettings: StageSettings | null;
  
  // Actions
  joinStage: (stageId: string, role?: 'host' | 'speaker' | 'audience' | 'moderator') => Promise<boolean>;
  leaveStage: () => Promise<void>;
  toggleAudio: () => Promise<boolean>;
  toggleVideo: () => Promise<boolean>;
  toggleHandRaise: () => Promise<boolean>;
  startScreenShare: () => Promise<MediaStream | null>;
  stopScreenShare: () => Promise<void>;
  updateStageSettings: (settings: Partial<StageSettings>) => Promise<void>;
}

export const useStageRoom = (): UseStageRoomReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [participants, setParticipants] = useState<StageParticipant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<StageParticipant | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [stageSettings, setStageSettings] = useState<StageSettings | null>(null);

  // Set up event listeners
  useEffect(() => {
    const service = StageService;

    const handleStageJoined = ({ participant }: { participant: StageParticipant }) => {
      console.log('Stage joined:', participant);
      setIsConnected(true);
      setIsConnecting(false);
      setLocalParticipant(participant);
      setIsAudioEnabled(participant.isAudioEnabled);
      setIsVideoEnabled(participant.isVideoEnabled);
      setIsHandRaised(participant.isHandRaised);
      setStageSettings(service.getStageSettings());
      
      toast({
        title: "Joined Stage",
        description: "Successfully joined the stage room",
      });
    };

    const handleParticipantsUpdated = ({ participants }: { participants: StageParticipant[] }) => {
      console.log('Participants updated:', participants);
      setParticipants(participants || []);
      
      if (user?.id) {
        const local = participants.find(p => p.id === user.id);
        if (local) {
          setLocalParticipant(local);
          setIsAudioEnabled(local.isAudioEnabled);
          setIsVideoEnabled(local.isVideoEnabled);
          setIsHandRaised(local.isHandRaised);
          setIsScreenSharing(local.isScreenSharing);
        }
      }
    };

    const handleAudioToggled = ({ enabled }: { enabled: boolean }) => {
      console.log('Audio toggled:', enabled);
      setIsAudioEnabled(enabled);
    };

    const handleVideoToggled = ({ enabled }: { enabled: boolean }) => {
      console.log('Video toggled:', enabled);
      setIsVideoEnabled(enabled);
    };

    const handleHandRaiseToggled = ({ isRaised }: { isRaised: boolean }) => {
      console.log('Hand raise toggled:', isRaised);
      setIsHandRaised(isRaised);
    };

    const handleScreenShareStarted = ({ stream }: { stream: MediaStream }) => {
      console.log('Screen share started');
      setIsScreenSharing(true);
      setLocalStream(stream);
      
      toast({
        title: "Screen Share Started",
        description: "You are now sharing your screen",
      });
    };

    const handleScreenShareStopped = () => {
      console.log('Screen share stopped');
      setIsScreenSharing(false);
      setLocalStream(null);
      
      toast({
        title: "Screen Share Stopped",
        description: "Screen sharing has ended",
      });
    };

    const handleStageLeft = () => {
      console.log('Stage left');
      setIsConnected(false);
      setIsConnecting(false);
      setParticipants([]);
      setLocalParticipant(null);
      setLocalStream(null);
      setIsAudioEnabled(true);
      setIsVideoEnabled(true);
      setIsHandRaised(false);
      setIsScreenSharing(false);
      setStageSettings(null);
    };

    const handleStageSettingsUpdated = (settings: StageSettings) => {
      console.log('Stage settings updated:', settings);
      setStageSettings(settings);
    };

    // Register event listeners
    service.on('stageJoined', handleStageJoined);
    service.on('participantsUpdated', handleParticipantsUpdated);
    service.on('audioToggled', handleAudioToggled);
    service.on('videoToggled', handleVideoToggled);
    service.on('handRaiseToggled', handleHandRaiseToggled);
    service.on('screenShareStarted', handleScreenShareStarted);
    service.on('screenShareStopped', handleScreenShareStopped);
    service.on('stageLeft', handleStageLeft);
    service.on('stageSettingsUpdated', handleStageSettingsUpdated);

    return () => {
      service.removeAllListeners();
    };
  }, [user, toast]);

  const joinStage = useCallback(async (
    stageId: string, 
    role: 'host' | 'speaker' | 'audience' | 'moderator' = 'speaker'
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join the stage",
        variant: "destructive",
      });
      return false;
    }

    console.log(`Attempting to join stage ${stageId} as ${role}`);
    setIsConnecting(true);
    
    try {
      const success = await StageService.joinStage(
        stageId,
        user.id,
        user.name || user.email || 'Anonymous User',
        role
      );

      if (!success) {
        setIsConnecting(false);
        toast({
          title: "Connection Failed",
          description: "Could not join the stage. Please try again.",
          variant: "destructive",
        });
      }

      return success;
    } catch (error) {
      console.error('Error joining stage:', error);
      setIsConnecting(false);
      toast({
        title: "Connection Error",
        description: "An error occurred while joining the stage",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast]);

  const leaveStage = useCallback(async (): Promise<void> => {
    console.log('Leaving stage...');
    await StageService.leaveStage();
    
    toast({
      title: "Left Stage",
      description: "You have successfully left the stage",
    });
  }, [toast]);

  const toggleAudio = useCallback(async (): Promise<boolean> => {
    try {
      console.log('Toggling audio...');
      const result = await StageService.toggleAudio();
      toast({
        title: result ? "Microphone Unmuted" : "Microphone Muted",
        description: result ? "Your microphone is now on" : "Your microphone is now off",
      });
      return result;
    } catch (error) {
      console.error('Error toggling audio:', error);
      toast({
        title: "Audio Error",
        description: "Could not toggle microphone",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const toggleVideo = useCallback(async (): Promise<boolean> => {
    try {
      console.log('Toggling video...');
      const result = await StageService.toggleVideo();
      toast({
        title: result ? "Camera On" : "Camera Off",
        description: result ? "Your camera is now on" : "Your camera is now off",
      });
      return result;
    } catch (error) {
      console.error('Error toggling video:', error);
      toast({
        title: "Video Error",
        description: "Could not toggle camera",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const toggleHandRaise = useCallback(async (): Promise<boolean> => {
    try {
      console.log('Toggling hand raise...');
      const result = await StageService.toggleHandRaise();
      toast({
        title: result ? "Hand Raised" : "Hand Lowered",
        description: result ? "Your hand is now raised" : "Your hand is now lowered",
      });
      return result;
    } catch (error) {
      console.error('Error toggling hand raise:', error);
      toast({
        title: "Hand Raise Error",
        description: "Could not toggle hand raise",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const startScreenShare = useCallback(async (): Promise<MediaStream | null> => {
    try {
      console.log('Starting screen share...');
      return await StageService.startScreenShare();
    } catch (error) {
      console.error('Error starting screen share:', error);
      toast({
        title: "Screen Share Error",
        description: "Could not start screen sharing",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const stopScreenShare = useCallback(async (): Promise<void> => {
    try {
      console.log('Stopping screen share...');
      await StageService.stopScreenShare();
    } catch (error) {
      console.error('Error stopping screen share:', error);
      toast({
        title: "Screen Share Error",
        description: "Could not stop screen sharing",
        variant: "destructive",
      });
    }
  }, [toast]);

  const updateStageSettings = useCallback(async (settings: Partial<StageSettings>): Promise<void> => {
    try {
      console.log('Updating stage settings:', settings);
      await StageService.updateStageSettings(settings);
      toast({
        title: "Settings Updated",
        description: "Stage settings have been updated",
      });
    } catch (error) {
      console.error('Error updating stage settings:', error);
      toast({
        title: "Settings Error",
        description: "Could not update stage settings",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    // Connection state
    isConnected,
    isConnecting,
    
    // Participants
    participants,
    localParticipant,
    
    // Media state
    localStream,
    isAudioEnabled,
    isVideoEnabled,
    isHandRaised,
    isScreenSharing,
    
    // Stage settings
    stageSettings,
    
    // Actions
    joinStage,
    leaveStage,
    toggleAudio,
    toggleVideo,
    toggleHandRaise,
    startScreenShare,
    stopScreenShare,
    updateStageSettings,
  };
};