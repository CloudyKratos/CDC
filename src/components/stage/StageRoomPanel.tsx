
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Video, 
  Plus, 
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import StageService from '@/services/StageService';
import CreateStageModal from './CreateStageModal';
import ActiveStage from './ActiveStage';
import StageTimer from './StageTimer';
import StageCard from './components/StageCard';
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

  const renderEmptyState = (icon: React.ReactNode, title: string, description: string, showCreateButton: boolean) => (
    <Card className="p-12 text-center">
      {icon}
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      {canCreateStage && showCreateButton && (
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {title.includes('Live') ? 'Create Your First Stage' : 'Schedule a Stage'}
        </Button>
      )}
    </Card>
  );

  const renderStageGrid = (stages: any[], isLive: boolean) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="p-6">
                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2 mb-4" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-10 bg-muted rounded" />
              </div>
            </Card>
          ))}
        </div>
      );
    }

    if (stages.length === 0) {
      return renderEmptyState(
        isLive ? 
          <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" /> :
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />,
        isLive ? 'No Live Stages' : 'No Scheduled Stages',
        isLive ? 
          'There are no live stage calls at the moment.' :
          'No upcoming stage calls have been scheduled.',
        true
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stages.map(stage => (
          <StageCard
            key={stage.id}
            stage={stage}
            isLive={isLive}
            user={user}
            canCreateStage={canCreateStage}
            onJoin={handleJoinStage}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
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
            {renderStageGrid(activeStages, true)}
          </TabsContent>

          <TabsContent value="scheduled">
            {renderStageGrid(scheduledStages, false)}
          </TabsContent>
        </Tabs>
      </div>

      <CreateStageModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onStageCreated={handleStageCreated}
      />
    </div>
  );
};

export default StageRoomPanel;
