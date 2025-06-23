
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  Server, 
  HardDrive, 
  Cpu, 
  MemoryStick,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

const ResourcesPanel: React.FC = () => {
  const resources = [
    {
      name: 'CPU Usage',
      icon: Cpu,
      value: 23,
      status: 'healthy',
      trend: '+2.3%',
      color: 'blue'
    },
    {
      name: 'Memory',
      icon: MemoryStick,
      value: 67,
      status: 'warning',
      trend: '+12.4%',
      color: 'yellow'
    },
    {
      name: 'Storage',
      icon: HardDrive,
      value: 45,
      status: 'healthy',
      trend: '+5.1%',
      color: 'green'
    },
    {
      name: 'Database',
      icon: Database,
      value: 89,
      status: 'critical',
      trend: '+23.7%',
      color: 'red'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'critical': return AlertCircle;
      default: return Activity;
    }
  };

  return (
    <div className="space-y-6">
      {/* Resource Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {resources.map((resource) => {
          const Icon = resource.icon;
          const StatusIcon = getStatusIcon(resource.status);
          
          return (
            <Card key={resource.name} className="bg-black/20 backdrop-blur-lg border-white/10 hover:bg-black/30 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-blue-400" />
                    <CardTitle className="text-white text-sm font-medium">
                      {resource.name}
                    </CardTitle>
                  </div>
                  <Badge className={getStatusColor(resource.status)}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {resource.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-white">{resource.value}%</span>
                  <div className="flex items-center gap-1 text-xs">
                    <TrendingUp className="h-3 w-3 text-green-400" />
                    <span className="text-green-400">{resource.trend}</span>
                  </div>
                </div>
                <Progress 
                  value={resource.value} 
                  className="h-2 bg-white/10"
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Resource Monitor */}
      <Card className="bg-black/20 backdrop-blur-lg border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl">System Resources</CardTitle>
              <CardDescription className="text-white/60">
                Real-time monitoring and resource allocation
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <ExternalLink className="h-4 w-4 mr-2" />
              Full Dashboard
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Server Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-white font-semibold mb-4">Active Servers</h3>
              {[
                { name: 'Web Server 01', status: 'online', load: 34, location: 'US-East' },
                { name: 'API Server 02', status: 'online', load: 67, location: 'US-West' },
                { name: 'Database Server', status: 'warning', load: 89, location: 'EU-Central' },
                { name: 'Cache Server', status: 'online', load: 23, location: 'Asia-Pacific' }
              ].map((server, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <Server className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">{server.name}</p>
                      <p className="text-white/60 text-sm">{server.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-white text-sm">{server.load}%</p>
                      <Progress value={server.load} className="w-20 h-1" />
                    </div>
                    <Badge className={server.status === 'online' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'}>
                      {server.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Quick Stats</h3>
              <div className="space-y-3">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-sm">Total Requests</span>
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  </div>
                  <p className="text-xl font-bold text-white">1.2M</p>
                  <p className="text-green-400 text-xs">+15.2% from last hour</p>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-sm">Response Time</span>
                    <Activity className="h-4 w-4 text-blue-400" />
                  </div>
                  <p className="text-xl font-bold text-white">245ms</p>
                  <p className="text-blue-400 text-xs">Average response</p>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-sm">Active Users</span>
                    <CheckCircle className="h-4 w-4 text-purple-400" />
                  </div>
                  <p className="text-xl font-bold text-white">2,847</p>
                  <p className="text-purple-400 text-xs">Currently online</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourcesPanel;
