
import React, { useState } from 'react';
import PremiumVaultHeader from './PremiumVaultHeader';
import PremiumCourseGrid from './PremiumCourseGrid';

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
  // Calculate stats for header
  const totalCourses = videos.length;
  const completedCourses = Object.values(userProgress).filter(p => p === 100).length;
  const totalHours = "47.5"; // This could be calculated from actual video durations
  const averageRating = 4.8;

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <PremiumVaultHeader
        totalCourses={totalCourses}
        completedCourses={completedCourses}
        totalHours={totalHours}
        averageRating={averageRating}
        onAddCourse={onAddVideo}
        isAdmin={isAdmin}
      />

      {/* Premium Course Grid */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen p-8 -mx-8">
        <div className="max-w-7xl mx-auto">
          <PremiumCourseGrid
            videos={videos}
            userProgress={userProgress}
            onProgressUpdate={onProgressUpdate}
            isAdmin={isAdmin}
            onAddVideo={onAddVideo}
          />
        </div>
      </div>
    </div>
  );
};

export default PremiumCoursesTab;
