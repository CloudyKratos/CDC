import React from 'react';
import { MessageCircle, Users, Hash, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatWelcomeScreenProps {
  activeChannel: string;
  onStartChatting?: () => void;
  className?: string;
}

export const ChatWelcomeScreen: React.FC<ChatWelcomeScreenProps> = ({
  activeChannel,
  onStartChatting,
  className
}) => {
  const getChannelIcon = (channelName: string) => {
    switch (channelName) {
      case 'announcement':
        return '📢';
      case 'general':
        return '💬';
      case 'morning journey':
        return '🌅';
      case 'random':
        return '🎲';
      default:
        return '📝';
    }
  };

  const getChannelDescription = (channelName: string) => {
    switch (channelName) {
      case 'announcement':
        return 'Stay updated with the latest news and important information from the community team.';
      case 'general':
        return 'The heart of our community! Share ideas, ask questions, and connect with fellow members.';
      case 'morning journey':
        return 'Start your day right! Share your morning routines, goals, and motivational thoughts.';
      case 'random':
        return 'Off-topic fun! Share memes, interesting links, and have casual conversations.';
      default:
        return 'Welcome to this community channel! Connect and share with other members.';
    }
  };

  return (
    <div className={cn(
      "h-full flex flex-col items-center justify-center p-8 text-center",
      "bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-purple-50/80",
      "dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20",
      className
    )}>
      {/* Channel Icon */}
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-blue-900/20 rounded-full flex items-center justify-center shadow-2xl border border-blue-100 dark:border-blue-800/30">
          <span className="text-5xl">{getChannelIcon(activeChannel)}</span>
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      </div>

      {/* Welcome Content */}
      <div className="max-w-md space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
            <Hash className="h-5 w-5" />
            <h2 className="text-2xl font-bold capitalize">{activeChannel}</h2>
          </div>
          
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {getChannelDescription(activeChannel)}
          </p>
        </div>

        {/* Community Stats */}
        <div className="flex items-center justify-center gap-6 py-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">Community Active</span>
          </div>
          <div className="flex items-center gap-2 text-green-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Online</span>
          </div>
        </div>

        {/* Call to Action */}
        <div className="space-y-4">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Ready to join the conversation?
          </p>
          
          {onStartChatting && (
            <Button 
              onClick={onStartChatting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Start Chatting
            </Button>
          )}
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-3 h-3 bg-blue-400/30 rounded-full animate-pulse" />
      <div className="absolute top-32 right-16 w-2 h-2 bg-purple-400/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-24 left-12 w-4 h-4 bg-indigo-400/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-40 right-20 w-3 h-3 bg-pink-400/30 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
    </div>
  );
};