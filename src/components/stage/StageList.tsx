
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Mic, 
  Clock, 
  Calendar,
  Plus,
  Play,
  Pause
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Stage = Database['public']['Tables']['stages']['Row'];

interface StageListProps {
  stages: Stage[];
  onJoinStage: (stageId: string) => void;
  isLoading: boolean;
  canCreateStage: boolean;
  onCreateStage: () => void;
}

const StageList: React.FC<StageListProps> = ({
  stages,
  onJoinStage,
  isLoading,
  canCreateStage,
  onCreateStage
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge variant="destructive" className="gap-1"><Play className="h-3 w-3" />Live</Badge>;
      case 'scheduled':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Scheduled</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><Pause className="h-3 w-3" />Ended</Badge>;
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (stages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Mic className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Active Stages</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          There are no active stage rooms at the moment. 
          {canCreateStage ? ' Create one to get started!' : ' Check back later for new sessions.'}
        </p>
        {canCreateStage && (
          <Button onClick={onCreateStage} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Your First Stage
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      {stages.map((stage) => (
        <Card key={stage.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{stage.title}</CardTitle>
                {stage.topic && (
                  <p className="text-sm text-muted-foreground">#{stage.topic}</p>
                )}
              </div>
              {getStatusBadge(stage.status)}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {stage.description && (
              <p className="text-sm text-muted-foreground">
                {stage.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>0/{stage.max_audience || 100}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Mic className="h-4 w-4" />
                <span>0/{stage.max_speakers || 10} speakers</span>
              </div>
              
              {stage.scheduled_start_time && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDateTime(stage.scheduled_start_time)}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=host`} />
                  <AvatarFallback>H</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">Host</span>
              </div>
              
              <Button 
                onClick={() => onJoinStage(stage.id)}
                variant={stage.status === 'live' ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                Join Stage
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StageList;
