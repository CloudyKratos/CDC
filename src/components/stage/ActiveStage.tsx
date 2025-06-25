
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Mic, MicOff, Video, VideoOff, Users, Clock, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface Stage {
  id: string;
  name: string;
  description?: string;
  host_id: string;
  is_active: boolean;
  max_participants: number;
  workspace_id?: string;
  created_at: string;
  updated_at: string;
}

interface ActiveStageProps {
  stageId: string;
  onLeave: () => void;
}

const ActiveStage: React.FC<ActiveStageProps> = ({ stageId, onLeave }) => {
  const { user } = useAuth();
  const [stage, setStage] = useState<Stage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);

  useEffect(() => {
    const fetchStage = async () => {
      try {
        const { data, error } = await supabase
          .from('stages')
          .select('*')
          .eq('id', stageId)
          .single();

        if (error) throw error;
        setStage(data);
      } catch (error) {
        console.error('Error fetching stage:', error);
        toast.error('Failed to load stage');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStage();
  }, [stageId]);

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    toast.info(isMuted ? 'Microphone unmuted' : 'Microphone muted');
  };

  const handleVideoToggle = () => {
    setIsVideoOff(!isVideoOff);
    toast.info(isVideoOff ? 'Video enabled' : 'Video disabled');
  };

  const handleLeaveStage = () => {
    toast.info('Left the stage');
    onLeave();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading stage...</p>
        </div>
      </div>
    );
  }

  if (!stage) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Stage not found</p>
        </CardContent>
      </Card>
    );
  }

  const isHost = user?.id === stage.host_id;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {stage.name}
                <Badge variant={stage.is_active ? 'default' : 'secondary'}>
                  {stage.is_active ? 'Live' : 'Inactive'}
                </Badge>
              </CardTitle>
              {stage.description && (
                <CardDescription>{stage.description}</CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{participants.length} / {stage.max_participants}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Main Stage Area */}
            <div className="md:col-span-2">
              <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center mb-4">
                <div className="text-center text-white">
                  <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm opacity-75">Stage Camera</p>
                </div>
              </div>
              
              {/* Stage Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant={isMuted ? "destructive" : "outline"}
                  size="sm"
                  onClick={handleMuteToggle}
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  variant={isVideoOff ? "destructive" : "outline"}
                  size="sm"
                  onClick={handleVideoToggle}
                >
                  {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                </Button>
                <Button variant="destructive" size="sm" onClick={handleLeaveStage}>
                  <Phone className="h-4 w-4 mr-2" />
                  Leave Stage
                </Button>
              </div>
            </div>

            {/* Participants Panel */}
            <div className="space-y-4">
              <h3 className="font-medium">Participants</h3>
              <div className="space-y-2">
                {participants.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No other participants</p>
                ) : (
                  participants.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={participant.avatar_url} />
                        <AvatarFallback>
                          {participant.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{participant.name || 'Anonymous'}</p>
                        {participant.id === stage.host_id && (
                          <Badge variant="secondary" className="text-xs">Host</Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActiveStage;
