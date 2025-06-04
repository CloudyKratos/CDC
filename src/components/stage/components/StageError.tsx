
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';

interface StageErrorProps {
  error: string | null;
  onLeave: () => void;
  onRetry?: () => void;
}

const StageError: React.FC<StageErrorProps> = ({
  error,
  onLeave,
  onRetry
}) => {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center gap-2 p-4 border-b bg-card/50">
        <Button variant="ghost" size="sm" onClick={onLeave}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold text-destructive">Stage Error</h1>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Unable to Load Stage</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              {error || 'An unexpected error occurred while loading the stage.'}
            </p>
            
            <div className="flex flex-col gap-2 sm:flex-row">
              {onRetry && (
                <Button onClick={onRetry} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              )}
              <Button onClick={onLeave} variant="default">
                Back to Stages
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StageError;
