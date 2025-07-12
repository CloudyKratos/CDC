import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth/AuthContext';

interface ActiveStageProps {
  stageId?: string;
  className?: string;
}

const ActiveStage: React.FC<ActiveStageProps> = ({
  stageId,
  className = ''
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stageData, setStageData] = useState<any>(null);

  useEffect(() => {
    // Initialize stage data
    const initializeStage = async () => {
      try {
        setIsLoading(true);
        // TODO: Implement stage initialization logic
        console.log('Initializing stage:', stageId);
        
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStageData({
          id: stageId || 'default',
          name: 'Active Stage',
          participants: [],
          isActive: true
        });
      } catch (error) {
        console.error('Failed to initialize stage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeStage();
  }, [stageId]);

  if (!user) {
    return (
      <Card className={`h-full ${className}`}>
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to join the stage
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={`h-full ${className}`}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading stage...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-full ${className}`}>
      <CardHeader>
        <CardTitle>Active Stage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{stageData?.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Stage ID: {stageData?.id}
            </p>
          </div>
          
          <div>
            <p className="text-sm">
              Status: {stageData?.isActive ? 'Active' : 'Inactive'}
            </p>
            <p className="text-sm">
              Participants: {stageData?.participants?.length || 0}
            </p>
          </div>

          <div className="text-center text-gray-500 dark:text-gray-400">
            <p>Stage functionality is under development</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveStage;
