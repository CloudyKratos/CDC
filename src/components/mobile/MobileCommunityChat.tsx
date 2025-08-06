import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Smile, 
  Paperclip, 
  MoreVertical,
  Heart,
  Reply,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MobileHeader from './MobileHeader';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  user: {
    name: string;
    avatar?: string;
    isOnline: boolean;
  };
  content: string;
  timestamp: Date;
  reactions?: { emoji: string; count: number; users: string[] }[];
  isOwn?: boolean;
}

const MobileCommunityChat: React.FC = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [activeChannel, setActiveChannel] = useState('general');
  const [showChannels, setShowChannels] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const channels = [
    { id: 'general', name: 'General', unread: 0 },
    { id: 'motivation', name: 'Motivation', unread: 3 },
    { id: 'workouts', name: 'Workouts', unread: 1 },
    { id: 'nutrition', name: 'Nutrition', unread: 0 },
    { id: 'wins', name: 'Daily Wins', unread: 5 }
  ];

  const messages: Message[] = [
    {
      id: '1',
      user: { name: 'Alex Chen', isOnline: true },
      content: 'Just finished my morning workout! 💪 6AM squad where you at?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      reactions: [
        { emoji: '💪', count: 4, users: ['mike', 'sarah', 'john', 'lisa'] },
        { emoji: '🔥', count: 2, users: ['tom', 'anna'] }
      ]
    },
    {
      id: '2',
      user: { name: 'Sarah Miller', isOnline: true },
      content: 'Love the energy! I\'m about to start mine. What\'s your routine looking like today?',
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
      isOwn: false
    },
    {
      id: '3',
      user: { name: 'You', isOnline: true },
      content: 'Starting with a 5k run then some strength training. The consistency is paying off!',
      timestamp: new Date(Date.now() - 1000 * 60 * 1),
      isOwn: true
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message
      setMessage('');
      inputRef.current?.focus();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background lg:hidden">
      <MobileHeader 
        title={`#${activeChannel}`}
        subtitle={`${channels.find(c => c.id === activeChannel)?.name} • 247 members`}
        showBack={true}
        backPath="/dashboard"
        actions={
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowChannels(!showChannels)}
            className="touch-target"
          >
            <ChevronDown className={cn(
              "h-5 w-5 transition-transform duration-200",
              showChannels && "rotate-180"
            )} />
          </Button>
        }
      />

      {/* Channel selector dropdown */}
      {showChannels && (
        <div className="mt-16 mx-4 mb-2 animate-mobile-slide-up">
          <Card className="p-2 border shadow-lg">
            {channels.map((channel) => (
              <Button
                key={channel.id}
                variant={activeChannel === channel.id ? "secondary" : "ghost"}
                className="w-full justify-between touch-target"
                onClick={() => {
                  setActiveChannel(channel.id);
                  setShowChannels(false);
                }}
              >
                <span className="font-medium">#{channel.name}</span>
                {channel.unread > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {channel.unread}
                  </Badge>
                )}
              </Button>
            ))}
          </Card>
        </div>
      )}

      {/* Messages area */}
      <div className={cn(
        "flex-1 overflow-y-auto scrollable-y px-4 space-y-4",
        showChannels ? "pt-2" : "pt-20"
      )}>
        {messages.map((msg) => (
          <div key={msg.id} className={cn(
            "flex gap-3 group",
            msg.isOwn && "flex-row-reverse"
          )}>
            {!msg.isOwn && (
              <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                <AvatarImage src={msg.user.avatar} />
                <AvatarFallback className="text-xs bg-primary/10">
                  {msg.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            
            <div className={cn(
              "flex-1 min-w-0 space-y-1",
              msg.isOwn && "text-right"
            )}>
              {!msg.isOwn && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {msg.user.name}
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs text-muted-foreground">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              )}
              
              <div className={cn(
                "inline-block max-w-[85%] p-3 rounded-2xl",
                msg.isOwn 
                  ? "bg-primary text-primary-foreground ml-auto" 
                  : "bg-muted"
              )}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>

              {msg.isOwn && (
                <div className="text-xs text-muted-foreground">
                  {formatTime(msg.timestamp)}
                </div>
              )}
              
              {/* Reactions */}
              {msg.reactions && msg.reactions.length > 0 && (
                <div className="flex gap-1 flex-wrap mt-2">
                  {msg.reactions.map((reaction, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs touch-feedback"
                    >
                      <span className="mr-1">{reaction.emoji}</span>
                      <span>{reaction.count}</span>
                    </Button>
                  ))}
                </div>
              )}
              
              {/* Message actions - shown on long press */}
              <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Heart className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Reply className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="mobile-container py-3 border-t bg-background">
        <div className="flex items-end gap-3">
          <Button variant="ghost" size="icon" className="touch-target mb-1">
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message #general..."
              className="pr-10 min-h-[44px] rounded-xl border-muted-foreground/20"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="touch-target mb-1 bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileCommunityChat;