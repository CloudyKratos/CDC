
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sun, Moon, Monitor, Palette } from 'lucide-react';
import { useTheme } from 'next-themes';

export const AppearanceTab: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Appearance Settings</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                <Label className="text-gray-900 dark:text-white">Theme</Label>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
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
                className="flex items-center gap-2"
              >
                <Monitor className="h-4 w-4" />
                System
              </Button>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
            <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Preview</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
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
