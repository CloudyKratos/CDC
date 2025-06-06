
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, LogOut, Info, Wifi, Clock } from 'lucide-react';

interface ConnectionErrorProps {
  error: string;
  onRetry: () => void;
  onLeave: () => void;
  retryAttempts?: number;
  maxRetries?: number;
}

export const ConnectionError: React.FC<ConnectionErrorProps> = ({
  error,
  onRetry,
  onLeave,
  retryAttempts = 0,
  maxRetries = 3
}) => {
  const isDuplicateKeyError = error.includes('duplicate key') || error.includes('Session already exists');
  const isCircuitBreakerError = error.includes('Circuit breaker') || error.includes('signaling-service');
  const isConnectionError = error.includes('connection') || error.includes('network') || error.includes('Failed to establish');
  const isMediaError = error.includes('Media access') || error.includes('permission');
  
  const getErrorIcon = () => {
    if (isDuplicateKeyError) return <RefreshCw className="h-8 w-8 text-yellow-400" />;
    if (isCircuitBreakerError || isConnectionError) return <Wifi className="h-8 w-8 text-red-400" />;
    if (isMediaError) return <AlertTriangle className="h-8 w-8 text-orange-400" />;
    return <AlertTriangle className="h-8 w-8 text-red-400" />;
  };

  const getErrorTitle = () => {
    if (isDuplicateKeyError) return "Session Conflict Detected";
    if (isCircuitBreakerError) return "Service Temporarily Unavailable";
    if (isConnectionError) return "Connection Failed";
    if (isMediaError) return "Media Access Required";
    return "Connection Error";
  };

  const getErrorDescription = () => {
    if (isDuplicateKeyError) {
      return "There's an existing session that needs to be cleaned up. The system will automatically resolve this conflict.";
    }
    if (isCircuitBreakerError) {
      return "The stage service is temporarily protecting against overload. This usually resolves quickly.";
    }
    if (isConnectionError) {
      return "Unable to establish a stable connection to the stage servers. Please check your internet connection.";
    }
    if (isMediaError) {
      return "Camera and microphone access is required to join the stage. Please allow permissions and try again.";
    }
    return error;
  };

  const getSolutionSteps = () => {
    if (isDuplicateKeyError) {
      return [
        "The system automatically cleans up old sessions",
        "Force reconnect will ensure a fresh connection",
        "No manual action required - just retry"
      ];
    }
    if (isCircuitBreakerError) {
      return [
        "Service is temporarily protecting against overload",
        "Wait 30-60 seconds before retrying",
        "The system will recover automatically"
      ];
    }
    if (isConnectionError) {
      return [
        "Check your internet connection stability",
        "Try refreshing the page if issues persist",
        "Contact support if problem continues"
      ];
    }
    if (isMediaError) {
      return [
        "Click the camera/microphone icon in your browser",
        "Select 'Allow' for camera and microphone permissions",
        "Refresh the page and try again"
      ];
    }
    return [
      "Try force reconnecting to reset the connection",
      "Check your internet connection",
      "Contact support if the issue persists"
    ];
  };
  
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-lg bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              {getErrorIcon()}
            </div>
            <CardTitle className="text-white text-xl">{getErrorTitle()}</CardTitle>
            
            {retryAttempts > 0 && (
              <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
                <Clock className="h-4 w-4" />
                <span>Attempt {retryAttempts} of {maxRetries}</span>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-white/80 text-center text-sm">
              {getErrorDescription()}
            </p>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <h4 className="text-blue-200 text-sm font-medium">How to resolve:</h4>
              </div>
              <ul className="text-blue-200 text-xs space-y-1 ml-6">
                {getSolutionSteps().map((step, index) => (
                  <li key={index} className="list-disc">{step}</li>
                ))}
              </ul>
            </div>

            {isCircuitBreakerError && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-200 text-xs">
                    The system uses circuit breakers to prevent service overload. 
                    Retrying will use an optimized fallback connection method.
                  </p>
                </div>
              </div>
            )}

            {retryAttempts >= maxRetries && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-200 text-xs">
                    Maximum retry attempts reached. Please check your connection and try again later,
                    or contact support if the issue persists.
                  </p>
                </div>
              </div>
            )}
            
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
              <p className="text-purple-200 text-xs text-center">
                Force reconnecting performs a complete cleanup and establishes a fresh connection with enhanced error recovery.
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button 
                onClick={onRetry}
                disabled={retryAttempts >= maxRetries}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {retryAttempts >= maxRetries ? 'Max Retries Reached' : 'Force Reconnect & Cleanup'}
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

            <details className="text-left">
              <summary className="text-xs text-white/60 cursor-pointer hover:text-white/80 mb-2">
                Technical Details & Diagnostics
              </summary>
              <div className="space-y-2">
                <div className="text-xs text-white/40">
                  <strong>Error Type:</strong> {isCircuitBreakerError ? 'Circuit Breaker' : isDuplicateKeyError ? 'Duplicate Session' : isMediaError ? 'Media Access' : 'Connection'}
                </div>
                <div className="text-xs text-white/40">
                  <strong>Retry Count:</strong> {retryAttempts}/{maxRetries}
                </div>
                <pre className="text-xs text-white/60 p-2 bg-black/20 rounded overflow-auto max-h-20">
                  {error}
                </pre>
              </div>
            </details>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
