
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
  category: 'Mindset' | 'Metapreneur' | 'Business Wiz' | 'Inner Circles' | "Warrior's Training";
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  addedBy: string;
  addedAt: Date;
  moduleCount?: number;
  estimatedHours?: number;
}

// Mock learning content organized by your 5 categories
export const mockLearningContent: LearningVideo[] = [
  // Mindset Category
  {
    id: '1',
    title: 'Mental Mastery Foundation',
    description: 'Build unbreakable mental strength and develop the mindset of champions',
    videoId: 'dQw4w9WgXcQ',
    duration: '3h 45m',
    category: 'Mindset',
    difficulty: 'beginner',
    tags: ['Psychology', 'Mental Strength', 'Foundation'],
    addedBy: 'Dr. Mindset Expert',
    addedAt: new Date('2024-01-15'),
    moduleCount: 8,
    estimatedHours: 4
  },
  {
    id: '2',
    title: 'Peak Performance Psychology',
    description: 'Advanced psychological techniques for achieving peak performance in any area',
    videoId: 'dQw4w9WgXcQ',
    duration: '2h 30m',
    category: 'Mindset',
    difficulty: 'advanced',
    tags: ['Peak Performance', 'Psychology', 'Advanced'],
    addedBy: 'Performance Coach',
    addedAt: new Date('2024-01-10'),
    moduleCount: 6,
    estimatedHours: 3
  },

  // Metapreneur Category
  {
    id: '3',
    title: 'Digital Empire Building',
    description: 'Master the art of building scalable digital businesses in the modern economy',
    videoId: 'dQw4w9WgXcQ',
    duration: '4h 15m',
    category: 'Metapreneur',
    difficulty: 'intermediate',
    tags: ['Digital Business', 'Scaling', 'Modern Economy'],
    addedBy: 'Digital Entrepreneur',
    addedAt: new Date('2024-01-05'),
    moduleCount: 10,
    estimatedHours: 5
  },
  {
    id: '4',
    title: 'Meta Business Strategies',
    description: 'Advanced strategies for navigating the new business landscape',
    videoId: 'dQw4w9WgXcQ',
    duration: '3h 20m',
    category: 'Metapreneur',
    difficulty: 'advanced',
    tags: ['Strategy', 'Innovation', 'Future Business'],
    addedBy: 'Strategy Expert',
    addedAt: new Date('2024-01-20'),
    moduleCount: 8,
    estimatedHours: 4
  },

  // Business Wiz Category
  {
    id: '5',
    title: 'Financial Intelligence Mastery',
    description: 'Comprehensive guide to financial literacy and wealth building',
    videoId: 'dQw4w9WgXcQ',
    duration: '5h 00m',
    category: 'Business Wiz',
    difficulty: 'intermediate',
    tags: ['Finance', 'Wealth Building', 'Intelligence'],
    addedBy: 'Financial Expert',
    addedAt: new Date('2024-01-12'),
    moduleCount: 12,
    estimatedHours: 6
  },
  {
    id: '6',
    title: 'Market Domination Tactics',
    description: 'Advanced business tactics for market leadership and competitive advantage',
    videoId: 'dQw4w9WgXcQ',
    duration: '3h 45m',
    category: 'Business Wiz',
    difficulty: 'advanced',
    tags: ['Market Strategy', 'Competition', 'Leadership'],
    addedBy: 'Business Strategist',
    addedAt: new Date('2024-01-08'),
    moduleCount: 9,
    estimatedHours: 4
  },

  // Inner Circles Category
  {
    id: '7',
    title: 'Elite Network Building',
    description: 'How to build and leverage high-value professional networks',
    videoId: 'dQw4w9WgXcQ',
    duration: '2h 30m',
    category: 'Inner Circles',
    difficulty: 'intermediate',
    tags: ['Networking', 'Relationships', 'Elite Circles'],
    addedBy: 'Network Expert',
    addedAt: new Date('2024-01-18'),
    moduleCount: 6,
    estimatedHours: 3
  },
  {
    id: '8',
    title: 'Influence & Persuasion Mastery',
    description: 'Master the subtle art of influence and persuasion in professional circles',
    videoId: 'dQw4w9WgXcQ',
    duration: '3h 15m',
    category: 'Inner Circles',
    difficulty: 'advanced',
    tags: ['Influence', 'Persuasion', 'Social Skills'],
    addedBy: 'Influence Coach',
    addedAt: new Date('2024-01-14'),
    moduleCount: 8,
    estimatedHours: 4
  },

  // Warrior's Training Category
  {
    id: '9',
    title: 'Physical Excellence Protocol',
    description: 'Complete training system for achieving peak physical performance',
    videoId: 'dQw4w9WgXcQ',
    duration: '4h 30m',
    category: "Warrior's Training",
    difficulty: 'beginner',
    tags: ['Fitness', 'Health', 'Performance'],
    addedBy: 'Elite Trainer',
    addedAt: new Date('2024-01-22'),
    moduleCount: 10,
    estimatedHours: 5
  },
  {
    id: '10',
    title: 'Mental Resilience Training',
    description: 'Build unshakeable mental resilience and emotional fortitude',
    videoId: 'dQw4w9WgXcQ',
    duration: '3h 00m',
    category: "Warrior's Training",
    difficulty: 'intermediate',
    tags: ['Resilience', 'Mental Training', 'Fortitude'],
    addedBy: 'Resilience Coach',
    addedAt: new Date('2024-01-25'),
    moduleCount: 7,
    estimatedHours: 3
  }
];

// Category definitions with descriptions and colors
export const courseCategories = [
  {
    id: 'Mindset',
    name: 'Mindset',
    description: 'Transform your mental framework for success',
    color: 'from-purple-500 to-indigo-600',
    icon: '🧠',
    count: 0
  },
  {
    id: 'Metapreneur',
    name: 'Metapreneur',
    description: 'Navigate the new economy with advanced business strategies',
    color: 'from-blue-500 to-cyan-600',
    icon: '🚀',
    count: 0
  },
  {
    id: 'Business Wiz',
    name: 'Business Wiz',
    description: 'Master financial intelligence and market domination',
    color: 'from-emerald-500 to-teal-600',
    icon: '💎',
    count: 0
  },
  {
    id: 'Inner Circles',
    name: 'Inner Circles',
    description: 'Build elite networks and master influence',
    color: 'from-amber-500 to-orange-600',
    icon: '🎯',
    count: 0
  },
  {
    id: "Warrior's Training",
    name: "Warrior's Training",
    description: 'Develop physical excellence and mental resilience',
    color: 'from-red-500 to-rose-600',
    icon: '⚔️',
    count: 0
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
