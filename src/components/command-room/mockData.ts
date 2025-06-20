
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
