import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff,
  Hand,
  Phone,
  Settings,
  Users,
  Shield,
  UserX,
  Volume2,
  VolumeX,
  StopCircle
} from 'lucide-react';

interface WebinarParticipant {
  id: string;
  name: string;
  email?: string;
  role: 'host' | 'presenter' | 'attendee';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isSpeaking: boolean;
  isHandRaised: boolean;
  isScreenSharing: boolean;
  joinedAt: Date;
  connectionState: RTCPeerConnectionState;
  networkQuality: 'excellent' | 'good' | 'poor' | 'unknown';
}

interface WebinarSettings {
  allowAttendeeVideo: boolean;
  allowAttendeeAudio: boolean;
  allowAttendeeScreenShare: boolean;
  allowAttendeeChat: boolean;
  isRecording: boolean;
  maxParticipants: number;
  waitingRoomEnabled: boolean;
}

interface WebinarControlsProps {
  localParticipant: WebinarParticipant | null;
  participants: WebinarParticipant[];
  webinarSettings: WebinarSettings;
  currentRole: 'host' | 'presenter' | 'attendee';
  onToggleAudio: () => Promise<void>;
  onToggleVideo: () => Promise<void>;
  onToggleScreenShare: () => Promise<void>;
  onToggleHandRaise: () => Promise<void>;
  onLeaveConference: () => Promise<void>;
  onUpdateSettings: (settings: Partial<WebinarSettings>) => Promise<void>;
  onMuteParticipant: (participantId: string) => Promise<void>;
  onRemoveParticipant: (participantId: string) => Promise<void>;
}

export const WebinarControls: React.FC<WebinarControlsProps> = ({
  localParticipant,
  participants,
  webinarSettings,
  currentRole,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleHandRaise,
  onLeaveConference,
  onUpdateSettings,
  onMuteParticipant,
  onRemoveParticipant
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const canControlSettings = currentRole === 'host';
  const canMuteOthers = currentRole === 'host' || currentRole === 'presenter';

  const handleSettingChange = async (key: keyof WebinarSettings, value: boolean) => {
    if (canControlSettings) {
      await onUpdateSettings({ [key]: value });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Controls */}
      <div className="flex items-center justify-center gap-4 p-4 bg-background/90 backdrop-blur-sm rounded-lg border">
        {/* Audio Control */}
        <Button
          onClick={onToggleAudio}
          variant={localParticipant?.isAudioEnabled ? "default" : "destructive"}
          size="lg"
          className="h-12 w-12 rounded-full"
          disabled={currentRole === 'attendee' && !webinarSettings.allowAttendeeAudio}
        >
          {localParticipant?.isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>

        {/* Video Control */}
        <Button
          onClick={onToggleVideo}
          variant={localParticipant?.isVideoEnabled ? "default" : "destructive"}
          size="lg"
          className="h-12 w-12 rounded-full"
          disabled={currentRole === 'attendee' && !webinarSettings.allowAttendeeVideo}
        >
          {localParticipant?.isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>

        {/* Screen Share Control */}
        <Button
          onClick={onToggleScreenShare}
          variant={localParticipant?.isScreenSharing ? "default" : "outline"}
          size="lg"
          className="h-12 w-12 rounded-full"
          disabled={currentRole === 'attendee' && !webinarSettings.allowAttendeeScreenShare}
        >
          {localParticipant?.isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
        </Button>

        {/* Hand Raise */}
        <Button
          onClick={onToggleHandRaise}
          variant={localParticipant?.isHandRaised ? "default" : "outline"}
          size="lg"
          className="h-12 w-12 rounded-full"
        >
          <Hand className={`h-5 w-5 ${localParticipant?.isHandRaised ? 'animate-pulse' : ''}`} />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        {/* Participants */}
        <Button
          onClick={() => setShowParticipants(!showParticipants)}
          variant="outline"
          size="lg"
          className="h-12 px-4"
        >
          <Users className="h-5 w-5 mr-2" />
          {participants.length}
        </Button>

        {/* Settings (Host only) */}
        {canControlSettings && (
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            size="lg"
            className="h-12 w-12 rounded-full"
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}

        <Separator orientation="vertical" className="h-8" />

        {/* Leave */}
        <Button
          onClick={onLeaveConference}
          variant="destructive"
          size="lg"
          className="h-12 w-12 rounded-full"
        >
          <Phone className="h-5 w-5" />
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && canControlSettings && (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Webinar Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Allow attendee audio</span>
              <Switch
                checked={webinarSettings.allowAttendeeAudio}
                onCheckedChange={(checked) => handleSettingChange('allowAttendeeAudio', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Allow attendee video</span>
              <Switch
                checked={webinarSettings.allowAttendeeVideo}
                onCheckedChange={(checked) => handleSettingChange('allowAttendeeVideo', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Allow screen sharing</span>
              <Switch
                checked={webinarSettings.allowAttendeeScreenShare}
                onCheckedChange={(checked) => handleSettingChange('allowAttendeeScreenShare', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Recording</span>
              <Switch
                checked={webinarSettings.isRecording}
                onCheckedChange={(checked) => handleSettingChange('isRecording', checked)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Participants Panel */}
      {showParticipants && (
        <Card className="w-full max-w-md mx-auto max-h-80 overflow-y-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participants ({participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Badge variant={participant.role === 'host' ? 'default' : participant.role === 'presenter' ? 'secondary' : 'outline'}>
                    {participant.role}
                  </Badge>
                  <span className="text-sm font-medium">{participant.name}</span>
                  {participant.isHandRaised && <Hand className="h-4 w-4 text-yellow-500 animate-pulse" />}
                </div>
                
                <div className="flex items-center gap-1">
                  {participant.isAudioEnabled ? (
                    <Mic className="h-4 w-4 text-green-500" />
                  ) : (
                    <MicOff className="h-4 w-4 text-red-500" />
                  )}
                  
                  {participant.isVideoEnabled ? (
                    <Video className="h-4 w-4 text-green-500" />
                  ) : (
                    <VideoOff className="h-4 w-4 text-red-500" />
                  )}

                  {/* Host Controls */}
                  {canMuteOthers && participant.id !== localParticipant?.id && participant.role === 'attendee' && (
                    <>
                      <Button
                        onClick={() => onMuteParticipant(participant.id)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <VolumeX className="h-3 w-3" />
                      </Button>
                      
                      {currentRole === 'host' && (
                        <Button
                          onClick={() => onRemoveParticipant(participant.id)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <UserX className="h-3 w-3" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};