
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, Hand, UserX, 
  Monitor, MonitorOff, Settings, Users, MessageCircle,
  MoreVertical, Volume2, VolumeX
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface EnhancedStageControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  userRole: 'speaker' | 'audience' | 'moderator';
  onToggleAudio: () => Promise<void>;
  onToggleVideo: () => Promise<void>;
  onLeave: () => void;
  onEndStage?: () => void;
  onRaiseHand?: () => void;
  onStartScreenShare?: () => void;
  isHandRaised?: boolean;
  isScreenSharing?: boolean;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  audioDevices?: MediaDeviceInfo[];
  videoDevices?: MediaDeviceInfo[];
  onAudioDeviceChange?: (deviceId: string) => void;
  onVideoDeviceChange?: (deviceId: string) => void;
  networkStats?: {
    ping: number;
    bandwidth: number;
    participantCount: number;
  };
}

export const EnhancedStageControls: React.FC<EnhancedStageControlsProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  userRole,
  onToggleAudio,
  onToggleVideo,
  onLeave,
  onEndStage,
  onRaiseHand,
  onStartScreenShare,
  isHandRaised = false,
  isScreenSharing = false,
  connectionQuality = 'good',
  audioDevices = [],
  videoDevices = [],
  onAudioDeviceChange,
  onVideoDeviceChange,
  networkStats
}) => {
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const canSpeak = userRole === 'speaker' || userRole === 'moderator';
  const canModerate = userRole === 'moderator';

  const getQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'fair': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const handleToggleAudio = async () => {
    await onToggleAudio();
  };

  const handleToggleVideo = async () => {
    await onToggleVideo();
  };

  return (
    <div className="relative">
      {/* Network Stats Overlay */}
      {networkStats && (
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 text-xs text-white/80 border border-white/10">
          <div className="flex items-center gap-4">
            <span className={getQualityColor()}>
              ● {connectionQuality.toUpperCase()}
            </span>
            <span>{networkStats.ping}ms</span>
            <span>{Math.round(networkStats.bandwidth)}kbps</span>
            <span>{networkStats.participantCount} participants</span>
          </div>
        </div>
      )}

      <div className="p-6 bg-black/40 backdrop-blur-md border-t border-white/10">
        <div className="flex items-center justify-center gap-3">
          {/* Audio Control */}
          <div className="relative">
            <Button
              onClick={handleToggleAudio}
              disabled={!canSpeak}
              size="lg"
              className={cn(
                "rounded-full w-14 h-14 p-0 transition-all duration-200",
                isAudioEnabled 
                  ? "bg-gray-700/80 hover:bg-gray-600 text-white" 
                  : "bg-red-600/90 hover:bg-red-700 text-white",
                !canSpeak && "opacity-50 cursor-not-allowed"
              )}
            >
              {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </Button>
            
            {/* Audio device selector */}
            {canSpeak && audioDevices.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    className="absolute -top-1 -right-1 w-6 h-6 p-0 bg-blue-600 hover:bg-blue-700 rounded-full"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56">
                  {audioDevices.map((device) => (
                    <DropdownMenuItem 
                      key={device.deviceId}
                      onClick={() => onAudioDeviceChange?.(device.deviceId)}
                    >
                      <Mic className="mr-2 h-4 w-4" />
                      {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Video Control */}
          <div className="relative">
            <Button
              onClick={handleToggleVideo}
              size="lg"
              className={cn(
                "rounded-full w-14 h-14 p-0 transition-all duration-200",
                isVideoEnabled 
                  ? "bg-gray-700/80 hover:bg-gray-600 text-white" 
                  : "bg-red-600/90 hover:bg-red-700 text-white"
              )}
            >
              {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </Button>

            {/* Video device selector */}
            {videoDevices.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    className="absolute -top-1 -right-1 w-6 h-6 p-0 bg-blue-600 hover:bg-blue-700 rounded-full"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56">
                  {videoDevices.map((device) => (
                    <DropdownMenuItem 
                      key={device.deviceId}
                      onClick={() => onVideoDeviceChange?.(device.deviceId)}
                    >
                      <Video className="mr-2 h-4 w-4" />
                      {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Screen Share (for speakers) */}
          {canSpeak && onStartScreenShare && (
            <Button
              onClick={onStartScreenShare}
              size="lg"
              className={cn(
                "rounded-full w-14 h-14 p-0 transition-all duration-200",
                isScreenSharing 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "bg-gray-700/80 hover:bg-gray-600 text-white"
              )}
            >
              {isScreenSharing ? <MonitorOff className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
            </Button>
          )}

          {/* Raise Hand (for audience) */}
          {!canSpeak && onRaiseHand && (
            <Button
              onClick={onRaiseHand}
              size="lg"
              className={cn(
                "rounded-full w-14 h-14 p-0 transition-all duration-200",
                isHandRaised 
                  ? "bg-yellow-600 hover:bg-yellow-700 text-white animate-pulse" 
                  : "bg-gray-700/80 hover:bg-gray-600 text-white"
              )}
            >
              <Hand className="h-6 w-6" />
            </Button>
          )}

          {/* Speaker Volume Control */}
          <Button
            onClick={() => setIsMuted(!isMuted)}
            size="lg"
            className={cn(
              "rounded-full w-14 h-14 p-0 transition-all duration-200",
              isMuted 
                ? "bg-red-600/90 hover:bg-red-700 text-white" 
                : "bg-gray-700/80 hover:bg-gray-600 text-white"
            )}
          >
            {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
          </Button>

          {/* More Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="lg"
                className="rounded-full w-14 h-14 p-0 bg-gray-700/80 hover:bg-gray-600 text-white"
              >
                <MoreVertical className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Users className="mr-2 h-4 w-4" />
                Participants
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {canModerate && onEndStage && (
                <DropdownMenuItem onClick={onEndStage} className="text-red-400">
                  <UserX className="mr-2 h-4 w-4" />
                  End Stage
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Leave Button */}
          <Button
            onClick={onLeave}
            size="lg"
            className="rounded-full w-14 h-14 p-0 bg-red-600 hover:bg-red-700 text-white ml-6"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>

        {/* Connection Quality Indicator */}
        <div className="flex items-center justify-center mt-4">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <div className={cn("w-2 h-2 rounded-full", 
              connectionQuality === 'excellent' && "bg-green-400",
              connectionQuality === 'good' && "bg-blue-400",
              connectionQuality === 'fair' && "bg-yellow-400",
              connectionQuality === 'poor' && "bg-red-400"
            )} />
            <span className="capitalize">{connectionQuality} connection</span>
          </div>
        </div>
      </div>
    </div>
  );
};
