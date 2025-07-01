
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sun, Moon, Palette } from 'lucide-react';
import { useTheme } from 'next-themes';

export const AppearanceTab: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Appearance Settings</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <Label>Theme</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Choose your preferred color theme
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('system')}
              >
                System
              </Button>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium mb-2">Preview</h4>
            <p className="text-sm text-muted-foreground mb-4">
              This is how your interface will look with the current theme settings.
            </p>
            <div className="flex gap-2">
              <div className="h-8 w-8 rounded bg-primary"></div>
              <div className="h-8 w-8 rounded bg-secondary"></div>
              <div className="h-8 w-8 rounded bg-accent"></div>
              <div className="h-8 w-8 rounded bg-muted"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
