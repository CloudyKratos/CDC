import React, { useState } from 'react';
import { toast } from 'sonner';
import LearningCard, { LearningItem } from './command-room/LearningCard';
import LearningFilters, { FilterState } from './command-room/LearningFilters';
import LearningDetailModal from './command-room/LearningDetailModal';
import AddYouTubeVideoModal from './command-room/AddYouTubeVideoModal';
import VideoViewerModal from './command-room/VideoViewerModal';
import CommandRoomHeader from './command-room/CommandRoomHeader';
import CommandRoomTabs from './command-room/CommandRoomTabs';
import CommandRoomContent from './command-room/CommandRoomContent';
import CommandRoomBackground from './command-room/CommandRoomBackground';

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

  // Start with empty learning items array
  const [learningItems, setLearningItems] = useState<LearningItem[]>([]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-blue-50/20 to-cyan-50/30 dark:from-purple-950/10 dark:via-blue-950/10 dark:to-cyan-950/10">
      {/* Ambient Background Elements */}
      <CommandRoomBackground />

      <div className="relative z-10 p-6">
        {/* Header */}
        <CommandRoomHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          showCreateDialog={showCreateDialog}
          onCreateDialogChange={setShowCreateDialog}
          onCreateNew={handleCreateNew}
        />

        {/* Navigation Tabs */}
        <CommandRoomTabs activeTab={activeTab} onTabChange={setActiveTab}>
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
          <CommandRoomContent
            activeTab={activeTab}
            filteredItems={filteredItems}
            searchQuery={searchQuery}
            activeFiltersCount={getActiveFiltersCount()}
            onFavorite={handleFavorite}
            onItemClick={handleItemClick}
          />
        </CommandRoomTabs>

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
