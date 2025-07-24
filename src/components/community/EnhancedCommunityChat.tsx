
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedChatContainer } from './EnhancedChatContainer';

interface EnhancedCommunityChatProps {
  defaultChannel?: string;
}

const EnhancedCommunityChat: React.FC<EnhancedCommunityChatProps> = ({
  defaultChannel = 'general'
}) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex items-center justify-center p-8">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sign in to join the chat
            </h3>
            <p className="text-gray-600">
              You need to be signed in to participate in community discussions.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full">
      <EnhancedChatContainer channelName={defaultChannel} />
    </div>
  );
};

export default EnhancedCommunityChat;
