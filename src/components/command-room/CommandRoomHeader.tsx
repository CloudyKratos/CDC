
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Vault, Plus, Youtube, BookOpen, TrendingUp, Sparkles } from 'lucide-react';

interface CommandRoomHeaderProps {
  isAdmin?: boolean;
  onAddVideo?: () => void;
}

const CommandRoomHeader: React.FC<CommandRoomHeaderProps> = ({ isAdmin, onAddVideo }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Vault className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 p-1 bg-yellow-400 rounded-full">
              <Sparkles className="h-3 w-3 text-yellow-800" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Value from the Vault
              </h1>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-medium">
                Learning Hub
              </Badge>
            </div>
            <p className="text-gray-600 text-base">
              Unlock premium knowledge and accelerate your growth journey
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button 
              onClick={onAddVideo}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md transition-all duration-200"
              size="default"
            >
              <Youtube className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          )}
          <Button 
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm transition-all duration-200"
            size="default"
          >
            <Plus className="h-4 w-4 mr-2" />
            Quick Add
          </Button>
        </div>
      </div>

      {/* Enhanced Quick Stats */}
      <div className="flex flex-wrap items-center gap-8 mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-3 text-sm">
          <div className="p-2 bg-blue-50 rounded-lg">
            <BookOpen className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Knowledge Base</div>
            <div className="text-gray-500 text-xs">Curated content</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="p-2 bg-green-50 rounded-lg">
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Progress Tracking</div>
            <div className="text-gray-500 text-xs">Real-time updates</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandRoomHeader;
