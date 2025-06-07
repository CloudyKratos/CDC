
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Hand,
  Settings,
  Monitor,
  MonitorOff,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NetworkStats {
  ping: number;
  bandwidth: number;
  participantCount: number;
}

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
  isScreenSharing?: boolean;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  audioDevices?: MediaDeviceInfo[];
  videoDevices?: MediaDeviceInfo[];
  onAudioDeviceChange?: (deviceId: string) => void;
  onVideoDeviceChange?: (deviceId: string) => void;
  networkStats?: NetworkStats;
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
  isScreenSharing = false,
  connectionQuality = 'good',
  audioDevices = [],
  videoDevices = [],
  onAudioDeviceChange,
  onVideoDeviceChange,
  networkStats
}) => {
  const [isHandRaised, setIsHandRaised] = useState(false);

  const handleRaiseHand = () => {
    setIsHandRaised(!isHandRaised);
    onRaiseHand?.();
  };

  const getQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent':
        return 'text-green-400';
      case 'good':
        return 'text-blue-400';
      case 'fair':
        return 'text-yellow-400';
      case 'poor':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const canSpeak = userRole === 'speaker' || userRole === 'moderator';

  return (
    <div className="bg-black/40 backdrop-blur-lg border-t border-white/10 p-4">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Left: Connection Quality */}
        <div className="flex items-center gap-2">
          <div className={cn("flex items-center gap-1", getQualityColor())}>
            <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span className="text-xs font-medium capitalize">{connectionQuality}</span>
          </div>
          {networkStats && (
            <div className="text-xs text-white/60">
              {networkStats.ping}ms • {networkStats.participantCount} users
            </div>
          )}
        </div>

        {/* Center: Main Controls */}
        <div className="flex items-center gap-3">
          {/* Audio Control */}
          <div className="flex items-center">
            <Button
              onClick={onToggleAudio}
              disabled={!canSpeak}
              size="lg"
              variant={isAudioEnabled ? "default" : "destructive"}
              className={cn(
                "w-12 h-12 rounded-full",
                !canSpeak && "opacity-50 cursor-not-allowed"
              )}
            >
              {isAudioEnabled ? (
                <Mic className="w-5 h-5" />
              ) : (
                <MicOff className="w-5 h-5" />
              )}
            </Button>
            
            {audioDevices.length > 0 && onAudioDeviceChange && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="ml-1 p-1 h-6 w-6">
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {audioDevices.map((device) => (
                    <DropdownMenuItem
                      key={device.deviceId}
                      onClick={() => onAudioDeviceChange(device.deviceId)}
                    >
                      {device.label || `Audio Device ${device.deviceId.slice(0, 8)}`}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Video Control */}
          <div className="flex items-center">
            <Button
              onClick={onToggleVideo}
              size="lg"
              variant={isVideoEnabled ? "default" : "destructive"}
              className="w-12 h-12 rounded-full"
            >
              {isVideoEnabled ? (
                <Video className="w-5 h-5" />
              ) : (
                <VideoOff className="w-5 h-5" />
              )}
            </Button>
            
            {videoDevices.length > 0 && onVideoDeviceChange && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="ml-1 p-1 h-6 w-6">
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {videoDevices.map((device) => (
                    <DropdownMenuItem
                      key={device.deviceId}
                      onClick={() => onVideoDeviceChange(device.deviceId)}
                    >
                      {device.label || `Video Device ${device.deviceId.slice(0, 8)}`}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Screen Share (for speakers/moderators) */}
          {canSpeak && onStartScreenShare && (
            <Button
              onClick={onStartScreenShare}
              size="lg"
              variant={isScreenSharing ? "default" : "outline"}
              className="w-12 h-12 rounded-full"
            >
              {isScreenSharing ? (
                <MonitorOff className="w-5 h-5" />
              ) : (
                <Monitor className="w-5 h-5" />
              )}
            </Button>
          )}

          {/* Hand Raise (for audience) */}
          {userRole === 'audience' && onRaiseHand && (
            <Button
              onClick={handleRaiseHand}
              size="lg"
              variant={isHandRaised ? "default" : "outline"}
              className={cn(
                "w-12 h-12 rounded-full",
                isHandRaised && "bg-yellow-600 hover:bg-yellow-700"
              )}
            >
              <Hand className={cn("w-5 h-5", isHandRaised && "animate-bounce")} />
            </Button>
          )}

          {/* Settings */}
          <Button
            size="lg"
            variant="outline"
            className="w-12 h-12 rounded-full"
          >
            <Settings className="w-5 h-5" />
          </Button>

          {/* Leave/End Stage */}
          <div className="flex gap-2 ml-4">
            {userRole === 'moderator' && onEndStage && (
              <Button
                onClick={onEndStage}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                End Stage
              </Button>
            )}
            
            <Button
              onClick={onLeave}
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500/10"
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              Leave
            </Button>
          </div>
        </div>

        {/* Right: Role Badge */}
        <div className="flex items-center">
          <Badge
            variant="outline"
            className={cn(
              "capitalize",
              userRole === 'moderator' && "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
              userRole === 'speaker' && "bg-blue-500/20 text-blue-300 border-blue-500/30",
              userRole === 'audience' && "bg-gray-500/20 text-gray-300 border-gray-500/30"
            )}
          >
            {userRole}
          </Badge>
        </div>
      </div>
    </div>
  );
};
