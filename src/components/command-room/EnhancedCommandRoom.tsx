
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
  Youtube,
  Sparkles,
  Zap,
  Award
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
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 border-t-transparent mx-auto"></div>
              <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-cyan-300 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Loading Learning Universe
              </h3>
              <p className="text-blue-200/80 text-lg">Preparing your courses...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <CommandRoomBackground />
      
      <div className="relative z-10 p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity animate-pulse"></div>
              <div className="relative p-4 bg-gradient-to-br from-cyan-500 via-purple-600 to-pink-600 rounded-3xl shadow-2xl">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-2">
                Learning Universe
              </h1>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                <p className="text-xl text-cyan-200 font-medium">Power Up Your Skills</p>
              </div>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-blue-100/90 leading-relaxed">
              🚀 Master cutting-edge skills with expertly curated video courses. Track your progress, 
              earn achievements, and level up your expertise in an immersive learning environment.
            </p>
          </div>
        </div>

        {/* Vibrant Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-xl border-cyan-300/30 text-white hover:scale-105 transition-transform duration-300 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="p-2 bg-cyan-400/20 rounded-full">
                  <Play className="h-6 w-6 text-cyan-300" />
                </div>
                <span className="text-3xl font-bold text-cyan-300">{totalVideos}</span>
              </div>
              <p className="text-cyan-100 font-medium">Epic Courses</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-500/20 to-green-600/20 backdrop-blur-xl border-emerald-300/30 text-white hover:scale-105 transition-transform duration-300 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="p-2 bg-emerald-400/20 rounded-full">
                  <CheckCircle className="h-6 w-6 text-emerald-300" />
                </div>
                <span className="text-3xl font-bold text-emerald-300">{completedVideos}</span>
              </div>
              <p className="text-emerald-100 font-medium">Conquered</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 backdrop-blur-xl border-amber-300/30 text-white hover:scale-105 transition-transform duration-300 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="p-2 bg-amber-400/20 rounded-full">
                  <Clock className="h-6 w-6 text-amber-300" />
                </div>
                <span className="text-3xl font-bold text-amber-300">{inProgressVideos}</span>
              </div>
              <p className="text-amber-100 font-medium">In Progress</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-xl border-purple-300/30 text-white hover:scale-105 transition-transform duration-300 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="p-2 bg-purple-400/20 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-300" />
                </div>
                <span className="text-3xl font-bold text-purple-300">{Math.round(totalProgress)}%</span>
              </div>
              <p className="text-purple-100 font-medium">Skill Level</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-8">
            <TabsList className="bg-black/40 backdrop-blur-xl border border-white/20 p-2 rounded-2xl">
              <TabsTrigger 
                value="courses" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white text-blue-200 px-6 py-3 rounded-xl font-medium transition-all duration-300"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Courses
              </TabsTrigger>
              <TabsTrigger 
                value="progress" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white text-purple-200 px-6 py-3 rounded-xl font-medium transition-all duration-300"
              >
                <Trophy className="h-5 w-5 mr-2" />
                Progress
              </TabsTrigger>
            </TabsList>

            {isAdmin && (
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Epic Course
              </Button>
            )}
          </div>

          <TabsContent value="courses" className="space-y-8">
            {/* Enhanced Filters */}
            <Card className="bg-black/30 backdrop-blur-xl border border-white/20 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-400" />
                      <Input
                        placeholder="Search for amazing courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 bg-white/10 border-cyan-300/40 text-white placeholder:text-cyan-200/60 h-12 rounded-xl focus:border-cyan-400 focus:ring-cyan-400/50"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-3 bg-white/10 border border-purple-300/40 rounded-xl text-white text-sm min-w-[150px] focus:border-purple-400 focus:ring-purple-400/50"
                    >
                      {categories.map(category => (
                        <option key={category} value={category} className="bg-gray-800 text-white">
                          {category === 'all' ? '🌟 All Categories' : `📚 ${category}`}
                        </option>
                      ))}
                    </select>
                    
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="px-4 py-3 bg-white/10 border border-pink-300/40 rounded-xl text-white text-sm min-w-[150px] focus:border-pink-400 focus:ring-pink-400/50"
                    >
                      {difficulties.map(difficulty => (
                        <option key={difficulty} value={difficulty} className="bg-gray-800 text-white">
                          {difficulty === 'all' ? '⚡ All Levels' : 
                           difficulty === 'beginner' ? '🌱 Beginner' :
                           difficulty === 'intermediate' ? '🚀 Intermediate' : '🎯 Advanced'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Video Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredVideos.map((video) => (
                <YouTubeEmbed
                  key={video.id}
                  videoId={video.videoId}
                  title={video.title}
                  description={video.description}
                  duration={video.duration}
                  progress={userProgress[video.id] || 0}
                  onProgressUpdate={(progress) => handleProgressUpdate(video.id, progress)}
                  className="w-full transform hover:scale-105 transition-transform duration-300"
                />
              ))}
            </div>

            {filteredVideos.length === 0 && (
              <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-600/30">
                <CardContent className="p-12 text-center">
                  <div className="space-y-4">
                    <Youtube className="h-16 w-16 text-gray-400 mx-auto" />
                    <h3 className="text-2xl font-bold text-white mb-2">No Courses Found</h3>
                    <p className="text-gray-300 text-lg">
                      {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                        ? '🔍 Try different filters to discover more courses.'
                        : '🎓 No learning adventures have been added yet. Stay tuned!'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Enhanced Progress Overview */}
              <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-purple-300/30 text-white shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-purple-400/20 rounded-full">
                      <Trophy className="h-6 w-6 text-purple-300" />
                    </div>
                    Learning Journey
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-100 font-medium">Overall Mastery</span>
                      <span className="text-2xl font-bold text-purple-300">{Math.round(totalProgress)}%</span>
                    </div>
                    <div className="w-full bg-purple-900/30 rounded-full h-4 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 rounded-full transition-all duration-1000 ease-out relative"
                        style={{ width: `${totalProgress}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6 pt-6 border-t border-purple-300/20">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-400 mb-1">{completedVideos}</div>
                      <div className="text-sm text-emerald-200">🏆 Mastered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-amber-400 mb-1">{inProgressVideos}</div>
                      <div className="text-sm text-amber-200">⚡ Learning</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-cyan-400 mb-1">{totalVideos - completedVideos - inProgressVideos}</div>
                      <div className="text-sm text-cyan-200">🚀 To Explore</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Activity Card */}
              <Card className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 backdrop-blur-xl border border-cyan-300/30 text-white shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-cyan-400/20 rounded-full">
                      <Clock className="h-6 w-6 text-cyan-300" />
                    </div>
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {videos.slice(0, 5).map(video => {
                      const progress = userProgress[video.id] || 0;
                      return (
                        <div key={video.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-cyan-300/20 hover:bg-white/10 transition-colors">
                          <div className="flex-1">
                            <p className="font-medium truncate text-white mb-1">{video.title}</p>
                            <p className="text-sm text-cyan-200/80">{video.category}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-bold text-cyan-300">{progress}%</div>
                            {progress === 100 && <CheckCircle className="h-5 w-5 text-emerald-400" />}
                            {progress > 0 && progress < 100 && <Clock className="h-5 w-5 text-amber-400" />}
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
