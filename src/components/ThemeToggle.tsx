
import React, { useEffect, useState } from "react";
import { Moon, Sun, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const ThemeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [colorTheme, setColorTheme] = useState<string>("blue");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  const colorOptions = [
    { name: "Blue", value: "blue", color: "bg-gradient-to-r from-blue-400 to-blue-600" },
    { name: "Purple", value: "purple", color: "bg-gradient-to-r from-purple-400 to-purple-600" },
    { name: "Green", value: "green", color: "bg-gradient-to-r from-green-400 to-green-600" },
    { name: "Orange", value: "orange", color: "bg-gradient-to-r from-orange-400 to-orange-600" }
  ];
  
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    const savedColorTheme = localStorage.getItem('colorTheme') || 'blue';
    
    setIsDarkMode(isDark);
    setColorTheme(savedColorTheme);
    
    // Apply the saved theme
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Apply the saved color theme
    colorOptions.forEach(opt => {
      if (opt.value === savedColorTheme) {
        document.documentElement.className = isDark ? `dark theme-${opt.value}` : `theme-${opt.value}`;
      }
    });
  }, []);
  
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      toast({
        title: "Dark mode enabled",
        description: "Your eyes will thank you at night.",
        variant: "default",
      });
    } else {
      document.documentElement.classList.remove('dark');
      toast({
        title: "Light mode enabled",
        description: "Perfect for daytime usage.",
        variant: "default",
      });
    }
    
    // Reapply the color theme
    document.documentElement.className = newMode ? `dark theme-${colorTheme}` : `theme-${colorTheme}`;
  };
  
  const setThemeColor = (theme: string) => {
    setColorTheme(theme);
    localStorage.setItem('colorTheme', theme);
    document.documentElement.className = isDarkMode ? `dark theme-${theme}` : `theme-${theme}`;
    setIsOpen(false);
    
    toast({
      title: `${theme.charAt(0).toUpperCase() + theme.slice(1)} theme applied`,
      description: "Your color preferences have been updated.",
      variant: "default",
    });
  };
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-9 w-9 rounded-full overflow-hidden relative transition-all duration-300 hover:bg-primary/10",
                isOpen ? "bg-primary/10" : "",
                "animate-fade-in button-effect glass-morphism border-0"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Sun className={cn(
                "h-[1.2rem] w-[1.2rem] transition-all absolute", 
                isDarkMode ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
              )} />
              <Moon className={cn(
                "h-[1.2rem] w-[1.2rem] transition-all absolute",
                isDarkMode ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
              )} />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">Change appearance</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent 
        align="end" 
        className="glass-morphism border border-gray-100/40 dark:border-gray-800/40 p-2 animate-scale-in shadow-lg backdrop-blur-sm"
      >
        <div className="flex justify-between items-center mb-2 px-2">
          <div className="flex items-center gap-1.5">
            <Palette size={14} className="text-primary" />
            <span className="text-sm font-medium">Theme</span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-full button-effect hover:bg-primary/10"
                onClick={toggleTheme}
              >
                {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="text-xs">Toggle {isDarkMode ? "light" : "dark"} mode</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        <DropdownMenuSeparator className="my-1 bg-gray-200/50 dark:bg-gray-700/50" />
        
        <div className="grid grid-cols-2 gap-1 pt-1">
          {colorOptions.map((option) => (
            <DropdownMenuItem 
              key={option.value}
              onClick={() => setThemeColor(option.value)}
              className={cn(
                "flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 focus:bg-primary/10 button-effect hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors",
                colorTheme === option.value && "bg-primary/10"
              )}
            >
              <div className={cn("w-3 h-3 rounded-full", option.color)} />
              <span className="text-sm">{option.name}</span>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
