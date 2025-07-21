
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Users, 
  Clock, 
  Play, 
  Calendar,
  Mic,
  Video,
  Monitor
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import StageService from '@/services/StageService';
import { supabase } from '@/integrations/supabase/client';
import StageRoom from './stage-call/StageRoom';

interface Stage {
  id: string;
  title: string;
  description?: string;
  status: string;
  participant_count?: number;
  creator_id: string;
  created_at: string;
  host_id: string;
}

const StageCallPanel: React.FC = () => {
  const { toast } = useToast();
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [newStage, setNewStage] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    loadStages();
    
    // Set up real-time subscription for new stages
    const interval = setInterval(loadStages, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadStages = async () => {
    try {
      const activeStages = await StageService.getActiveStages();
      if (activeStages) {
        setStages(activeStages);
      }
    } catch (error) {
      console.error('Error loading stages:', error);
      toast({
        title: "Error",
        description: "Failed to load stages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createStage = async () => {
    if (!newStage.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a stage title",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a stage",
          variant: "destructive"
        });
        return;
      }

      const stageData = {
        title: newStage.title,
        description: newStage.description,
        creator_id: user.id,
        host_id: user.id,
        status: 'live',
        is_active: true
      };

      const result = await StageService.createStage(stageData);
      if (result) {
        toast({
          title: "Success",
          description: "Stage created successfully"
        });
        setNewStage({ title: '', description: '' });
        setShowCreateForm(false);
        loadStages();
      }
    } catch (error) {
      console.error('Error creating stage:', error);
      toast({
        title: "Error",
        description: "Failed to create stage",
        variant: "destructive"
      });
    }
  };

  const joinStage = async (stageId: string) => {
    setActiveStageId(stageId);
  };

  const leaveStage = () => {
    setActiveStageId(null);
  };

  if (activeStageId) {
    return (
      <StageRoom 
        stageId={activeStageId}
        onLeave={leaveStage}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Stage Rooms</h2>
          <p className="text-muted-foreground">Join or create live video conversations with your community</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="hover-scale">
          <Plus className="w-4 h-4 mr-2" />
          Create Stage
        </Button>
      </div>

      {/* Create Stage Form */}
      {showCreateForm && (
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle>Create New Stage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Stage title"
              value={newStage.title}
              onChange={(e) => setNewStage({ ...newStage, title: e.target.value })}
            />
            <Input
              placeholder="Description (optional)"
              value={newStage.description}
              onChange={(e) => setNewStage({ ...newStage, description: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={createStage} className="hover-scale">Create Stage</Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
        {stages.map((stage, index) => (
          <Card key={stage.id} className="hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{stage.title}</CardTitle>
                  {stage.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {stage.description}
                    </p>
                  )}
                </div>
                <Badge 
                  variant={stage.status === 'live' ? 'default' : 'secondary'}
                  className={stage.status === 'live' ? 'bg-green-500' : ''}
                >
                  {stage.status === 'live' && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1" />
                  )}
                  {stage.status || 'scheduled'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{stage.participant_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(stage.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-green-500" />
                <Video className="w-4 h-4 text-blue-500" />
                <Monitor className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-muted-foreground ml-auto">
                  Full features available
                </span>
              </div>

              <Button 
                onClick={() => joinStage(stage.id)}
                className="w-full hover-scale bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                disabled={stage.status !== 'live' && stage.status !== 'scheduled'}
              >
                <Play className="w-4 h-4 mr-2" />
                Join Stage
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {stages.length === 0 && !loading && (
        <Card className="border-dashed border-2 animate-fade-in">
          <CardContent className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Stages</h3>
            <p className="text-muted-foreground mb-4">
              Create a new stage to start your video conversation with the community
            </p>
            <Button onClick={() => setShowCreateForm(true)} className="hover-scale">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Stage
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StageCallPanel;
