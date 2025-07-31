
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Settings, 
  Monitor,
  ChevronDown
} from 'lucide-react';

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
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="bg-black/40 backdrop-blur-lg border-t border-white/10 p-4">
      <div className="flex items-center justify-center gap-4">
        
        {/* Audio Control with Device Selector */}
        <div className="flex items-center">
          <Button
            onClick={onToggleAudio}
            size="lg"
            variant={isAudioEnabled ? "default" : "destructive"}
            className="w-12 h-12 rounded-l-full hover-scale transition-all duration-200"
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={isAudioEnabled ? "default" : "destructive"}
                size="lg"
                className="w-8 h-12 rounded-r-full rounded-l-none border-l border-white/20"
              >
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
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
        </div>

        {/* Video Control with Device Selector */}
        <div className="flex items-center">
          <Button
            onClick={onToggleVideo}
            size="lg"
            variant={isVideoEnabled ? "default" : "destructive"}
            className="w-12 h-12 rounded-l-full hover-scale transition-all duration-200"
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={isVideoEnabled ? "default" : "destructive"}
                size="lg"
                className="w-8 h-12 rounded-r-full rounded-l-none border-l border-white/20"
              >
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
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
        </div>

        {/* Screen Share */}
        <Button
          size="lg"
          variant="outline"
          className="w-12 h-12 rounded-full hover-scale transition-all duration-200"
        >
          <Monitor className="w-5 h-5" />
        </Button>

        {/* Settings */}
        <Button
          size="lg"
          variant="outline"
          className="w-12 h-12 rounded-full hover-scale transition-all duration-200"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="w-5 h-5" />
        </Button>

        {/* Leave Button */}
        <Button
          onClick={onLeave}
          variant="destructive"
          size="lg"
          className="ml-8 hover-scale transition-all duration-200"
        >
          <PhoneOff className="w-4 h-4 mr-2" />
          Leave Stage
        </Button>
      </div>
    </div>
  );
};

export default StageControls;
