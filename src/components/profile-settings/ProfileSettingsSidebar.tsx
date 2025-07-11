
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Shield, 
  Bell, 
  Eye, 
  Palette,
  ChevronRight
} from 'lucide-react';
import { SettingsSection } from './ProfileSettingsLayout';

interface ProfileSettingsSidebarProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}

const sidebarItems = [
  {
    id: 'profile' as SettingsSection,
    label: 'Profile',
    icon: User,
    description: 'Basic information'
  },
  {
    id: 'security' as SettingsSection,
    label: 'Security',
    icon: Shield,
    description: 'Password & 2FA'
  },
  {
    id: 'notifications' as SettingsSection,
    label: 'Notifications',
    icon: Bell,
    description: 'Email & push settings'
  },
  {
    id: 'privacy' as SettingsSection,
    label: 'Privacy',
    icon: Eye,
    description: 'Visibility & data'
  },
  {
    id: 'theme' as SettingsSection,
    label: 'Appearance',
    icon: Palette,
    description: 'Theme & language'
  }
];

export const ProfileSettingsSidebar: React.FC<ProfileSettingsSidebarProps> = ({
  activeSection,
  onSectionChange
}) => {
  return (
    <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-lg sticky top-8">
      <div className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Settings</h3>
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start h-auto p-4 transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'hover:bg-muted/80 text-foreground/80 hover:text-foreground'
                }`}
                onClick={() => onSectionChange(item.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">{item.label}</div>
                      <div className={`text-xs ${
                        isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </div>
              </Button>
            );
          })}
        </nav>
      </div>
    </Card>
  );
};
