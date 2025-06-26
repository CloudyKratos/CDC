
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

interface LearningVideo {
  id: string;
  title: string;
  description: string;
  videoId: string;
  duration: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  addedBy: string;
  addedAt: Date;
}

// Mock learning content for premium courses
export const mockLearningContent: LearningVideo[] = [
  {
    id: '1',
    title: 'Advanced React Patterns',
    description: 'Master advanced React patterns including render props, higher-order components, and compound components',
    videoId: 'dQw4w9WgXcQ',
    duration: '2h 30m',
    category: 'React',
    difficulty: 'advanced',
    tags: ['React', 'Patterns', 'Advanced'],
    addedBy: 'Expert Instructor',
    addedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    title: 'TypeScript Masterclass',
    description: 'Complete guide to TypeScript from basics to advanced features',
    videoId: 'dQw4w9WgXcQ',
    duration: '3h 15m',
    category: 'TypeScript',
    difficulty: 'intermediate',
    tags: ['TypeScript', 'JavaScript', 'Types'],
    addedBy: 'TypeScript Expert',
    addedAt: new Date('2024-01-10')
  },
  {
    id: '3',
    title: 'Node.js Performance Optimization',
    description: 'Learn how to optimize Node.js applications for maximum performance',
    videoId: 'dQw4w9WgXcQ',
    duration: '1h 45m',
    category: 'Node.js',
    difficulty: 'advanced',
    tags: ['Node.js', 'Performance', 'Backend'],
    addedBy: 'Backend Specialist',
    addedAt: new Date('2024-01-05')
  },
  {
    id: '4',
    title: 'CSS Grid & Flexbox Mastery',
    description: 'Master modern CSS layout techniques with Grid and Flexbox',
    videoId: 'dQw4w9WgXcQ',
    duration: '2h 00m',
    category: 'CSS',
    difficulty: 'beginner',
    tags: ['CSS', 'Layout', 'Grid', 'Flexbox'],
    addedBy: 'CSS Expert',
    addedAt: new Date('2024-01-20')
  },
  {
    id: '5',
    title: 'GraphQL API Development',
    description: 'Build powerful GraphQL APIs from scratch',
    videoId: 'dQw4w9WgXcQ',
    duration: '2h 45m',
    category: 'GraphQL',
    difficulty: 'intermediate',
    tags: ['GraphQL', 'API', 'Backend'],
    addedBy: 'API Specialist',
    addedAt: new Date('2024-01-12')
  }
];

// Removed all mock data - resources should be loaded from user input or backend
export const mockResources: Resource[] = [];

export const resourceTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'video', label: 'Video' },
  { value: 'article', label: 'Article' },
  { value: 'course', label: 'Course' },
  { value: 'tool', label: 'Tool' }
];

// Helper functions for data processing
export const filterResources = (resources: Resource[], searchTerm: string, typeFilter: string) => {
  return resources.filter(resource => {
    const matchesSearch = !searchTerm || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || resource.type === typeFilter;
    
    return matchesSearch && matchesType;
  });
};

export const sortResources = (resources: Resource[], sortBy: 'title' | 'rating' | 'views' | 'recent') => {
  return [...resources].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'rating':
        return b.rating - a.rating;
      case 'views':
        return b.views - a.views;
      case 'recent':
      default:
        return 0; // For 'recent', we'd need a created_at date
    }
  });
};
