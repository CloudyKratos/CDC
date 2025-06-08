
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Video, 
  FileText, 
  Search, 
  Filter, 
  Plus,
  Calendar,
  Clock,
  User,
  Star,
  Download,
  ExternalLink,
  Bookmark,
  Share2
} from 'lucide-react';
import { CommandRoomBackground } from './CommandRoomBackground';

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'course': return <BookOpen className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'webinar': return <Calendar className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'course': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'document': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'webinar': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
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
            {/* Search and Filters */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Find Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search resources..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="px-4 py-2 rounded-md bg-white/20 border-white/30 text-white"
                    >
                      {resourceTypes.map(type => (
                        <option key={type.value} value={type.value} className="text-black">
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value)}
                      className="px-4 py-2 rounded-md bg-white/20 border-white/30 text-white"
                    >
                      <option value="all" className="text-black">All Tags</option>
                      {allTags.map(tag => (
                        <option key={tag} value={tag} className="text-black">{tag}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resource Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge className={`${getTypeColor(resource.type)} flex items-center gap-1`}>
                        {getTypeIcon(resource.type)}
                        {resource.type}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBookmark(resource.id)}
                        className="text-white hover:bg-white/20"
                      >
                        <Bookmark className={`w-4 h-4 ${resource.isBookmarked ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                    <CardTitle className="text-white text-lg leading-tight">
                      {resource.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-white/80 text-sm">
                      {resource.description}
                    </CardDescription>
                    
                    <div className="flex items-center gap-4 text-sm text-white/70">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {resource.author}
                      </div>
                      {resource.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {resource.duration}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-white/80 text-sm">{resource.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-white/60 text-sm">
                        <Download className="w-3 h-3" />
                        {resource.downloadCount.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {resource.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs text-white/70 border-white/30">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Open
                      </Button>
                      <Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/20">
                        <Share2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.filter(r => r.isBookmarked).map((resource) => (
                    <div key={resource.id} className="p-4 rounded-lg bg-white/5 border border-white/20">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-medium">{resource.title}</h3>
                        <Badge className={getTypeColor(resource.type)}>
                          {resource.type}
                        </Badge>
                      </div>
                      <p className="text-white/70 text-sm mb-3">{resource.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">{resource.author}</span>
                        <Button size="sm" variant="outline" className="text-white border-white/30">
                          Open
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
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
