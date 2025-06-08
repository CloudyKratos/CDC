
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import CommandRoomFilters from './CommandRoomFilters';
import ResourceCard from './ResourceCard';
import { BookmarksEmptyState, UploadArea } from './EmptyStates';
import { LearningStreak, WeeklyProgress } from './ProgressMetrics';
import { mockResources, resourceTypes } from './mockData';

const CommandRoomContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');

  const allTags = Array.from(new Set(mockResources.flatMap(resource => resource.tags)));

  const filteredResources = mockResources.filter(resource => {
    const searchRegex = new RegExp(searchTerm, 'i');
    const typeMatch = selectedType === 'all' || resource.type === selectedType;
    const tagMatch = selectedTag === 'all' || resource.tags.includes(selectedTag);

    return searchRegex.test(resource.title) && typeMatch && tagMatch;
  });

  return (
    <>
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

      <TabsContent value="resources" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="bookmarks" className="space-y-6">
        <BookmarksEmptyState />
      </TabsContent>

      <TabsContent value="progress" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <LearningStreak />
          <WeeklyProgress />
        </div>
      </TabsContent>

      <TabsContent value="upload" className="space-y-6">
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Upload Resource</CardTitle>
          </CardHeader>
          <UploadArea />
        </Card>
      </TabsContent>
    </>
  );
};

export default CommandRoomContent;
