
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icons from '@/utils/IconUtils';

interface CommandRoomHeaderProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showCreateDialog: boolean;
  onCreateDialogChange: (open: boolean) => void;
  onCreateNew: (type: string) => void;
}

const CREATE_OPTIONS = [
  { id: 'youtube-video', name: 'Add YouTube Video', icon: <Icons.Video size={20} className="text-red-500" /> },
  { id: 'course', name: 'New Course', icon: <Icons.BookOpen size={20} className="text-purple-500" /> },
  { id: 'vault', name: 'Vault Item', icon: <Icons.FileText size={20} className="text-amber-500" /> },
  { id: 'replay', name: 'Upload Replay', icon: <Icons.Video size={20} className="text-blue-500" /> },
  { id: 'template', name: 'Create Template', icon: <Icons.LayoutDashboard size={20} className="text-green-500" /> },
];

const CommandRoomHeader: React.FC<CommandRoomHeaderProps> = ({
  searchQuery,
  onSearchChange,
  showCreateDialog,
  onCreateDialogChange,
  onCreateNew
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Command Room
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-light">
            Your growth sanctuary for deep learning and timeless knowledge
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Input 
              placeholder="Search your mental library..."
              className="pl-12 pr-4 h-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-purple-200/50 dark:border-purple-800/50 text-lg"
              value={searchQuery}
              onChange={onSearchChange}
            />
            <Icons.Search size={20} className="absolute top-1/2 transform -translate-y-1/2 left-4 text-gray-500" />
          </div>

          {/* Create Button */}
          <Dialog open={showCreateDialog} onOpenChange={onCreateDialogChange}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg">
                <Icons.Plus size={20} className="mr-2" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle className="text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Add to Your Sanctuary
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-3 pt-4">
                {CREATE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all duration-200 group border border-purple-200/30 dark:border-purple-800/30"
                    onClick={() => onCreateNew(option.id)}
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                      {option.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{option.name}</span>
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default CommandRoomHeader;
