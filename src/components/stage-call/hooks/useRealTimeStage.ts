
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import WebRTCManager from '@/services/webrtc/WebRTCManager';
import SignalingService from '@/services/signaling/SignalingService';
import MediaDeviceManager from '@/services/media/MediaDeviceManager';
import CallStateManager from '@/services/call/CallStateManager';
import { useToast } from '@/hooks/use-toast';
import type { CallParticipant, CallState } from '@/services/call/CallStateManager';

interface UseRealTimeStageReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  callState: CallState;
  error: string | null;
  
  // Media state
  localStream: MediaStream | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  
  // Participants
  participants: CallParticipant[];
  remoteStreams: Map<string, MediaStream>;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  toggleAudio: () => Promise<boolean>;
  toggleVideo: () => Promise<boolean>;
  toggleScreenShare: () => Promise<boolean>;
}

export const useRealTimeStage = (stageId: string): UseRealTimeStageReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [callState, setCallState] = useState<CallState>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [error, setError] = useState<string | null>(null);

  const webrtcManager = useRef(WebRTCManager);
  const signalingService = useRef(SignalingService);
  const mediaManager = useRef(MediaDeviceManager);
  const callManager = useRef(CallStateManager);
  const isInitialized = useRef(false);
  const screenShareStream = useRef<MediaStream | null>(null);

  // Set up event handlers
  const setupEventHandlers = useCallback(() => {
    // Media device events
    mediaManager.current.on('streamCreated', ({ stream }) => {
      setLocalStream(stream);
      webrtcManager.current.updateLocalStream(stream);
    });

    mediaManager.current.on('audioToggled', ({ enabled }) => {
      setIsAudioEnabled(enabled);
      // Update call manager
      if (user) {
        callManager.current.updateParticipant(user.id, { isAudioEnabled: enabled });
      }
    });

    mediaManager.current.on('videoToggled', ({ enabled }) => {
      setIsVideoEnabled(enabled);
      // Update call manager
      if (user) {
        callManager.current.updateParticipant(user.id, { isVideoEnabled: enabled });
      }
    });

    // Call state events
    callManager.current.on('callStateChanged', ({ state }) => {
      setCallState(state);
    });

    callManager.current.on('participantsChanged', ({ participants }) => {
      setParticipants(participants);
    });

    callManager.current.on('callError', () => {
      setError('Call connection failed');
    });

    // WebRTC events
    webrtcManager.current.on('remoteStream', ({ userId, stream }) => {
      setRemoteStreams(prev => new Map(prev.set(userId, stream)));
      // Update participant stream
      callManager.current.updateParticipant(userId, { stream });
    });

    webrtcManager.current.on('connectionStateChange', ({ userId, state }) => {
      callManager.current.updateParticipant(userId, { connectionState: state });
    });

    webrtcManager.current.on('peerDisconnected', ({ userId }) => {
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
      callManager.current.removeParticipant(userId);
    });

    // Signaling events
    signalingService.current.on('userJoined', async ({ userId }) => {
      if (userId !== user?.id) {
        console.log(`New user joined: ${userId}`);
        
        // Add as participant
        callManager.current.addParticipant({
          userId,
          name: `User ${userId.slice(0, 8)}`,
          isAudioEnabled: true,
          isVideoEnabled: true,
          isSpeaking: false,
          connectionState: 'connecting',
          joinedAt: new Date()
        });

        // Create offer
        try {
          const offer = await webrtcManager.current.createOffer(userId);
          signalingService.current.sendMessage({
            type: 'offer',
            to: userId,
            data: offer
          });
        } catch (error) {
          console.error('Error creating offer:', error);
        }
      }
    });

    signalingService.current.on('offer', async ({ userId, offer }) => {
      console.log(`Received offer from: ${userId}`);
      try {
        const answer = await webrtcManager.current.createAnswer(userId, offer);
        signalingService.current.sendMessage({
          type: 'answer',
          to: userId,
          data: answer
        });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    });

    signalingService.current.on('answer', async ({ userId, answer }) => {
      try {
        await webrtcManager.current.handleAnswer(userId, answer);
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    });

    signalingService.current.on('iceCandidate', async ({ userId, candidate }) => {
      try {
        await webrtcManager.current.handleIceCandidate(userId, candidate);
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    });

    signalingService.current.on('userLeft', ({ userId }) => {
      webrtcManager.current.closePeerConnection(userId);
    });

    // Forward ICE candidates
    webrtcManager.current.on('iceCandidate', ({ userId, candidate }) => {
      signalingService.current.sendMessage({
        type: 'ice-candidate',
        to: userId,
        data: candidate
      });
    });
  }, [user]);

  const connect = useCallback(async () => {
    if (!user || callState === 'connecting' || callState === 'connected') return;

    setError(null);
    console.log('Connecting to stage...');

    try {
      // Initialize media manager
      await mediaManager.current.initialize();
      
      // Create local stream
      const stream = await mediaManager.current.createStream({
        audio: true,
        video: true
      });

      // Start call
      callManager.current.startCall(stageId, user.id, user.name || 'Anonymous');
      
      // Initialize WebRTC
      await webrtcManager.current.initialize(stream);
      
      // Set up event handlers
      setupEventHandlers();

      // Connect signaling
      const connected = await signalingService.current.connect(stageId, user.id);
      if (!connected) {
        throw new Error('Failed to connect to signaling server');
      }

      callManager.current.setCallState('connected');
      isInitialized.current = true;

      toast({
        title: "Connected",
        description: "Successfully joined the stage",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setError(errorMessage);
      callManager.current.setCallState('error');

      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [user, stageId, callState, setupEventHandlers, toast]);

  const disconnect = useCallback(async () => {
    console.log('Disconnecting from stage...');

    try {
      // Stop screen sharing if active
      if (screenShareStream.current) {
        screenShareStream.current.getTracks().forEach(track => track.stop());
        screenShareStream.current = null;
        setIsScreenSharing(false);
      }

      // Cleanup services
      webrtcManager.current.cleanup();
      signalingService.current.disconnect();
      mediaManager.current.cleanup();
      callManager.current.cleanup();

      // Reset state
      setLocalStream(null);
      setRemoteStreams(new Map());
      setParticipants([]);
      setIsAudioEnabled(false);
      setIsVideoEnabled(false);
      setError(null);

      isInitialized.current = false;

      toast({
        title: "Disconnected",
        description: "Left the stage successfully",
      });

    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }, [toast]);

  const toggleAudio = useCallback(async (): Promise<boolean> => {
    const enabled = mediaManager.current.toggleAudio();
    return enabled;
  }, []);

  const toggleVideo = useCallback(async (): Promise<boolean> => {
    const enabled = mediaManager.current.toggleVideo();
    return enabled;
  }, []);

  const toggleScreenShare = useCallback(async (): Promise<boolean> => {
    try {
      if (isScreenSharing && screenShareStream.current) {
        // Stop screen sharing
        screenShareStream.current.getTracks().forEach(track => track.stop());
        screenShareStream.current = null;
        setIsScreenSharing(false);

        // Switch back to camera
        if (localStream) {
          webrtcManager.current.updateLocalStream(localStream);
        }

        return false;
      } else {
        // Start screen sharing
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { width: 1920, height: 1080 },
          audio: true
        });

        screenShareStream.current = displayStream;
        webrtcManager.current.updateLocalStream(displayStream);
        setIsScreenSharing(true);

        // Handle stream ended
        displayStream.getVideoTracks()[0].addEventListener('ended', () => {
          screenShareStream.current = null;
          setIsScreenSharing(false);
          if (localStream) {
            webrtcManager.current.updateLocalStream(localStream);
          }
        });

        return true;
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      return false;
    }
  }, [isScreenSharing, localStream]);

  // Initialize on mount
  useEffect(() => {
    if (user && stageId && !isInitialized.current && callState === 'idle') {
      connect();
    }

    return () => {
      if (isInitialized.current) {
        disconnect();
      }
    };
  }, [user, stageId, callState, connect, disconnect]);

  return {
    // Connection state
    isConnected: callState === 'connected',
    isConnecting: callState === 'connecting',
    callState,
    error,
    
    // Media state
    localStream,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    
    // Participants
    participants,
    remoteStreams,
    
    // Actions
    connect,
    disconnect,
    toggleAudio,
    toggleVideo,
    toggleScreenShare
  };
};
