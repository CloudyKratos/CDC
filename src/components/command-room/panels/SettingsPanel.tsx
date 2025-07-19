
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, User, Bell, Shield, Palette, Globe, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SettingsPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // CDC Admin user ID
  const CDC_ADMIN_ID = '348ae8de-aaac-41cb-89cd-674023098784';
  const isCDCAdmin = user?.id === CDC_ADMIN_ID;

  const handleSettingsClick = (settingType: string) => {
    // Only redirect CDC admin to admin page for any settings
    if (isCDCAdmin && settingType === 'system') {
      navigate('/admin');
    } else if (isCDCAdmin) {
      // For CDC admin, redirect all settings to admin page
      navigate('/admin');
    } else {
      // For regular users, show coming soon message
      toast.info(`${settingType} settings coming soon`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: 'User Preferences', icon: User, description: 'Personal settings and profile', type: 'user' },
          { title: 'Notifications', icon: Bell, description: 'Alert and notification settings', type: 'notifications' },
          { title: 'Security', icon: Shield, description: 'Security and privacy settings', type: 'security' },
          { title: 'Appearance', icon: Palette, description: 'Theme and display options', type: 'appearance' },
          { 
            title: isCDCAdmin ? 'Admin System' : 'System', 
            icon: isCDCAdmin ? Crown : Settings, 
            description: isCDCAdmin ? 'CDC Admin system configuration' : 'System configuration', 
            type: 'system' 
          },
          { title: 'Integrations', icon: Globe, description: 'External service connections', type: 'integrations' }
        ].map((setting, index) => {
          const Icon = setting.icon;
          return (
            <Card 
              key={index} 
              className={`bg-black/20 backdrop-blur-lg border-white/10 hover:bg-black/30 transition-all duration-300 cursor-pointer ${
                isCDCAdmin && setting.type === 'system' ? 'border-red-500/30 hover:border-red-500/50' : ''
              }`}
              onClick={() => handleSettingsClick(setting.type)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Icon className={`h-8 w-8 ${
                    isCDCAdmin && setting.type === 'system' ? 'text-red-400' : 'text-blue-400'
                  }`} />
                  <div>
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      {setting.title}
                      {isCDCAdmin && setting.type === 'system' && (
                        <Shield className="h-4 w-4 text-red-400" />
                      )}
                    </h3>
                    <p className="text-white/60 text-sm">{setting.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-black/20 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center gap-2">
            Quick Settings
            {isCDCAdmin && <Crown className="h-5 w-5 text-red-400" />}
          </CardTitle>
          <CardDescription className="text-white/60">
            {isCDCAdmin ? 'CDC Admin configuration options' : 'Frequently used configuration options'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div>
              <p className="text-white font-medium">Dark Mode</p>
              <p className="text-white/60 text-sm">System appearance theme</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/10 border-white/20 text-white"
              onClick={() => handleSettingsClick('appearance')}
            >
              Enabled
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div>
              <p className="text-white font-medium">Auto Updates</p>
              <p className="text-white/60 text-sm">Automatic system updates</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/10 border-white/20 text-white"
              onClick={() => handleSettingsClick('system')}
            >
              {isCDCAdmin ? 'Manage' : 'Enabled'}
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div>
              <p className="text-white font-medium">Analytics</p>
              <p className="text-white/60 text-sm">Usage analytics collection</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/10 border-white/20 text-white"
              onClick={() => handleSettingsClick('system')}
            >
              {isCDCAdmin ? 'Configure' : 'Enabled'}
            </Button>
          </div>

          {isCDCAdmin && (
            <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <div>
                <p className="text-red-400 font-medium">CDC Admin Access</p>
                <p className="text-red-300/60 text-sm">Full system administration</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                onClick={() => navigate('/admin')}
              >
                <Crown className="h-4 w-4 mr-1" />
                Admin Panel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPanel;
