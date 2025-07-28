
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ProfileSettingsSidebar } from './ProfileSettingsSidebar';
import { EnhancedBasicProfileSection } from './EnhancedBasicProfileSection';
import { AccountSecuritySection } from './AccountSecuritySection';
import { EnhancedNotificationSettings } from './EnhancedNotificationSettings';
import { PrivacyDataSection } from './PrivacyDataSection';
import { ThemeLanguageSection } from './ThemeLanguageSection';
import { CommunityNotificationHandler } from './CommunityNotificationHandler';

export type SettingsSection = 'profile' | 'security' | 'notifications' | 'privacy' | 'theme';

interface ProfileSettingsLayoutProps {
  user?: any;
}

export const ProfileSettingsLayout: React.FC<ProfileSettingsLayoutProps> = ({ user }) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return <EnhancedBasicProfileSection user={user} />;
      case 'security':
        return <AccountSecuritySection user={user} />;
      case 'notifications':
        return <EnhancedNotificationSettings />;
      case 'privacy':
        return <PrivacyDataSection user={user} />;
      case 'theme':
        return <ThemeLanguageSection />;
      default:
        return <EnhancedBasicProfileSection user={user} />;
    }
  };

  return (
    <>
      {/* Community notification handler - runs in background */}
      <CommunityNotificationHandler />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences, notifications, and privacy settings</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ProfileSettingsSidebar 
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-xl">
                <div className="p-8">
                  {renderActiveSection()}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
