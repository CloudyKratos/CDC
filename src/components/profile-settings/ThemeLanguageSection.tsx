
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Sun, 
  Moon, 
  Monitor, 
  Palette,
  Globe,
  Check
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const ThemeLanguageSection: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);

  const themeOptions = [
    {
      value: 'light',
      label: 'Light',
      description: 'Clean and bright interface',
      icon: Sun
    },
    {
      value: 'dark',
      label: 'Dark',
      description: 'Easy on the eyes in low light',
      icon: Moon
    },
    {
      value: 'system',
      label: 'System',
      description: 'Match your device preference',
      icon: Monitor
    }
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Integrate with Supabase to save user preferences
      // await supabase.from('user_preferences').upsert({
      //   user_id: user.id,
      //   theme: theme,
      //   language: language
      // });
      console.log('Saving theme and language preferences:', { theme, language });
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Appearance & Language</h2>
        <p className="text-muted-foreground">Customize how the platform looks and feels.</p>
      </div>

      {/* Theme Selection */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Palette className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Theme Preference</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.value;
            
            return (
              <div
                key={option.value}
                className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50 ${
                  isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border/50 hover:bg-muted/30'
                }`}
                onClick={() => setTheme(option.value)}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`p-3 rounded-full ${
                    isSelected ? 'bg-primary/20' : 'bg-muted/50'
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      isSelected ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  
                  <div>
                    <Label className="font-medium text-foreground cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Theme Preview */}
        <div className="p-6 rounded-lg border border-border/50 bg-gradient-to-r from-muted/20 to-muted/10">
          <h4 className="font-medium text-foreground mb-4">Preview</h4>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <div className="h-4 w-4 rounded-full bg-primary"></div>
              <div className="h-4 w-4 rounded-full bg-secondary"></div>
              <div className="h-4 w-4 rounded-full bg-accent"></div>
              <div className="h-4 w-4 rounded-full bg-muted"></div>
            </div>
            <p className="text-sm text-muted-foreground">
              Color palette with current theme
            </p>
          </div>
        </div>
      </Card>

      {/* Language Selection */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Language</h3>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose your preferred language for the interface.
          </p>
          
          <div className="max-w-sm">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Language changes will take effect after refreshing the page. 
              Some content may still appear in English as we continue to add translations.
            </p>
          </div>
        </div>
      </Card>

      {/* Additional Customization */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Palette className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Advanced Customization</h3>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            More customization options coming soon! We're working on additional themes, 
            font size controls, and accessibility features.
          </p>
          
          <div className="p-4 rounded-lg border border-border/50 bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Custom Themes</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Create and save your own color schemes
                </p>
              </div>
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end pt-6">
        <Button 
          onClick={handleSave}
          disabled={isLoading}
          className="px-8"
        >
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
};
