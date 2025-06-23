
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Play, Pause, CheckCircle } from 'lucide-react';

const AutomationPanel: React.FC = () => {
  return (
    <Card className="bg-black/20 backdrop-blur-lg border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-xl">Automation Controls</CardTitle>
        <CardDescription className="text-white/60">
          Automated processes and workflow management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { name: 'Auto Deployment', status: 'active', lastRun: '2 hours ago' },
            { name: 'Security Scans', status: 'active', lastRun: '30 min ago' },
            { name: 'Backup Process', status: 'active', lastRun: '6 hours ago' },
            { name: 'Performance Monitor', status: 'paused', lastRun: '1 day ago' }
          ].map((automation, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-white font-medium">{automation.name}</p>
                  <p className="text-white/60 text-sm">Last run: {automation.lastRun}</p>
                </div>
              </div>
              {automation.status === 'active' ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 text-sm">Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Pause className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm">Paused</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AutomationPanel;
