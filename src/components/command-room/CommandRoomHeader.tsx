
import React from 'react';
import { Button } from '@/components/ui/button';
import { GraduationCap, Plus, Youtube } from 'lucide-react';

interface CommandRoomHeaderProps {
  isAdmin?: boolean;
  onAddVideo?: () => void;
}

const CommandRoomHeader: React.FC<CommandRoomHeaderProps> = ({ isAdmin, onAddVideo }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Learning Command Room
            </h1>
            <p className="text-gray-300 text-sm">
              Track your progress and master new skills
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {isAdmin && (
            <Button 
              onClick={onAddVideo}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Youtube className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          )}
          <Button 
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Quick Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommandRoomHeader;
