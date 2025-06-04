
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

interface StageLoadingProps {
  onLeave: () => void;
}

const StageLoading: React.FC<StageLoadingProps> = ({ onLeave }) => {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center gap-2 p-4 border-b">
        <Button variant="ghost" size="sm" onClick={onLeave} disabled>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="flex-1 p-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StageLoading;
