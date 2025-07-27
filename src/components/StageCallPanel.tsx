
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Users, 
  Clock, 
  Play, 
  Calendar,
  Mic,
  Video,
  Monitor,
  Zap,
  Star,
  Globe,
  Lock,
  Crown,
  Radio
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import StageService from '@/services/StageService';
import { supabase } from '@/integrations/supabase/client';
import StageRoom from '@/components/stage-call/StageRoom';
import { toast } from 'sonner';

interface Stage {
  id: string;
  title: string;
  description?: string;
  status: string;
  participant_count?: number;
  creator_id: string;
  created_at: string;
  host_id: string;
  topic?: string;
  max_speakers?: number;
  max_audience?: number;
}

const StageCallPanel: React.FC = () => {
  const { toast: toastHook } = useToast();
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [newStage, setNewStage] = useState({
    title: '',
    description: '',
    topic: '',
    maxSpeakers: 10,
    maxAudience: 100
  });

  useEffect(() => {
    loadStages();
    
    // Set up real-time updates
    const interval = setInterval(loadStages, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStages = async () => {
    try {
      console.log('Loading active stages...');
      const activeStages = await StageService.getActiveStages();
      if (activeStages) {
        setStages(activeStages);
        console.log('Loaded stages:', activeStages.length);
      }
    } catch (error) {
      console.error('Error loading stages:', error);
      toast.error('Failed to load stages');
    } finally {
      setLoading(false);
    }
  };

  const createStage = async () => {
    if (!newStage.title.trim()) {
      toast.error('Please enter a stage title');
      return;
    }

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to create a stage');
        return;
      }

      console.log('Creating new stage:', newStage.title);
      
      // Create stage data that matches the database schema
      const stageData = {
        title: newStage.title,
        description: newStage.description || '',
        topic: newStage.topic || '',
        creator_id: user.id,
        host_id: user.id,
        status: 'live',
        is_active: true,
        max_speakers: newStage.maxSpeakers,
        max_audience: newStage.maxAudience,
        actual_start_time: new Date().toISOString()
      };

      const result = await StageService.createStage(stageData);
      if (result) {
        toast.success('Stage created successfully!');
        setNewStage({ 
          title: '', 
          description: '', 
          topic: '',
          maxSpeakers: 10, 
          maxAudience: 100 
        });
        setShowCreateForm(false);
        await loadStages();
        
        // Auto-join the created stage
        setActiveStageId(result.id);
      }
    } catch (error) {
      console.error('Error creating stage:', error);
      toast.error('Failed to create stage');
    } finally {
      setCreating(false);
    }
  };

  const joinStage = async (stageId: string) => {
    try {
      console.log('Joining stage:', stageId);
      setActiveStageId(stageId);
    } catch (error) {
      console.error('Error joining stage:', error);
      toast.error('Failed to join stage');
    }
  };

  const leaveStage = () => {
    console.log('Leaving stage');
    setActiveStageId(null);
  };

  // Show stage room if user is in a stage
  if (activeStageId) {
    return (
      <StageRoom 
        stageId={activeStageId}
        onLeave={leaveStage}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Stage Rooms
            </h1>
            <p className="text-muted-foreground text-lg">
              Join or create live video conversations with your community
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)} 
            className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 transition-all duration-300 hover:scale-105"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Stage
          </Button>
        </div>

        {/* Create Stage Form */}
        {showCreateForm && (
          <Card className="animate-scale-in border-primary/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-600/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-primary" />
                Create New Stage
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Stage Title *</label>
                    <Input
                      placeholder="Enter stage title"
                      value={newStage.title}
                      onChange={(e) => setNewStage({ ...newStage, title: e.target.value })}
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Topic</label>
                    <Input
                      placeholder="What's the main topic?"
                      value={newStage.topic}
                      onChange={(e) => setNewStage({ ...newStage, topic: e.target.value })}
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea
                      placeholder="Describe your stage"
                      value={newStage.description}
                      onChange={(e) => setNewStage({ ...newStage, description: e.target.value })}
                      className="border-primary/20 focus:border-primary min-h-[100px]"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Max Speakers</label>
                    <Input
                      type="number"
                      min="2"
                      max="20"
                      value={newStage.maxSpeakers}
                      onChange={(e) => setNewStage({ ...newStage, maxSpeakers: parseInt(e.target.value) || 10 })}
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Max Audience</label>
                    <Input
                      type="number"
                      min="10"
                      max="500"
                      value={newStage.maxAudience}
                      onChange={(e) => setNewStage({ ...newStage, maxAudience: parseInt(e.target.value) || 100 })}
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Features Included:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4 text-green-500" />
                        <span>Audio</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-blue-500" />
                        <span>Video</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-purple-500" />
                        <span>Screen Share</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-orange-500" />
                        <span>Hand Raising</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button 
                  onClick={createStage} 
                  disabled={creating}
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 transition-all duration-300 hover:scale-105"
                >
                  {creating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Radio className="w-4 h-4 mr-2" />
                      Go Live Now
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-muted-foreground">Loading stages...</p>
            </div>
          </div>
        )}

        {/* Active Stages Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {stages.map((stage, index) => (
              <Card 
                key={stage.id} 
                className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-primary/30 animate-fade-in overflow-hidden" 
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardHeader className="pb-3 relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold truncate group-hover:text-primary transition-colors duration-200">
                        {stage.title}
                      </CardTitle>
                      {stage.topic && (
                        <p className="text-sm text-primary/70 font-medium mt-1">
                          {stage.topic}
                        </p>
                      )}
                      {stage.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {stage.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge 
                        variant={stage.status === 'live' ? 'default' : 'secondary'}
                        className={`${stage.status === 'live' 
                          ? 'bg-red-500 hover:bg-red-600 text-white border-0 animate-pulse' 
                          : 'bg-muted text-muted-foreground'
                        } transition-colors duration-200`}
                      >
                        {stage.status === 'live' && (
                          <div className="w-2 h-2 bg-white rounded-full mr-1.5" />
                        )}
                        {stage.status === 'live' ? 'Live' : 'Scheduled'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 space-y-4 relative z-10">
                  {/* Stage Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{stage.participant_count || 0}</span>
                      <span>participants</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(stage.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1" title="Audio enabled">
                      <Mic className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">Audio</span>
                    </div>
                    <div className="flex items-center gap-1" title="Video enabled">
                      <Video className="w-4 h-4 text-blue-500" />
                      <span className="text-xs text-blue-600 font-medium">Video</span>
                    </div>
                    <div className="flex items-center gap-1" title="Screen sharing">
                      <Monitor className="w-4 h-4 text-purple-500" />
                      <span className="text-xs text-purple-600 font-medium">Share</span>
                    </div>
                    <div className="flex items-center gap-1 ml-auto" title="HD Quality">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs text-yellow-600 font-medium">HD</span>
                    </div>
                  </div>

                  {/* Creator Info */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                    <Crown className="w-3 h-3" />
                    <span>Hosted by CDC Admin</span>
                  </div>

                  {/* Join Button */}
                  <Button 
                    onClick={() => joinStage(stage.id)}
                    className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 transition-all duration-300 group-hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={stage.status !== 'live'}
                    size="lg"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {stage.status === 'live' ? 'Join Stage' : 'Not Available'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && stages.length === 0 && (
          <Card className="border-dashed border-2 border-muted-foreground/20 animate-fade-in">
            <CardContent className="text-center py-16">
              <div className="space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Radio className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">No Active Stages</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Create your first stage to start hosting live video conversations with your community
                  </p>
                </div>
                <Button 
                  onClick={() => setShowCreateForm(true)} 
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 transition-all duration-300 hover:scale-105"
                  size="lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Stage
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StageCallPanel;
