
import React from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users } from 'lucide-react';

const DiscordCommunityPanel: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Please sign in to access the community</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Discord Community
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>Discord integration coming soon...</p>
      </CardContent>
    </Card>
  );
};

export default DiscordCommunityPanel;
