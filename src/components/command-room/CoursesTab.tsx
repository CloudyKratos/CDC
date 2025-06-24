
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Youtube } from 'lucide-react';
import YouTubeEmbed from './YouTubeEmbed';

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

interface CoursesTabProps {
  videos: LearningVideo[];
  userProgress: Record<string, number>;
  onProgressUpdate: (videoId: string, progress: number) => void;
}

const CoursesTab: React.FC<CoursesTabProps> = ({
  videos,
  userProgress,
  onProgressUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

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

  return (
    <>
      {/* Search and Filters */}
      <Card className="bg-black/30 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl overflow-hidden">
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-cyan-400" />
                <Input
                  placeholder="Search for courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 lg:pl-12 bg-white/10 border-cyan-300/40 text-white placeholder:text-cyan-200/70 h-10 lg:h-12 rounded-xl text-sm lg:text-base focus:border-cyan-400 focus:ring-cyan-400/50"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 lg:px-4 py-2 lg:py-3 bg-white/10 border border-purple-300/40 rounded-xl text-white text-sm lg:text-base font-medium min-w-[140px] lg:min-w-[160px] focus:border-purple-400 focus:ring-purple-400/50"
              >
                {categories.map(category => (
                  <option key={category} value={category} className="bg-gray-800 text-white font-medium">
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 lg:px-4 py-2 lg:py-3 bg-white/10 border border-pink-300/40 rounded-xl text-white text-sm lg:text-base font-medium min-w-[140px] lg:min-w-[160px] focus:border-pink-400 focus:ring-pink-400/50"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty} className="bg-gray-800 text-white font-medium">
                    {difficulty === 'all' ? 'All Levels' : 
                     difficulty === 'beginner' ? 'Beginner' :
                     difficulty === 'intermediate' ? 'Intermediate' : 'Advanced'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Grid */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 lg:gap-8">
          {filteredVideos.map((video) => (
            <YouTubeEmbed
              key={video.id}
              videoId={video.videoId}
              title={video.title}
              description={video.description}
              duration={video.duration}
              progress={userProgress[video.id] || 0}
              onProgressUpdate={(progress) => onProgressUpdate(video.id, progress)}
              className="w-full"
            />
          ))}
        </div>
      ) : (
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-600/30 rounded-2xl overflow-hidden">
          <CardContent className="p-8 lg:p-12 text-center">
            <div className="space-y-6">
              <Youtube className="h-16 w-16 lg:h-20 lg:w-20 text-gray-400 mx-auto" />
              <div className="space-y-3">
                <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">No Learning Adventures Found</h3>
                <p className="text-gray-300 text-base lg:text-lg leading-relaxed max-w-md mx-auto">
                  {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                    ? 'Try adjusting your filters to discover amazing courses that match your learning goals.'
                    : 'Your learning universe is being prepared. Epic educational content coming soon!'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default CoursesTab;
