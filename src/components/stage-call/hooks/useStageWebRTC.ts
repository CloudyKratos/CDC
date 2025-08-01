
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WebRTCConfig {
  iceServers: RTCIceServer[];
  offerOptions: RTCOfferOptions;
  answerOptions: RTCAnswerOptions;
}

interface PeerConnection {
  pc: RTCPeerConnection;
  userId: string;
  stream?: MediaStream;
  dataChannel?: RTCDataChannel;
}

export const useStageWebRTC = (localStream: MediaStream | null) => {
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [peerConnections, setPeerConnections] = useState<Map<string, PeerConnection>>(new Map());
  const [connectionStates, setConnectionStates] = useState<Map<string, RTCPeerConnectionState>>(new Map());
  const { toast } = useToast();
  
  const webrtcConfig: WebRTCConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
    offerOptions: {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    },
    answerOptions: {}
  };

  const createPeerConnection = useCallback(async (userId: string): Promise<RTCPeerConnection> => {
    console.log('Creating peer connection for:', userId);
    
    const pc = new RTCPeerConnection({
      iceServers: webrtcConfig.iceServers,
    });

    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle incoming stream
    pc.ontrack = (event) => {
      console.log('Received remote track from:', userId);
      const [remoteStream] = event.streams;
      setRemoteStreams(prev => new Map(prev.set(userId, remoteStream)));
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Connection state for ${userId}:`, pc.connectionState);
      setConnectionStates(prev => new Map(prev.set(userId, pc.connectionState)));
      
      if (pc.connectionState === 'connected') {
        toast({
          title: "Connected",
          description: `Connected to ${userId}`,
        });
      } else if (pc.connectionState === 'failed') {
        toast({
          title: "Connection Failed",
          description: `Failed to connect to ${userId}`,
          variant: "destructive",
        });
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate to:', userId);
        // In real implementation, send this via signaling server
      }
    };

    // Create data channel for chat and control messages
    const dataChannel = pc.createDataChannel('control', {
      ordered: true,
    });

    dataChannel.onopen = () => {
      console.log('Data channel opened for:', userId);
    };

    dataChannel.onmessage = (event) => {
      console.log('Received data channel message:', event.data);
      // Handle control messages (mute/unmute, hand raise, etc.)
    };

    const peerConnection: PeerConnection = {
      pc,
      userId,
      dataChannel,
    };

    setPeerConnections(prev => new Map(prev.set(userId, peerConnection)));
    return pc;
  }, [localStream, toast]);

  const createOffer = useCallback(async (userId: string) => {
    const pc = await createPeerConnection(userId);
    const offer = await pc.createOffer(webrtcConfig.offerOptions);
    await pc.setLocalDescription(offer);
    
    console.log('Created offer for:', userId);
    // In real implementation, send offer via signaling server
    return offer;
  }, [createPeerConnection, webrtcConfig.offerOptions]);

  const createAnswer = useCallback(async (userId: string, offer: RTCSessionDescriptionInit) => {
    const pc = await createPeerConnection(userId);
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer(webrtcConfig.answerOptions);
    await pc.setLocalDescription(answer);
    
    console.log('Created answer for:', userId);
    // In real implementation, send answer via signaling server
    return answer;
  }, [createPeerConnection, webrtcConfig.answerOptions]);

  const handleAnswer = useCallback(async (userId: string, answer: RTCSessionDescriptionInit) => {
    const peerConnection = peerConnections.get(userId);
    if (peerConnection) {
      await peerConnection.pc.setRemoteDescription(answer);
      console.log('Set remote description for:', userId);
    }
  }, [peerConnections]);

  const handleIceCandidate = useCallback(async (userId: string, candidate: RTCIceCandidateInit) => {
    const peerConnection = peerConnections.get(userId);
    if (peerConnection) {
      await peerConnection.pc.addIceCandidate(candidate);
    }
  }, [peerConnections]);

  const sendControlMessage = useCallback((message: any) => {
    peerConnections.forEach((peerConnection) => {
      if (peerConnection.dataChannel && peerConnection.dataChannel.readyState === 'open') {
        peerConnection.dataChannel.send(JSON.stringify(message));
      }
    });
  }, [peerConnections]);

  const removePeer = useCallback((userId: string) => {
    const peerConnection = peerConnections.get(userId);
    if (peerConnection) {
      peerConnection.pc.close();
      setPeerConnections(prev => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
    }
    
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });
    
    setConnectionStates(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });
  }, [peerConnections]);

  const cleanup = useCallback(() => {
    peerConnections.forEach((peerConnection) => {
      peerConnection.pc.close();
    });
    setPeerConnections(new Map());
    setRemoteStreams(new Map());
    setConnectionStates(new Map());
  }, [peerConnections]);

  // Update tracks when local stream changes
  useEffect(() => {
    if (localStream) {
      peerConnections.forEach((peerConnection) => {
        // Remove old tracks
        peerConnection.pc.getSenders().forEach(sender => {
          if (sender.track) {
            peerConnection.pc.removeTrack(sender);
          }
        });

        // Add new tracks
        localStream.getTracks().forEach(track => {
          peerConnection.pc.addTrack(track, localStream);
        });
      });
    }
  }, [localStream, peerConnections]);

  return {
    remoteStreams,
    connectionStates,
    createOffer,
    createAnswer,
    handleAnswer,
    handleIceCandidate,
    sendControlMessage,
    removePeer,
    cleanup,
  };
};
