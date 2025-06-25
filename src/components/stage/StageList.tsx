
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Users, Clock, Mic } from 'lucide-react';
import { toast } from 'sonner';
import CreateStageModal from './CreateStageModal';

interface Stage {
  id: string;
  name: string;
  description?: string;
  host_id: string;
  is_active: boolean;
  max_participants: number;
  workspace_id?: string;
  created_at: string;
  updated_at: string;
}

interface StageListProps {
  onJoinStage: (stageId: string) => void;
}

const StageList: React.FC<StageListProps> = ({ onJoinStage }) => {
  const { user } = useAuth();
  const [stages, setStages] = useState<Stage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async () => {
    try {
      const { data, error } = await supabase
        .from('stages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStages(data || []);
    } catch (error) {
      console.error('Error fetching stages:', error);
      toast.error('Failed to load stages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinStage = async (stageId: string) => {
    try {
      // Here you would typically check if the stage is available, add user to participants, etc.
      toast.success('Joining stage...');
      onJoinStage(stageId);
    } catch (error) {
      console.error('Error joining stage:', error);
      toast.error('Failed to join stage');
    }
  };

  const filteredStages = stages.filter(stage =>
    stage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stage.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Stage Rooms</h2>
          <p className="text-muted-foreground">Join or create stage conversations</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Stage
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search stages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stages List */}
      <div className="grid gap-4">
        {filteredStages.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Mic className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No stages found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No stages match your search' : 'Be the first to create a stage room!'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Stage
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredStages.map((stage) => (
            <Card key={stage.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {stage.name}
                      <Badge variant={stage.is_active ? 'default' : 'secondary'}>
                        {stage.is_active ? 'Live' : 'Scheduled'}
                      </Badge>
                    </CardTitle>
                    {stage.description && (
                      <CardDescription className="mt-1">
                        {stage.description}
                      </CardDescription>
                    )}
                  </div>
                  <Button 
                    onClick={() => handleJoinStage(stage.id)}
                    disabled={!stage.is_active}
                  >
                    {stage.is_active ? 'Join' : 'Notify Me'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>Max {stage.max_participants}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(stage.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {user?.id === stage.host_id && (
                    <Badge variant="outline">You're the host</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CreateStageModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onStageCreated={fetchStages}
      />
    </div>
  );
};

export default StageList;
