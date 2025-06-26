
import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  BarChart3, 
  Users, 
  Settings, 
  Plus,
  Sparkles,
  Trophy,
  Target
} from 'lucide-react';
import { mockLearningContent } from './mockData';
import PremiumCoursesTab from './PremiumCoursesTab';
import ProgressTab from './ProgressTab';
import AddYouTubeVideoModal from './AddYouTubeVideoModal';

interface CommandRoomTabsProps {
  isAdmin?: boolean;
}

const CommandRoomTabs: React.FC<CommandRoomTabsProps> = ({ isAdmin = false }) => {
  const [activeTab, setActiveTab] = useState('courses');
  const [userProgress, setUserProgress] = useState<Record<string, number>>({
    '1': 75,
    '2': 100,
    '3': 25,
    '4': 0,
    '5': 90
  });
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [videos, setVideos] = useState(mockLearningContent);

  const handleProgressUpdate = (videoId: string, progress: number) => {
    setUserProgress(prev => ({
      ...prev,
      [videoId]: progress
    }));
  };

  const handleAddVideo = (videoData: any) => {
    const newVideo = {
      ...videoData,
      id: (videos.length + 1).toString(),
      addedAt: new Date()
    };
    setVideos(prev => [...prev, newVideo]);
    setShowAddVideoModal(false);
  };

  const tabContent = {
    courses: {
      icon: BookOpen,
      label: 'Premium Courses',
      badge: videos.length,
      color: 'from-blue-600 to-purple-600'
    },
    progress: {
      icon: BarChart3,
      label: 'Progress',
      badge: Object.values(userProgress).filter(p => p === 100).length,
      color: 'from-green-600 to-emerald-600'
    },
    community: {
      icon: Users,
      label: 'Community',
      badge: '12',
      color: 'from-orange-600 to-red-600'
    },
    settings: {
      icon: Settings,
      label: 'Settings',
      badge: null,
      color: 'from-gray-600 to-slate-600'
    }
  };

  return (
    <div className="space-y-6">
      {/* Premium Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-4 px-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Command Room</h2>
                <p className="text-gray-600">Your premium learning headquarters</p>
              </div>
            </div>
            
            {isAdmin && (
              <Button
                onClick={() => setShowAddVideoModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Content
              </Button>
            )}
          </div>

          <TabsList className="grid w-full grid-cols-4 bg-gray-50 p-1 rounded-xl">
            {Object.entries(tabContent).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="relative flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-md"
                >
                  <Icon className={`h-4 w-4 ${activeTab === key ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className={activeTab === key ? 'text-gray-900' : 'text-gray-600'}>
                    {config.label}
                  </span>
                  {config.badge && (
                    <Badge className={`ml-1 ${
                      activeTab === key 
                        ? `bg-gradient-to-r ${config.color} text-white border-0` 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {config.badge}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab Content */}
          <div className="mt-6">
            <TabsContent value="courses" className="m-0">
              <PremiumCoursesTab
                videos={videos}
                userProgress={userProgress}
                onProgressUpdate={handleProgressUpdate}
                searchTerm=""
                selectedCategory="all"
                viewMode="grid"
                isAdmin={isAdmin}
                onAddVideo={() => setShowAddVideoModal(true)}
              />
            </TabsContent>

            <TabsContent value="progress" className="m-0">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8">
                <ProgressTab
                  videos={videos}
                  userProgress={userProgress}
                />
              </div>
            </TabsContent>

            <TabsContent value="community" className="m-0">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 text-center">
                <Users className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Community Hub</h3>
                <p className="text-gray-600 mb-6">Connect with fellow learners and share your progress</p>
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  Join Community
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="m-0">
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-8 text-center">
                <Settings className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Learning Settings</h3>
                <p className="text-gray-600 mb-6">Customize your learning experience and preferences</p>
                <Button variant="outline" className="border-gray-300">
                  Configure Settings
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Add Video Modal */}
      <AddYouTubeVideoModal
        isOpen={showAddVideoModal}
        onClose={() => setShowAddVideoModal(false)}
        onAdd={handleAddVideo}
      />
    </div>
  );
};

export default CommandRoomTabs;
