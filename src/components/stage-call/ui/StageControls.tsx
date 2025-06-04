
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Hand, UserX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StageControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  userRole: 'speaker' | 'audience';
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onLeave: () => void;
  onEndStage?: () => void;
  onRaiseHand?: () => void;
  isHandRaised?: boolean;
}

export const StageControls: React.FC<StageControlsProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  userRole,
  onToggleAudio,
  onToggleVideo,
  onLeave,
  onEndStage,
  onRaiseHand,
  isHandRaised = false
}) => {
  const canSpeak = userRole === 'speaker';

  return (
    <div className="p-4 bg-black/20 backdrop-blur-sm border-t border-white/10">
      <div className="flex items-center justify-center gap-4">
        {/* Audio Control */}
        <Button
          onClick={onToggleAudio}
          disabled={!canSpeak}
          size="lg"
          className={cn(
            "rounded-full w-12 h-12 p-0",
            isAudioEnabled 
              ? "bg-gray-700 hover:bg-gray-600 text-white" 
              : "bg-red-600 hover:bg-red-700 text-white",
            !canSpeak && "opacity-50 cursor-not-allowed"
          )}
        >
          {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </Button>

        {/* Video Control */}
        <Button
          onClick={onToggleVideo}
          size="lg"
          className={cn(
            "rounded-full w-12 h-12 p-0",
            isVideoEnabled 
              ? "bg-gray-700 hover:bg-gray-600 text-white" 
              : "bg-red-600 hover:bg-red-700 text-white"
          )}
        >
          {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
        </Button>

        {/* Raise Hand (for audience) */}
        {!canSpeak && onRaiseHand && (
          <Button
            onClick={onRaiseHand}
            size="lg"
            className={cn(
              "rounded-full w-12 h-12 p-0",
              isHandRaised 
                ? "bg-yellow-600 hover:bg-yellow-700 text-white" 
                : "bg-gray-700 hover:bg-gray-600 text-white"
            )}
          >
            <Hand className="h-6 w-6" />
          </Button>
        )}

        {/* End Stage (for moderators) */}
        {onEndStage && (
          <Button
            onClick={onEndStage}
            size="lg"
            className="rounded-full w-12 h-12 p-0 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <UserX className="h-6 w-6" />
          </Button>
        )}

        {/* Leave */}
        <Button
          onClick={onLeave}
          size="lg"
          className="rounded-full w-12 h-12 p-0 bg-red-600 hover:bg-red-700 text-white"
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};
