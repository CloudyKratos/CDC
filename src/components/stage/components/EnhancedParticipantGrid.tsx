import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, MicOff, VideoOff, Hand, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Participant {
  id: string;
  name: string;
  role: 'speaker' | 'audience' | 'moderator';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isMuted: boolean;
  isHandRaised: boolean;
  isSpeaking?: boolean;
  audioLevel?: number;
  avatarUrl?: string;
}

interface User {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
}

interface EnhancedParticipantGridProps {
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
  layoutMode?: 'grid' | 'spotlight' | 'circle';
}

const EnhancedParticipantGrid: React.FC<EnhancedParticipantGridProps> = ({
  speakers,
  listeners,
  localVideoRef,
  user,
  userStageRole,
  isVideoEnabled,
  isAudioEnabled,
  isHandRaised,
  activeSpeaker,
  canModerate,
  layoutMode = 'grid'
}) => {
  const [reactions, setReactions] = useState<Array<{id: string, type: string, x: number, y: number}>>([]);

  const getGridLayout = (participantCount: number) => {
    if (layoutMode === 'circle') return 'circle-layout';
    if (layoutMode === 'spotlight') return 'spotlight-layout';
    
    if (participantCount <= 4) return 'grid-cols-1 md:grid-cols-2';
    if (participantCount <= 9) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  };

  const renderParticipantCard = (participant: Participant, isLocal = false, isSpotlight = false) => {
    const isSpeaking = participant.isSpeaking || activeSpeaker === participant.id;
    const cardSize = isSpotlight ? 'h-80 w-[32rem]' : 'h-48 w-64';
    
    return (
      <div
        key={participant.id}
        className={cn(
          'participant-card-3d floating-card glass-card',
          cardSize,
          isSpeaking && 'speaking-glow speaking',
          isSpotlight && 'participant-spotlight'
        )}
        style={{
          animationDelay: `${Math.random() * 2}s`
        }}
      >
        {/* Audio Wave Effect */}
        <div className="audio-wave" />
        
        <CardContent className="p-0 h-full relative overflow-hidden">
          {/* Background Gradient */}
          <div className={cn(
            'absolute inset-0',
            isSpeaking ? 'audio-responsive-gradient' : 'gradient-bg'
          )} />
          
          {/* Video/Avatar Content */}
          <div className="relative h-full w-full">
            {isLocal ? (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : participant.isVideoEnabled ? (
              <video
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-black/20">
                <Avatar className={cn(
                  'transition-all duration-300',
                  isSpotlight ? 'w-24 h-24' : 'w-16 h-16'
                )}>
                  <AvatarImage src={participant.avatarUrl} />
                  <AvatarFallback className="text-white bg-white/20 backdrop-blur">
                    {participant.name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>

          {/* Participant Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="glass-panel rounded-lg p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {participant.role === 'moderator' && (
                    <Crown className="h-4 w-4 text-yellow-400" />
                  )}
                  {isSpeaking && (
                    <Volume2 className="h-4 w-4 text-green-400 animate-pulse" />
                  )}
                  <Badge 
                    variant={isLocal ? "secondary" : participant.role === 'speaker' ? 'default' : 'secondary'} 
                    className="text-xs bg-white/20 text-white border-white/30"
                  >
                    {isLocal ? 'You' : participant.name}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1">
                  {!participant.isAudioEnabled && (
                    <div className="p-1 rounded-full bg-red-500/80">
                      <MicOff className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {!participant.isVideoEnabled && (
                    <div className="p-1 rounded-full bg-red-500/80">
                      <VideoOff className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {participant.isHandRaised && (
                    <div className="p-1 rounded-full bg-orange-500/80 animate-bounce">
                      <Hand className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Audio Level Indicator */}
          {participant.audioLevel && participant.audioLevel > 0.1 && (
            <div className="absolute top-2 right-2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      'w-1 bg-green-400 rounded-full transition-all duration-100',
                      participant.audioLevel! * 5 >= level ? 'h-4 opacity-100' : 'h-2 opacity-30'
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </div>
    );
  };

  // Create local participant object
  const localParticipant: Participant = {
    id: user?.id || '',
    name: user?.full_name || user?.email?.split('@')[0] || 'You',
    role: userStageRole,
    isAudioEnabled,
    isVideoEnabled,
    isMuted: !isAudioEnabled,
    isHandRaised,
    isSpeaking: activeSpeaker === user?.id,
    avatarUrl: user?.avatar_url
  };

  const allParticipants = [localParticipant, ...speakers, ...listeners.slice(0, 8)];
  const spotlightParticipant = speakers.find(p => p.id === activeSpeaker) || localParticipant;

  if (layoutMode === 'spotlight') {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-6">
        {/* Spotlight Participant */}
        <div className="flex justify-center">
          {renderParticipantCard(spotlightParticipant, spotlightParticipant.id === user?.id, true)}
        </div>
        
        {/* Other Participants */}
        <div className="flex gap-4 flex-wrap justify-center max-w-6xl">
          {allParticipants
            .filter(p => p.id !== spotlightParticipant.id)
            .slice(0, 6)
            .map(participant => renderParticipantCard(participant, participant.id === user?.id))}
        </div>
      </div>
    );
  }

  if (layoutMode === 'circle') {
    return (
      <div className="flex-1 p-6 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Center Logo or Info */}
          <div className="glass-card rounded-full w-32 h-32 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">LIVE</div>
              <div className="text-sm text-white/70">{allParticipants.length} people</div>
            </div>
          </div>
        </div>
        
        {/* Circular Layout */}
        <div className="absolute inset-0">
          {allParticipants.map((participant, index) => {
            const angle = (index * 360) / allParticipants.length;
            const radius = 250;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            
            return (
              <div
                key={participant.id}
                className="absolute"
                style={{
                  left: `calc(50% + ${x}px - 8rem)`,
                  top: `calc(50% + ${y}px - 6rem)`,
                  transform: 'translate(0, 0)'
                }}
              >
                {renderParticipantCard(participant, participant.id === user?.id)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-hidden">
      <div className={cn(
        'participant-grid-advanced h-full',
        getGridLayout(allParticipants.length)
      )}>
        {allParticipants.map(participant => 
          renderParticipantCard(participant, participant.id === user?.id)
        )}
      </div>
    </div>
  );
};

export default EnhancedParticipantGrid;
