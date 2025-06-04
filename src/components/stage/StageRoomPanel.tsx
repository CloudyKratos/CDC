
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Users, 
  Video, 
  Plus, 
  Clock,
  Play,
  Settings,
  Mic,
  Crown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import StageService from '@/services/StageService';
import CreateStageModal from './CreateStageModal';
import ActiveStage from './ActiveStage';
import StageTimer from './StageTimer';
import { toast } from 'sonner';

const StageRoomPanel: React.FC = () => {
  const [activeStages, setActiveStages] = useState<any[]>([]);
  const [scheduledStages, setScheduledStages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('live');

  const { user } = useAuth();
  const { currentRole } = useRole();

  useEffect(() => {
    loadStages();
  }, []);

  const loadStages = async () => {
    setIsLoading(true);
    try {
      const stages = await StageService.getActiveStages();
      const liveStages = stages.filter(s => s.status === 'live');
      const scheduled = stages.filter(s => s.status === 'scheduled');
      
      setActiveStages(liveStages);
      setScheduledStages(scheduled);
    } catch (error) {
      console.error('Error loading stages:', error);
      toast.error('Failed to load stages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStageCreated = () => {
    setShowCreateModal(false);
    loadStages();
  };

  const handleJoinStage = (stageId: string) => {
    setSelectedStageId(stageId);
  };

  const handleLeaveStage = () => {
    setSelectedStageId(null);
    loadStages();
  };

  const canCreateStage = currentRole === 'admin' || currentRole === 'moderator';

  if (selectedStageId) {
    return (
      <ActiveStage
        stageId={selectedStageId}
        onLeave={handleLeaveStage}
        userRole={currentRole}
      />
    );
  }

  const renderStageCard = (stage: any, isLive = false) => (
    <Card key={stage.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{stage.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {isLive ? (
                <Badge variant="destructive" className="gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  LIVE
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" />
                  Scheduled
                </Badge>
              )}
              {stage.topic && (
                <Badge variant="outline">#{stage.topic}</Badge>
              )}
            </div>
          </div>
          <Crown className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {stage.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {stage.description}
          </p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Mic className="h-4 w-4" />
            <span>{stage.speaker_count || 0}/{stage.max_speakers || 10}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{stage.audience_count || 0}/{stage.max_audience || 100}</span>
          </div>
          {stage.scheduled_start_time && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(stage.scheduled_start_time).toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => handleJoinStage(stage.id)}
            className="flex-1 gap-2"
            variant={isLive ? "default" : "outline"}
          >
            {isLive ? (
              <>
                <Video className="h-4 w-4" />
                Join Live
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start Stage
              </>
            )}
          </Button>
          
          {(stage.creator_id === user?.id || canCreateStage) && (
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-bold">Stage Rooms</h1>
          <p className="text-muted-foreground">
            Live discussions, panels, AMAs, and community calls
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <StageTimer isHost={canCreateStage} />
          
          {canCreateStage && (
            <Button onClick={() => setShowCreateModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Stage
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="live" className="gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              Live Stages ({activeStages.length})
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="gap-2">
              <Clock className="h-4 w-4" />
              Scheduled ({scheduledStages.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-4 bg-muted rounded" />
                        <div className="h-10 bg-muted rounded" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : activeStages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeStages.map(stage => renderStageCard(stage, true))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Live Stages</h3>
                <p className="text-muted-foreground mb-4">
                  There are no live stage calls at the moment.
                </p>
                {canCreateStage && (
                  <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Your First Stage
                  </Button>
                )}
              </Card>
            )}
          </TabsContent>

          <TabsContent value="scheduled">
            {scheduledStages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scheduledStages.map(stage => renderStageCard(stage, false))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Scheduled Stages</h3>
                <p className="text-muted-foreground mb-4">
                  No upcoming stage calls have been scheduled.
                </p>
                {canCreateStage && (
                  <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Schedule a Stage
                  </Button>
                )}
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Stage Modal */}
      <CreateStageModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onStageCreated={handleStageCreated}
      />
    </div>
  );
};

export default StageRoomPanel;
