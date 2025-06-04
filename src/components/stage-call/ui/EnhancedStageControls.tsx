
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
  onSwitchCamera,
  isHandRaised = false,
  isScreenSharing = false,
  connectionQuality = 'good',
  audioDevices = [],
  videoDevices = [],
  onAudioDeviceChange,
  onVideoDeviceChange,
  networkStats
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Wifi className={cn("h-4 w-4", getConnectionColor())} />
            <span className={cn("text-xs", getConnectionColor())}>
              {connectionQuality}
            </span>
          </div>
          
          {networkStats && (
            <div className="text-xs text-white/70 space-y-1">
              <div>Ping: {networkStats.ping.toFixed(0)}ms</div>
              <div>Bandwidth: {(networkStats.bandwidth / 1000).toFixed(1)}Mbps</div>
              <div>Participants: {networkStats.participantCount}</div>
            </div>
          )}
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
                  "rounded-full w-12 h-12 p-0 transition-all duration-200",
                  isAudioEnabled 
                    ? "bg-gray-700 hover:bg-gray-600 text-white shadow-lg" 
                    : "bg-red-600 hover:bg-red-700 text-white shadow-lg",
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
                    className="h-6 w-6 p-0 text-white hover:bg-white/20 transition-colors"
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
                  className="hover:bg-gray-700 cursor-pointer"
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
                  "rounded-full w-12 h-12 p-0 transition-all duration-200",
                  isVideoEnabled 
                    ? "bg-gray-700 hover:bg-gray-600 text-white shadow-lg" 
                    : "bg-red-600 hover:bg-red-700 text-white shadow-lg"
                )}
              >
                {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </Button>
              
              {videoDevices.length > 1 && (
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-white hover:bg-white/20 transition-colors"
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
                  className="hover:bg-gray-700 cursor-pointer"
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
                    className="hover:bg-gray-700 cursor-pointer"
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
                "rounded-full w-12 h-12 p-0 transition-all duration-200",
                isScreenSharing
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg animate-pulse"
                  : "bg-gray-700 hover:bg-gray-600 text-white shadow-lg"
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
                "rounded-full w-12 h-12 p-0 transition-all duration-200",
                isHandRaised 
                  ? "bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg animate-bounce" 
                  : "bg-gray-700 hover:bg-gray-600 text-white shadow-lg"
              )}
            >
              <Hand className="h-6 w-6" />
            </Button>
          )}

          {/* Advanced Settings Dialog */}
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="rounded-full w-12 h-12 p-0 bg-gray-700 hover:bg-gray-600 text-white shadow-lg transition-all duration-200"
              >
                <Settings className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Advanced Stage Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Audio Devices Section */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-blue-400">Audio Devices</h4>
                  <div className="space-y-2">
                    {audioDevices.map((device) => (
                      <div key={device.deviceId} className="flex items-center justify-between p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                        <div className="flex items-center gap-3">
                          <Volume2 className="h-5 w-5 text-blue-400" />
                          <span className="text-sm font-medium">{device.label || 'Unknown Device'}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAudioDeviceChange?.(device.deviceId)}
                          className="bg-blue-600 hover:bg-blue-700 border-blue-500"
                        >
                          Select
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Video Devices Section */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-green-400">Video Devices</h4>
                  <div className="space-y-2">
                    {videoDevices.map((device) => (
                      <div key={device.deviceId} className="flex items-center justify-between p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                        <div className="flex items-center gap-3">
                          <Camera className="h-5 w-5 text-green-400" />
                          <span className="text-sm font-medium">{device.label || 'Unknown Device'}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onVideoDeviceChange?.(device.deviceId)}
                          className="bg-green-600 hover:bg-green-700 border-green-500"
                        >
                          Select
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Network Quality Section */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-purple-400">Network Quality</h4>
                  <div className="p-4 rounded-lg bg-gray-700 space-y-3">
                    <div className="flex items-center gap-3">
                      <Wifi className={cn("h-5 w-5", getConnectionColor())} />
                      <span className="text-sm font-medium capitalize">{connectionQuality} Connection</span>
                    </div>
                    {networkStats && (
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">{networkStats.ping.toFixed(0)}</div>
                          <div className="text-gray-400">Ping (ms)</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{(networkStats.bandwidth / 1000).toFixed(1)}</div>
                          <div className="text-gray-400">Bandwidth (Mbps)</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">{networkStats.participantCount}</div>
                          <div className="text-gray-400">Participants</div>
                        </div>
                      </div>
                    )}
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
              className="rounded-full w-12 h-12 p-0 bg-orange-600 hover:bg-orange-700 text-white shadow-lg transition-all duration-200"
            >
              <UserX className="h-6 w-6" />
            </Button>
          )}

          {/* Leave Stage */}
          <Button
            onClick={onLeave}
            size="lg"
            className="rounded-full w-12 h-12 p-0 bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all duration-200 hover:scale-105"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>

        {/* Role Indicator */}
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs px-3 py-1 rounded-full font-medium transition-all duration-200",
            userRole === 'speaker' 
              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-lg" 
              : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
          )}>
            {userRole === 'speaker' ? '🎤 Speaker' : '👥 Audience'}
          </span>
        </div>
      </div>
    </div>
  );
};
