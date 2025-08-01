
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Settings, 
  Hand,
  MoreVertical,
  Share2,
  Users,
  MessageSquare,
  Monitor,
  StopCircle,
  Circle,
  Volume2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface StageControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  audioDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onSwitchAudioDevice: (deviceId: string) => void;
  onSwitchVideoDevice: (deviceId: string) => void;
  onLeave: () => void;
  onToggleScreenShare?: () => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onRaiseHand?: () => void;
  onToggleChat?: () => void;
  isHost?: boolean;
  isHandRaised?: boolean;
  isRecording?: boolean;
  isScreenSharing?: boolean;
  participantCount?: number;
  stageId?: string;
}

const StageControls: React.FC<StageControlsProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  audioDevices,
  videoDevices,
  onToggleAudio,
  onToggleVideo,
  onSwitchAudioDevice,
  onSwitchVideoDevice,
  onLeave,
  onToggleScreenShare,
  onStartRecording,
  onStopRecording,
  onRaiseHand,
  onToggleChat,
  isHost = false,
  isHandRaised = false,
  isRecording = false,
  isScreenSharing = false,
  participantCount = 0,
  stageId
}) => {
  const [showShareDialog, setShowShareDialog] = useState(false);

  const handleShareStage = () => {
    const stageUrl = `${window.location.origin}/stage/${stageId}`;
    navigator.clipboard.writeText(stageUrl);
    setShowShareDialog(false);
  };

  return (
    <>
      {/* Fixed controls bar with proper z-index and backdrop */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/80 backdrop-blur-xl border-t border-white/10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left side - Stage info */}
          <div className="flex items-center gap-4 min-w-0">
            <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs font-medium">LIVE</span>
            </Badge>
            
            <div className="flex items-center gap-2 text-white/80">
              <Users className="w-4 h-4" />
              <span className="text-sm">{participantCount}</span>
            </div>

            {isRecording && (
              <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30 flex items-center gap-1">
                <Circle className="w-3 h-3 animate-pulse fill-red-400" />
                <span className="text-xs">Recording</span>
              </Badge>
            )}
          </div>

          {/* Center - Main controls */}
          <div className="flex items-center gap-2">
            {/* Audio Control */}
            <div className="flex items-center">
              <Button
                variant={isAudioEnabled ? "secondary" : "destructive"}
                size="lg"
                onClick={onToggleAudio}
                className="h-12 w-12 rounded-full p-0"
              >
                {isAudioEnabled ? (
                  <Mic className="w-5 h-5" />
                ) : (
                  <MicOff className="w-5 h-5" />
                )}
              </Button>
              {audioDevices.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 p-1 h-6 w-6 text-white/60 hover:text-white"
                    >
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black/90 backdrop-blur-xl border-white/20">
                    <div className="px-2 py-1 text-xs font-medium text-white/60">
                      Microphones
                    </div>
                    {audioDevices.map((device) => (
                      <DropdownMenuItem
                        key={device.deviceId}
                        onClick={() => onSwitchAudioDevice(device.deviceId)}
                        className="text-white hover:bg-white/10"
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Video Control */}
            <div className="flex items-center">
              <Button
                variant={isVideoEnabled ? "secondary" : "destructive"}
                size="lg"
                onClick={onToggleVideo}
                className="h-12 w-12 rounded-full p-0"
              >
                {isVideoEnabled ? (
                  <Video className="w-5 h-5" />
                ) : (
                  <VideoOff className="w-5 h-5" />
                )}
              </Button>
              {videoDevices.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 p-1 h-6 w-6 text-white/60 hover:text-white"
                    >
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black/90 backdrop-blur-xl border-white/20">
                    <div className="px-2 py-1 text-xs font-medium text-white/60">
                      Cameras
                    </div>
                    {videoDevices.map((device) => (
                      <DropdownMenuItem
                        key={device.deviceId}
                        onClick={() => onSwitchVideoDevice(device.deviceId)}
                        className="text-white hover:bg-white/10"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Screen Share */}
            <Button
              variant={isScreenSharing ? "default" : "outline"}
              size="lg"
              onClick={onToggleScreenShare}
              className={`h-12 w-12 rounded-full p-0 ${
                isScreenSharing ? "bg-blue-600 hover:bg-blue-700" : ""
              }`}
            >
              <Monitor className="w-5 h-5" />
            </Button>

            {/* Raise Hand (for non-hosts) */}
            {!isHost && (
              <Button
                variant={isHandRaised ? "default" : "outline"}
                size="lg"
                onClick={onRaiseHand}
                className={`h-12 w-12 rounded-full p-0 ${
                  isHandRaised ? "bg-yellow-600 hover:bg-yellow-700" : ""
                }`}
              >
                <Hand className="w-5 h-5" />
              </Button>
            )}

            {/* Chat */}
            <Button 
              variant="outline" 
              size="lg" 
              onClick={onToggleChat}
              className="h-12 w-12 rounded-full p-0"
            >
              <MessageSquare className="w-5 h-5" />
            </Button>

            {/* Host controls */}
            {isHost && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="lg" className="h-12 w-12 rounded-full p-0">
                    <Settings className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black/90 backdrop-blur-xl border-white/20">
                  <DropdownMenuItem 
                    onClick={() => setShowShareDialog(true)}
                    className="text-white hover:bg-white/10"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share stage link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem 
                    onClick={isRecording ? onStopRecording : onStartRecording}
                    className="text-white hover:bg-white/10"
                  >
                    {isRecording ? (
                      <>
                        <StopCircle className="w-4 h-4 mr-2" />
                        Stop recording
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4 mr-2 fill-red-500" />
                        Start recording
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Leave Button */}
            <Button
              variant="destructive"
              size="lg"
              onClick={onLeave}
              className="ml-4 h-12 px-6"
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              Leave
            </Button>
          </div>

          {/* Right side - Share button for non-hosts */}
          <div className="flex items-center min-w-0">
            {!isHost && (
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => setShowShareDialog(true)}
                className="h-12 w-12 rounded-full p-0"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-black/90 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Share Stage</DialogTitle>
            <DialogDescription className="text-white/80">
              Share this link to invite others to join the stage.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-white/10 rounded-lg">
              <code className="flex-1 text-sm text-white">
                {window.location.origin}/stage/{stageId}
              </code>
              <Button onClick={handleShareStage} size="sm">
                Copy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StageControls;
