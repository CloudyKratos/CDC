
import StageService from '@/services/StageService';
import StageCleanupService from '@/services/StageCleanupService';

export const cleanupStageResources = async (stageId: string, userId: string): Promise<void> => {
  console.log('Cleaning up stage resources for:', { stageId, userId });
  
  try {
    const cleanupService = StageCleanupService.getInstance();
    
    // Force disconnect user from any existing sessions
    await cleanupService.forceCleanupUserParticipation(stageId, userId);
    
    // Clean up ghost participants
    await cleanupService.cleanupGhostParticipants(stageId);
    
    // Clean up completed stages
    await cleanupService.cleanupCompletedStages();
    
    console.log('Stage resources cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up stage resources:', error);
    // Don't throw error as this is cleanup - we want to continue anyway
  }
};

export const cleanupCompletedCalls = async (): Promise<void> => {
  try {
    console.log('Cleaning up completed calls...');
    const cleanupService = StageCleanupService.getInstance();
    await cleanupService.cleanupCompletedStages();
  } catch (error) {
    console.error('Error cleaning up completed calls:', error);
  }
};

export const stopAllTracks = (stream: MediaStream | null): void => {
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
      console.log(`Stopped ${track.kind} track`);
    });
  }
};

export const destroyPeerConnections = (peerConnections: Map<string, any>): void => {
  peerConnections.forEach((connection, userId) => {
    try {
      if (connection.pc && connection.pc.close) {
        connection.pc.close();
        console.log(`Closed peer connection for user: ${userId}`);
      }
    } catch (error) {
      console.error(`Error closing peer connection for ${userId}:`, error);
    }
  });
  
  peerConnections.clear();
};

// Auto cleanup function that can be called periodically
export const performPeriodicCleanup = async (): Promise<void> => {
  try {
    console.log('Performing periodic cleanup...');
    const cleanupService = StageCleanupService.getInstance();
    await cleanupService.cleanupCompletedStages();
    console.log('Periodic cleanup completed');
  } catch (error) {
    console.error('Error in periodic cleanup:', error);
  }
};
