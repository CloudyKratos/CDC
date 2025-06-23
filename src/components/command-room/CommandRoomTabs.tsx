
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Users, 
  BarChart3, 
  Settings, 
  Shield, 
  Activity,
  Zap,
  Globe
} from 'lucide-react';

const CommandRoomTabs: React.FC = () => {
  const tabs = [
    { value: 'resources', label: 'Resources', icon: Database, color: 'from-blue-500 to-cyan-500' },
    { value: 'team', label: 'Team', icon: Users, color: 'from-green-500 to-emerald-500' },
    { value: 'analytics', label: 'Analytics', icon: BarChart3, color: 'from-purple-500 to-pink-500' },
    { value: 'security', label: 'Security', icon: Shield, color: 'from-red-500 to-orange-500' },
    { value: 'performance', label: 'Performance', icon: Activity, color: 'from-yellow-500 to-amber-500' },
    { value: 'integrations', label: 'Integrations', icon: Globe, color: 'from-indigo-500 to-blue-500' },
    { value: 'automation', label: 'Automation', icon: Zap, color: 'from-teal-500 to-cyan-500' },
    { value: 'settings', label: 'Settings', icon: Settings, color: 'from-gray-500 to-slate-500' },
  ];

  return (
    <div className="relative">
      <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 h-auto p-3 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="group relative flex flex-col items-center justify-center p-4 h-auto min-h-[80px] bg-transparent border-0 rounded-xl transition-all duration-300 hover:bg-white/5 data-[state=active]:bg-gradient-to-br data-[state=active]:shadow-lg data-[state=active]:shadow-white/10"
              style={{
                backgroundImage: `var(--state-active) and linear-gradient(135deg, ${tab.color.split(' ')[1]}, ${tab.color.split(' ')[3]})`
              }}
            >
              <div className="relative mb-2">
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-data-[state=active]:opacity-100 rounded-full blur-sm transition-opacity duration-300"
                     style={{ background: `linear-gradient(135deg, ${tab.color.split(' ')[1]}, ${tab.color.split(' ')[3]})` }}></div>
                <Icon className="relative h-5 w-5 text-white/70 group-data-[state=active]:text-white transition-colors duration-300" />
              </div>
              <span className="text-xs font-medium text-white/70 group-data-[state=active]:text-white transition-colors duration-300 text-center">
                {tab.label}
              </span>
              
              {/* Active indicator */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300"></div>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </div>
  );
};

export default CommandRoomTabs;
