
import { useState, useRef, useCallback } from 'react';

export const useStageMedia = () => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const initializeMedia = useCallback(async () => {
    try {
      console.log('Initializing media...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      });
      
      streamRef.current = stream;
      setLocalStream(stream);
      
      // Start with audio off for audience members
      stream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
      
      setIsAudioEnabled(false);
      setIsVideoEnabled(true);
      
      console.log('Media initialized successfully');
      return stream;
    } catch (error) {
      console.error('Failed to initialize media:', error);
      
      // Fallback to audio only
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = audioStream;
        setLocalStream(audioStream);
        setIsVideoEnabled(false);
        return audioStream;
      } catch (audioError) {
        console.error('Failed to get audio:', audioError);
        throw new Error('Media access denied');
      }
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled(prev => !prev);
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(prev => !prev);
    }
  }, []);

  const cleanupMedia = useCallback(() => {
    console.log('Cleaning up media resources');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
      setLocalStream(null);
    }
    
    setIsAudioEnabled(false);
    setIsVideoEnabled(false);
  }, []);

  const getMediaStream = useCallback(() => {
    return streamRef.current;
  }, []);

  return {
    isAudioEnabled,
    isVideoEnabled,
    localStream,
    initializeMedia,
    toggleAudio,
    toggleVideo,
    cleanupMedia,
    getMediaStream
  };
};
