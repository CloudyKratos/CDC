
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, MicOff, VideoOff, Hand } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  role: 'speaker' | 'audience' | 'moderator';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isMuted: boolean;
  isHandRaised: boolean;
  avatarUrl?: string;
}

interface User {
  id: string;
  email?: string;
  // Updated to use direct properties instead of user_metadata
  full_name?: string;
  avatar_url?: string;
}

interface ParticipantGridProps {
  speakers: Participant[];
  listeners: Participant[];
  localVideoRef: React.RefObject<HTMLVideoElement>;
  user: User | null;
  userStageRole: 'speaker' | 'audience' | 'moderator';
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isHandRaised: boolean;
  activeSpeaker: string | null;
  canModerate: boolean;
}

const ParticipantGrid: React.FC<ParticipantGridProps> = ({
  speakers,
  listeners,
  localVideoRef,
  user,
  userStageRole,
  isVideoEnabled,
  isAudioEnabled,
  isHandRaised,
  activeSpeaker,
  canModerate
}) => {
  const renderParticipantCard = (participant: Participant, isLocal = false) => (
    <Card key={participant.id} className={`relative overflow-hidden transition-all duration-300 ${activeSpeaker === participant.id ? 'ring-2 ring-primary shadow-lg scale-105' : ''}`}>
      <CardContent className="p-0 aspect-video bg-gradient-to-br from-slate-900 to-slate-800 relative">
        {isLocal ? (
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        )}
        
        {!participant.isVideoEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
            <Avatar className="w-16 h-16">
              <AvatarImage src={participant.avatarUrl} />
              <AvatarFallback>{participant.name[0]}</AvatarFallback>
            </Avatar>
          </div>
        )}
        
        <div className="absolute bottom-2 left-2 flex items-center gap-2">
          <Badge variant={isLocal ? "secondary" : participant.role === 'speaker' ? 'default' : 'secondary'} className="text-xs">
            {isLocal ? 'You' : participant.name}
          </Badge>
          {participant.role === 'moderator' && <Crown className="h-3 w-3 text-yellow-500" />}
          {!participant.isAudioEnabled && <MicOff className="h-3 w-3 text-red-500" />}
          {!participant.isVideoEnabled && <VideoOff className="h-3 w-3 text-red-500" />}
          {participant.isHandRaised && <Hand className="h-3 w-3 text-yellow-500 animate-bounce" />}
        </div>
      </CardContent>
    </Card>
  );

  // Create local participant object
  const localParticipant: Participant = {
    id: user?.id || '',
    name: user?.full_name || user?.email?.split('@')[0] || 'You',
    role: userStageRole,
    isAudioEnabled,
    isVideoEnabled,
    isMuted: !isAudioEnabled,
    isHandRaised,
    avatarUrl: user?.avatar_url
  };

  return (
    <div className="flex-1 p-4 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full max-w-7xl mx-auto">
        {/* Local Video */}
        {renderParticipantCard(localParticipant, true)}

        {/* Remote Videos - Speakers First */}
        {speakers.map((participant) => renderParticipantCard(participant))}

        {/* Listeners (showing first few if space allows) */}
        {listeners.slice(0, Math.max(0, 8 - speakers.length)).map((participant) => (
          <Card key={participant.id} className="relative overflow-hidden opacity-75">
            <CardContent className="p-0 aspect-video bg-gradient-to-br from-slate-700 to-slate-600 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={participant.avatarUrl} />
                  <AvatarFallback className="text-xs">{participant.name[0]}</AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute bottom-2 left-2 flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-background/80">
                  {participant.name}
                </Badge>
                {participant.isHandRaised && <Hand className="h-3 w-3 text-yellow-500 animate-bounce" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ParticipantGrid;
