
import React from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Card, CardContent } from '@/components/ui/card';

const ImprovedCommunityChat: React.FC = () => {
  const { user } = useAuth();

  return (
    <Card className="h-full">
      <CardContent className="flex items-center justify-center h-full">
        <p>Improved Community Chat - Under Development</p>
      </CardContent>
    </Card>
  );
};

export default ImprovedCommunityChat;
