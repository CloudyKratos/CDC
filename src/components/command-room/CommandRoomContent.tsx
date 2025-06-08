
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from 'lucide-react';
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
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
            <CardContent className="py-12 text-center">
              <div className="text-slate-400 dark:text-slate-500 mb-2">
                <BookOpen className="w-12 h-12 mx-auto mb-4" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-medium mb-2">No resources found</p>
              <p className="text-slate-500 dark:text-slate-500 text-sm">Try adjusting your search criteria or browse different categories</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="bookmarks">
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Your Bookmarks</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
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
              <div className="text-center py-12">
                <div className="text-slate-400 dark:text-slate-500 mb-4">
                  <Bookmark className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-lg font-medium mb-2">No bookmarks yet</p>
                <p className="text-slate-500 dark:text-slate-500 text-sm">Start bookmarking resources to see them here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="progress">
        <div className="space-y-6">
          <CommandRoomStats />
          
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Learning Progress</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Track your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-slate-900 dark:text-white font-medium">Advanced Trading Strategies</h3>
                    <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">75% Complete</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full w-3/4 transition-all duration-300"></div>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-slate-900 dark:text-white font-medium">Leadership Masterclass</h3>
                    <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">30% Complete</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full w-1/3 transition-all duration-300"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="upload">
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Resource
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Share your knowledge with the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-12 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                <Upload className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 text-lg font-medium mb-2">Drag and drop your files here</p>
                <p className="text-slate-500 dark:text-slate-500 text-sm mb-4">or click to browse</p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Choose Files
                </Button>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-500 text-center">
                Supported formats: PDF, DOC, DOCX, MP4, MOV, JPG, PNG (Max 100MB)
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};

export default CommandRoomContent;
