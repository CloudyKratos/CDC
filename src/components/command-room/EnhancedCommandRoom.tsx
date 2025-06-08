
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import CommandRoomBackground from './CommandRoomBackground';
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

const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Advanced Trading Strategies',
    type: 'video',
    description: 'Master advanced trading techniques and risk management strategies used by professional traders.',
    author: 'Marcus Johnson',
    duration: '45 min',
    rating: 4.8,
    tags: ['Trading', 'Finance', 'Strategy'],
    url: 'https://example.com/video1',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300&h=200&fit=crop',
    isBookmarked: false,
    downloadCount: 2341,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Complete Leadership Masterclass',
    type: 'course',
    description: 'Transform your leadership skills with this comprehensive course covering all aspects of modern leadership.',
    author: 'Sarah Chen',
    duration: '8 hours',
    rating: 4.9,
    tags: ['Leadership', 'Management', 'Business'],
    url: 'https://example.com/course1',
    isBookmarked: true,
    downloadCount: 1567,
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    title: 'Digital Marketing Blueprint 2024',
    type: 'document',
    description: 'Essential strategies and tactics for digital marketing success in the current landscape.',
    author: 'Alex Rodriguez',
    rating: 4.6,
    tags: ['Marketing', 'Digital', 'Strategy'],
    url: 'https://example.com/doc1',
    isBookmarked: false,
    downloadCount: 3421,
    createdAt: '2024-01-08'
  },
  {
    id: '4',
    title: 'Mindfulness and Productivity',
    type: 'webinar',
    description: 'Learn how mindfulness practices can boost your productivity and reduce stress.',
    author: 'Dr. Emily Watson',
    duration: '60 min',
    rating: 4.7,
    tags: ['Mindfulness', 'Productivity', 'Wellness'],
    url: 'https://example.com/webinar1',
    isBookmarked: true,
    downloadCount: 987,
    createdAt: '2024-01-05'
  },
  {
    id: '5',
    title: 'Cryptocurrency Investment Guide',
    type: 'article',
    description: 'A comprehensive guide to understanding and investing in cryptocurrency markets.',
    author: 'John Smith',
    rating: 4.4,
    tags: ['Cryptocurrency', 'Investment', 'Finance'],
    url: 'https://example.com/article1',
    isBookmarked: false,
    downloadCount: 1789,
    createdAt: '2024-01-12'
  }
];

const EnhancedCommandRoom: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [resources, setResources] = useState<Resource[]>(mockResources);

  const resourceTypes = [
    { value: 'all', label: 'All Resources' },
    { value: 'video', label: 'Videos' },
    { value: 'course', label: 'Courses' },
    { value: 'document', label: 'Documents' },
    { value: 'webinar', label: 'Webinars' },
    { value: 'article', label: 'Articles' }
  ];

  const allTags = Array.from(new Set(mockResources.flatMap(r => r.tags)));

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    const matchesTag = selectedTag === 'all' || resource.tags.includes(selectedTag);
    
    return matchesSearch && matchesType && matchesTag;
  });

  const toggleBookmark = (resourceId: string) => {
    setResources(prev => prev.map(resource =>
      resource.id === resourceId
        ? { ...resource, isBookmarked: !resource.isBookmarked }
        : resource
    ));
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <CommandRoomBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Command Room</h1>
          <p className="text-xl text-white/80">Your learning and resource hub</p>
        </div>

        <Tabs defaultValue="resources" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="resources" className="text-white data-[state=active]:bg-white/20">Resources</TabsTrigger>
            <TabsTrigger value="bookmarks" className="text-white data-[state=active]:bg-white/20">Bookmarks</TabsTrigger>
            <TabsTrigger value="progress" className="text-white data-[state=active]:bg-white/20">Progress</TabsTrigger>
            <TabsTrigger value="upload" className="text-white data-[state=active]:bg-white/20">Upload</TabsTrigger>
          </TabsList>

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
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedCommandRoom;
