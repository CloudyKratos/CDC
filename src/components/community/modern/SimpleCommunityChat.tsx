import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/auth/AuthContext';

interface SimpleCommunityChatProps {
  channelName?: string;
}

const SimpleCommunityChat: React.FC<SimpleCommunityChatProps> = ({ channelName = 'general' }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello world!',
      timestamp: '2023-11-18T12:00:00.000Z',
      sender: {
        id: '1',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.png',
      },
    },
    {
      id: '2',
      text: 'This is a simple chat component.',
      timestamp: '2023-11-18T12:01:00.000Z',
      sender: {
        id: '2',
        name: 'Jane Smith',
        avatar: 'https://example.com/avatar2.png',
      },
    },
  ]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>#{channelName}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <ScrollArea className="flex-1">
          <div>
            {messages.map((message) => (
              <div key={message.id} className="mb-2">
                <p className="text-sm font-bold">{message.sender.name}</p>
                <p className="text-sm">{message.text}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Type your message here..."
            className="w-full border rounded-md py-2 px-3"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleCommunityChat;
