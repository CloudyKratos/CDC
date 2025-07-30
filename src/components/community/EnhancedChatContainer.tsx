
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  channel_id: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

interface Channel {
  id: string;
  name: string;
  description?: string;
}

interface EnhancedChatContainerProps {
  defaultChannel?: string;
}

export const EnhancedChatContainer: React.FC<EnhancedChatContainerProps> = ({ 
  defaultChannel = 'general' 
}) => {
  const { user } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState<string>(defaultChannel);
  const [newMessage, setNewMessage] = useState('');

  // Fetch channels
  const { data: channels = [] } = useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Channel[];
    }
  });

  // Fetch messages for selected channel
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['messages', selectedChannel],
    queryFn: async () => {
      const channel = channels.find(c => c.name === selectedChannel);
      if (!channel) return [];

      const { data, error } = await supabase
        .from('community_messages')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('channel_id', channel.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!channels.find(c => c.name === selectedChannel)
  });

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const channel = channels.find(c => c.name === selectedChannel);
    if (!channel) return;

    try {
      const { error } = await supabase
        .from('community_messages')
        .insert({
          content: newMessage.trim(),
          sender_id: user.id,
          channel_id: channel.id
        });

      if (error) throw error;

      setNewMessage('');
      refetchMessages();
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center gap-3">
          <Hash className="h-6 w-6 text-purple-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">Community Chat</h2>
            <p className="text-purple-200 text-sm">Connect with fellow warriors</p>
          </div>
        </div>
      </div>

      <div className="flex h-full bg-slate-900/50 backdrop-blur-sm">
        {/* Channel Sidebar */}
        <div className="w-64 bg-black/30 border-r border-purple-800/30 p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Channels
          </h3>
          <div className="space-y-2">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel.name)}
                className={`w-full text-left p-2 rounded-lg transition-colors ${
                  selectedChannel === channel.name
                    ? 'bg-purple-600/50 text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                #{channel.name}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.profiles?.avatar_url} />
                  <AvatarFallback className="bg-purple-600 text-white text-xs">
                    {message.profiles?.full_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium text-sm">
                      {message.profiles?.full_name || 'Unknown User'}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{message.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 bg-black/20 border-t border-purple-800/30">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message #${selectedChannel}`}
                className="flex-1 bg-black/40 border-purple-800/50 text-white placeholder-gray-400"
              />
              <Button onClick={handleSendMessage} size="sm" className="bg-purple-600 hover:bg-purple-700">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
