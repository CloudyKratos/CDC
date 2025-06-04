
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Hand,
  Monitor,
  PhoneOff,
  Settings,
  Grid3X3,
  Focus,
  Circle,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedStageControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isHandRaised: boolean;
  isScreenSharing: boolean;
  canSpeak: boolean;
  layoutMode: 'grid' | 'spotlight' | 'circle';
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleHandRaise: () => void;
  onStartScreenShare: () => void;
  onStopScreenShare: () => void;
  onLeaveCall: () => void;
  onLayoutChange: (mode: 'grid' | 'spotlight' | 'circle') => void;
}

const EnhancedStageControls: React.FC<EnhancedStageControlsProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  isHandRaised,
  isScreenSharing,
  canSpeak,
  layoutMode,
  onToggleAudio,
  onToggleVideo,
  onToggleHandRaise,
  onStartScreenShare,
  onStopScreenShare,
  onLeaveCall,
  onLayoutChange
}) => {
  const [showEffects, setShowEffects] = useState(false);

  const controlButtonClass = cn(
    "btn-glass rounded-full w-14 h-14 shadow-lg transition-all duration-300 hover:scale-110",
    "relative overflow-hidden"
  );

  const primaryButtonClass = cn(
    controlButtonClass,
    "bg-white/20 hover:bg-white/30 border-white/30"
  );

  const activeButtonClass = cn(
    controlButtonClass,
    "bg-green-500/80 hover:bg-green-500 border-green-400/50 shadow-green-500/25"
  );

  const destructiveButtonClass = cn(
    controlButtonClass,
    "bg-red-500/80 hover:bg-red-500 border-red-400/50 shadow-red-500/25"
  );

  const layoutButtons = [
    { mode: 'grid' as const, icon: Grid3X3, label: 'Grid View' },
    { mode: 'spotlight' as const, icon: Focus, label: 'Spotlight' },
    { mode: 'circle' as const, icon: Circle, label: 'Circle View' }
  ];

  const reactions = ['👍', '❤️', '😂', '🔥', '👏', '🎉'];

  return (
    <div className="control-panel-glass p-6 border-t">
      <div className="flex items-center justify-center gap-6">
        {/* Primary Controls */}
        <div className="flex items-center gap-4">
          <Button
            className={isAudioEnabled ? activeButtonClass : destructiveButtonClass}
            onClick={onToggleAudio}
            disabled={!canSpeak}
          >
            {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 transform translate-x-[-100%] hover:translate-x-[100%]" />
          </Button>

          <Button
            className={isVideoEnabled ? activeButtonClass : destructiveButtonClass}
            onClick={onToggleVideo}
            disabled={!canSpeak}
          >
            {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 transform translate-x-[-100%] hover:translate-x-[100%]" />
          </Button>

          {!canSpeak && (
            <Button
              className={isHandRaised ? activeButtonClass : primaryButtonClass}
              onClick={onToggleHandRaise}
            >
              <Hand className={cn("h-6 w-6", isHandRaised && "animate-bounce")} />
            </Button>
          )}

          {canSpeak && (
            <Button
              className={isScreenSharing ? activeButtonClass : primaryButtonClass}
              onClick={isScreenSharing ? onStopScreenShare : onStartScreenShare}
            >
              <Monitor className="h-6 w-6" />
            </Button>
          )}
        </div>

        <Separator orientation="vertical" className="h-12 bg-white/20" />

        {/* Layout Controls */}
        <div className="flex items-center gap-2">
          {layoutButtons.map(({ mode, icon: Icon, label }) => (
            <Button
              key={mode}
              className={cn(
                "btn-glass rounded-lg px-3 py-2 h-10",
                layoutMode === mode ? "bg-blue-500/80 border-blue-400/50" : "bg-white/10 border-white/20"
              )}
              onClick={() => onLayoutChange(mode)}
              title={label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-12 bg-white/20" />

        {/* Quick Reactions */}
        <div className="flex items-center gap-2">
          <Button
            className="btn-glass rounded-lg px-3 py-2 h-10"
            onClick={() => setShowEffects(!showEffects)}
          >
            <Sparkles className="h-4 w-4" />
          </Button>
          
          {showEffects && (
            <div className="flex items-center gap-1 glass-panel rounded-lg p-2">
              {reactions.map((reaction, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="text-lg p-1 h-8 w-8 hover:scale-125 transition-transform"
                  onClick={() => {
                    // Trigger reaction animation
                    console.log('Reaction:', reaction);
                  }}
                >
                  {reaction}
                </Button>
              ))}
            </div>
          )}
        </div>

        <Separator orientation="vertical" className="h-12 bg-white/20" />

        {/* Settings & Leave */}
        <div className="flex items-center gap-4">
          <Button className={primaryButtonClass}>
            <Settings className="h-6 w-6" />
          </Button>

          <Button
            className={destructiveButtonClass}
            onClick={onLeaveCall}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStageControls;
