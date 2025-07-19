
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CommandRoomHeader from './CommandRoomHeader';
import { VideoLibrary } from './VideoLibrary';
import { AddVideoModal } from './AddVideoModal';
import SettingsPanel from './panels/SettingsPanel';
import { Video, Settings, BookOpen, TrendingUp } from 'lucide-react';

interface CommandRoomTabsProps {
  isAdmin?: boolean;
}

const CommandRoomTabs: React.FC<CommandRoomTabsProps> = ({ isAdmin }) => {
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);

  const handleAddVideo = () => {
    setShowAddVideoModal(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Command Room Header with Daily Quote */}
      <div className="flex-shrink-0 p-6 pb-0">
        <CommandRoomHeader 
          isAdmin={isAdmin} 
          onAddVideo={handleAddVideo}
        />
      </div>

      {/* Tabs Content */}
      <div className="flex-1 p-6 pt-4">
        <Tabs defaultValue="library" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="library" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Library
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Learning
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="library" className="h-full">
              <VideoLibrary isAdmin={isAdmin} />
            </TabsContent>
            
            <TabsContent value="learning" className="h-full">
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Learning modules coming soon...</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="progress" className="h-full">
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Progress tracking coming soon...</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="h-full">
              <SettingsPanel />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Add Video Modal */}
      {showAddVideoModal && (
        <AddVideoModal
          isOpen={showAddVideoModal}
          onClose={() => setShowAddVideoModal(false)}
        />
      )}
    </div>
  );
};

export default CommandRoomTabs;
