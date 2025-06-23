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
  Award,
  GraduationCap,
  Target,
  Flame
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
          <div className="text-center space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-2xl rounded-3xl p-12 shadow-2xl border border-white/10">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 border-t-transparent mx-auto mb-6"></div>
                <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-cyan-300 animate-pulse" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                Initializing Learning Universe
              </h3>
              <p className="text-blue-200/90 text-xl font-medium">Preparing your epic learning journey...</p>
              <div className="flex items-center justify-center gap-2 mt-6">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <CommandRoomBackground />
      
      <div className="relative z-10 p-8 space-y-12">
        {/* Hero Header with Better Visual Impact */}
        <div className="text-center space-y-8 mb-16">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
            <div className="relative flex items-center justify-center gap-6 mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-60 group-hover:opacity-90 transition-all duration-500 animate-pulse"></div>
                <div className="relative p-6 bg-gradient-to-br from-cyan-500 via-purple-600 to-pink-600 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-500">
                  <GraduationCap className="h-12 w-12 text-white" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-7xl font-bold bg-gradient-to-r from-cyan-200 via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4 tracking-tight">
                  Learning Universe
                </h1>
                <div className="flex items-center gap-4">
                  <Flame className="h-6 w-6 text-orange-400 animate-pulse" />
                  <p className="text-2xl text-cyan-100 font-semibold">Master Skills • Build Dreams • Achieve Greatness</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-blue-100/95 leading-relaxed font-medium">
              🚀 Welcome to your personal learning command center! Dive into expertly curated video courses, 
              track your progress with precision, unlock epic achievements, and level up your expertise in a 
              stunning immersive environment designed for champions.
            </p>
          </div>

          {/* Enhanced Achievement Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Badge className="bg-gradient-to-r from-emerald-500/80 to-green-500/80 text-white border-0 px-6 py-3 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <Target className="h-5 w-5 mr-2" />
              Skill Mastery Hub
            </Badge>
            <Badge className="bg-gradient-to-r from-amber-500/80 to-orange-500/80 text-white border-0 px-6 py-3 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <Zap className="h-5 w-5 mr-2" />
              Lightning Learning
            </Badge>
            <Badge className="bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white border-0 px-6 py-3 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <Award className="h-5 w-5 mr-2" />
              Achievement Unlocked
            </Badge>
          </div>
        </div>

        {/* Enhanced Stats Cards with Better Visual Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
          <Card className="group bg-gradient-to-br from-cyan-500/10 via-cyan-600/10 to-blue-700/10 backdrop-blur-2xl border border-cyan-300/30 text-white hover:scale-105 hover:rotate-1 transition-all duration-500 shadow-2xl hover:shadow-cyan-500/25 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-8 text-center relative z-10">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="p-4 bg-cyan-400/20 rounded-2xl group-hover:bg-cyan-400/30 transition-colors duration-300">
                  <Play className="h-8 w-8 text-cyan-300" />
                </div>
                <span className="text-4xl font-bold text-cyan-300 group-hover:text-cyan-200 transition-colors duration-300">{totalVideos}</span>
              </div>
              <p className="text-cyan-100 font-semibold text-lg">Epic Courses Available</p>
              <div className="mt-3 text-sm text-cyan-200/80">Ready for mastery</div>
            </CardContent>
          </Card>
          
          <Card className="group bg-gradient-to-br from-emerald-500/10 via-emerald-600/10 to-green-700/10 backdrop-blur-2xl border border-emerald-300/30 text-white hover:scale-105 hover:rotate-1 transition-all duration-500 shadow-2xl hover:shadow-emerald-500/25 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-8 text-center relative z-10">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="p-4 bg-emerald-400/20 rounded-2xl group-hover:bg-emerald-400/30 transition-colors duration-300">
                  <CheckCircle className="h-8 w-8 text-emerald-300" />
                </div>
                <span className="text-4xl font-bold text-emerald-300 group-hover:text-emerald-200 transition-colors duration-300">{completedVideos}</span>
              </div>
              <p className="text-emerald-100 font-semibold text-lg">Courses Conquered</p>
              <div className="mt-3 text-sm text-emerald-200/80">Victory achieved!</div>
            </CardContent>
          </Card>
          
          <Card className="group bg-gradient-to-br from-amber-500/10 via-amber-600/10 to-orange-700/10 backdrop-blur-2xl border border-amber-300/30 text-white hover:scale-105 hover:rotate-1 transition-all duration-500 shadow-2xl hover:shadow-amber-500/25 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-8 text-center relative z-10">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="p-4 bg-amber-400/20 rounded-2xl group-hover:bg-amber-400/30 transition-colors duration-300">
                  <Clock className="h-8 w-8 text-amber-300" />
                </div>
                <span className="text-4xl font-bold text-amber-300 group-hover:text-amber-200 transition-colors duration-300">{inProgressVideos}</span>
              </div>
              <p className="text-amber-100 font-semibold text-lg">Active Learning</p>
              <div className="mt-3 text-sm text-amber-200/80">In progress now</div>
            </CardContent>
          </Card>
          
          <Card className="group bg-gradient-to-br from-purple-500/10 via-purple-600/10 to-pink-700/10 backdrop-blur-2xl border border-purple-300/30 text-white hover:scale-105 hover:rotate-1 transition-all duration-500 shadow-2xl hover:shadow-purple-500/25 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-8 text-center relative z-10">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="p-4 bg-purple-400/20 rounded-2xl group-hover:bg-purple-400/30 transition-colors duration-300">
                  <TrendingUp className="h-8 w-8 text-purple-300" />
                </div>
                <span className="text-4xl font-bold text-purple-300 group-hover:text-purple-200 transition-colors duration-300">{Math.round(totalProgress)}%</span>
              </div>
              <p className="text-purple-100 font-semibold text-lg">Mastery Level</p>
              <div className="mt-3 text-sm text-purple-200/80">Total progress</div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Content with Better Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-10">
            <TabsList className="bg-black/50 backdrop-blur-2xl border border-white/20 p-3 rounded-3xl shadow-2xl">
              <TabsTrigger 
                value="courses" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-blue-200 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:bg-white/10"
              >
                <BookOpen className="h-6 w-6 mr-3" />
                Epic Courses
              </TabsTrigger>
              <TabsTrigger 
                value="progress" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-purple-200 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:bg-white/10"
              >
                <Trophy className="h-6 w-6 mr-3" />
                Progress Hub
              </TabsTrigger>
            </TabsList>

            {isAdmin && (
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-105 transform"
              >
                <Plus className="h-6 w-6 mr-3" />
                Add Epic Course
              </Button>
            )}
          </div>

          <TabsContent value="courses" className="space-y-10">
            {/* Enhanced Search and Filters */}
            <Card className="bg-black/40 backdrop-blur-3xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-cyan-400" />
                      <Input
                        placeholder="Search for life-changing courses and unlock your potential..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-16 bg-white/10 border-cyan-300/40 text-white placeholder:text-cyan-200/70 h-16 rounded-2xl text-lg focus:border-cyan-400 focus:ring-cyan-400/50 focus:ring-4 transition-all duration-300"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-6">
                    <div className="relative">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-6 py-4 bg-white/10 border border-purple-300/40 rounded-2xl text-white text-lg font-medium min-w-[200px] focus:border-purple-400 focus:ring-purple-400/50 focus:ring-4 transition-all duration-300 hover:bg-white/15"
                      >
                        {categories.map(category => (
                          <option key={category} value={category} className="bg-gray-800 text-white font-medium">
                            {category === 'all' ? '🌟 All Categories' : `📚 ${category}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="relative">
                      <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="px-6 py-4 bg-white/10 border border-pink-300/40 rounded-2xl text-white text-lg font-medium min-w-[200px] focus:border-pink-400 focus:ring-pink-400/50 focus:ring-4 transition-all duration-300 hover:bg-white/15"
                      >
                        {difficulties.map(difficulty => (
                          <option key={difficulty} value={difficulty} className="bg-gray-800 text-white font-medium">
                            {difficulty === 'all' ? '⚡ All Levels' : 
                             difficulty === 'beginner' ? '🌱 Beginner' :
                             difficulty === 'intermediate' ? '🚀 Intermediate' : '🎯 Advanced'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Video Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-10">
              {filteredVideos.map((video) => (
                <YouTubeEmbed
                  key={video.id}
                  videoId={video.videoId}
                  title={video.title}
                  description={video.description}
                  duration={video.duration}
                  progress={userProgress[video.id] || 0}
                  onProgressUpdate={(progress) => handleProgressUpdate(video.id, progress)}
                  className="w-full transform hover:scale-105 hover:-rotate-1 transition-all duration-500 hover:shadow-2xl"
                />
              ))}
            </div>

            {/* Enhanced Empty State */}
            {filteredVideos.length === 0 && (
              <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-2xl border border-gray-600/30 rounded-3xl overflow-hidden">
                <CardContent className="p-16 text-center">
                  <div className="space-y-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 to-gray-600/20 rounded-full blur-3xl"></div>
                      <Youtube className="relative h-24 w-24 text-gray-400 mx-auto" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-bold text-white mb-4">No Learning Adventures Found</h3>
                      <p className="text-gray-300 text-xl leading-relaxed max-w-md mx-auto">
                        {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                          ? '🔍 Try adjusting your filters to discover amazing courses that match your learning goals.'
                          : '🎓 Your learning universe is being prepared. Epic educational content coming soon!'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Keep existing progress tab content */}
          <TabsContent value="progress" className="space-y-10">
            {/* ... keep existing progress content the same */}
          </TabsContent>
        </Tabs>

        {/* Keep existing modal */}
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
