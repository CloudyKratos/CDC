
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hash, Users, Megaphone, HelpCircle, MessageSquare, Lightbulb } from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  isActive?: boolean;
}

interface CommunityChannelSelectorProps {
  activeChannel: string;
  onChannelSelect: (channelId: string) => void;
}

const CommunityChannelSelector: React.FC<CommunityChannelSelectorProps> = ({
  activeChannel,
  onChannelSelect
}) => {
  const channels: Channel[] = [
    {
      id: 'general',
      name: 'general',
      description: 'General discussion and community chat',
      icon: Hash,
      color: 'bg-blue-500'
    },
    {
      id: 'announcements',
      name: 'announcements',
      description: 'Important updates and news',
      icon: Megaphone,
      color: 'bg-purple-500'
    },
    {
      id: 'entrepreneurs',
      name: 'entrepreneurs',
      description: 'Business and entrepreneurship discussions',
      icon: Lightbulb,
      color: 'bg-green-500'
    },
    {
      id: 'support',
      name: 'support',
      description: 'Get help and support from the community',
      icon: HelpCircle,
      color: 'bg-orange-500'
    },
    {
      id: 'random',
      name: 'random',
      description: 'Off-topic conversations and fun',
      icon: MessageSquare,
      color: 'bg-pink-500'
    }
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-3 py-2">
        <Users className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Community Channels
        </span>
      </div>
      
      {channels.map((channel) => {
        const IconComponent = channel.icon;
        const isActive = activeChannel === channel.id;
        
        return (
          <Button
            key={channel.id}
            variant={isActive ? "secondary" : "ghost"}
            className={`w-full justify-start gap-3 h-auto p-3 ${
              isActive ? 'bg-primary/10 border-primary/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            onClick={() => onChannelSelect(channel.id)}
          >
            <div className={`w-2 h-2 rounded-full ${channel.color}`} />
            <IconComponent className="h-4 w-4" />
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="font-medium">#{channel.name}</span>
                {isActive && <Badge variant="secondary" className="text-xs">Active</Badge>}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {channel.description}
              </p>
            </div>
          </Button>
        );
      })}
    </div>
  );
};

export default CommunityChannelSelector;
