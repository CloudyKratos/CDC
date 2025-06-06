
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, LogOut, Info, Wifi } from 'lucide-react';

interface ConnectionErrorProps {
  error: string;
  onRetry: () => void;
  onLeave: () => void;
}

export const ConnectionError: React.FC<ConnectionErrorProps> = ({
  error,
  onRetry,
  onLeave
}) => {
  const isDuplicateKeyError = error.includes('duplicate key') || error.includes('Session already exists');
  const isCircuitBreakerError = error.includes('Circuit breaker') || error.includes('signaling-service');
  const isConnectionError = error.includes('connection') || error.includes('network') || error.includes('Failed to establish');
  
  const getErrorIcon = () => {
    if (isDuplicateKeyError) return <RefreshCw className="h-8 w-8 text-yellow-400" />;
    if (isCircuitBreakerError || isConnectionError) return <Wifi className="h-8 w-8 text-red-400" />;
    return <AlertTriangle className="h-8 w-8 text-red-400" />;
  };

  const getErrorTitle = () => {
    if (isDuplicateKeyError) return "Session Conflict";
    if (isCircuitBreakerError) return "Service Connection Error";
    if (isConnectionError) return "Connection Failed";
    return "Connection Error";
  };

  const getErrorDescription = () => {
    if (isDuplicateKeyError) {
      return "There's an existing session that needs to be cleaned up. Force reconnecting will resolve this issue.";
    }
    if (isCircuitBreakerError) {
      return "The signaling service is temporarily unavailable. This usually resolves itself quickly.";
    }
    if (isConnectionError) {
      return "Unable to establish a stable connection to the stage servers.";
    }
    return error;
  };
  
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              {getErrorIcon()}
            </div>
            <CardTitle className="text-white text-xl">{getErrorTitle()}</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-white/80 text-center text-sm">
              {getErrorDescription()}
            </p>
            
            {isDuplicateKeyError && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-200 text-xs">
                    This usually happens when a previous session wasn't properly closed. 
                    Force reconnecting will clean up the old session and establish a new connection.
                  </p>
                </div>
              </div>
            )}

            {isCircuitBreakerError && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-200 text-xs">
                    The system is protecting against service overload. Retrying will attempt to reconnect 
                    using a fallback connection method.
                  </p>
                </div>
              </div>
            )}
            
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
              <p className="text-purple-200 text-xs text-center">
                Having trouble? Force reconnecting will clean up any previous sessions and retry the connection.
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button 
                onClick={onRetry}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Force Reconnect & Cleanup
              </Button>
              
              <Button 
                onClick={onLeave}
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Leave Stage
              </Button>
            </div>

            {error && (
              <details className="text-left">
                <summary className="text-xs text-white/60 cursor-pointer hover:text-white/80">
                  Technical Details
                </summary>
                <pre className="text-xs text-white/60 mt-2 p-2 bg-black/20 rounded overflow-auto max-h-20">
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
