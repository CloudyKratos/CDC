
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import WebRTCManager from '@/services/webrtc/WebRTCManager';
import SignalingService from '@/services/signaling/SignalingService';
import { useToast } from '@/hooks/use-toast';

interface MediaState {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
}

interface Participant {
  userId: string;
  stream?: MediaStream;
  mediaState: MediaState;
  connectionState: RTCPeerConnectionState;
}

interface StageState {
  isConnected: boolean;
  isConnecting: boolean;
  participants: Map<string, Participant>;
  localStream: MediaStream | null;
  mediaState: MediaState;
  error: string | null;
}

export const useRealTimeStage = (stageId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [state, setState] = useState<StageState>({
    isConnected: false,
    isConnecting: false,
    participants: new Map(),
    localStream: null,
    mediaState: {
      isAudioEnabled: false,
      isVideoEnabled: true,
      isScreenSharing: false
    },
    error: null
  });

  const webrtcManager = useRef(WebRTCManager);
  const signalingService = useRef(SignalingService);
  const isInitialized = useRef(false);
  const screenShareStream = useRef<MediaStream | null>(null);

  const updateState = useCallback((updates: Partial<StageState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const initializeMedia = useCallback(async (): Promise<MediaStream> => {
    try {
      console.log('Initializing user media...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      });

      // Start with audio muted for better UX
      stream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });

      console.log('Media initialized successfully');
      return stream;
    } catch (error) {
      console.error('Failed to initialize media:', error);
      throw new Error('Failed to access camera/microphone');
    }
  }, []);

  const setupWebRTCHandlers = useCallback(() => {
    const webrtc = webrtcManager.current;

    webrtc.on('remoteStream', ({ userId, stream }) => {
      console.log(`Adding remote stream for user: ${userId}`);
      setState(prev => {
        const newParticipants = new Map(prev.participants);
        const existing = newParticipants.get(userId) || {
          userId,
          mediaState: { isAudioEnabled: true, isVideoEnabled: true, isScreenSharing: false },
          connectionState: 'connecting' as RTCPeerConnectionState
        };
        
        newParticipants.set(userId, { ...existing, stream });
        return { ...prev, participants: newParticipants };
      });
    });

    webrtc.on('connectionStateChange', ({ userId, state: connectionState }) => {
      setState(prev => {
        const newParticipants = new Map(prev.participants);
        const existing = newParticipants.get(userId);
        if (existing) {
          newParticipants.set(userId, { ...existing, connectionState });
        }
        return { ...prev, participants: newParticipants };
      });
    });

    webrtc.on('peerDisconnected', ({ userId }) => {
      console.log(`Removing participant: ${userId}`);
      setState(prev => {
        const newParticipants = new Map(prev.participants);
        newParticipants.delete(userId);
        return { ...prev, participants: newParticipants };
      });
    });

    webrtc.on('dataChannelMessage', ({ userId, message }) => {
      handleControlMessage(userId, message);
    });
  }, []);

  const setupSignalingHandlers = useCallback(() => {
    const signaling = signalingService.current;

    signaling.on('userJoined', async ({ userId }) => {
      console.log(`User joined: ${userId}`);
      if (userId !== user?.id) {
        try {
          const offer = await webrtcManager.current.createOffer(userId);
          signaling.sendMessage({
            type: 'offer',
            to: userId,
            data: offer
          });
        } catch (error) {
          console.error('Error creating offer for new user:', error);
        }
      }
    });

    signaling.on('offer', async ({ userId, offer }) => {
      console.log(`Received offer from: ${userId}`);
      try {
        const answer = await webrtcManager.current.createAnswer(userId, offer);
        signaling.sendMessage({
          type: 'answer',
          to: userId,
          data: answer
        });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    });

    signaling.on('answer', async ({ userId, answer }) => {
      console.log(`Received answer from: ${userId}`);
      try {
        await webrtcManager.current.handleAnswer(userId, answer);
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    });

    signaling.on('iceCandidate', async ({ userId, candidate }) => {
      try {
        await webrtcManager.current.handleIceCandidate(userId, candidate);
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    });

    signaling.on('userLeft', ({ userId }) => {
      console.log(`User left: ${userId}`);
      webrtcManager.current.closePeerConnection(userId);
    });

    signaling.on('controlMessage', ({ userId, data }) => {
      handleControlMessage(userId, data);
    });
  }, [user?.id]);

  const handleControlMessage = useCallback((userId: string, message: any) => {
    console.log('Received control message:', message);
    
    switch (message.type) {
      case 'audio-toggle':
        setState(prev => {
          const newParticipants = new Map(prev.participants);
          const participant = newParticipants.get(userId);
          if (participant) {
            newParticipants.set(userId, {
              ...participant,
              mediaState: { ...participant.mediaState, isAudioEnabled: message.enabled }
            });
          }
          return { ...prev, participants: newParticipants };
        });
        break;
      
      case 'video-toggle':
        setState(prev => {
          const newParticipants = new Map(prev.participants);
          const participant = newParticipants.get(userId);
          if (participant) {
            newParticipants.set(userId, {
              ...participant,
              mediaState: { ...participant.mediaState, isVideoEnabled: message.enabled }
            });
          }
          return { ...prev, participants: newParticipants };
        });
        break;
    }
  }, []);

  const connect = useCallback(async () => {
    if (!user || state.isConnecting || state.isConnected) return;

    updateState({ isConnecting: true, error: null });

    try {
      // Initialize media
      const localStream = await initializeMedia();
      updateState({ localStream });

      // Initialize WebRTC
      await webrtcManager.current.initialize(localStream);
      
      // Set up event handlers
      setupWebRTCHandlers();
      setupSignalingHandlers();

      // Connect signaling
      const signalingConnected = await signalingService.current.connect(stageId, user.id);
      if (!signalingConnected) {
        throw new Error('Failed to connect to signaling server');
      }

      // Set up ICE candidate forwarding
      webrtcManager.current.on('iceCandidate', ({ userId, candidate }) => {
        signalingService.current.sendMessage({
          type: 'ice-candidate',
          to: userId,
          data: candidate
        });
      });

      updateState({ isConnected: true, isConnecting: false });
      isInitialized.current = true;

      toast({
        title: "Connected",
        description: "Successfully joined the stage",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      updateState({ 
        isConnecting: false, 
        isConnected: false, 
        error: errorMessage 
      });

      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [user, stageId, state.isConnecting, state.isConnected, initializeMedia, setupWebRTCHandlers, setupSignalingHandlers, updateState, toast]);

  const disconnect = useCallback(async () => {
    console.log('Disconnecting from stage...');

    // Stop screen sharing if active
    if (screenShareStream.current) {
      screenShareStream.current.getTracks().forEach(track => track.stop());
      screenShareStream.current = null;
    }

    // Stop local stream
    if (state.localStream) {
      state.localStream.getTracks().forEach(track => track.stop());
    }

    // Cleanup WebRTC and signaling
    webrtcManager.current.cleanup();
    signalingService.current.disconnect();

    updateState({
      isConnected: false,
      isConnecting: false,
      participants: new Map(),
      localStream: null,
      error: null
    });

    isInitialized.current = false;

    toast({
      title: "Disconnected",
      description: "Left the stage successfully",
    });
  }, [state.localStream, updateState, toast]);

  const toggleAudio = useCallback(async () => {
    if (!state.localStream) return false;

    const audioTrack = state.localStream.getAudioTracks()[0];
    if (audioTrack) {
      const newEnabled = !audioTrack.enabled;
      audioTrack.enabled = newEnabled;

      updateState({
        mediaState: { ...state.mediaState, isAudioEnabled: newEnabled }
      });

      // Broadcast state change
      webrtcManager.current.broadcastDataChannelMessage({
        type: 'audio-toggle',
        enabled: newEnabled
      });

      return newEnabled;
    }
    return false;
  }, [state.localStream, state.mediaState, updateState]);

  const toggleVideo = useCallback(async () => {
    if (!state.localStream) return false;

    const videoTrack = state.localStream.getVideoTracks()[0];
    if (videoTrack) {
      const newEnabled = !videoTrack.enabled;
      videoTrack.enabled = newEnabled;

      updateState({
        mediaState: { ...state.mediaState, isVideoEnabled: newEnabled }
      });

      // Broadcast state change
      webrtcManager.current.broadcastDataChannelMessage({
        type: 'video-toggle',
        enabled: newEnabled
      });

      return newEnabled;
    }
    return false;
  }, [state.localStream, state.mediaState, updateState]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (state.mediaState.isScreenSharing && screenShareStream.current) {
        // Stop screen sharing
        screenShareStream.current.getTracks().forEach(track => track.stop());
        screenShareStream.current = null;

        // Switch back to camera
        if (state.localStream) {
          webrtcManager.current.updateLocalStream(state.localStream);
        }

        updateState({
          mediaState: { ...state.mediaState, isScreenSharing: false }
        });

        return false;
      } else {
        // Start screen sharing
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { width: 1920, height: 1080 },
          audio: true
        });

        screenShareStream.current = displayStream;
        webrtcManager.current.updateLocalStream(displayStream);

        // Handle stream ended
        displayStream.getVideoTracks()[0].addEventListener('ended', () => {
          screenShareStream.current = null;
          if (state.localStream) {
            webrtcManager.current.updateLocalStream(state.localStream);
          }
          updateState({
            mediaState: { ...state.mediaState, isScreenSharing: false }
          });
        });

        updateState({
          mediaState: { ...state.mediaState, isScreenSharing: true }
        });

        return true;
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      return false;
    }
  }, [state.mediaState, state.localStream, updateState]);

  // Initialize on mount
  useEffect(() => {
    if (user && stageId && !isInitialized.current) {
      connect();
    }

    return () => {
      if (isInitialized.current) {
        disconnect();
      }
    };
  }, [user, stageId]);

  return {
    ...state,
    connect,
    disconnect,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    participants: Array.from(state.participants.values()),
    remoteStreams: new Map(
      Array.from(state.participants.entries())
        .filter(([_, participant]) => participant.stream)
        .map(([userId, participant]) => [userId, participant.stream!])
    ),
    screenShareStream: screenShareStream.current
  };
};
