
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Vault, Plus, Youtube, BookOpen, TrendingUp } from 'lucide-react';

interface CommandRoomHeaderProps {
  isAdmin?: boolean;
  onAddVideo?: () => void;
}

const CommandRoomHeader: React.FC<CommandRoomHeaderProps> = ({ isAdmin, onAddVideo }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-sm">
            <Vault className="h-7 w-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Value from the Vault
              </h1>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                Learning Hub
              </Badge>
            </div>
            <p className="text-gray-600 text-sm">
              Unlock knowledge and accelerate your growth journey
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button 
              onClick={onAddVideo}
              className="bg-red-500 hover:bg-red-600 text-white shadow-sm"
              size="sm"
            >
              <Youtube className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          )}
          <Button 
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Quick Add
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm">
          <BookOpen className="h-4 w-4 text-blue-500" />
          <span className="text-gray-600">Knowledge Base</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span className="text-gray-600">Progress Tracking</span>
        </div>
      </div>
    </div>
  );
};

export default CommandRoomHeader;
