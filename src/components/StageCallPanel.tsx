
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import VideoCallService, { StageCall, ParticipantRole, StageParticipant } from '@/services/VideoCallService';
import { Mic, MicOff, Users, HandRaised, Crown, X, PhoneOff, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StageCallPanelProps {
  callId?: string;
  onClose?: () => void;
}

export default function StageCallPanel({ callId, onClose }: StageCallPanelProps) {
  const { user } = useAuth();
  const [call, setCall] = useState<StageCall | null>(null);
  const [isCreatingCall, setIsCreatingCall] = useState(false);
  const [isJoiningCall, setIsJoiningCall] = useState(false);
  const [newCallName, setNewCallName] = useState('');
  const [newCallDescription, setNewCallDescription] = useState('');
  const [isSpeakerView, setSpeakerView] = useState(true);
  const [userRole, setUserRole] = useState<ParticipantRole | undefined>();
  const [isMuted, setIsMuted] = useState(true);
  
  useEffect(() => {
    const initializeCall = async () => {
      try {
        await VideoCallService.initialize();
        
        if (callId) {
          setIsJoiningCall(true);
          
          try {
            const stageCall = VideoCallService.getStageCall(callId);
            
            if (stageCall && user) {
              const joinedCall = await VideoCallService.joinStageCall(callId, user, true);
              setCall(joinedCall);
              
              const role = VideoCallService.getCurrentUserRole(callId);
              setUserRole(role);
              setIsMuted(role === ParticipantRole.LISTENER);
            } else {
              toast.error("Call not found");
            }
          } catch (error) {
            console.error("Error joining call:", error);
            toast.error("Failed to join call");
          } finally {
            setIsJoiningCall(false);
          }
        }
      } catch (error) {
        console.error("Failed to initialize video service:", error);
        toast.error("Failed to initialize video service");
      }
    };
    
    initializeCall();
    
    // Cleanup function
    return () => {
      if (callId && user) {
        VideoCallService.leaveStageCall(callId, user.id);
      }
    };
  }, [callId, user]);
  
  const createNewCall = async () => {
    if (!user) {
      toast.error("You must be logged in to create a call");
      return;
    }
    
    if (!newCallName.trim()) {
      toast.error("Please enter a call name");
      return;
    }
    
    setIsCreatingCall(true);
    
    try {
      const createdCall = await VideoCallService.createStageCall(
        newCallName.trim(),
        newCallDescription.trim() || undefined
      );
      
      if (createdCall && user) {
        const joinedCall = await VideoCallService.joinStageCall(createdCall.id, user, false);
        setCall(joinedCall);
        setUserRole(ParticipantRole.HOST);
        setIsMuted(false);
      }
    } catch (error) {
      console.error("Error creating call:", error);
      toast.error("Failed to create call");
    } finally {
      setIsCreatingCall(false);
    }
  };
  
  const handleRequestToSpeak = () => {
    if (!user || !call) return;
    
    VideoCallService.requestToSpeak(call.id, user.id);
    toast.info("Request to speak sent to host");
  };
  
  const handleApproveRequest = (userId: string, approved: boolean) => {
    if (!call) return;
    
    VideoCallService.approveRequestToSpeak(call.id, userId, approved);
    
    if (approved) {
      toast.success(`Speaker request approved`);
    } else {
      toast.info(`Speaker request denied`);
    }
  };
  
  const handleToggleMute = () => {
    if (!user || !call) return;
    
    // Only speakers and hosts can toggle mute
    if (userRole === ParticipantRole.LISTENER) {
      toast.error("Listeners cannot unmute themselves. Request to speak first.");
      return;
    }
    
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    VideoCallService.muteParticipant(call.id, user.id, newMuteState);
  };
  
  const handleLeaveCall = () => {
    if (!user || !call) return;
    
    VideoCallService.leaveStageCall(call.id, user.id);
    setCall(null);
    
    if (onClose) {
      onClose();
    }
    
    toast.info("You left the call");
  };
  
  const getSpeakers = () => {
    return call?.participants.filter(p => 
      p.role === ParticipantRole.SPEAKER || p.role === ParticipantRole.HOST
    ) || [];
  };
  
  const getListeners = () => {
    return call?.participants.filter(p => p.role === ParticipantRole.LISTENER) || [];
  };
  
  const getPendingRequests = () => {
    return call?.participants.filter(p => p.hasRequestedToSpeak) || [];
  };
  
  if (isJoiningCall) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          <p>Joining call...</p>
        </div>
      </div>
    );
  }
  
  if (!call) {
    return (
      <div className="flex flex-col gap-6 items-center justify-center h-full p-6">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle>Create a Stage Call</CardTitle>
              <CardDescription>
                Host a stage where speakers can present to an audience of listeners
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="callName" className="block text-sm font-medium">
                  Call Name
                </label>
                <input
                  id="callName"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Weekly Community Update"
                  value={newCallName}
                  onChange={(e) => setNewCallName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="callDescription" className="block text-sm font-medium">
                  Description (Optional)
                </label>
                <textarea
                  id="callDescription"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Let's discuss our latest updates and upcoming features"
                  rows={3}
                  value={newCallDescription}
                  onChange={(e) => setNewCallDescription(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={createNewCall}
                disabled={isCreatingCall || !newCallName.trim()}
                className="bg-primary"
              >
                {isCreatingCall ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Creating...
                  </>
                ) : (
                  <>Create Stage</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center bg-card">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          
          <div>
            <h2 className="text-lg font-semibold">{call.name}</h2>
            <p className="text-sm text-muted-foreground">
              {call.participants.length} participant{call.participants.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSpeakerView(!isSpeakerView)}
                  className="hidden sm:flex"
                >
                  {isSpeakerView ? (
                    <>
                      <Users className="h-4 w-4 mr-1" />
                      Speaker View
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-1" />
                      List View
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle between speaker and list view</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button size="sm" variant="ghost" onClick={handleLeaveCall}>
            <PhoneOff className="h-4 w-4 text-destructive" />
            <span className="ml-1 hidden md:inline">Leave</span>
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Main stage area */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
            <Crown className="h-4 w-4 mr-1 text-amber-500" />
            SPEAKERS ({getSpeakers().length})
          </h3>
          
          {isSpeakerView ? (
            <ScrollArea className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getSpeakers().map((participant) => (
                  <Card key={participant.id} className={`border ${participant.id === call.hostId ? 'border-amber-500/50' : ''}`}>
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex items-start">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback>{participant.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="ml-3 flex-1">
                          <div className="font-medium flex items-center">
                            {participant.name}
                            {participant.id === call.hostId && (
                              <Badge variant="secondary" className="ml-2 text-xs px-1 py-0">
                                Host
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center mt-1">
                            {participant.isMuted ? (
                              <MicOff className="h-3 w-3 mr-1 text-destructive" />
                            ) : (
                              <Mic className="h-3 w-3 mr-1 text-green-500" />
                            )}
                            {participant.isMuted ? "Muted" : "Speaking"}
                          </div>
                        </div>
                        
                        {participant.isSpeaking && !participant.isMuted && (
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <ScrollArea className="flex-1">
              <div className="space-y-1">
                {getSpeakers().map((participant) => (
                  <div 
                    key={participant.id} 
                    className={`flex items-center p-2 rounded-md ${
                      participant.id === call.hostId ? 'bg-amber-100/10' : ''
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback>{participant.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3 flex-1">
                      <div className="font-medium flex items-center">
                        {participant.name}
                        {participant.id === call.hostId && (
                          <Crown className="h-3 w-3 ml-2 text-amber-500" />
                        )}
                      </div>
                    </div>
                    <div>
                      {participant.isMuted ? (
                        <MicOff className="h-4 w-4 text-destructive" />
                      ) : (
                        <Mic className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          
          {userRole === ParticipantRole.HOST && getPendingRequests().length > 0 && (
            <>
              <Separator className="my-3" />
              
              <div className="mb-3">
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                  <HandRaised className="h-4 w-4 mr-1 text-blue-500" />
                  SPEAKER REQUESTS ({getPendingRequests().length})
                </h3>
                
                <ScrollArea className="max-h-32">
                  <div className="space-y-1">
                    {getPendingRequests().map((participant) => (
                      <div key={participant.id} className="flex items-center p-2 rounded-md bg-blue-100/10">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback>{participant.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="ml-3 flex-1">
                          <div className="font-medium">{participant.name}</div>
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-destructive"
                            onClick={() => handleApproveRequest(participant.id, false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-green-500"
                            onClick={() => handleApproveRequest(participant.id, true)}
                          >
                            <Mic className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
          
          <Separator className="my-3" />
          
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            LISTENERS ({getListeners().length})
          </h3>
          
          <ScrollArea className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {getListeners().map((participant) => (
                <div key={participant.id} className="flex flex-col items-center">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={participant.avatar} />
                    <AvatarFallback>{participant.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="mt-1 text-center">
                    <div className="text-sm font-medium truncate max-w-[100px]">{participant.name}</div>
                    <div className="text-xs text-muted-foreground">Listening</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
      
      <div className="p-4 border-t bg-card">
        <div className="flex justify-center space-x-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="lg" 
                  variant={isMuted ? "default" : "secondary"}
                  onClick={handleToggleMute}
                  disabled={userRole === ParticipantRole.LISTENER && !getSpeakers().some(p => p.id === user?.id)}
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isMuted ? "Unmute" : "Mute"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {userRole === ParticipantRole.LISTENER && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={handleRequestToSpeak}
                  >
                    <HandRaised className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Request to speak</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="lg" 
                  variant="outline"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="lg" 
                  variant="destructive"
                  onClick={handleLeaveCall}
                >
                  <PhoneOff className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Leave call</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
