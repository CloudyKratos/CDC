
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Hand, 
  MessageSquare,
  Phone
} from 'lucide-react';

interface SimpleStageControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isHandRaised: boolean;
  userRole: 'speaker' | 'audience' | 'moderator';
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onRaiseHand: () => void;
  onToggleChat: () => void;
  onLeave: () => void;
}

export const SimpleStageControls: React.FC<SimpleStageControlsProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  isHandRaised,
  userRole,
  onToggleAudio,
  onToggleVideo,
  onRaiseHand,
  onToggleChat,
  onLeave
}) => {
  const canSpeak = userRole === 'speaker' || userRole === 'moderator';

  return (
    <div className="p-4 bg-black/30 backdrop-blur-sm border-t border-white/20">
      <div className="flex items-center justify-center gap-4">
        {/* Audio Control */}
        <Button
          variant={isAudioEnabled ? "default" : "destructive"}
          size="lg"
          onClick={onToggleAudio}
          disabled={!canSpeak}
          className="w-12 h-12 rounded-full"
          title={canSpeak ? (isAudioEnabled ? 'Mute' : 'Unmute') : 'Request speaker access'}
        >
          {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
        
        {/* Video Control */}
        <Button
          variant={isVideoEnabled ? "default" : "secondary"}
          size="lg"
          onClick={onToggleVideo}
          disabled={!canSpeak}
          className="w-12 h-12 rounded-full"
          title={canSpeak ? (isVideoEnabled ? 'Turn off camera' : 'Turn on camera') : 'Request speaker access'}
        >
          {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>
        
        {/* Raise Hand (for audience) */}
        {userRole === 'audience' && (
          <Button
            variant={isHandRaised ? "default" : "secondary"}
            size="lg"
            onClick={onRaiseHand}
            className="w-12 h-12 rounded-full"
            title={isHandRaised ? 'Lower hand' : 'Raise hand'}
          >
            <Hand className="h-5 w-5" />
          </Button>
        )}
        
        {/* Chat Toggle */}
        <Button
          variant="secondary"
          size="lg"
          onClick={onToggleChat}
          className="w-12 h-12 rounded-full"
          title="Toggle chat"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
        
        {/* Leave */}
        <Button
          variant="destructive"
          size="lg"
          onClick={onLeave}
          className="w-12 h-12 rounded-full"
          title="Leave stage"
        >
          <Phone className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default SimpleStageControls;
