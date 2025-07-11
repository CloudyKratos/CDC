
import React from 'react';
import { 
  LayoutGrid,
  Calendar,
  Users,
  Video
} from 'lucide-react';
import { ActivePanel } from '@/types/dashboard';

interface PanelInfoProps {
  activePanel: ActivePanel;
  userName?: string;
}

const PanelInfo: React.FC<PanelInfoProps> = ({ activePanel, userName }) => {
  const getPanelTitle = (panel: ActivePanel) => {
    switch (panel) {
      case "command-room":
        return "Command Room";
      case "calendar":
        return "Calendar";
      case "community":
        return "Community";
      case "stage":
        return "Stage Call";
      default:
        return "Dashboard";
    }
  };

  const getPanelIcon = (panel: ActivePanel) => {
    switch (panel) {
      case "command-room":
        return <LayoutGrid className="h-5 w-5" />;
      case "calendar":
        return <Calendar className="h-5 w-5" />;
      case "community":
        return <Users className="h-5 w-5" />;
      case "stage":
        return <Video className="h-5 w-5" />;
      default:
        return <LayoutGrid className="h-5 w-5" />;
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-600/10 text-blue-600 dark:text-blue-400">
        {getPanelIcon(activePanel)}
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {getPanelTitle(activePanel)}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Welcome back, {userName || 'Warrior'}
        </p>
      </div>
    </div>
  );
};

export default PanelInfo;
