
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ServerListProps {
  activeServer?: string;
  onServerSelect: (serverId: string) => void;
}

const ServerList: React.FC<ServerListProps> = ({
  activeServer = 'main',
  onServerSelect
}) => {
  const servers = [
    { id: 'main', name: 'CDC Community', avatar: '📌' },
    { id: 'dev', name: 'Developers', avatar: '💻' },
    { id: 'design', name: 'Designers', avatar: '🎨' },
    { id: 'marketing', name: 'Marketing', avatar: '📢' },
    { id: 'events', name: 'Events', avatar: '📅' },
  ];
  
  return (
    <div className="w-18 bg-gray-950 flex flex-col items-center py-3 h-full">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-12 w-12 rounded-full mb-2 bg-primary text-white hover:bg-primary/90",
                activeServer === 'home' && "ring-2 ring-primary ring-offset-2 ring-offset-gray-950"
              )}
              onClick={() => onServerSelect('home')}
            >
              <span className="text-xl">🏠</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Home</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="w-10 h-0.5 bg-gray-800 my-2"></div>
      
      <ScrollArea className="flex-1 w-full">
        <div className="flex flex-col items-center space-y-2 px-3">
          {servers.map(server => (
            <TooltipProvider key={server.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    key={server.id}
                    variant={activeServer === server.id ? "default" : "ghost"}
                    size="icon"
                    className={cn(
                      "h-12 w-12 rounded-full relative",
                      activeServer === server.id 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-gray-700 hover:bg-gray-600",
                      activeServer === server.id && "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-8 before:bg-white before:rounded-r-full"
                    )}
                    onClick={() => onServerSelect(server.id)}
                  >
                    {server.id === 'main' ? (
                      <Avatar className="h-full w-full">
                        <AvatarImage src="/lovable-uploads/0fb72d4e-63d4-425a-aa88-376364dbb395.png" alt={server.name} />
                        <AvatarFallback>{server.avatar}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <span className="text-xl">{server.avatar}</span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{server.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                >
                  <PlusCircle size={24} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Add a Server</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ServerList;
