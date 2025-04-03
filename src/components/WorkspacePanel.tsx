
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, FolderPlus, Upload, Star, Users, PlusCircle } from 'lucide-react';

const WorkspacePanel = () => {
  return (
    <div className="p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Workspace</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <FolderPlus size={16} />
            <span className="hidden sm:inline">New Folder</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Upload size={16} />
            <span className="hidden sm:inline">Upload</span>
          </Button>
          <Button size="sm" className="flex items-center gap-1">
            <PlusCircle size={16} />
            <span className="hidden sm:inline">Create</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="recent" className="w-full">
        <TabsList>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="space-y-4 mt-4">
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded">
                      <FileText size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium truncate">Project Document {i + 1}</h3>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Star size={16} className="text-gray-400" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 truncate">Last edited 2 days ago</p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Users size={14} className="mr-1" />
                        <span>You and 2 others</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="favorites" className="space-y-4 mt-4">
          <p className="text-center text-gray-500 py-8">No favorites yet</p>
        </TabsContent>
        <TabsContent value="shared" className="space-y-4 mt-4">
          <p className="text-center text-gray-500 py-8">No shared documents</p>
        </TabsContent>
        <TabsContent value="templates" className="space-y-4 mt-4">
          <p className="text-center text-gray-500 py-8">No templates available</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkspacePanel;
