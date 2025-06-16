
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import EnhancedCommunityChat from './EnhancedCommunityChat';
import CommunityChannelSelector from './CommunityChannelSelector';
import { MessageSquare, Users, Globe, Settings, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ImprovedCommunityPanelProps {
  defaultChannel?: string;
}

const ImprovedCommunityPanel: React.FC<ImprovedCommunityPanelProps> = ({
  defaultChannel = 'general'
}) => {
  const [activeChannel, setActiveChannel] = useState(defaultChannel);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());

  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update last activity
  useEffect(() => {
    const updateActivity = () => setLastActivity(new Date());
    
    window.addEventListener('focus', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('keypress', updateActivity);

    return () => {
      window.removeEventListener('focus', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keypress', updateActivity);
    };
  }, []);

  const handleChannelSelect = (channelId: string) => {
    setActiveChannel(channelId);
    toast.success(`Switched to #${channelId}`, { duration: 1000 });
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!user) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center p-8">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Join Our Community</h3>
          <p className="text-gray-600 mb-4">
            Connect with fellow warriors and share your journey. Sign in to get started!
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            Sign In to Join
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4">
      {/* Sidebar - Channels */}
      {!isMobile && (
        <Card className="w-80 flex-shrink-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Community Hub
              <Badge variant={isOnline ? "secondary" : "destructive"} className="ml-auto">
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CommunityChannelSelector
              activeChannel={activeChannel}
              onChannelSelect={handleChannelSelect}
            />
            
            {/* Quick Actions */}
            <div className="mt-6 pt-4 border-t">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Chat
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  disabled
                >
                  <Settings className="h-4 w-4" />
                  Settings (Soon)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col min-h-0">
        {isMobile && (
          <CardHeader className="pb-2">
            <Tabs value={activeChannel} onValueChange={setActiveChannel}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="announcements">News</TabsTrigger>
                <TabsTrigger value="entrepreneurs">Business</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
        )}
        
        <CardContent className="flex-1 flex flex-col p-0">
          <EnhancedCommunityChat channelName={activeChannel} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ImprovedCommunityPanel;
