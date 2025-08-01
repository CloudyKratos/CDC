
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
  Record,
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
  const [showSettings, setShowSettings] = useState(false);

  const handleShareStage = () => {
    const stageUrl = `${window.location.origin}/stage/${stageId}`;
    navigator.clipboard.writeText(stageUrl);
    setShowShareDialog(false);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/30 backdrop-blur-lg border-t border-white/10">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {/* Left side - Stage info */}
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              LIVE
            </Badge>
            
            <div className="flex items-center gap-2 text-white/80">
              <Users className="w-4 h-4" />
              <span>{participantCount}</span>
            </div>

            {isRecording && (
              <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">
                <Record className="w-3 h-3 mr-1 animate-pulse" />
                Recording
              </Badge>
            )}
          </div>

          {/* Center - Main controls */}
          <div className="flex items-center gap-3">
            {/* Audio Control */}
            <DropdownMenu>
              <div className="flex">
                <Button
                  variant={isAudioEnabled ? "secondary" : "destructive"}
                  size="lg"
                  onClick={onToggleAudio}
                  className="rounded-r-none px-4"
                >
                  {isAudioEnabled ? (
                    <Mic className="w-5 h-5" />
                  ) : (
                    <MicOff className="w-5 h-5" />
                  )}
                </Button>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={isAudioEnabled ? "secondary" : "destructive"}
                    size="lg"
                    className="rounded-l-none border-l border-white/20 px-2"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
              </div>
              <DropdownMenuContent>
                <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                  Microphones
                </div>
                {audioDevices.map((device) => (
                  <DropdownMenuItem
                    key={device.deviceId}
                    onClick={() => onSwitchAudioDevice(device.deviceId)}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Video Control */}
            <DropdownMenu>
              <div className="flex">
                <Button
                  variant={isVideoEnabled ? "secondary" : "destructive"}
                  size="lg"
                  onClick={onToggleVideo}
                  className="rounded-r-none px-4"
                >
                  {isVideoEnabled ? (
                    <Video className="w-5 h-5" />
                  ) : (
                    <VideoOff className="w-5 h-5" />
                  )}
                </Button>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={isVideoEnabled ? "secondary" : "destructive"}
                    size="lg"
                    className="rounded-l-none border-l border-white/20 px-2"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
              </div>
              <DropdownMenuContent>
                <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                  Cameras
                </div>
                {videoDevices.map((device) => (
                  <DropdownMenuItem
                    key={device.deviceId}
                    onClick={() => onSwitchVideoDevice(device.deviceId)}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Screen Share */}
            <Button
              variant={isScreenSharing ? "default" : "outline"}
              size="lg"
              onClick={onToggleScreenShare}
              className={isScreenSharing ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              <Monitor className="w-5 h-5" />
            </Button>

            {/* Raise Hand (for non-hosts) */}
            {!isHost && (
              <Button
                variant={isHandRaised ? "default" : "outline"}
                size="lg"
                onClick={onRaiseHand}
                className={isHandRaised ? "bg-yellow-600 hover:bg-yellow-700" : ""}
              >
                <Hand className="w-5 h-5" />
              </Button>
            )}

            {/* Leave Button */}
            <Button
              variant="destructive"
              size="lg"
              onClick={onLeave}
              className="ml-4"
            >
              <PhoneOff className="w-5 h-5 mr-2" />
              Leave
            </Button>
          </div>

          {/* Right side - Additional controls */}
          <div className="flex items-center gap-2">
            {/* Chat */}
            <Button variant="outline" size="lg" onClick={onToggleChat}>
              <MessageSquare className="w-5 h-5" />
            </Button>

            {/* Host controls */}
            {isHost && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="lg">
                    <Settings className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share stage link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={isRecording ? onStopRecording : onStartRecording}
                  >
                    {isRecording ? (
                      <>
                        <StopCircle className="w-4 h-4 mr-2" />
                        Stop recording
                      </>
                    ) : (
                      <>
                        <Record className="w-4 h-4 mr-2" />
                        Start recording
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowSettings(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Stage settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Share button for non-hosts */}
            {!isHost && (
              <Button variant="outline" size="lg" onClick={() => setShowShareDialog(true)}>
                <Share2 className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Stage</DialogTitle>
            <DialogDescription>
              Share this link to invite others to join the stage.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <code className="flex-1 text-sm">
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
