import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Hand, 
  MessageSquare,
  PhoneOff,
  Settings,
  Monitor,
  MoreHorizontal,
  Volume2,
  Camera,
  Headphones
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfessionalStageControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isHandRaised: boolean;
  isScreenSharing: boolean;
  userRole: 'speaker' | 'audience' | 'moderator';
  participantCount: number;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onRaiseHand: () => void;
  onToggleChat: () => void;
  onScreenShare: () => void;
  onLeave: () => void;
  onSettings?: () => void;
}

export const ProfessionalStageControls: React.FC<ProfessionalStageControlsProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  isHandRaised,
  isScreenSharing,
  userRole,
  participantCount,
  onToggleAudio,
  onToggleVideo,
  onRaiseHand,
  onToggleChat,
  onScreenShare,
  onLeave,
  onSettings
}) => {
  const [showMoreControls, setShowMoreControls] = useState(false);
  const canSpeak = userRole === 'speaker' || userRole === 'moderator';

  const ControlButton = ({ 
    children, 
    onClick, 
    variant = 'default',
    disabled = false,
    tooltip,
    className,
    isActive = false
  }: {
    children: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'secondary' | 'ghost';
    disabled?: boolean;
    tooltip: string;
    className?: string;
    isActive?: boolean;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size="lg"
            onClick={onClick}
            disabled={disabled}
            className={cn(
              "h-14 w-14 rounded-full transition-all duration-200 hover:scale-110 active:scale-95",
              isActive && "ring-2 ring-blue-400 ring-offset-2 ring-offset-black",
              className
            )}
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-black/90 text-white border-gray-700">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="relative">
      {/* Main Controls Bar */}
      <div className="flex items-center justify-center gap-4 p-6 bg-black/50 backdrop-blur-xl border-t border-white/10">
        {/* Audio Control */}
        <ControlButton
          onClick={onToggleAudio}
          variant={isAudioEnabled ? "default" : "destructive"}
          disabled={!canSpeak}
          tooltip={
            !canSpeak 
              ? "Request speaker access to unmute" 
              : isAudioEnabled 
                ? "Mute microphone (M)" 
                : "Unmute microphone (M)"
          }
          className={cn(
            !canSpeak && "opacity-60",
            isAudioEnabled ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-500"
          )}
        >
          <div className="relative">
            {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            {!canSpeak && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border border-black" />
            )}
          </div>
        </ControlButton>
        
        {/* Video Control */}
        <ControlButton
          onClick={onToggleVideo}
          variant={isVideoEnabled ? "default" : "secondary"}
          disabled={!canSpeak}
          tooltip={
            !canSpeak
              ? "Request speaker access to turn on camera"
              : isVideoEnabled 
                ? "Turn off camera (V)" 
                : "Turn on camera (V)"
          }
          className={cn(
            !canSpeak && "opacity-60",
            isVideoEnabled ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-600 hover:bg-gray-500"
          )}
        >
          <div className="relative">
            {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            {!canSpeak && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border border-black" />
            )}
          </div>
        </ControlButton>

        {/* Screen Share */}
        <ControlButton
          onClick={onScreenShare}
          variant={isScreenSharing ? "default" : "secondary"}
          disabled={!canSpeak}
          tooltip={isScreenSharing ? "Stop sharing screen" : "Share your screen"}
          isActive={isScreenSharing}
          className={cn(
            !canSpeak && "opacity-60",
            isScreenSharing ? "bg-blue-600 hover:bg-blue-500" : "bg-gray-700 hover:bg-gray-600"
          )}
        >
          <Monitor className="h-6 w-6" />
        </ControlButton>
        
        {/* Raise Hand (for audience) or More Controls (for speakers) */}
        {userRole === 'audience' ? (
          <ControlButton
            onClick={onRaiseHand}
            variant={isHandRaised ? "default" : "secondary"}
            tooltip={isHandRaised ? "Lower hand" : "Raise hand"}
            isActive={isHandRaised}
            className={cn(
              isHandRaised ? "bg-yellow-600 hover:bg-yellow-500 animate-pulse" : "bg-gray-700 hover:bg-gray-600"
            )}
          >
            <Hand className="h-6 w-6" />
          </ControlButton>
        ) : (
          <ControlButton
            onClick={() => setShowMoreControls(!showMoreControls)}
            variant="ghost"
            tooltip="More controls"
            className="bg-gray-700 hover:bg-gray-600"
          >
            <MoreHorizontal className="h-6 w-6" />
          </ControlButton>
        )}
        
        {/* Chat Toggle */}
        <ControlButton
          onClick={onToggleChat}
          variant="ghost"
          tooltip="Toggle chat panel"
          className="bg-gray-700 hover:bg-gray-600"
        >
          <MessageSquare className="h-6 w-6" />
        </ControlButton>
        
        {/* Leave Call */}
        <ControlButton
          onClick={onLeave}
          variant="destructive"
          tooltip="Leave call"
          className="bg-red-600 hover:bg-red-500"
        >
          <PhoneOff className="h-6 w-6" />
        </ControlButton>
      </div>

      {/* Extended Controls (for speakers/moderators) */}
      {showMoreControls && canSpeak && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 flex items-center gap-3 p-4 bg-black/80 backdrop-blur-xl rounded-xl border border-white/10">
          <ControlButton
            onClick={onRaiseHand}
            variant={isHandRaised ? "default" : "ghost"}
            tooltip={isHandRaised ? "Lower hand" : "Raise hand"}
            isActive={isHandRaised}
            className={cn(
              "h-12 w-12",
              isHandRaised ? "bg-yellow-600 hover:bg-yellow-500" : "bg-gray-700 hover:bg-gray-600"
            )}
          >
            <Hand className="h-5 w-5" />
          </ControlButton>

          <ControlButton
            onClick={onSettings || (() => {})}
            variant="ghost"
            tooltip="Audio/Video settings"
            className="h-12 w-12 bg-gray-700 hover:bg-gray-600"
          >
            <Settings className="h-5 w-5" />
          </ControlButton>

          <ControlButton
            onClick={() => {}} // Add device switching logic
            variant="ghost"
            tooltip="Switch camera"
            className="h-12 w-12 bg-gray-700 hover:bg-gray-600"
          >
            <Camera className="h-5 w-5" />
          </ControlButton>

          <ControlButton
            onClick={() => {}} // Add audio device switching logic
            variant="ghost"
            tooltip="Audio devices"
            className="h-12 w-12 bg-gray-700 hover:bg-gray-600"
          >
            <Headphones className="h-5 w-5" />
          </ControlButton>
        </div>
      )}

      {/* Status Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/30 border-t border-white/5">
        <div className="flex items-center gap-4 text-sm text-white/70">
          <Badge variant="secondary" className="bg-white/10 text-white/80">
            {participantCount} participant{participantCount !== 1 ? 's' : ''}
          </Badge>
          
          {userRole === 'moderator' && (
            <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-600/30">
              Moderator
            </Badge>
          )}
          
          {isScreenSharing && (
            <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600/30">
              Sharing Screen
            </Badge>
          )}
          
          {isHandRaised && (
            <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30 animate-pulse">
              Hand Raised
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-white/50">
          <span>Press M to mute • V for video • Space for push-to-talk</span>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalStageControls;