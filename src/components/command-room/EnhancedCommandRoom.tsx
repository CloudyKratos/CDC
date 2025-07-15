
import React, { useState, useEffect } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { LearningVideo, LearningProgress, LearningStats } from '@/types/learning';
import CommandRoomBackground from './CommandRoomBackground';
import CommandRoomHeader from './CommandRoomHeader';
import CommandRoomStats from './CommandRoomStats';
import CommandRoomContent from './CommandRoomContent';
import AddYouTubeModal from './AddYouTubeModal';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';

const EnhancedCommandRoom: React.FC = () => {
  const { canManageCalendar, currentRole } = useRole();
  const { user } = useAuth();
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [userProgress, setUserProgress] = useState<LearningProgress>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = currentRole === 'admin' || canManageCalendar;

  // Load progress from localStorage with error handling
  const loadProgress = (): LearningProgress => {
    try {
      const savedProgress = localStorage.getItem(`learning_progress_${user?.id}`);
      return savedProgress ? JSON.parse(savedProgress) : {};
    } catch (error) {
      console.error('Failed to load progress:', error);
      return {};
    }
  };

  // Save progress to localStorage with error handling
  const saveProgress = (progress: LearningProgress) => {
    try {
      localStorage.setItem(`learning_progress_${user?.id}`, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save progress:', error);
      toast.error('Failed to save progress');
    }
  };

  // Mock data initialization with better error handling
  useEffect(() => {
    const initializeData = async () => {
      try {
        setError(null);
        
        const mockVideos: LearningVideo[] = [
          {
            id: '1',
            title: 'Introduction to React Hooks',
            description: 'Learn the fundamentals of React Hooks and how to use them effectively in your applications.',
            videoId: 'O6P86uwfdR0',
            duration: '28:15',
            category: 'React',
            difficulty: 'beginner',
            tags: ['hooks', 'useState', 'useEffect'],
            addedBy: 'Admin',
            addedAt: new Date('2024-01-15'),
            progress: 0,
            instructor: 'React Team',
            rating: 4.8,
            views: 1250
          },
          {
            id: '2',
            title: 'Advanced TypeScript Patterns',
            description: 'Deep dive into advanced TypeScript patterns for building robust applications.',
            videoId: 'VlJuFdeoTUU',
            duration: '45:30',
            category: 'TypeScript',
            difficulty: 'advanced',
            tags: ['typescript', 'patterns', 'generics'],
            addedBy: 'Admin',
            addedAt: new Date('2024-01-10'),
            progress: 0,
            instructor: 'TypeScript Expert',
            rating: 4.9,
            views: 890
          },
          {
            id: '3',
            title: 'CSS Grid Layout Mastery',
            description: 'Master CSS Grid Layout with practical examples and real-world projects.',
            videoId: 'jV8B24rSN5o',
            duration: '32:45',
            category: 'CSS',
            difficulty: 'intermediate',
            tags: ['css', 'grid', 'layout'],
            addedBy: 'Admin',
            addedAt: new Date('2024-01-12'),
            progress: 0,
            instructor: 'CSS Master',
            rating: 4.7,
            views: 1100
          },
          {
            id: '4',
            title: 'JavaScript ES6+ Features',
            description: 'Explore modern JavaScript features and how to use them in your projects.',
            videoId: 'WZQc7RUAg18',
            duration: '35:20',
            category: 'JavaScript',
            difficulty: 'intermediate',
            tags: ['javascript', 'es6', 'modern'],
            addedBy: 'Admin',
            addedAt: new Date('2024-01-08'),
            progress: 0,
            instructor: 'JS Guru',
            rating: 4.6,
            views: 980
          }
        ];

        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setVideos(mockVideos);
        
        // Load user progress
        const savedProgress = loadProgress();
        setUserProgress(savedProgress);
        
        // Update video progress
        const videosWithProgress = mockVideos.map(video => ({
          ...video,
          progress: savedProgress[video.id] || 0
        }));
        setVideos(videosWithProgress);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize Command Room data:', error);
        setError('Failed to load learning data');
        toast.error('Failed to load learning data');
        setIsLoading(false);
      }
    };

    if (user?.id) {
      initializeData();
    }
  }, [user?.id]);

  const handleProgressUpdate = (videoId: string, progress: number) => {
    try {
      const clampedProgress = Math.max(0, Math.min(100, progress));
      const updatedProgress = { ...userProgress, [videoId]: clampedProgress };
      
      setUserProgress(updatedProgress);
      saveProgress(updatedProgress);
      
      // Update video progress
      setVideos(prev => prev.map(video => 
        video.id === videoId ? { ...video, progress: clampedProgress } : video
      ));

      if (clampedProgress === 100) {
        toast.success('🎉 Course completed! Amazing work!', {
          description: 'You\'ve mastered another skill. Keep up the momentum!'
        });
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
      toast.error('Failed to save progress');
    }
  };

  const handleAddVideo = (videoData: Omit<LearningVideo, 'id' | 'addedBy' | 'addedAt'>) => {
    try {
      const newVideo: LearningVideo = {
        ...videoData,
        id: Date.now().toString(),
        addedBy: user?.email?.split('@')[0] || 'Admin',
        addedAt: new Date(),
        progress: 0
      };
      
      setVideos(prev => [newVideo, ...prev]);
      toast.success('Learning video added successfully!');
    } catch (error) {
      console.error('Failed to add video:', error);
      toast.error('Failed to add video');
    }
  };

  // Calculate stats with error handling
  const calculateStats = (): LearningStats => {
    try {
      const totalVideos = videos.length;
      const completedVideos = Object.values(userProgress).filter(p => p === 100).length;
      const totalProgress = totalVideos > 0 ? Object.values(userProgress).reduce((sum, p) => sum + p, 0) / totalVideos : 0;
      const inProgressVideos = Object.values(userProgress).filter(p => p > 0 && p < 100).length;

      return {
        totalVideos,
        completedVideos,
        totalProgress: Math.round(totalProgress),
        inProgressVideos
      };
    } catch (error) {
      console.error('Failed to calculate stats:', error);
      return {
        totalVideos: 0,
        completedVideos: 0,
        totalProgress: 0,
        inProgressVideos: 0
      };
    }
  };

  const stats = calculateStats();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CommandRoomBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <ErrorBoundary>
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          </ErrorBoundary>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CommandRoomBackground />
        <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center space-y-2">
                  <Skeleton className="h-8 w-16 mx-auto" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <CommandRoomBackground />
        
        <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <CommandRoomHeader 
            isAdmin={isAdmin}
            onAddVideo={() => setIsAddModalOpen(true)}
          />
          <CommandRoomStats stats={stats} />
          <CommandRoomContent
            videos={videos}
            userProgress={userProgress}
            onProgressUpdate={handleProgressUpdate}
            isAdmin={isAdmin}
            onAddVideo={() => setIsAddModalOpen(true)}
          />
          
          <AddYouTubeModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAdd={handleAddVideo}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default EnhancedCommandRoom;
