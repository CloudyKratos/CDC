
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Mic, 
  Users, 
  Calendar, 
  Clock, 
  Video, 
  Play, 
  Settings 
} from 'lucide-react';

interface StageCardProps {
  stage: any;
  isLive?: boolean;
  user: any;
  canCreateStage: boolean;
  onJoin: (stageId: string) => void;
}

const StageCard: React.FC<StageCardProps> = ({
  stage,
  isLive = false,
  user,
  canCreateStage,
  onJoin
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
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
            onClick={() => onJoin(stage.id)}
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
};

export default StageCard;
