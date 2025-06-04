
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Mic, 
  Video, 
  Users, 
  Calendar, 
  Globe,
  Clock,
  MapPin,
  Plus,
  Play,
  Settings
} from 'lucide-react';
import RoundtableStageCall from './RoundtableStageCall';
import StageScheduler from './StageScheduler';
import StageTimeZoneView from './StageTimeZoneView';
import VideoCallService, { StageCall } from '@/services/VideoCallService';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { toast } from 'sonner';

interface StageCallManagerProps {
  onClose: () => void;
}

const StageCallManager: React.FC<StageCallManagerProps> = ({ onClose }) => {
  const [activeView, setActiveView] = useState<'lobby' | 'call' | 'schedule'>('lobby');
  const [currentStageCall, setCurrentStageCall] = useState<StageCall | null>(null);
  const [availableStages, setAvailableStages] = useState<StageCall[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { user } = useAuth();
  const { currentRole } = useRole();

  const canCreateStage = currentRole === 'admin' || currentRole === 'moderator';

  useEffect(() => {
    loadAvailableStages();
  }, []);

  const loadAvailableStages = async () => {
    try {
      const stages = VideoCallService.getActiveStageCalls();
      setAvailableStages(stages);
    } catch (error) {
      console.error('Failed to load stages:', error);
      toast.error('Failed to load available stages');
    }
  };

  const handleCreateStage = async (stageData: {
    name: string;
    description?: string;
    scheduledTime?: Date;
  }) => {
    try {
      const newStage = await VideoCallService.createStageCall(
        stageData.name,
        stageData.description
      );
      
      setCurrentStageCall(newStage);
      setActiveView('call');
      setShowCreateModal(false);
      toast.success('Stage call created successfully!');
    } catch (error) {
      console.error('Failed to create stage:', error);
      toast.error('Failed to create stage call');
    }
  };

  const handleJoinStage = async (stageCall: StageCall) => {
    try {
      if (!user) {
        toast.error('Please log in to join a stage');
        return;
      }

      setCurrentStageCall(stageCall);
      setActiveView('call');
      toast.success('Joined stage call successfully!');
    } catch (error) {
      console.error('Failed to join stage:', error);
      toast.error('Failed to join stage call');
    }
  };

  const handleLeaveStage = () => {
    setCurrentStageCall(null);
    setActiveView('lobby');
    loadAvailableStages();
  };

  const getCurrentTimeZone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };

  const formatTimeForTimeZone = (date: Date, timeZone: string) => {
    return date.toLocaleTimeString('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (activeView === 'call' && currentStageCall) {
    return (
      <RoundtableStageCall
        stageId={currentStageCall.id}
        onLeave={handleLeaveStage}
        userRole={currentRole}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Stage Calls</h1>
            <Badge variant="secondary" className="ml-2">
              {availableStages.length} Active
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {canCreateStage && (
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Stage
              </Button>
            )}
            
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="h-full flex flex-col">
          <div className="px-4 pt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="lobby" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Active Stages
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="timezone" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Time Zones
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="lobby" className="flex-1 p-4 m-0 overflow-auto">
            <div className="space-y-4">
              {/* Quick Start Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Quick Start
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col gap-2"
                      onClick={() => setShowCreateModal(true)}
                      disabled={!canCreateStage}
                    >
                      <Video className="h-6 w-6" />
                      <span>Start Video Stage</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col gap-2"
                      onClick={() => setShowCreateModal(true)}
                      disabled={!canCreateStage}
                    >
                      <Mic className="h-6 w-6" />
                      <span>Start Audio Only</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Active Stages */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Active Stage Calls</h3>
                
                {availableStages.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h4 className="text-lg font-medium mb-2">No active stages</h4>
                      <p className="text-muted-foreground mb-4">
                        Be the first to start a stage call for your community!
                      </p>
                      {canCreateStage && (
                        <Button onClick={() => setShowCreateModal(true)}>
                          Create First Stage
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableStages.map((stage) => (
                      <Card key={stage.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{stage.name}</CardTitle>
                              {stage.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {stage.description}
                                </p>
                              )}
                            </div>
                            <Badge variant="destructive" className="gap-1">
                              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                              LIVE
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{stage.participants.length} participants</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{formatTimeForTimeZone(stage.startTime, getCurrentTimeZone())}</span>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleJoinStage(stage)}
                                className="flex-1"
                                size="sm"
                              >
                                Join Stage
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="px-3"
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="schedule" className="flex-1 p-4 m-0 overflow-auto">
            <StageScheduler 
              onCreateStage={handleCreateStage}
              canCreate={canCreateStage}
            />
          </TabsContent>
          
          <TabsContent value="timezone" className="flex-1 p-4 m-0 overflow-auto">
            <StageTimeZoneView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StageCallManager;
