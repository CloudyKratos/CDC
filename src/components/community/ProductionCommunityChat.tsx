
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth/AuthContext';

const ProductionCommunityChat: React.FC = () => {
  const { user } = useAuth();

  return (
    <Card className="h-full">
      <CardContent className="flex items-center justify-center h-full">
        <p>Production Community Chat - Under Development</p>
      </CardContent>
    </Card>
  );
};

export default ProductionCommunityChat;
