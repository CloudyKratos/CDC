
import React from 'react';
import { SimpleCommunityChat } from '@/components/community/modern/SimpleCommunityChat';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MessageSquare, Users, LogIn } from 'lucide-react';

const CommunityPage = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Join the Community
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
            Sign in to participate in real-time discussions and connect with other community members.
          </p>
          <div className="space-y-3">
            <Link to="/login" className="w-full">
              <Button className="w-full touch-target-optimal">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In to Join Chat
              </Button>
            </Link>
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>Connect • Chat • Collaborate</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col mobile-safe-area-top mobile-safe-area-bottom">
      <div className="flex-1 overflow-hidden">
        <SimpleCommunityChat />
      </div>
    </div>
  );
};

export default CommunityPage;
