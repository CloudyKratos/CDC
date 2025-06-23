
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Plug, CheckCircle, AlertCircle } from 'lucide-react';

const IntegrationsPanel: React.FC = () => {
  return (
    <Card className="bg-black/20 backdrop-blur-lg border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-xl">System Integrations</CardTitle>
        <CardDescription className="text-white/60">
          Connected services and external integrations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { name: 'Authentication Service', status: 'connected', type: 'critical' },
            { name: 'Database Cluster', status: 'connected', type: 'critical' },
            { name: 'Monitoring Service', status: 'connected', type: 'important' },
            { name: 'Backup Service', status: 'warning', type: 'optional' }
          ].map((integration, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <Plug className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-white font-medium">{integration.name}</p>
                  <p className="text-white/60 text-sm capitalize">{integration.type} service</p>
                </div>
              </div>
              {integration.status === 'connected' ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationsPanel;
