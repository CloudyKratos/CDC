import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Bookmark, 
  TrendingUp, 
  Upload, 
  Play, 
  Clock, 
  User, 
  ExternalLink,
  Star,
  Download,
  Eye
} from 'lucide-react';
import CommandRoomFilters from './CommandRoomFilters';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'course' | 'tool';
  author: string;
  tags: string[];
  duration: string;
  views: number;
  rating: number;
  url: string;
}

const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Mastering React Hooks',
    description: 'Learn how to use React hooks to manage state and side effects in your functional components.',
    type: 'video',
    author: 'John Doe',
    tags: ['react', 'hooks', 'javascript'],
    duration: '2 hours',
    views: 1234,
    rating: 4.5,
    url: 'https://example.com/react-hooks'
  },
  {
    id: '2',
    title: 'The Ultimate Guide to CSS Grid',
    description: 'A comprehensive guide to CSS Grid, covering everything from basic concepts to advanced techniques.',
    type: 'article',
    author: 'Jane Smith',
    tags: ['css', 'grid', 'layout'],
    duration: '15 minutes',
    views: 5678,
    rating: 4.8,
    url: 'https://example.com/css-grid'
  },
  {
    id: '3',
    title: 'Node.js for Beginners',
    description: 'Get started with Node.js and learn how to build server-side applications with JavaScript.',
    type: 'course',
    author: 'David Johnson',
    tags: ['node.js', 'javascript', 'backend'],
    duration: '4 hours',
    views: 9012,
    rating: 4.2,
    url: 'https://example.com/node-js'
  },
  {
    id: '4',
    title: 'Figma for UI Design',
    description: 'Learn how to use Figma to create beautiful and functional user interfaces.',
    type: 'tool',
    author: 'Emily Brown',
    tags: ['figma', 'ui', 'design'],
    duration: '30 minutes',
    views: 3456,
    rating: 4.7,
    url: 'https://example.com/figma'
  },
  {
    id: '5',
    title: 'Vue.js Crash Course',
    description: 'A quick and easy introduction to Vue.js, the progressive JavaScript framework.',
    type: 'video',
    author: 'Michael Green',
    tags: ['vue.js', 'javascript', 'frontend'],
    duration: '1.5 hours',
    views: 6789,
    rating: 4.6,
    url: 'https://example.com/vue-js'
  },
  {
    id: '6',
    title: 'JavaScript Design Patterns',
    description: 'Explore common design patterns in JavaScript and learn how to apply them to your projects.',
    type: 'article',
    author: 'Sarah White',
    tags: ['javascript', 'design patterns', 'programming'],
    duration: '20 minutes',
    views: 2345,
    rating: 4.9,
    url: 'https://example.com/javascript-patterns'
  },
  {
    id: '7',
    title: 'React Native Mobile Development',
    description: 'Build native mobile apps with JavaScript and React Native.',
    type: 'course',
    author: 'Robert Black',
    tags: ['react native', 'mobile', 'javascript'],
    duration: '6 hours',
    views: 7890,
    rating: 4.3,
    url: 'https://example.com/react-native'
  },
  {
    id: '8',
    title: 'Sketch for UX Design',
    description: 'Learn how to use Sketch to create user-centered designs.',
    type: 'tool',
    author: 'Jessica Gray',
    tags: ['sketch', 'ux', 'design'],
    duration: '45 minutes',
    views: 4567,
    rating: 4.4,
    url: 'https://example.com/sketch'
  }
];

const CommandRoomContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');

  const resourceTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'video', label: 'Video' },
    { value: 'article', label: 'Article' },
    { value: 'course', label: 'Course' },
    { value: 'tool', label: 'Tool' }
  ];

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
            <Card key={resource.id} className="group hover:shadow-lg transition-all duration-200 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${resource.type === 'video' ? 'bg-red-100 dark:bg-red-900/20 text-red-600' : 
                      resource.type === 'article' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600' :
                      resource.type === 'course' ? 'bg-green-100 dark:bg-green-900/20 text-green-600' :
                      'bg-purple-100 dark:bg-purple-900/20 text-purple-600'}`}>
                      {resource.type === 'video' ? <Play className="w-4 h-4" /> :
                       resource.type === 'article' ? <BookOpen className="w-4 h-4" /> :
                       resource.type === 'course' ? <BookOpen className="w-4 h-4" /> :
                       <Upload className="w-4 h-4" />}
                    </div>
                    <div>
                      <CardTitle className="text-base leading-tight text-slate-900 dark:text-white">
                        {resource.title}
                      </CardTitle>
                      <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                        <User className="w-3 h-3" />
                        {resource.author}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                  {resource.description}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {resource.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {resource.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {resource.views} views
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{resource.rating}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1">
                    <Play className="w-3 h-3 mr-1" />
                    {resource.type === 'video' ? 'Watch' : 'Read'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="bookmarks" className="space-y-6">
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bookmark className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Bookmarks Yet</h3>
            <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
              Start bookmarking resources you want to revisit later. Click the bookmark icon on any resource card.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="progress" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Learning Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">15 Days</div>
                <p className="text-slate-600 dark:text-slate-400">Keep it up!</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Completed This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">8</div>
                <p className="text-slate-600 dark:text-slate-400">Resources completed</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="upload" className="space-y-6">
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Upload Resource</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Upload Your Resource
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Share valuable content with the community
              </p>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};

export default CommandRoomContent;
