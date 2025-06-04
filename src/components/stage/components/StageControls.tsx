
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Hand,
  Monitor,
  PhoneOff
} from 'lucide-react';

interface StageControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isHandRaised: boolean;
  isScreenSharing: boolean;
  canSpeak: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleHandRaise: () => void;
  onStartScreenShare: () => void;
  onStopScreenShare: () => void;
  onLeaveCall: () => void;
}

const StageControls: React.FC<StageControlsProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  isHandRaised,
  isScreenSharing,
  canSpeak,
  onToggleAudio,
  onToggleVideo,
  onToggleHandRaise,
  onStartScreenShare,
  onStopScreenShare,
  onLeaveCall
}) => {
  return (
    <div className="flex items-center justify-center gap-4 p-6 border-t bg-card/50 backdrop-blur-sm">
      <Button
        variant={isAudioEnabled ? "default" : "destructive"}
        size="lg"
        onClick={onToggleAudio}
        disabled={!canSpeak}
        className="rounded-full w-14 h-14 shadow-lg transition-all duration-200 hover:scale-105"
      >
        {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
      </Button>

      <Button
        variant={isVideoEnabled ? "default" : "destructive"}
        size="lg"
        onClick={onToggleVideo}
        disabled={!canSpeak}
        className="rounded-full w-14 h-14 shadow-lg transition-all duration-200 hover:scale-105"
      >
        {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
      </Button>

      {!canSpeak && (
        <Button
          variant={isHandRaised ? "default" : "outline"}
          size="lg"
          onClick={onToggleHandRaise}
          className="rounded-full w-14 h-14 shadow-lg transition-all duration-200 hover:scale-105"
        >
          <Hand className={`h-6 w-6 ${isHandRaised ? 'animate-bounce' : ''}`} />
        </Button>
      )}

      {canSpeak && (
        <Button
          variant={isScreenSharing ? "default" : "outline"}
          size="lg"
          onClick={isScreenSharing ? onStopScreenShare : onStartScreenShare}
          className="rounded-full w-14 h-14 shadow-lg transition-all duration-200 hover:scale-105"
        >
          <Monitor className="h-6 w-6" />
        </Button>
      )}

      <Separator orientation="vertical" className="h-8" />

      <Button
        variant="destructive"
        size="lg"
        onClick={onLeaveCall}
        className="rounded-full w-14 h-14 shadow-lg transition-all duration-200 hover:scale-105"
      >
        <PhoneOff className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default StageControls;
