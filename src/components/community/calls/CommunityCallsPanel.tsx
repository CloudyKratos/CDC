import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, Users, Video, Plus, Play, Settings, PhoneOff } from 'lucide-react';
import { CreateCallModal } from './CreateCallModal';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import CommunityCallService, { CommunityCall } from '@/services/CommunityCallService';

type CallStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';

export const CommunityCallsPanel: React.FC = () => {
  const [calls, setCalls] = useState<CommunityCall[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [canCreateCalls, setCanCreateCalls] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadCalls();
    checkCreatePermissions();
  }, []);

  const checkCreatePermissions = async () => {
    try {
      const canCreate = await CommunityCallService.canCreateCalls();
      setCanCreateCalls(canCreate);
    } catch (error) {
      console.error('Error checking create permissions:', error);
      setCanCreateCalls(false);
    }
  };

  const loadCalls = async () => {
    try {
      setIsLoading(true);
      const upcomingCalls = await CommunityCallService.getUpcomingCalls();
      setCalls(upcomingCalls);
    } catch (error) {
      console.error('Error loading calls:', error);
      toast.error('Failed to load community calls');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCall = async (callData: {
    title: string;
    description: string;
    scheduledTime: Date;
    maxParticipants: number;
  }) => {
    try {
      if (!user) {
        toast.error('You must be logged in to create a call');
        return;
      }

      if (!canCreateCalls) {
        toast.error('You do not have permission to create calls');
        return;
      }

      const newCall = await CommunityCallService.createCall({
        ...callData,
        host_id: user.id,
        status: 'scheduled' as CallStatus
      });

      setCalls(prev => [newCall, ...prev]);
      setIsCreateModalOpen(false);
      toast.success('Community call created successfully!');
    } catch (error) {
      console.error('Error creating call:', error);
      toast.error('Failed to create community call');
    }
  };

  const handleJoinCall = async (call: CommunityCall) => {
    try {
      if (!user) {
        toast.error('You must be logged in to join a call');
        return;
      }

      // Check if call is live or about to start (within 5 minutes)
      const callTime = new Date(call.scheduled_time);
      const now = new Date();
      const timeDiff = callTime.getTime() - now.getTime();
      const fiveMinutes = 5 * 60 * 1000;

      if (call.status === 'live' || (timeDiff <= fiveMinutes && timeDiff >= -fiveMinutes)) {
        // Join the call
        await CommunityCallService.joinCall(call.id, user.id);
        
        // Navigate to the stage room
        navigate(`/stage-call/community/${call.id}`);
        toast.success('Joining community call...');
      } else if (call.status === 'scheduled') {
        toast.info('This call is scheduled for later. You can join 5 minutes before the start time.');
      } else {
        toast.error('This call is no longer available');
      }
    } catch (error) {
      console.error('Error joining call:', error);
      toast.error('Failed to join call');
    }
  };

  const handleStartCall = async (call: CommunityCall) => {
    try {
      if (!user || call.host_id !== user.id) {
        toast.error('Only the host can start this call');
        return;
      }

      await CommunityCallService.updateCallStatus(call.id, 'live');
      
      // Update local state
      setCalls(prev => prev.map(c => 
        c.id === call.id ? { ...c, status: 'live' as CallStatus } : c
      ));

      // Navigate to the stage room
      navigate(`/stage-call/community/${call.id}`);
      toast.success('Starting community call...');
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Failed to start call');
    }
  };

  const handleEndCall = async (call: CommunityCall) => {
    try {
      if (!user || call.host_id !== user.id) {
        toast.error('Only the host can end this call');
        return;
      }

      const result = await CommunityCallService.endCall(call.id);
      if (result.success) {
        // Update local state to remove ended call
        setCalls(prev => prev.filter(c => c.id !== call.id));
        toast.success('Call ended and cleared from stage rooms');
      } else {
        toast.error(result.error || 'Failed to end call');
      }
    } catch (error) {
      console.error('Error ending call:', error);
      toast.error('Failed to end call');
    }
  };

  const formatCallTime = (scheduledTime: string) => {
    const date = new Date(scheduledTime);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const getStatusColor = (status: CallStatus) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'live':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'ended':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const canJoinCall = (call: CommunityCall) => {
    if (call.status === 'live') return true;
    
    const callTime = new Date(call.scheduled_time);
    const now = new Date();
    const timeDiff = callTime.getTime() - now.getTime();
    const fiveMinutes = 5 * 60 * 1000;
    
    return timeDiff <= fiveMinutes && timeDiff >= -fiveMinutes;
  };

  const isHost = (call: CommunityCall) => {
    return user?.id === call.host_id;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading community calls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Community Calls</h1>
          <p className="text-muted-foreground">Join or host community discussions</p>
        </div>
        {canCreateCalls && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Call
          </Button>
        )}
      </div>

      {calls.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No upcoming calls</h3>
            <p className="text-muted-foreground mb-6">
              {canCreateCalls 
                ? "Schedule your first community call to bring people together for discussions, presentations, or casual conversations."
                : "Community calls will appear here when scheduled by authorized users."
              }
            </p>
            {canCreateCalls && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Your First Call
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto space-y-4">
          {calls.map((call) => (
            <Card key={call.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{call.title}</CardTitle>
                      <Badge className={getStatusColor(call.status)}>
                        {call.status}
                      </Badge>
                    </div>
                    <CardDescription>{call.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {isHost(call) && call.status === 'scheduled' && (
                      <Button
                        size="sm"
                        onClick={() => handleStartCall(call)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </Button>
                    )}
                    {isHost(call) && call.status === 'live' && (
                      <Button
                        size="sm"
                        onClick={() => handleEndCall(call)}
                        variant="destructive"
                      >
                        <PhoneOff className="w-4 h-4 mr-2" />
                        End Call
                      </Button>
                    )}
                    {canJoinCall(call) && (
                      <Button
                        size="sm"
                        onClick={() => handleJoinCall(call)}
                        variant={call.status === 'live' ? 'default' : 'outline'}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        {call.status === 'live' ? 'Join Live' : 'Join'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatCallTime(call.scheduled_time)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {call.participant_count || 0} / {call.max_participants} participants
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {call.host_name?.charAt(0) || 'H'}
                      </AvatarFallback>
                    </Avatar>
                    <span>Hosted by {call.host_name || 'Community Member'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {canCreateCalls && (
        <CreateCallModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onCreateCall={handleCreateCall}
        />
      )}
    </div>
  );
};
