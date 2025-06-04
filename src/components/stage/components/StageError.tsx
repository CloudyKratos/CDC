
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, AlertCircle, RefreshCw, WifiOff, UserX, Clock } from 'lucide-react';

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
  const getErrorDetails = (errorMessage: string | null) => {
    if (!errorMessage) {
      return {
        icon: <AlertCircle className="h-6 w-6 text-destructive" />,
        title: "Unable to Load Stage",
        description: "An unexpected error occurred while loading the stage.",
        suggestions: ["Please try again in a moment", "Check your internet connection"]
      };
    }

    const message = errorMessage.toLowerCase();
    
    if (message.includes('validation failed') || message.includes('access denied')) {
      return {
        icon: <UserX className="h-6 w-6 text-destructive" />,
        title: "Access Denied",
        description: "You don't have permission to access this stage.",
        suggestions: [
          "Check if you're logged in with the correct account",
          "Contact the stage organizer for access",
          "Ensure you have the required role or invitation"
        ]
      };
    }

    if (message.includes('not found') || message.includes('stage not found')) {
      return {
        icon: <AlertCircle className="h-6 w-6 text-destructive" />,
        title: "Stage Not Found",
        description: "The stage you're looking for doesn't exist or has been removed.",
        suggestions: [
          "Check if the stage URL is correct",
          "The stage may have been deleted or moved",
          "Contact the organizer for the correct link"
        ]
      };
    }

    if (message.includes('ended') || message.includes('has ended')) {
      return {
        icon: <Clock className="h-6 w-6 text-destructive" />,
        title: "Stage Has Ended",
        description: "This stage call has already concluded.",
        suggestions: [
          "Check if there's a recording available",
          "Look for upcoming stages on the same topic",
          "Contact the organizer about future sessions"
        ]
      };
    }

    if (message.includes('connection') || message.includes('network') || message.includes('timeout')) {
      return {
        icon: <WifiOff className="h-6 w-6 text-destructive" />,
        title: "Connection Problem",
        description: "Unable to connect to the stage server.",
        suggestions: [
          "Check your internet connection",
          "Try refreshing the page",
          "Disable VPN if you're using one",
          "Try again in a few minutes"
        ]
      };
    }

    if (message.includes('limit') || message.includes('capacity') || message.includes('full')) {
      return {
        icon: <UserX className="h-6 w-6 text-destructive" />,
        title: "Stage is Full",
        description: "This stage has reached its maximum capacity.",
        suggestions: [
          "Wait for someone to leave and try again",
          "Check if there are similar upcoming stages",
          "Contact the organizer about increasing capacity"
        ]
      };
    }

    return {
      icon: <AlertCircle className="h-6 w-6 text-destructive" />,
      title: "Unable to Load Stage",
      description: errorMessage,
      suggestions: ["Please try again", "Contact support if the problem persists"]
    };
  };

  const errorDetails = getErrorDetails(error);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center gap-2 p-4 border-b bg-card/50">
        <Button variant="ghost" size="sm" onClick={onLeave}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold text-destructive">Stage Error</h1>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              {errorDetails.icon}
            </div>
            <CardTitle className="text-destructive">{errorDetails.title}</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6 text-center">
            <p className="text-sm text-muted-foreground">
              {errorDetails.description}
            </p>
            
            {errorDetails.suggestions.length > 0 && (
              <div className="text-left">
                <h4 className="text-sm font-medium mb-2">What you can try:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {errorDetails.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex flex-col gap-2 sm:flex-row">
              {onRetry && (
                <Button onClick={onRetry} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              )}
              <Button onClick={onLeave} variant="default">
                Back to Stages
              </Button>
            </div>

            {error && (
              <details className="text-left">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  Technical Details
                </summary>
                <pre className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded overflow-auto">
                  {error}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StageError;
