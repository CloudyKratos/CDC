import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import Icons from '@/utils/IconUtils';
import LearningCard, { LearningItem } from './command-room/LearningCard';
import LearningFilters, { FilterState } from './command-room/LearningFilters';
import LearningDetailModal from './command-room/LearningDetailModal';
import AddYouTubeVideoModal from './command-room/AddYouTubeVideoModal';
import VideoViewerModal from './command-room/VideoViewerModal';

const CommandRoomPanel = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LearningItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    level: 'all',
    coach: 'all',
    format: 'all'
  });

  // Sample learning content data with YouTube videos
  const [learningItems, setLearningItems] = useState<LearningItem[]>([
    {
      id: '1',
      title: 'Morning Ritual Mastery Course',
      type: 'course',
      category: 'rituals',
      level: 'beginner',
      coach: 'Alex Chen',
      format: 'video',
      lastReviewed: '2 hours ago',
      progress: 65,
      isPrivate: false,
      isPremium: true,
      isFavorited: true,
      description: 'Transform your mornings with proven rituals that set the foundation for extraordinary days.',
      modules: 7,
      duration: '2.5 hours'
    },
    {
      id: '2',
      title: 'Stoic Decision Framework',
      type: 'vault',
      category: 'wisdom',
      level: 'intermediate',
      coach: 'Maya Singh',
      format: 'pdf',
      lastReviewed: '1 day ago',
      isPrivate: false,
      isPremium: false,
      isFavorited: false,
      description: 'Ancient wisdom meets modern decision-making. A comprehensive framework for clear thinking.',
      duration: '45 min read'
    },
    {
      id: '7',
      title: 'The Power of Now - Eckhart Tolle',
      type: 'replay',
      category: 'mindset',
      level: 'intermediate',
      coach: 'Eckhart Tolle',
      format: 'video',
      lastReviewed: 'Just added',
      progress: 30,
      isPrivate: false,
      isPremium: false,
      isFavorited: false,
      description: 'A profound spiritual teaching about living in the present moment and finding peace within.',
      duration: '1.5 hours',
      youtubeId: 'qgVyVZE7lfw',
      youtubeUrl: 'https://youtube.com/watch?v=qgVyVZE7lfw'
    },
    {
      id: '8',
      title: 'Atomic Habits Masterclass',
      type: 'replay',
      category: 'productivity',
      level: 'beginner',
      coach: 'James Clear',
      format: 'video',
      lastReviewed: '2 days ago',
      progress: 85,
      isPrivate: false,
      isPremium: true,
      isFavorited: true,
      description: 'Learn the science of habit formation and how tiny changes lead to remarkable results.',
      duration: '45 minutes',
      youtubeId: 'YT7tQzmGRLA',
      youtubeUrl: 'https://youtube.com/watch?v=YT7tQzmGRLA'
    }
  ]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      category: 'all',
      level: 'all',
      coach: 'all',
      format: 'all'
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== 'all').length;
  };

  const handleFavorite = (id: string) => {
    setLearningItems(items =>
      items.map(item =>
        item.id === id ? { ...item, isFavorited: !item.isFavorited } : item
      )
    );
  };

  const handleItemClick = (item: LearningItem) => {
    setSelectedItem(item);
    if (item.youtubeId) {
      setShowVideoModal(true);
    } else {
      setShowDetailModal(true);
    }
  };

  const handleStartLearning = (item: LearningItem) => {
    if (item.youtubeId) {
      setShowDetailModal(false);
      setShowVideoModal(true);
    } else {
      toast.success(`Starting: ${item.title}`, {
        description: "Your learning journey begins now!"
      });
      setShowDetailModal(false);
    }
  };

  const handleCreateNew = (type: string) => {
    if (type === 'youtube-video') {
      setShowYouTubeModal(true);
      setShowCreateDialog(false);
    } else {
      toast.success(`New ${type} created!`, {
        description: "Ready to add your wisdom to the sanctuary."
      });
      setShowCreateDialog(false);
    }
  };

  const handleAddYouTubeVideo = (newItem: LearningItem) => {
    setLearningItems(prev => [newItem, ...prev]);
  };

  const handleProgressUpdate = (id: string, progress: number) => {
    setLearningItems(items =>
      items.map(item =>
        item.id === id ? { ...item, progress } : item
      )
    );
  };

  // Filter logic
  const filteredItems = learningItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'courses' && item.type === 'course') ||
                      (activeTab === 'vault' && item.type === 'vault') ||
                      (activeTab === 'replays' && item.type === 'replay') ||
                      (activeTab === 'templates' && item.type === 'template') ||
                      (activeTab === 'favorites' && item.isFavorited) ||
                      (activeTab === 'videos' && item.youtubeId);
    
    const matchesFilters = (filters.category === 'all' || item.category === filters.category) &&
                          (filters.level === 'all' || item.level === filters.level) &&
                          (filters.coach === 'all' || item.coach.toLowerCase().includes(filters.coach)) &&
                          (filters.format === 'all' || item.format === filters.format);
    
    return matchesSearch && matchesTab && matchesFilters;
  });

  const CREATE_OPTIONS = [
    { id: 'youtube-video', name: 'Add YouTube Video', icon: <Icons.Video size={20} className="text-red-500" /> },
    { id: 'course', name: 'New Course', icon: <Icons.BookOpen size={20} className="text-purple-500" /> },
    { id: 'vault', name: 'Vault Item', icon: <Icons.FileText size={20} className="text-amber-500" /> },
    { id: 'replay', name: 'Upload Replay', icon: <Icons.Video size={20} className="text-blue-500" /> },
    { id: 'template', name: 'Create Template', icon: <Icons.LayoutDashboard size={20} className="text-green-500" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-blue-50/20 to-cyan-50/30 dark:from-purple-950/10 dark:via-blue-950/10 dark:to-cyan-950/10">
      {/* Ambient Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-purple-200/40 to-pink-200/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-32 w-64 h-64 bg-gradient-to-br from-blue-200/40 to-cyan-200/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Command Room
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-light">
                Your growth sanctuary for deep learning and timeless knowledge
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Input 
                  placeholder="Search your mental library..."
                  className="pl-12 pr-4 h-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-purple-200/50 dark:border-purple-800/50 text-lg"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <Icons.Search size={20} className="absolute top-1/2 transform -translate-y-1/2 left-4 text-gray-500" />
              </div>

              {/* Create Button */}
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="h-12 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg">
                    <Icons.Plus size={20} className="mr-2" />
                    Create
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Add to Your Sanctuary
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 gap-3 pt-4">
                    {CREATE_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all duration-200 group border border-purple-200/30 dark:border-purple-800/30"
                        onClick={() => handleCreateNew(option.id)}
                      >
                        <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          {option.icon}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{option.name}</span>
                      </button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-purple-200/30 dark:border-purple-800/30 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">All</TabsTrigger>
            <TabsTrigger value="videos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">Videos</TabsTrigger>
            <TabsTrigger value="courses" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">Courses</TabsTrigger>
            <TabsTrigger value="vault" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">Vault</TabsTrigger>
            <TabsTrigger value="replays" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">Replays</TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">Templates</TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">Favorites</TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="mb-6">
            <LearningFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              activeFiltersCount={getActiveFiltersCount()}
            />
          </div>

          {/* Content */}
          <TabsContent value={activeTab} className="space-y-6">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mb-6">
                  <Icons.Search size={40} className="text-purple-400 opacity-60" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No learning materials found</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  {searchQuery || getActiveFiltersCount() > 0
                    ? "Try adjusting your search or filters to discover more content"
                    : "Your learning sanctuary awaits. Create your first piece of wisdom."
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredItems.map((item) => (
                  <LearningCard
                    key={item.id}
                    item={item}
                    onFavorite={handleFavorite}
                    onClick={handleItemClick}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <LearningDetailModal
          item={selectedItem}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onStartLearning={handleStartLearning}
        />

        <VideoViewerModal
          item={selectedItem}
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          onProgressUpdate={handleProgressUpdate}
        />

        <AddYouTubeVideoModal
          isOpen={showYouTubeModal}
          onClose={() => setShowYouTubeModal(false)}
          onAdd={handleAddYouTubeVideo}
        />
      </div>
    </div>
  );
};

export default CommandRoomPanel;
