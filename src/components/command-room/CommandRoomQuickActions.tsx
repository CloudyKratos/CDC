
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  Shield, 
  Zap, 
  Users, 
  BarChart3, 
  Settings,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

const CommandRoomQuickActions: React.FC = () => {
  const [isSystemActive, setIsSystemActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickAction = async (action: string) => {
    setIsLoading(true);
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    switch (action) {
      case 'deploy':
        toast.success('🚀 Deployment initiated successfully');
        break;
      case 'security':
        toast.success('🛡️ Security scan completed');
        break;
      case 'optimize':
        toast.success('⚡ Performance optimization applied');
        break;
      case 'backup':
        toast.success('💾 System backup created');
        break;
      default:
        toast.info(`✨ ${action} executed`);
    }
    
    setIsLoading(false);
  };

  const toggleSystem = () => {
    setIsSystemActive(!isSystemActive);
    toast.info(isSystemActive ? '⏸️ System paused' : '▶️ System activated');
  };

  const quickActions = [
    {
      id: 'deploy',
      label: 'Quick Deploy',
      icon: Rocket,
      color: 'from-blue-500 to-cyan-500',
      description: 'Deploy latest changes'
    },
    {
      id: 'security',
      label: 'Security Scan',
      icon: Shield,
      color: 'from-red-500 to-pink-500',
      description: 'Run security check'
    },
    {
      id: 'optimize',
      label: 'Optimize',
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      description: 'Performance boost'
    },
    {
      id: 'backup',
      label: 'Backup',
      icon: RefreshCw,
      color: 'from-green-500 to-emerald-500',
      description: 'Create system backup'
    }
  ];

  return (
    <Card className="bg-black/20 backdrop-blur-xl border-white/10 shadow-2xl">
      <CardContent className="p-6">
        {/* System Status Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Activity className={`h-6 w-6 ${isSystemActive ? 'text-green-400' : 'text-orange-400'}`} />
              {isSystemActive && (
                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Quick Actions</h3>
              <p className="text-white/60 text-sm">Mission-critical operations</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className={`${isSystemActive ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-orange-500/20 text-orange-300 border-orange-500/30'}`}>
              {isSystemActive ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Paused
                </>
              )}
            </Badge>
            
            <Button
              onClick={toggleSystem}
              size="sm"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300"
            >
              {isSystemActive ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Activate
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                onClick={() => handleQuickAction(action.id)}
                disabled={!isSystemActive || isLoading}
                className="group relative h-auto p-4 bg-gradient-to-br hover:scale-105 transition-all duration-300 border-0 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(135deg, ${action.color.split(' ')[1]}, ${action.color.split(' ')[3]})`
                }}
              >
                <div className="flex flex-col items-center gap-3 text-white">
                  <div className="relative">
                    <Icon className="h-6 w-6" />
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm">{action.label}</p>
                    <p className="text-xs opacity-80">{action.description}</p>
                  </div>
                </div>
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              </Button>
            );
          })}
        </div>

        {/* System Metrics */}
        <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">99.9%</p>
              <p className="text-xs text-white/60 uppercase tracking-wide">Uptime</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">2.3s</p>
              <p className="text-xs text-white/60 uppercase tracking-wide">Response</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">47</p>
              <p className="text-xs text-white/60 uppercase tracking-wide">Active Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">12.4GB</p>
              <p className="text-xs text-white/60 uppercase tracking-wide">Data Transfer</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommandRoomQuickActions;
