
import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export const ThemeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(isDark);
  }, []);
  
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-morphism">
        <DropdownMenuItem 
          onClick={() => {
            toggleTheme();
            localStorage.setItem('colorTheme', 'blue');
            document.documentElement.className = isDarkMode ? 'dark theme-blue' : 'theme-blue';
          }}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <div className="w-4 h-4 rounded-full bg-blue-500" />
          <span>Blue</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => {
            toggleTheme();
            localStorage.setItem('colorTheme', 'purple');
            document.documentElement.className = isDarkMode ? 'dark theme-purple' : 'theme-purple';
          }}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <div className="w-4 h-4 rounded-full bg-purple-500" />
          <span>Purple</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => {
            toggleTheme();
            localStorage.setItem('colorTheme', 'green');
            document.documentElement.className = isDarkMode ? 'dark theme-green' : 'theme-green';
          }}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <span>Green</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => {
            toggleTheme();
            localStorage.setItem('colorTheme', 'orange');
            document.documentElement.className = isDarkMode ? 'dark theme-orange' : 'theme-orange';
          }}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <div className="w-4 h-4 rounded-full bg-orange-500" />
          <span>Orange</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
