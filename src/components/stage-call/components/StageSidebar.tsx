
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, 
  Users, 
  MessageSquare, 
  Settings,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Crown,
  Hand
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Participant {
  id: string;
  name: string;
  role: 'host' | 'speaker' | 'audience';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isSpeaking?: boolean;
}

interface StageSidebarProps {
  stageId: string;
  participants: Participant[];
  onClose: () => void;
}

const StageSidebar: React.FC<StageSidebarProps> = ({
  stageId,
  participants,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('participants');

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'host':
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case 'speaker':
        return <Mic className="w-4 h-4 text-green-400" />;
      default:
        return <Users className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'host':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'speaker':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="w-80 bg-black/40 backdrop-blur-sm border-l border-white/10 flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">Stage Info</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white/60 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
          <TabsTrigger value="participants">
            <Users className="w-4 h-4 mr-2" />
            People
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 p-4">
          <TabsContent value="participants" className="mt-0 h-full">
            <div className="mb-4">
              <h4 className="text-sm font-medium text-white/80 mb-2">
                Participants ({participants.length})
              </h4>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <Card key={participant.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-white">
                                {participant.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">
                                {participant.name}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                {getRoleIcon(participant.role)}
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getRoleBadgeColor(participant.role)}`}
                                >
                                  {participant.role}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {participant.isAudioEnabled ? (
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                participant.isSpeaking ? 'bg-green-500/30' : 'bg-green-500/20'
                              }`}>
                                <Mic className="w-3 h-3 text-green-400" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                                <MicOff className="w-3 h-3 text-red-400" />
                              </div>
                            )}
                            
                            {participant.isVideoEnabled ? (
                              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                                <Video className="w-3 h-3 text-blue-400" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                                <VideoOff className="w-3 h-3 text-red-400" />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="mt-0 h-full">
            <div className="h-96 flex items-center justify-center text-white/60">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Chat feature coming soon</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-0 h-full">
            <div className="space-y-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Stage Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 text-sm">Stage ID</span>
                    <span className="text-white/60 text-sm font-mono">{stageId.slice(0, 8)}...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default StageSidebar;
