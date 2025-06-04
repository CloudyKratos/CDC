
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
    
    // Clean up completed calls (older than 2 hours)
    await cleanupCompletedCalls();
    
    console.log('Stage resources cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up stage resources:', error);
    // Don't throw error as this is cleanup - we want to continue anyway
  }
};

export const cleanupCompletedCalls = async (): Promise<void> => {
  try {
    console.log('Cleaning up completed calls...');
    
    // This would ideally be done via a Supabase edge function or cron job
    // For now, we'll clean up participants who left more than 2 hours ago
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    
    // Note: This would need to be implemented as a database function or edge function
    // since we can't directly delete from the frontend for security reasons
    console.log('Cleanup would remove participants who left before:', twoHoursAgo);
    
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
