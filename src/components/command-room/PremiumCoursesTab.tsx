
import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import PremiumVaultHeader from './PremiumVaultHeader';
import CategoryOverview from './CategoryOverview';
import SimpleCourseGrid from './SimpleCourseGrid';
import { courseCategories } from './mockData';

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
  moduleCount?: number;
  estimatedHours?: number;
}

interface PremiumCoursesTabProps {
  videos: LearningVideo[];
  userProgress: Record<string, number>;
  onProgressUpdate: (videoId: string, progress: number) => void;
  searchTerm: string;
  selectedCategory: string;
  viewMode: 'grid' | 'list';
  isAdmin?: boolean;
  onAddVideo?: () => void;
}

const PremiumCoursesTab: React.FC<PremiumCoursesTabProps> = ({
  videos,
  userProgress,
  onProgressUpdate,
  isAdmin,
  onAddVideo
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate course counts by category
  const courseCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    courseCategories.forEach(cat => {
      counts[cat.id] = videos.filter(video => video.category === cat.id).length;
    });
    return counts;
  }, [videos]);

  // Calculate completed counts by category
  const completedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    courseCategories.forEach(cat => {
      counts[cat.id] = videos
        .filter(video => video.category === cat.id)
        .filter(video => userProgress[video.id] === 100)
        .length;
    });
    return counts;
  }, [videos, userProgress]);

  // Filter videos by selected category and search
  const filteredVideos = useMemo(() => {
    let filtered = videos;
    
    if (selectedCategory) {
      filtered = filtered.filter(video => video.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  }, [videos, selectedCategory, searchTerm]);

  // Calculate stats
  const totalCourses = videos.length;
  const completedCourses = Object.values(userProgress).filter(p => p === 100).length;
  const totalHours = videos.reduce((acc, video) => {
    const hours = parseFloat(video.duration.replace(/[^\d.]/g, '')) || 0;
    return acc + hours;
  }, 0).toFixed(1);
  const averageRating = 4.8;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PremiumVaultHeader
        totalCourses={totalCourses}
        completedCourses={completedCourses}
        totalHours={totalHours}
        averageRating={averageRating}
        onAddCourse={onAddVideo}
        isAdmin={isAdmin}
      />

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 min-h-[600px]">
        {!selectedCategory ? (
          <CategoryOverview
            categories={courseCategories}
            onCategorySelect={setSelectedCategory}
            courseCounts={courseCounts}
            completedCounts={completedCounts}
          />
        ) : (
          <SimpleCourseGrid
            videos={filteredVideos}
            userProgress={userProgress}
            onProgressUpdate={onProgressUpdate}
            selectedCategory={selectedCategory}
            onBackToCategories={() => setSelectedCategory(null)}
          />
        )}
      </div>
    </div>
  );
};

export default PremiumCoursesTab;
