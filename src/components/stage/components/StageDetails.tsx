
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Users,
  Mic,
  Calendar,
  Clock,
  Play,
  AlertCircle
} from 'lucide-react';

interface StageDetailsProps {
  stage: any;
  user: any;
  currentRole: string;
  isJoining: boolean;
  error: string | null;
  onLeave: () => void;
  onJoin: () => void;
}

const StageDetails: React.FC<StageDetailsProps> = ({
  stage,
  user,
  currentRole,
  isJoining,
  error,
  onLeave,
  onJoin
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return (
          <Badge variant="destructive" className="gap-1 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-white" />
            Live
          </Badge>
        );
      case 'scheduled':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Scheduled</Badge>;
      default:
        return <Badge variant="outline">Ended</Badge>;
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleString();
  };

  const canStartStage = stage?.creator_id === user?.id || currentRole === 'admin' || currentRole === 'moderator';

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center gap-2 p-4 border-b bg-card/50">
        <Button variant="ghost" size="sm" onClick={onLeave}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold">{stage.title}</h1>
        {getStatusBadge(stage.status)}
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardTitle className="flex items-center justify-between">
              <span className="text-xl">{stage.title}</span>
              {stage.topic && (
                <Badge variant="outline" className="bg-background">#{stage.topic}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6 p-6">
            {stage.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Description</h3>
                <p className="text-sm leading-relaxed">{stage.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Max Audience</div>
                  <div className="text-muted-foreground">{stage.max_audience || 100} participants</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Mic className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Max Speakers</div>
                  <div className="text-muted-foreground">{stage.max_speakers || 10} speakers</div>
                </div>
              </div>
              
              {stage.scheduled_start_time && (
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg col-span-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Scheduled Time</div>
                    <div className="text-muted-foreground">{formatDateTime(stage.scheduled_start_time)}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {stage.allow_hand_raising && (
                <Badge variant="secondary" className="gap-1">
                  ✋ Hand Raising Allowed
                </Badge>
              )}
              {stage.recording_enabled && (
                <Badge variant="secondary" className="gap-1">
                  🔴 Recording Enabled
                </Badge>
              )}
            </div>

            <div className="pt-4 space-y-3">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              
              {stage.status === 'scheduled' && canStartStage ? (
                <Button 
                  onClick={onJoin} 
                  disabled={isJoining}
                  size="lg"
                  className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <Play className="h-5 w-5" />
                  {isJoining ? 'Starting Stage...' : 'Start & Join Stage'}
                </Button>
              ) : stage.status === 'live' ? (
                <Button 
                  onClick={onJoin} 
                  disabled={isJoining}
                  size="lg"
                  className="w-full gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                >
                  <Users className="h-5 w-5" />
                  {isJoining ? 'Joining...' : 'Join Live Stage'}
                </Button>
              ) : stage.status === 'scheduled' ? (
                <div className="text-center p-6 bg-muted/30 rounded-lg">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="font-medium">This stage is scheduled but not yet live.</p>
                  <p className="text-sm text-muted-foreground">Only the creator or moderators can start it.</p>
                </div>
              ) : (
                <div className="text-center p-6 bg-muted/30 rounded-lg">
                  <p className="font-medium">This stage has ended.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StageDetails;
