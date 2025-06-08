
import React, { useState } from 'react';
import { Tabs } from "@/components/ui/tabs";
import CommandRoomBackground from './CommandRoomBackground';
import CommandRoomHeader from './CommandRoomHeader';
import CommandRoomTabs from './CommandRoomTabs';
import CommandRoomContent from './CommandRoomContent';

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
    <div className="relative min-h-screen">
      <CommandRoomBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <CommandRoomHeader />

        <Tabs defaultValue="resources" className="space-y-6">
          <CommandRoomTabs />
          <CommandRoomContent
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
            filteredResources={filteredResources}
            resources={resources}
            toggleBookmark={toggleBookmark}
            resourceTypes={resourceTypes}
            allTags={allTags}
          />
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedCommandRoom;
