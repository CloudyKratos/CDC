
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Mic, MicOff, Video, VideoOff, Hand, PhoneOff } from 'lucide-react';

interface StageControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  userRole: 'speaker' | 'audience';
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onLeave: () => void;
  isHandRaised?: boolean;
  onToggleHandRaise?: () => void;
}

export const StageControls: React.FC<StageControlsProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  userRole,
  onToggleAudio,
  onToggleVideo,
  onLeave,
  isHandRaised = false,
  onToggleHandRaise
}) => {
  const canSpeak = userRole === 'speaker';

  return (
    <div className="p-6 bg-black/20 backdrop-blur-sm border-t border-white/10">
      <div className="flex items-center justify-center gap-4">
        {/* Audio Control */}
        <Button
          variant={isAudioEnabled ? "default" : "destructive"}
          size="lg"
          onClick={onToggleAudio}
          disabled={!canSpeak}
          className="rounded-full w-16 h-16 shadow-lg transition-all duration-200 hover:scale-105"
        >
          {isAudioEnabled ? (
            <Mic className="h-6 w-6" />
          ) : (
            <MicOff className="h-6 w-6" />
          )}
        </Button>

        {/* Video Control */}
        <Button
          variant={isVideoEnabled ? "default" : "destructive"}
          size="lg"
          onClick={onToggleVideo}
          disabled={!canSpeak}
          className="rounded-full w-16 h-16 shadow-lg transition-all duration-200 hover:scale-105"
        >
          {isVideoEnabled ? (
            <Video className="h-6 w-6" />
          ) : (
            <VideoOff className="h-6 w-6" />
          )}
        </Button>

        {/* Raise Hand (for audience) */}
        {!canSpeak && onToggleHandRaise && (
          <Button
            variant={isHandRaised ? "default" : "outline"}
            size="lg"
            onClick={onToggleHandRaise}
            className="rounded-full w-16 h-16 shadow-lg transition-all duration-200 hover:scale-105 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Hand className={`h-6 w-6 ${isHandRaised ? 'animate-bounce' : ''}`} />
          </Button>
        )}

        <Separator orientation="vertical" className="h-12 bg-white/20" />

        {/* Leave Call */}
        <Button
          variant="destructive"
          size="lg"
          onClick={onLeave}
          className="rounded-full w-16 h-16 shadow-lg transition-all duration-200 hover:scale-105"
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>

      {/* Control Labels */}
      <div className="flex items-center justify-center gap-4 mt-3">
        <span className="text-white/60 text-xs">
          {canSpeak ? (isAudioEnabled ? 'Unmuted' : 'Muted') : 'Request to speak'}
        </span>
        <span className="text-white/60 text-xs">
          {canSpeak ? (isVideoEnabled ? 'Camera On' : 'Camera Off') : ''}
        </span>
        {!canSpeak && (
          <span className="text-white/60 text-xs">
            {isHandRaised ? 'Hand Raised' : 'Raise Hand'}
          </span>
        )}
      </div>
    </div>
  );
};
