
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth/AuthContext';

interface StableCommunityPanelProps {
  defaultChannel?: string;
}

const StableCommunityPanel: React.FC<StableCommunityPanelProps> = ({ 
  defaultChannel = 'general' 
}) => {
  const { user } = useAuth();

  return (
    <Card className="h-full">
      <CardContent className="flex items-center justify-center h-full">
        <p>Stable Community Panel - Channel: {defaultChannel}</p>
      </CardContent>
    </Card>
  );
};

export default StableCommunityPanel;
