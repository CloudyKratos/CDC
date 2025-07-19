
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, User, Bell, Shield, Palette, Globe } from 'lucide-react';

const SettingsPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: 'User Preferences', icon: User, description: 'Personal settings and profile' },
          { title: 'Notifications', icon: Bell, description: 'Alert and notification settings' },
          { title: 'Security', icon: Shield, description: 'Security and privacy settings' },
          { title: 'Appearance', icon: Palette, description: 'Theme and display options' },
          { title: 'System', icon: Settings, description: 'System configuration' },
          { title: 'Integrations', icon: Globe, description: 'External service connections' }
        ].map((setting, index) => {
          const Icon = setting.icon;
          return (
            <Card key={index} className="bg-black/20 backdrop-blur-lg border-white/10 hover:bg-black/30 transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Icon className="h-8 w-8 text-blue-400" />
                  <div>
                    <h3 className="text-white font-semibold">{setting.title}</h3>
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
          <CardTitle className="text-white text-xl">Quick Settings</CardTitle>
          <CardDescription className="text-white/60">
            Frequently used configuration options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div>
              <p className="text-white font-medium">Dark Mode</p>
              <p className="text-white/60 text-sm">System appearance theme</p>
            </div>
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white">
              Enabled
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div>
              <p className="text-white font-medium">Auto Updates</p>
              <p className="text-white/60 text-sm">Automatic system updates</p>
            </div>
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white">
              Enabled
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div>
              <p className="text-white font-medium">Analytics</p>
              <p className="text-white/60 text-sm">Usage analytics collection</p>
            </div>
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white">
              Enabled
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPanel;
