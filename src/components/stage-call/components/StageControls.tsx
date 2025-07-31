
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Settings, 
  Hand,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  onLeave
}) => {
  const [isHandRaised, setIsHandRaised] = useState(false);

  const handleRaiseHand = () => {
    setIsHandRaised(!isHandRaised);
    // TODO: Implement actual hand raising logic
    console.log('Hand raised:', !isHandRaised);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/20 backdrop-blur-sm border-t border-white/10">
      <div className="flex items-center justify-center gap-4">
        {/* Audio Control */}
        <DropdownMenu>
          <div className="flex">
            <Button
              variant={isAudioEnabled ? "secondary" : "destructive"}
              size="lg"
              onClick={onToggleAudio}
              className="rounded-r-none"
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
            {audioDevices.map((device) => (
              <DropdownMenuItem
                key={device.deviceId}
                onClick={() => onSwitchAudioDevice(device.deviceId)}
              >
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
              className="rounded-r-none"
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
            {videoDevices.map((device) => (
              <DropdownMenuItem
                key={device.deviceId}
                onClick={() => onSwitchVideoDevice(device.deviceId)}
              >
                {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Raise Hand */}
        <Button
          variant={isHandRaised ? "default" : "outline"}
          size="lg"
          onClick={handleRaiseHand}
          className={isHandRaised ? "bg-yellow-600 hover:bg-yellow-700" : ""}
        >
          <Hand className="w-5 h-5" />
        </Button>

        {/* Settings */}
        <Button variant="outline" size="lg">
          <Settings className="w-5 h-5" />
        </Button>

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
    </div>
  );
};

export default StageControls;
