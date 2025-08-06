
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import VideoConferenceService, { ConferenceParticipant, ConferenceStats } from '@/services/conference/VideoConferenceService';

interface UseVideoConferenceReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  
  // Participants
  participants: ConferenceParticipant[];
  localParticipant: ConferenceParticipant | null;
  
  // Media state
  localStream: MediaStream | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isHandRaised: boolean;
  isScreenSharing: boolean;
  
  // Stats
  conferenceStats: ConferenceStats | null;
  
  // Actions
  joinConference: (roomId: string) => Promise<boolean>;
  leaveConference: () => Promise<void>;
  toggleAudio: () => boolean;
  toggleVideo: () => boolean;
  toggleHandRaise: () => boolean;
  startScreenShare: () => Promise<MediaStream | null>;
  stopScreenShare: () => Promise<void>;
}

export const useVideoConference = (): UseVideoConferenceReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [participants, setParticipants] = useState<ConferenceParticipant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<ConferenceParticipant | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [conferenceStats, setConferenceStats] = useState<ConferenceStats | null>(null);
  const [screenShareStream, setScreenShareStream] = useState<MediaStream | null>(null);

  // Set up event listeners
  useEffect(() => {
    const service = VideoConferenceService;

    const handleConferenceJoined = ({ participant }: { participant: ConferenceParticipant }) => {
      setIsConnected(true);
      setIsConnecting(false);
      setLocalParticipant(participant);
      setIsAudioEnabled(participant.isAudioEnabled);
      setIsVideoEnabled(participant.isVideoEnabled);
      setIsHandRaised(participant.isHandRaised);
      
      toast({
        title: "Joined Conference",
        description: "Successfully joined the video call",
      });
    };

    const handleLocalStreamReady = ({ stream }: { stream: MediaStream }) => {
      setLocalStream(stream);
    };

    const handleParticipantsUpdated = ({ participants }: { participants: ConferenceParticipant[] }) => {
      // Ensure participants is always an array
      const participantsList = participants || [];
      
      setParticipants(participantsList);
      if (user?.id) {
        const local = participantsList.find(p => p.id === user.id);
        if (local) {
          setLocalParticipant(local);
          setIsAudioEnabled(local.isAudioEnabled);
          setIsVideoEnabled(local.isVideoEnabled);
          setIsHandRaised(local.isHandRaised);
        }
      }
    };

    const handleLocalAudioToggled = ({ enabled }: { enabled: boolean }) => {
      setIsAudioEnabled(enabled);
    };

    const handleLocalVideoToggled = ({ enabled }: { enabled: boolean }) => {
      setIsVideoEnabled(enabled);
    };

    const handleHandRaiseToggled = ({ isRaised }: { isRaised: boolean }) => {
      setIsHandRaised(isRaised);
    };

    const handleScreenShareStarted = ({ stream }: { stream: MediaStream }) => {
      setIsScreenSharing(true);
      setScreenShareStream(stream);
      
      // Handle screen share end
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        setIsScreenSharing(false);
        setScreenShareStream(null);
        service.stopScreenShare();
      });
      
      toast({
        title: "Screen Share Started",
        description: "You are now sharing your screen",
      });
    };

    const handleScreenShareStopped = () => {
      setIsScreenSharing(false);
      setScreenShareStream(null);
      
      toast({
        title: "Screen Share Stopped",
        description: "Screen sharing has ended",
      });
    };

    const handleConferenceLeft = () => {
      setIsConnected(false);
      setIsConnecting(false);
      setParticipants([]);
      setLocalParticipant(null);
      setLocalStream(null);
      setIsAudioEnabled(true);
      setIsVideoEnabled(true);
      setIsHandRaised(false);
      setIsScreenSharing(false);
      setScreenShareStream(null);
      setConferenceStats(null);
    };

    // Register event listeners
    service.on('conferenceJoined', handleConferenceJoined);
    service.on('localStreamReady', handleLocalStreamReady);
    service.on('participantsUpdated', handleParticipantsUpdated);
    service.on('localAudioToggled', handleLocalAudioToggled);
    service.on('localVideoToggled', handleLocalVideoToggled);
    service.on('handRaiseToggled', handleHandRaiseToggled);
    service.on('screenShareStarted', handleScreenShareStarted);
    service.on('screenShareStopped', handleScreenShareStopped);
    service.on('conferenceLeft', handleConferenceLeft);

    return () => {
      service.removeAllListeners();
    };
  }, [user, toast]);

  // Update stats periodically
  useEffect(() => {
    if (!isConnected) return;

    const updateStats = () => {
      setConferenceStats(VideoConferenceService.getConferenceStats());
    };

    const interval = setInterval(updateStats, 3000);
    updateStats(); // Initial update

    return () => clearInterval(interval);
  }, [isConnected]);

  const joinConference = useCallback(async (roomId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join the conference",
        variant: "destructive",
      });
      return false;
    }

    setIsConnecting(true);
    
    try {
      const success = await VideoConferenceService.joinConference(
        roomId,
        user.id,
        user.name || user.email || 'Anonymous User'
      );

      if (!success) {
        setIsConnecting(false);
        toast({
          title: "Connection Failed",
          description: "Could not join the conference. Please try again.",
          variant: "destructive",
        });
      }

      return success;
    } catch (error) {
      setIsConnecting(false);
      toast({
        title: "Connection Error",
        description: "An error occurred while joining the conference",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast]);

  const leaveConference = useCallback(async (): Promise<void> => {
    await VideoConferenceService.leaveConference();
    
    toast({
      title: "Left Conference",
      description: "You have successfully left the call",
    });
  }, [toast]);

  const toggleAudio = useCallback((): boolean => {
    VideoConferenceService.toggleAudio();
    return true;
  }, []);

  const toggleVideo = useCallback((): boolean => {
    VideoConferenceService.toggleVideo();
    return true;
  }, []);

  const toggleHandRaise = useCallback((): boolean => {
    VideoConferenceService.toggleHandRaise();
    return true;
  }, []);

  const startScreenShare = useCallback(async (): Promise<MediaStream | null> => {
    return await VideoConferenceService.startScreenShare();
  }, []);

  const stopScreenShare = useCallback(async (): Promise<void> => {
    await VideoConferenceService.stopScreenShare();
  }, []);

  return {
    // Connection state
    isConnected,
    isConnecting,
    
    // Participants
    participants,
    localParticipant,
    
    // Media state
    localStream: isScreenSharing ? screenShareStream : localStream,
    isAudioEnabled,
    isVideoEnabled,
    isHandRaised,
    isScreenSharing,
    
    // Stats
    conferenceStats,
    
    // Actions
    joinConference,
    leaveConference,
    toggleAudio,
    toggleVideo,
    toggleHandRaise,
    startScreenShare,
    stopScreenShare,
  };
};
