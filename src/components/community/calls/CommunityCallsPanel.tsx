
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  Globe, 
  Lock,
  Play,
  Square
} from 'lucide-react';
import { CreateCallModal } from './CreateCallModal';
import { toast } from 'sonner';
import CommunityCallService from '@/services/CommunityCallService';

export const CommunityCallsPanel: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [upcomingCalls] = useState([
    {
      id: '1',
      title: 'Weekly Community Standup',
      description: 'Join us for our weekly community updates and discussions',
      scheduled_time: '2024-02-01T15:00:00',
      duration_minutes: 60,
      max_participants: 100,
      is_public: true,
      status: 'scheduled' as const,
      participant_count: 23
    },
    {
      id: '2', 
      title: 'Product Roadmap Discussion',
      description: 'Let\'s discuss upcoming features and get your feedback',
      scheduled_time: '2024-02-03T14:00:00',
      duration_minutes: 90,
      max_participants: 50,
      is_public: false,
      status: 'scheduled' as const,
      participant_count: 12
    }
  ]);

  const handleCreateCall = (callId: string) => {
    console.log('Call created:', callId);
    toast.success('Community call created successfully!');
  };

  const handleJoinCall = async (callId: string) => {
    try {
      const result = await CommunityCallService.joinCall(callId, 'audience');
      
      if (result.success && result.stageId) {
        toast.success('Joining call...');
        // In a real app, you would navigate to the stage room
        console.log('Joining stage:', result.stageId);
      } else {
        toast.error(result.error || 'Failed to join call');
      }
    } catch (error) {
      console.error('Error joining call:', error);
      toast.error('Failed to join call');
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'ended': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">Community Calls</h2>
          <p className="text-sm text-muted-foreground">Host and join community discussions</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Host Call
        </Button>
      </div>

      {/* Calls List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {upcomingCalls.length > 0 ? (
          upcomingCalls.map((call) => {
            const { date, time } = formatDateTime(call.scheduled_time);
            
            return (
              <Card key={call.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {call.title}
                        {call.is_public ? (
                          <Globe className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        )}
                      </CardTitle>
                      {call.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {call.description}
                        </p>
                      )}
                    </div>
                    <Badge className={`${getStatusColor(call.status)} text-white`}>
                      {call.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {time} ({call.duration_minutes}m)
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {call.participant_count}/{call.max_participants}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {call.status === 'scheduled' && (
                      <Button
                        onClick={() => handleJoinCall(call.id)}
                        className="flex-1 flex items-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Join Call
                      </Button>
                    )}
                    
                    {call.status === 'live' && (
                      <>
                        <Button
                          onClick={() => handleJoinCall(call.id)}
                          className="flex-1 flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <Play className="w-4 h-4" />
                          Join Live
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Video className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No scheduled calls</h3>
            <p className="text-muted-foreground mb-4">
              Create your first community call to get started
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Host Your First Call
            </Button>
          </div>
        )}
      </div>

      <CreateCallModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCallCreated={handleCreateCall}
      />
    </div>
  );
};
