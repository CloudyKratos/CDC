
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Users, Activity, Settings, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useRole } from '@/contexts/RoleContext';

const CommandRoomHeader: React.FC = () => {
  const { user } = useAuth();
  const { currentRole } = useRole();

  return (
    <div className="relative z-20 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
              <div className="relative p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-xl">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                Command Room
              </h1>
              <p className="text-blue-200 text-lg font-medium">
                Mission Control Center
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1 text-sm font-semibold">
              <Activity className="h-4 w-4 mr-2" />
              System Online
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1 text-sm">
              <Users className="h-4 w-4 mr-2" />
              Active Mission
            </Badge>
            {currentRole && (
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-3 py-1 text-sm">
                <Shield className="h-4 w-4 mr-2" />
                {currentRole.toUpperCase()}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center lg:justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
          >
            <Bell className="h-4 w-4 mr-2" />
            Alerts
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
          >
            <Settings className="h-4 w-4 mr-2" />
            Controls
          </Button>
        </div>
      </div>

      {/* Status bar */}
      <div className="mt-6 p-4 bg-black/20 backdrop-blur-lg rounded-xl border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="text-center sm:text-left">
              <p className="text-xs text-blue-200 uppercase tracking-wide font-semibold">Welcome Back</p>
              <p className="text-white font-medium">{user?.email?.split('@')[0] || 'Commander'}</p>
            </div>
            <div className="h-8 w-px bg-white/20 hidden sm:block"></div>
            <div className="text-center sm:text-left">
              <p className="text-xs text-green-200 uppercase tracking-wide font-semibold">Mission Status</p>
              <p className="text-green-300 font-medium">All Systems Operational</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-300 text-sm font-medium">Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandRoomHeader;
