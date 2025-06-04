
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, Play, Pause, RotateCcw, Bell } from 'lucide-react';
import { toast } from 'sonner';

interface StageTimerProps {
  onTimerEnd?: () => void;
  isHost: boolean;
}

const StageTimer: React.FC<StageTimerProps> = ({ onTimerEnd, isHost }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(30 * 60); // 30 minutes default

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            setIsRunning(false);
            onTimerEnd?.();
            toast.error('Session time ended!', {
              description: 'The stage session has reached its time limit.'
            });
            return 0;
          }
          
          // Warning at 5 minutes
          if (time === 5 * 60) {
            toast.warning('5 minutes remaining', {
              description: 'Stage session will end soon.'
            });
          }
          
          // Warning at 1 minute
          if (time === 60) {
            toast.warning('1 minute remaining', {
              description: 'Stage session ending soon!'
            });
          }
          
          return time - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, onTimerEnd]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = (duration: number) => {
    setTimeRemaining(duration);
    setIsRunning(true);
    toast.success(`Timer started for ${Math.round(duration / 60)} minutes`);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeRemaining(sessionDuration);
  };

  const getTimerColor = () => {
    if (timeRemaining <= 60) return 'text-red-500';
    if (timeRemaining <= 5 * 60) return 'text-orange-500';
    return 'text-green-500';
  };

  if (!isHost) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2">
            <Timer className="h-5 w-5" />
            <span className={`text-lg font-mono font-bold ${getTimerColor()}`}>
              {formatTime(timeRemaining)}
            </span>
            {isRunning && (
              <Badge variant="secondary" className="gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Timer className="h-4 w-4" />
          Session Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-2xl font-mono font-bold ${getTimerColor()}`}>
            {formatTime(timeRemaining)}
          </div>
          {isRunning && (
            <Badge variant="secondary" className="mt-2 gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Running
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTimer}
            disabled={timeRemaining === 0}
            className="flex-1"
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetTimer}
            className="flex-1"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Quick Start:</div>
          <div className="grid grid-cols-3 gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => startTimer(15 * 60)}
              className="text-xs"
            >
              15m
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => startTimer(30 * 60)}
              className="text-xs"
            >
              30m
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => startTimer(60 * 60)}
              className="text-xs"
            >
              60m
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StageTimer;
