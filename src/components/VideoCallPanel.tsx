
import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, Maximize, Minimize, Settings, Share, Monitor, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CallService, CallParticipant } from "../services/CallService";
import StageRoomPanel from "./stage/StageRoomPanel";
import ComingSoonBanner from "./ComingSoonBanner";

interface CallType {
  id: string;
  type: 'audio' | 'video';
  startTime: Date;
  endTime?: Date;
  participants: CallParticipant[];
}

interface VideoCallPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const VideoCallPanel: React.FC<VideoCallPanelProps> = ({ isOpen, onClose }) => {
  const [activeCall, setActiveCall] = useState<CallType | null>(null);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState("00:00");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [activeTab, setActiveTab] = useState("stage");
  const callContainerRef = useRef<HTMLDivElement>(null);
  const durationIntervalRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      // Create mock data for demonstration purposes
      const mockParticipants: CallParticipant[] = [
        {
          id: '1',
          name: 'You',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
          isMuted: false,
          isVideoEnabled: true,
          isScreenSharing: false
        },
        {
          id: '2',
          name: 'Jane Smith',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
          isMuted: false,
          isVideoEnabled: true,
          isScreenSharing: false
        }
      ];
      
      const mockCall: CallType = {
        id: '1',
        type: 'video',
        startTime: new Date(),
        participants: mockParticipants
      };
      
      setActiveCall(mockCall);
      startDurationTimer(mockCall.startTime);
    } else {
      stopDurationTimer();
      setActiveCall(null);
    }
    
    return () => {
      stopDurationTimer();
    };
  }, [isOpen]);
  
  const startDurationTimer = (startTime: Date) => {
    stopDurationTimer();
    
    durationIntervalRef.current = window.setInterval(() => {
      const durationMs = new Date().getTime() - startTime.getTime();
      const minutes = Math.floor(durationMs / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000);
      setCallDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
  };
  
  const stopDurationTimer = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  };
  
  const handleToggleAudio = () => {
    setLocalAudioEnabled(!localAudioEnabled);
    if (activeCall) {
      const updatedParticipants = activeCall.participants.map(p => 
        p.id === '1' ? { ...p, isMuted: !localAudioEnabled } : p
      );
      setActiveCall({
        ...activeCall,
        participants: updatedParticipants
      });
    }
  };
  
  const handleToggleVideo = () => {
    setLocalVideoEnabled(!localVideoEnabled);
    if (activeCall) {
      const updatedParticipants = activeCall.participants.map(p => 
        p.id === '1' ? { ...p, isVideoEnabled: !localVideoEnabled } : p
      );
      setActiveCall({
        ...activeCall,
        participants: updatedParticipants
      });
    }
  };
  
  const handleToggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    if (activeCall) {
      const updatedParticipants = activeCall.participants.map(p => 
        p.id === '1' ? { ...p, isScreenSharing: !isScreenSharing } : p
      );
      setActiveCall({
        ...activeCall,
        participants: updatedParticipants
      });
    }
  };
  
  const handleEndCall = () => {
    stopDurationTimer();
    onClose();
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      callContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  const renderParticipant = (participant: CallParticipant, isLarge = false) => {
    const isVideoOff = participant.id === '1' ? !localVideoEnabled : !participant.isVideoEnabled;
    
    return (
      <div className={`relative rounded-lg overflow-hidden bg-celestial-dark ${isLarge ? 'h-full' : 'h-32'}`}>
        {!isVideoOff ? (
          <div className="h-full w-full bg-celestial-dark flex items-center justify-center">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/50">
                  {participant.isScreenSharing ? "Screen sharing" : "Video"}
                </span>
              </div>
              <div className="absolute top-2 right-2 bg-celestial-gold/20 px-2 py-1 rounded text-white text-xs">
                HD
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-celestial-dark">
            <Avatar className={`${isLarge ? 'h-24 w-24' : 'h-16 w-16'} celestial-glow`}>
              <AvatarImage src={participant.avatar} />
              <AvatarFallback className="bg-celestial-light text-white">
                {participant.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
        
        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded-full text-white text-xs flex items-center">
          {participant.isMuted && <MicOff size={12} className="mr-1 text-red-500" />}
          {isVideoOff && <VideoOff size={12} className="mr-1 text-red-500" />}
          {participant.isScreenSharing && <Monitor size={12} className="mr-1 text-celestial-gold" />}
          <span>{participant.name}</span>
        </div>
      </div>
    );
  };
  
  if (!isOpen) {
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[90vw] h-[90vh] p-0 overflow-hidden celestial-gradient" ref={callContainerRef}>
        {showBanner && (
          <div className="absolute top-0 left-0 right-0 z-50">
            <ComingSoonBanner 
              title="Video Call Feature in Development" 
              description="Stage Rooms are now integrated! Traditional video calls coming soon."
              className="rounded-none"
              showNotifyButton={false}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute top-1 right-1 text-white/70 hover:text-white hover:bg-transparent"
              onClick={() => setShowBanner(false)}
            >
              Dismiss
            </Button>
          </div>
        )}
        
        <div className="flex flex-col h-full">
          <div className="bg-celestial-dark p-3 flex items-center justify-between border-b border-celestial-gold/20">
            <div className="flex items-center">
              <Users size={18} className="text-celestial-gold mr-2" />
              <div>
                <h3 className="font-medium text-white">
                  Video & Audio Communication
                </h3>
                <p className="text-xs text-white/60">Choose your communication mode</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/60 hover:text-white hover:bg-celestial-light/20"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/60 hover:text-white hover:bg-celestial-light/20"
              >
                <Settings size={16} />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 bg-[url('/public/lovable-uploads/f61a938f-4bf8-44f0-8e79-84bbe1a177b0.png')] bg-cover bg-center overflow-hidden">
            <div className="bg-black/30 backdrop-blur-sm h-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="px-4 pt-4">
                  <TabsList className="grid w-full grid-cols-2 bg-celestial-dark/80">
                    <TabsTrigger value="stage" className="flex items-center gap-2">
                      <Headphones size={16} />
                      Stage Rooms
                    </TabsTrigger>
                    <TabsTrigger value="video" className="flex items-center gap-2">
                      <Video size={16} />
                      Video Call
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="stage" className="flex-1 p-4 m-0">
                  <div className="h-full bg-background rounded-lg overflow-hidden">
                    <StageRoomPanel />
                  </div>
                </TabsContent>
                
                <TabsContent value="video" className="flex-1 p-4 m-0">
                  <div className="h-full">
                    {activeCall?.participants && activeCall.participants.length <= 2 ? (
                      <div className="h-full flex flex-col">
                        <div className="flex-1 relative">
                          {renderParticipant(
                            activeCall.participants.length > 1
                              ? activeCall.participants.find(p => p.id !== '1')!
                              : activeCall.participants[0],
                            true
                          )}
                          
                          {activeCall.participants.length > 1 && (
                            <div className="absolute bottom-4 right-4 w-48 rounded-lg overflow-hidden shadow-lg border border-celestial-gold/30">
                              {renderParticipant(activeCall.participants.find(p => p.id === '1')!)}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full grid grid-cols-2 gap-4 overflow-auto">
                        {activeCall?.participants.map(participant => (
                          <div key={participant.id} className="aspect-video">
                            {renderParticipant(participant)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <div className="bg-celestial-dark p-4 border-t border-celestial-gold/20 flex items-center justify-center space-x-4">
            {activeTab === 'video' && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-12 w-12 rounded-full ${
                          localAudioEnabled
                            ? 'bg-celestial-light/80 hover:bg-celestial-light/60 text-white'
                            : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                        }`}
                        onClick={handleToggleAudio}
                      >
                        {localAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{localAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-12 w-12 rounded-full ${
                          localVideoEnabled
                            ? 'bg-celestial-light/80 hover:bg-celestial-light/60 text-white'
                            : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                        }`}
                        onClick={handleToggleVideo}
                      >
                        {localVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{localVideoEnabled ? 'Turn off camera' : 'Turn on camera'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-12 w-12 rounded-full ${
                          isScreenSharing
                            ? 'bg-celestial-gold/20 text-celestial-gold hover:bg-celestial-gold/30'
                            : 'bg-celestial-light/80 hover:bg-celestial-light/60 text-white'
                        }`}
                        onClick={handleToggleScreenShare}
                      >
                        <Share size={20} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{isScreenSharing ? 'Stop sharing screen' : 'Share screen'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600 text-white"
                    onClick={handleEndCall}
                  >
                    <PhoneOff size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Close communication panel</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoCallPanel;
