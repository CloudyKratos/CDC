
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const DatabaseConnectionCheck: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [tables, setTables] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  const checkDatabaseConnection = async () => {
    try {
      setConnectionStatus('checking');
      
      // Test basic connection
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Database connection error:', error);
        setError(error.message);
        setConnectionStatus('error');
        return;
      }
      
      // If we get here, connection is working
      setConnectionStatus('connected');
      setTables(['profiles', 'member_locations', 'member_online_status', 'channels', 'messages']);
      
    } catch (err) {
      console.error('Connection check failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setConnectionStatus('error');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {connectionStatus === 'checking' && <Loader2 className="h-5 w-5 animate-spin" />}
          {connectionStatus === 'connected' && <CheckCircle className="h-5 w-5 text-green-500" />}
          {connectionStatus === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
          Database Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <Badge 
              variant={connectionStatus === 'connected' ? 'default' : 
                      connectionStatus === 'error' ? 'destructive' : 'secondary'}
            >
              {connectionStatus === 'checking' && 'Checking Connection...'}
              {connectionStatus === 'connected' && 'Connected'}
              {connectionStatus === 'error' && 'Connection Error'}
            </Badge>
          </div>

          {connectionStatus === 'connected' && (
            <div>
              <h4 className="font-medium mb-2">Available Tables:</h4>
              <div className="flex flex-wrap gap-1">
                {tables.map((table) => (
                  <Badge key={table} variant="outline" className="text-xs">
                    {table}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {connectionStatus === 'error' && error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}

          <button 
            onClick={checkDatabaseConnection}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseConnectionCheck;
