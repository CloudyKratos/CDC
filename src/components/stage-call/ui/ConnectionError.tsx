
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, LogOut, Info } from 'lucide-react';

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
  const isDuplicateKeyError = error.includes('duplicate key') || error.includes('stage_participants_stage_id_user_id_key');
  
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <CardTitle className="text-white text-xl">Connection Error</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-white/80 text-center text-sm">
              {isDuplicateKeyError 
                ? "There's an existing session that needs to be cleaned up. Please try force reconnecting."
                : error
              }
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
            
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-yellow-200 text-xs text-center">
                Having trouble? Try force reconnecting to clean up any previous sessions.
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button 
                onClick={onRetry}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {isDuplicateKeyError ? 'Force Reconnect & Cleanup' : 'Force Reconnect'}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
