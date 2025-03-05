
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

export const ThemeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [colorTheme, setColorTheme] = useState<string>("blue");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  const colorOptions = [
    { name: "Blue", value: "blue", color: "bg-blue-500" },
    { name: "Purple", value: "purple", color: "bg-purple-500" },
    { name: "Green", value: "green", color: "bg-green-500" },
    { name: "Orange", value: "orange", color: "bg-orange-500" }
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
      <DropdownMenuContent 
        align="end" 
        className="glass-morphism border border-gray-100 dark:border-gray-800 p-2 animate-scale-in"
      >
        <div className="flex justify-between items-center mb-2 px-2">
          <div className="flex items-center gap-1.5">
            <Palette size={14} />
            <span className="text-sm font-medium">Theme</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-full button-effect"
            onClick={toggleTheme}
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
          </Button>
        </div>
        
        <DropdownMenuSeparator className="my-1" />
        
        <div className="grid grid-cols-2 gap-1 pt-1">
          {colorOptions.map((option) => (
            <DropdownMenuItem 
              key={option.value}
              onClick={() => setThemeColor(option.value)}
              className={cn(
                "flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 focus:bg-primary/10 button-effect",
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
