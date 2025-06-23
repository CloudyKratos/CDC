
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useRole } from '@/contexts/RoleContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Play, 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  Search, 
  Filter,
  Plus,
  Users,
  Clock,
  CheckCircle,
  Star,
  Youtube
} from 'lucide-react';
import CommandRoomBackground from './CommandRoomBackground';
import YouTubeEmbed from './YouTubeEmbed';
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

interface LearningProgress {
  userId: string;
  videoId: string;
  progress: number;
  completedAt?: Date;
  timeSpent: number;
}

const EnhancedCommandRoom: React.FC = () => {
  const { canManageCalendar, currentRole } = useRole();
  const { user } = useAuth();
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('courses');
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = currentRole === 'admin' || canManageCalendar;

  // Mock data - In a real app, this would come from your backend
  useEffect(() => {
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

    // Simulate loading
    setTimeout(() => {
      setVideos(mockVideos);
      
      // Load user progress from localStorage (in a real app, this would come from backend)
      const savedProgress = localStorage.getItem(`learning_progress_${user?.id}`);
      if (savedProgress) {
        setUserProgress(JSON.parse(savedProgress));
      }
      
      setIsLoading(false);
    }, 1000);
  }, [user?.id]);

  const categories = ['all', ...Array.from(new Set(videos.map(v => v.category)))];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || video.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleProgressUpdate = (videoId: string, progress: number) => {
    const updatedProgress = { ...userProgress, [videoId]: progress };
    setUserProgress(updatedProgress);
    
    // Save to localStorage (in a real app, this would save to backend)
    localStorage.setItem(`learning_progress_${user?.id}`, JSON.stringify(updatedProgress));
    
    // Update video progress
    setVideos(prev => prev.map(video => 
      video.id === videoId ? { ...video, progress } : video
    ));
  };

  const handleAddVideo = (videoData: Omit<LearningVideo, 'id' | 'addedBy' | 'addedAt'>) => {
    const newVideo: LearningVideo = {
      ...videoData,
      id: Date.now().toString(),
      addedBy: user?.name || 'Admin',
      addedAt: new Date(),
      progress: 0
    };
    
    setVideos(prev => [newVideo, ...prev]);
    toast.success('Learning video added successfully!');
  };

  // Calculate stats
  const totalVideos = videos.length;
  const completedVideos = Object.values(userProgress).filter(p => p === 100).length;
  const totalProgress = Object.values(userProgress).reduce((sum, p) => sum + p, 0) / Math.max(totalVideos, 1);
  const inProgressVideos = Object.values(userProgress).filter(p => p > 0 && p < 100).length;

  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <CommandRoomBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent mx-auto"></div>
            <p className="text-white/80 text-lg">Loading Learning Center...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <CommandRoomBackground />
      
      <div className="relative z-10 p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Learning Center</h1>
          </div>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Master new skills with curated video courses. Track your progress and level up your expertise.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-black/40 backdrop-blur-lg border-white/10 text-white">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Play className="h-5 w-5 text-blue-400" />
                <span className="text-2xl font-bold">{totalVideos}</span>
              </div>
              <p className="text-white/70 text-sm">Total Courses</p>
            </CardContent>
          </Card>
          
          <Card className="bg-black/40 backdrop-blur-lg border-white/10 text-white">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-2xl font-bold">{completedVideos}</span>
              </div>
              <p className="text-white/70 text-sm">Completed</p>
            </CardContent>
          </Card>
          
          <Card className="bg-black/40 backdrop-blur-lg border-white/10 text-white">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-yellow-400" />
                <span className="text-2xl font-bold">{inProgressVideos}</span>
              </div>
              <p className="text-white/70 text-sm">In Progress</p>
            </CardContent>
          </Card>
          
          <Card className="bg-black/40 backdrop-blur-lg border-white/10 text-white">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <span className="text-2xl font-bold">{Math.round(totalProgress)}%</span>
              </div>
              <p className="text-white/70 text-sm">Overall Progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-black/40 backdrop-blur-lg border-white/10">
              <TabsTrigger 
                value="courses" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Courses
              </TabsTrigger>
              <TabsTrigger 
                value="progress" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
              >
                <Trophy className="h-4 w-4 mr-2" />
                My Progress
              </TabsTrigger>
            </TabsList>

            {isAdmin && (
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            )}
          </div>

          <TabsContent value="courses" className="space-y-6">
            {/* Filters */}
            <Card className="bg-black/40 backdrop-blur-lg border-white/10">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                      <Input
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm"
                    >
                      {categories.map(category => (
                        <option key={category} value={category} className="bg-gray-800">
                          {category === 'all' ? 'All Categories' : category}
                        </option>
                      ))}
                    </select>
                    
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm"
                    >
                      {difficulties.map(difficulty => (
                        <option key={difficulty} value={difficulty} className="bg-gray-800">
                          {difficulty === 'all' ? 'All Levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Video Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <YouTubeEmbed
                  key={video.id}
                  videoId={video.videoId}
                  title={video.title}
                  description={video.description}
                  duration={video.duration}
                  progress={userProgress[video.id] || 0}
                  onProgressUpdate={(progress) => handleProgressUpdate(video.id, progress)}
                  className="w-full"
                />
              ))}
            </div>

            {filteredVideos.length === 0 && (
              <Card className="bg-black/40 backdrop-blur-lg border-white/10">
                <CardContent className="p-8 text-center">
                  <Youtube className="h-12 w-12 text-white/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No courses found</h3>
                  <p className="text-white/70">
                    {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                      ? 'Try adjusting your filters to find more courses.'
                      : 'No learning courses have been added yet.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Progress Overview */}
              <Card className="bg-black/40 backdrop-blur-lg border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    Learning Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{Math.round(totalProgress)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${totalProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{completedVideos}</div>
                      <div className="text-xs text-white/70">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">{inProgressVideos}</div>
                      <div className="text-xs text-white/70">In Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{totalVideos - completedVideos - inProgressVideos}</div>
                      <div className="text-xs text-white/70">Not Started</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-black/40 backdrop-blur-lg border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-400" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {videos.slice(0, 5).map(video => {
                      const progress = userProgress[video.id] || 0;
                      return (
                        <div key={video.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                          <div className="flex-1">
                            <p className="text-sm font-medium truncate">{video.title}</p>
                            <p className="text-xs text-white/70">{video.category}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-white/70">{progress}%</div>
                            {progress === 100 && <CheckCircle className="h-4 w-4 text-green-400" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Video Modal */}
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
