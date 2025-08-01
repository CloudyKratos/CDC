
import { useCallback, useRef } from 'react';

export const useStageMediaCleanup = () => {
  const streamsRef = useRef<Set<MediaStream>>(new Set());

  const registerStream = useCallback((stream: MediaStream) => {
    streamsRef.current.add(stream);
  }, []);

  const unregisterStream = useCallback((stream: MediaStream) => {
    streamsRef.current.delete(stream);
  }, []);

  const cleanupAllStreams = useCallback(() => {
    console.log('Cleaning up all media streams');
    streamsRef.current.forEach(stream => {
      stream.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind, track.label);
        track.stop();
      });
    });
    streamsRef.current.clear();
  }, []);

  const cleanupSpecificStream = useCallback((stream: MediaStream) => {
    if (stream) {
      console.log('Cleaning up specific stream');
      stream.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind, track.label);
        track.stop();
      });
      unregisterStream(stream);
    }
  }, [unregisterStream]);

  return {
    registerStream,
    unregisterStream,
    cleanupAllStreams,
    cleanupSpecificStream
  };
};
