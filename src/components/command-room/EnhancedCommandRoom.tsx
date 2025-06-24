import React, { useState, useEffect } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import CommandRoomBackground from './CommandRoomBackground';
import CommandRoomHeader from './CommandRoomHeader';
import CommandRoomStats from './CommandRoomStats';
import CommandRoomContent from './CommandRoomContent';
import AddYouTubeModal from './AddYouTubeModal';

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
  progress?: number;
}

const EnhancedCommandRoom: React.FC = () => {
  const { canManageCalendar, currentRole } = useRole();
  const { user } = useAuth();
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = currentRole === 'admin' || canManageCalendar;

  // Mock data initialization
  useEffect(() => {
    const initializeData = async () => {
      try {
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
            progress: 0
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
            progress: 0
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
            progress: 0
          }
        ];

        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setVideos(mockVideos);
        
        // Load user progress from localStorage
        const savedProgress = localStorage.getItem(`learning_progress_${user?.id}`);
        if (savedProgress) {
          setUserProgress(JSON.parse(savedProgress));
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize Command Room data:', error);
        toast.error('Failed to load learning data');
        setIsLoading(false);
      }
    };

    initializeData();
  }, [user?.id]);

  const handleProgressUpdate = (videoId: string, progress: number) => {
    try {
      const clampedProgress = Math.max(0, Math.min(100, progress));
      const updatedProgress = { ...userProgress, [videoId]: clampedProgress };
      setUserProgress(updatedProgress);
      
      // Save to localStorage
      localStorage.setItem(`learning_progress_${user?.id}`, JSON.stringify(updatedProgress));
      
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
        addedBy: user?.name || 'Admin',
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

  // Calculate stats
  const totalVideos = videos.length;
  const completedVideos = Object.values(userProgress).filter(p => p === 100).length;
  const totalProgress = totalVideos > 0 ? Object.values(userProgress).reduce((sum, p) => sum + p, 0) / totalVideos : 0;
  const inProgressVideos = Object.values(userProgress).filter(p => p > 0 && p < 100).length;

  const stats = {
    totalVideos,
    completedVideos,
    totalProgress: Math.round(totalProgress),
    inProgressVideos
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <CommandRoomBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center space-y-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-400 border-t-transparent mx-auto"></div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-cyan-300">
                Loading Command Room
              </h3>
              <p className="text-blue-200/80">Preparing your learning environment...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <CommandRoomBackground />
      
      <div className="relative z-10 p-4 md:p-6 lg:p-8 space-y-6">
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
  );
};

export default EnhancedCommandRoom;
