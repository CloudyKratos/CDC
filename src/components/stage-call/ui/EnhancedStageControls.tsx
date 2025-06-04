
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Hand, 
  UserX, 
  Settings, 
  Monitor,
  Camera,
  Volume2,
  Wifi
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface EnhancedStageControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  userRole: 'speaker' | 'audience';
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onLeave: () => void;
  onEndStage?: () => void;
  onRaiseHand?: () => void;
  onStartScreenShare?: () => void;
  onSwitchCamera?: () => void;
  isHandRaised?: boolean;
  isScreenSharing?: boolean;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  audioDevices?: MediaDeviceInfo[];
  videoDevices?: MediaDeviceInfo[];
  onAudioDeviceChange?: (deviceId: string) => void;
  onVideoDeviceChange?: (deviceId: string) => void;
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
  onSwitchCamera,
  isHandRaised = false,
  isScreenSharing = false,
  connectionQuality = 'good',
  audioDevices = [],
  videoDevices = [],
  onAudioDeviceChange,
  onVideoDeviceChange
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const canSpeak = userRole === 'speaker';

  const getConnectionColor = () => {
    switch (connectionQuality) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-green-400';
      case 'fair': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="p-4 bg-black/20 backdrop-blur-sm border-t border-white/10">
      <div className="flex items-center justify-between">
        {/* Connection Quality Indicator */}
        <div className="flex items-center gap-2">
          <Wifi className={cn("h-4 w-4", getConnectionColor())} />
          <span className={cn("text-xs", getConnectionColor())}>
            {connectionQuality}
          </span>
        </div>

        {/* Main Controls */}
        <div className="flex items-center gap-4">
          {/* Audio Control with Device Selector */}
          <DropdownMenu>
            <div className="flex items-center gap-1">
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
              
              {audioDevices.length > 1 && (
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-white hover:bg-white/20"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
              )}
            </div>
            
            <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
              {audioDevices.map((device) => (
                <DropdownMenuItem
                  key={device.deviceId}
                  onClick={() => onAudioDeviceChange?.(device.deviceId)}
                  className="hover:bg-gray-700"
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  {device.label || 'Unknown Device'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Video Control with Device Selector */}
          <DropdownMenu>
            <div className="flex items-center gap-1">
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
              
              {videoDevices.length > 1 && (
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-white hover:bg-white/20"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
              )}
            </div>
            
            <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
              {videoDevices.map((device) => (
                <DropdownMenuItem
                  key={device.deviceId}
                  onClick={() => onVideoDeviceChange?.(device.deviceId)}
                  className="hover:bg-gray-700"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {device.label || 'Unknown Device'}
                </DropdownMenuItem>
              ))}
              {onSwitchCamera && (
                <>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem
                    onClick={onSwitchCamera}
                    className="hover:bg-gray-700"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Switch Camera
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Screen Share */}
          {canSpeak && onStartScreenShare && (
            <Button
              onClick={onStartScreenShare}
              size="lg"
              className={cn(
                "rounded-full w-12 h-12 p-0",
                isScreenSharing
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-white"
              )}
            >
              <Monitor className="h-6 w-6" />
            </Button>
          )}

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

          {/* Settings Dialog */}
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="rounded-full w-12 h-12 p-0 bg-gray-700 hover:bg-gray-600 text-white"
              >
                <Settings className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Stage Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Audio Devices</h4>
                  {audioDevices.map((device) => (
                    <div key={device.deviceId} className="flex items-center justify-between p-2 rounded hover:bg-gray-700">
                      <span className="text-sm">{device.label || 'Unknown Device'}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAudioDeviceChange?.(device.deviceId)}
                      >
                        Select
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Video Devices</h4>
                  {videoDevices.map((device) => (
                    <div key={device.deviceId} className="flex items-center justify-between p-2 rounded hover:bg-gray-700">
                      <span className="text-sm">{device.label || 'Unknown Device'}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onVideoDeviceChange?.(device.deviceId)}
                      >
                        Select
                      </Button>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Connection Quality</h4>
                  <div className="flex items-center gap-2">
                    <Wifi className={cn("h-4 w-4", getConnectionColor())} />
                    <span className="text-sm capitalize">{connectionQuality}</span>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

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

        {/* Role Indicator */}
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs px-2 py-1 rounded-full",
            userRole === 'speaker' 
              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" 
              : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
          )}>
            {userRole === 'speaker' ? 'Speaker' : 'Audience'}
          </span>
        </div>
      </div>
    </div>
  );
};
