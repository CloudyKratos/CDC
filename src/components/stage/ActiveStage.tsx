import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import StageService from '@/services/StageService';
import RoundtableStageCall from './RoundtableStageCall';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Mic, 
  Clock, 
  Calendar,
  ArrowLeft,
  Play,
  Settings
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Stage = Database['public']['Tables']['stages']['Row'];

interface ActiveStageProps {
  stageId: string;
  onLeave: () => void;
  userRole?: string;
}

const ActiveStage: React.FC<ActiveStageProps> = ({
  stageId,
  onLeave,
  userRole
}) => {
  const [stage, setStage] = useState<Stage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const { user } = useAuth();
  const { currentRole } = useRole();

  useEffect(() => {
    loadStage();
    
    // Set up real-time subscription for stage updates
    const channel = StageService.subscribeToStageUpdates(stageId, handleStageUpdate);
    
    return () => {
      channel.unsubscribe();
    };
  }, [stageId]);

  const loadStage = async () => {
    setIsLoading(true);
    try {
      const stageData = await StageService.getStageById(stageId);
      setStage(stageData);
    } catch (error) {
      console.error('Error loading stage:', error);
      toast.error('Failed to load stage details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStageUpdate = () => {
    loadStage();
  };

  const joinStageCall = async () => {
    if (!user) {
      toast.error('Please log in to join the stage');
      return;
    }

    setIsJoining(true);
    try {
      // Start the stage if it's scheduled and user is creator/moderator
      if (stage?.status === 'scheduled' && 
          (stage.creator_id === user.id || currentRole === 'admin' || currentRole === 'moderator')) {
        await StageService.updateStageStatus(stageId, 'live');
        setStage(prev => prev ? { ...prev, status: 'live' } : null);
        toast.success('Stage is now live!');
      }

      // Join as participant
      const success = await StageService.joinStage(stageId, 'audience');
      if (success) {
        setHasJoined(true);
        toast.success('Joined stage successfully!');
      } else {
        toast.error('Failed to join stage');
      }
    } catch (error) {
      console.error('Error joining stage:', error);
      toast.error('Failed to join stage');
    } finally {
      setIsJoining(false);
    }
  };

  const leaveStageCall = async () => {
    try {
      const success = await StageService.leaveStage(stageId);
      if (success) {
        setHasJoined(false);
        onLeave();
        toast.success('Left stage successfully!');
      } else {
        toast.error('Failed to leave stage');
      }
    } catch (error) {
      console.error('Error leaving stage:', error);
      toast.error('Failed to leave stage');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge variant="destructive" className="gap-1"><Play className="h-3 w-3" />Live</Badge>;
      case 'scheduled':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Scheduled</Badge>;
      default:
        return <Badge variant="outline">Ended</Badge>;
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleString();
  };

  const canStartStage = stage?.creator_id === user?.id || currentRole === 'admin' || currentRole === 'moderator';

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center gap-2 p-4 border-b">
          <Button variant="ghost" size="sm" onClick={onLeave} disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="flex-1 p-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!stage) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center gap-2 p-4 border-b">
          <Button variant="ghost" size="sm" onClick={onLeave}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Stage Not Found</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                The stage you're looking for could not be found or may have been deleted.
              </p>
              <Button onClick={onLeave}>Go Back</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If user has joined the stage call, show the real-time call interface
  if (hasJoined) {
    return <RoundtableStageCall stageId={stageId} onLeave={leaveStageCall} userRole={userRole || 'audience'} />;
  }

  // Show stage details and join interface
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b">
        <Button variant="ghost" size="sm" onClick={onLeave}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold">{stage.title}</h1>
        {getStatusBadge(stage.status)}
      </div>

      {/* Stage Details */}
      <div className="flex-1 p-4 overflow-y-auto">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{stage.title}</span>
              {stage.topic && (
                <Badge variant="outline">#{stage.topic}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {stage.description && (
              <div>
                <h3 className="text-sm font-medium mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{stage.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Max Audience: {stage.max_audience || 100}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-muted-foreground" />
                <span>Max Speakers: {stage.max_speakers || 10}</span>
              </div>
              
              {stage.scheduled_start_time && (
                <div className="flex items-center gap-2 col-span-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Scheduled: {formatDateTime(stage.scheduled_start_time)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {stage.allow_hand_raising && (
                <Badge variant="secondary">Hand Raising Allowed</Badge>
              )}
              {stage.recording_enabled && (
                <Badge variant="secondary">Recording Enabled</Badge>
              )}
            </div>

            {/* Join Button */}
            <div className="pt-4">
              {stage.status === 'scheduled' && canStartStage ? (
                <Button 
                  onClick={joinStageCall} 
                  disabled={isJoining}
                  size="lg"
                  className="w-full gap-2"
                >
                  <Play className="h-5 w-5" />
                  {isJoining ? 'Starting Stage...' : 'Start & Join Stage'}
                </Button>
              ) : stage.status === 'live' ? (
                <Button 
                  onClick={joinStageCall} 
                  disabled={isJoining}
                  size="lg"
                  className="w-full gap-2"
                >
                  <Users className="h-5 w-5" />
                  {isJoining ? 'Joining...' : 'Join Live Stage'}
                </Button>
              ) : stage.status === 'scheduled' ? (
                <div className="text-center text-muted-foreground">
                  <p>This stage is scheduled but not yet live.</p>
                  <p className="text-sm">Only the creator or moderators can start it.</p>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p>This stage has ended.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActiveStage;
