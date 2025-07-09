
import React from 'react';
import { SimpleCommunityChat } from '@/components/community/modern/SimpleCommunityChat';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MessageSquare, Users, LogIn } from 'lucide-react';

const CommunityPage = () => {
  const { isAuthenticated, user } = useSimpleAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Join the Community
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sign in to participate in real-time discussions and connect with other community members.
          </p>
          <div className="space-y-3">
            <Link to="/simple-login" className="w-full">
              <Button className="w-full">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In to Join Chat
              </Button>
            </Link>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>Connect • Chat • Collaborate</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 h-screen">
      <div className="h-full max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Community Chat
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome {user?.email}! Connect with the community in real-time discussions.
          </p>
        </div>
        
        <div className="h-[calc(100vh-200px)]">
          <SimpleCommunityChat />
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
