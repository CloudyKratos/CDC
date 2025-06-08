
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import CommandRoomFilters from './CommandRoomFilters';
import CommandRoomResourceCard from './CommandRoomResourceCard';
import CommandRoomStats from './CommandRoomStats';

interface Resource {
  id: string;
  title: string;
  type: 'video' | 'document' | 'course' | 'webinar' | 'article';
  description: string;
  author: string;
  duration?: string;
  rating: number;
  tags: string[];
  url: string;
  thumbnail?: string;
  isBookmarked: boolean;
  downloadCount: number;
  createdAt: string;
}

interface CommandRoomContentProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  filteredResources: Resource[];
  resources: Resource[];
  toggleBookmark: (id: string) => void;
  resourceTypes: { value: string; label: string }[];
  allTags: string[];
}

const CommandRoomContent: React.FC<CommandRoomContentProps> = ({
  searchTerm,
  setSearchTerm,
  selectedType,
  setSelectedType,
  selectedTag,
  setSelectedTag,
  filteredResources,
  resources,
  toggleBookmark,
  resourceTypes,
  allTags
}) => {
  return (
    <>
      <TabsContent value="resources" className="space-y-6">
        <CommandRoomFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedTag={selectedTag}
          onTagChange={setSelectedTag}
          resourceTypes={resourceTypes}
          allTags={allTags}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <CommandRoomResourceCard
              key={resource.id}
              resource={resource}
              onToggleBookmark={toggleBookmark}
            />
          ))}
        </div>

        {filteredResources.length === 0 && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="py-8 text-center">
              <p className="text-white/80">No resources found matching your criteria.</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="bookmarks">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Your Bookmarks</CardTitle>
            <CardDescription className="text-white/80">
              Resources you've saved for later
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.filter(r => r.isBookmarked).map((resource) => (
                <CommandRoomResourceCard
                  key={resource.id}
                  resource={resource}
                  onToggleBookmark={toggleBookmark}
                />
              ))}
            </div>
            {resources.filter(r => r.isBookmarked).length === 0 && (
              <div className="text-center py-8">
                <p className="text-white/80">No bookmarked resources yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="progress">
        <div className="space-y-6">
          <CommandRoomStats />
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Learning Progress</CardTitle>
              <CardDescription className="text-white/80">
                Track your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">Advanced Trading Strategies</h3>
                    <span className="text-white/80 text-sm">75% Complete</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">Leadership Masterclass</h3>
                    <span className="text-white/80 text-sm">30% Complete</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-1/3"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="upload">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Upload Resource</CardTitle>
            <CardDescription className="text-white/80">
              Share your knowledge with the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center">
                <Plus className="w-12 h-12 text-white/60 mx-auto mb-4" />
                <p className="text-white/80 mb-2">Drag and drop your files here</p>
                <p className="text-white/60 text-sm">or click to browse</p>
                <Button className="mt-4" variant="outline">
                  Choose Files
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};

export default CommandRoomContent;
