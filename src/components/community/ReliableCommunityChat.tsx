
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth/AuthContext';

const ReliableCommunityChat: React.FC = () => {
  const { user } = useAuth();

  return (
    <Card className="h-full">
      <CardContent className="flex items-center justify-center h-full">
        <p>Reliable Community Chat - Under Development</p>
      </CardContent>
    </Card>
  );
};

export default ReliableCommunityChat;
