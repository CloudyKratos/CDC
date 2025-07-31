
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Mic, MicOff, Video, VideoOff, Crown, Hand } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  role: 'host' | 'speaker' | 'audience';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isHandRaised?: boolean;
  avatar?: string;
}

interface StageSidebarProps {
  stageId: string;
  participants: Participant[];
  onClose: () => void;
}

const StageSidebar: React.FC<StageSidebarProps> = ({
  stageId,
  participants,
  onClose
}) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'host':
        return <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Host</Badge>;
      case 'speaker':
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Speaker</Badge>;
      default:
        return <Badge variant="outline">Audience</Badge>;
    }
  };

  const ParticipantItem = ({ participant }: { participant: Participant }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
      <Avatar className="w-10 h-10">
        <AvatarImage src={participant.avatar} alt={participant.name} />
        <AvatarFallback className="bg-gray-700 text-white">
          {participant.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-white truncate">{participant.name}</p>
          {participant.role === 'host' && <Crown className="w-4 h-4 text-yellow-400" />}
        </div>
        {getRoleBadge(participant.role)}
      </div>
      
      <div className="flex items-center gap-1">
        {participant.isHandRaised && (
          <Hand className="w-4 h-4 text-yellow-400 animate-bounce" />
        )}
        
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
          participant.isAudioEnabled 
            ? 'bg-green-500/20' 
            : 'bg-red-500/20'
        }`}>
          {participant.isAudioEnabled ? (
            <Mic className="w-3 h-3 text-green-400" />
          ) : (
            <MicOff className="w-3 h-3 text-red-400" />
          )}
        </div>
        
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
          participant.isVideoEnabled 
            ? 'bg-green-500/20' 
            : 'bg-red-500/20'
        }`}>
          {participant.isVideoEnabled ? (
            <Video className="w-3 h-3 text-green-400" />
          ) : (
            <VideoOff className="w-3 h-3 text-red-400" />
          )}
        </div>
      </div>
    </div>
  );

  // Mock participants if none provided
  const mockParticipants: Participant[] = participants.length > 0 ? participants : [
    {
      id: '1',
      name: 'You',
      role: 'host',
      isAudioEnabled: true,
      isVideoEnabled: true
    },
    {
      id: '2', 
      name: 'John Speaker',
      role: 'speaker',
      isAudioEnabled: true,
      isVideoEnabled: false
    },
    {
      id: '3',
      name: 'Jane Listener',
      role: 'audience',
      isAudioEnabled: false,
      isVideoEnabled: false,
      isHandRaised: true
    }
  ];

  const hosts = mockParticipants.filter(p => p.role === 'host');
  const speakers = mockParticipants.filter(p => p.role === 'speaker');
  const audience = mockParticipants.filter(p => p.role === 'audience');

  return (
    <div className="w-80 bg-gray-900/95 backdrop-blur-sm border-l border-white/10 flex flex-col">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Participants</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        
        {/* Hosts */}
        {hosts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Hosts ({hosts.length})
            </h4>
            <div className="space-y-2">
              {hosts.map(participant => (
                <ParticipantItem key={participant.id} participant={participant} />
              ))}
            </div>
          </div>
        )}

        {/* Speakers */}
        {speakers.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Speakers ({speakers.length})
            </h4>
            <div className="space-y-2">
              {speakers.map(participant => (
                <ParticipantItem key={participant.id} participant={participant} />
              ))}
            </div>
          </div>
        )}

        {/* Audience */}
        {audience.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white/80 mb-3">
              Audience ({audience.length})
            </h4>
            <div className="space-y-2">
              {audience.map(participant => (
                <ParticipantItem key={participant.id} participant={participant} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StageSidebar;
