import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from 'sonner';

interface StageRoom {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  max_participants?: number;
  current_participants: number;
}

interface StageParticipant {
  id: string;
  user_id: string;
  stage_room_id: string;
  role: 'host' | 'speaker' | 'listener';
  is_muted: boolean;
  is_video_enabled: boolean;
  joined_at: string;
  user?: {
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

interface UseStageInitializationProps {
  roomId?: string;
  autoJoin?: boolean;
}

export function useStageInitialization({ 
  roomId, 
  autoJoin = false 
}: UseStageInitializationProps = {}) {
  const { user } = useAuth();
  const [stageRoom, setStageRoom] = useState<StageRoom | null>(null);
  const [participants, setParticipants] = useState<StageParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentParticipant, setCurrentParticipant] = useState<StageParticipant | null>(null);

  // Initialize stage room
  const initializeStage = useCallback(async (targetRoomId?: string) => {
    if (!user?.id) {
      setError('User must be authenticated');
      return;
    }

    const roomToLoad = targetRoomId || roomId;
    if (!roomToLoad) {
      setError('No room ID provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🎭 Initializing stage room:', roomToLoad);

      // Get stage room details
      const { data: room, error: roomError } = await supabase
        .from('stage_rooms')
        .select('*')
        .eq('id', roomToLoad)
        .single();

      if (roomError) {
        throw new Error(`Failed to load stage room: ${roomError.message}`);
      }

      if (!room) {
        throw new Error('Stage room not found');
      }

      setStageRoom(room);

      // Load current participants
      await loadParticipants(roomToLoad);

      // Auto-join if requested
      if (autoJoin) {
        await joinStage(roomToLoad);
      }

      setIsConnected(true);
      console.log('✅ Stage initialized successfully');

    } catch (err) {
      console.error('❌ Failed to initialize stage:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize stage');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, roomId, autoJoin]);

  // Load participants
  const loadParticipants = useCallback(async (targetRoomId: string) => {
    try {
      const { data: participantData, error } = await supabase
        .from('stage_participants')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('stage_room_id', targetRoomId)
        .order('joined_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to load participants: ${error.message}`);
      }

      const formattedParticipants = (participantData || []).map(p => ({
        ...p,
        user: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
      }));

      setParticipants(formattedParticipants);

      // Find current user's participation
      const userParticipant = formattedParticipants.find(p => p.user_id === user?.id);
      setCurrentParticipant(userParticipant || null);

    } catch (err) {
      console.error('❌ Failed to load participants:', err);
      throw err;
    }
  }, [user?.id]);

  // Join stage
  const joinStage = useCallback(async (targetRoomId?: string, role: 'speaker' | 'listener' = 'listener') => {
    if (!user?.id) {
      toast.error('Must be authenticated to join stage');
      return false;
    }

    const roomToJoin = targetRoomId || roomId;
    if (!roomToJoin) {
      toast.error('No room to join');
      return false;
    }

    try {
      console.log('🎭 Joining stage room:', roomToJoin);

      // Check if already a participant
      const existingParticipant = participants.find(p => p.user_id === user.id);
      if (existingParticipant) {
        toast.info('Already in this stage room');
        return true;
      }

      // Join the stage
      const { data: participant, error } = await supabase
        .from('stage_participants')
        .insert({
          stage_room_id: roomToJoin,
          user_id: user.id,
          role: role,
          is_muted: true, // Start muted by default
          is_video_enabled: false
        })
        .select('*')
        .single();

      if (error) {
        throw new Error(`Failed to join stage: ${error.message}`);
      }

      // Reload participants
      await loadParticipants(roomToJoin);

      toast.success(`Joined stage as ${role}`);
      return true;

    } catch (err) {
      console.error('❌ Failed to join stage:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to join stage');
      return false;
    }
  }, [user?.id, roomId, participants, loadParticipants]);

  // Leave stage
  const leaveStage = useCallback(async () => {
    if (!user?.id || !currentParticipant) {
      return false;
    }

    try {
      console.log('🚪 Leaving stage room');

      const { error } = await supabase
        .from('stage_participants')
        .delete()
        .eq('id', currentParticipant.id);

      if (error) {
        throw new Error(`Failed to leave stage: ${error.message}`);
      }

      setCurrentParticipant(null);
      
      // Reload participants
      if (stageRoom) {
        await loadParticipants(stageRoom.id);
      }

      toast.success('Left the stage');
      return true;

    } catch (err) {
      console.error('❌ Failed to leave stage:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to leave stage');
      return false;
    }
  }, [user?.id, currentParticipant, stageRoom, loadParticipants]);

  // Update participant settings
  const updateParticipantSettings = useCallback(async (settings: {
    is_muted?: boolean;
    is_video_enabled?: boolean;
    role?: 'host' | 'speaker' | 'listener';
  }) => {
    if (!currentParticipant) {
      toast.error('Not currently in a stage room');
      return false;
    }

    try {
      const { error } = await supabase
        .from('stage_participants')
        .update(settings)
        .eq('id', currentParticipant.id);

      if (error) {
        throw new Error(`Failed to update settings: ${error.message}`);
      }

      // Update local state
      setCurrentParticipant(prev => prev ? { ...prev, ...settings } : null);

      // Reload participants to sync with others
      if (stageRoom) {
        await loadParticipants(stageRoom.id);
      }

      return true;

    } catch (err) {
      console.error('❌ Failed to update participant settings:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update settings');
      return false;
    }
  }, [currentParticipant, stageRoom, loadParticipants]);

  // Create new stage room
  const createStageRoom = useCallback(async (roomData: {
    name: string;
    description?: string;
    max_participants?: number;
  }) => {
    if (!user?.id) {
      toast.error('Must be authenticated to create stage room');
      return null;
    }

    try {
      console.log('🎭 Creating new stage room:', roomData.name);

      const { data: newRoom, error } = await supabase
        .from('stage_rooms')
        .insert({
          name: roomData.name,
          description: roomData.description,
          max_participants: roomData.max_participants || 10,
          created_by: user.id,
          is_active: true,
          current_participants: 0
        })
        .select('*')
        .single();

      if (error) {
        throw new Error(`Failed to create stage room: ${error.message}`);
      }

      toast.success('Stage room created successfully');
      return newRoom;

    } catch (err) {
      console.error('❌ Failed to create stage room:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create stage room');
      return null;
    }
  }, [user?.id]);

  // Initialize on mount
  useEffect(() => {
    if (roomId && user?.id) {
      initializeStage();
    }
  }, [roomId, user?.id, initializeStage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentParticipant) {
        leaveStage();
      }
    };
  }, []);

  return {
    // State
    stageRoom,
    participants,
    currentParticipant,
    isLoading,
    error,
    isConnected,
    
    // Actions
    initializeStage,
    joinStage,
    leaveStage,
    updateParticipantSettings,
    createStageRoom,
    loadParticipants,
    
    // Computed values
    isHost: currentParticipant?.role === 'host',
    isSpeaker: currentParticipant?.role === 'speaker' || currentParticipant?.role === 'host',
    isListener: currentParticipant?.role === 'listener',
    isInStage: !!currentParticipant,
    participantCount: participants.length,
    speakerCount: participants.filter(p => p.role === 'speaker' || p.role === 'host').length
  };
}
