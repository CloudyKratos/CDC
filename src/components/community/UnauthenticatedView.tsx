
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Sparkles, ArrowRight, Shield, Zap } from 'lucide-react';

const UnauthenticatedView: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full p-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950">
      <Card className="max-w-md w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-2xl">
        <CardContent className="p-8 text-center">
          {/* Hero Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <MessageSquare className="h-10 w-10 text-white" />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Join the Community
          </h3>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Connect with fellow community members, share ideas, and participate in real-time discussions.
          </p>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Real-time Chat</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Instant messaging with live updates</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Active Community</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Connect with like-minded people</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Safe & Secure</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Moderated and protected environment</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Button 
            onClick={() => {
              // This will trigger the auth flow
              window.location.href = '/login';
            }}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 group"
          >
            <span>Sign In to Join Chat</span>
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-6">
            <Sparkles className="h-4 w-4" />
            <span>Connect • Chat • Collaborate</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnauthenticatedView;
