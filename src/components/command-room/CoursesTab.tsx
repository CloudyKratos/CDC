
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
      <Card className="bg-black/40 backdrop-blur-3xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
        <CardContent className="p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <div className="flex-1">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Search className="absolute left-4 lg:left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 lg:h-6 lg:w-6 text-cyan-400" />
                <Input
                  placeholder="Search for life-changing courses and unlock your potential..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 lg:pl-16 bg-white/10 border-cyan-300/40 text-white placeholder:text-cyan-200/70 h-12 lg:h-16 rounded-2xl text-base lg:text-lg focus:border-cyan-400 focus:ring-cyan-400/50 focus:ring-4 transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 lg:px-6 py-3 lg:py-4 bg-white/10 border border-purple-300/40 rounded-2xl text-white text-base lg:text-lg font-medium min-w-[180px] lg:min-w-[200px] focus:border-purple-400 focus:ring-purple-400/50 focus:ring-4 transition-all duration-300 hover:bg-white/15"
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
                  className="px-4 lg:px-6 py-3 lg:py-4 bg-white/10 border border-pink-300/40 rounded-2xl text-white text-base lg:text-lg font-medium min-w-[180px] lg:min-w-[200px] focus:border-pink-400 focus:ring-pink-400/50 focus:ring-4 transition-all duration-300 hover:bg-white/15"
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

      {/* Video Grid */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8 lg:gap-10">
          {filteredVideos.map((video) => (
            <YouTubeEmbed
              key={video.id}
              videoId={video.videoId}
              title={video.title}
              description={video.description}
              duration={video.duration}
              progress={userProgress[video.id] || 0}
              onProgressUpdate={(progress) => onProgressUpdate(video.id, progress)}
              className="w-full transform hover:scale-105 hover:-rotate-1 transition-all duration-500 hover:shadow-2xl"
            />
          ))}
        </div>
      ) : (
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-2xl border border-gray-600/30 rounded-3xl overflow-hidden">
          <CardContent className="p-12 lg:p-16 text-center">
            <div className="space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 to-gray-600/20 rounded-full blur-3xl"></div>
                <Youtube className="relative h-20 w-20 lg:h-24 lg:w-24 text-gray-400 mx-auto" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">No Learning Adventures Found</h3>
                <p className="text-gray-300 text-lg lg:text-xl leading-relaxed max-w-md mx-auto">
                  {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                    ? '🔍 Try adjusting your filters to discover amazing courses that match your learning goals.'
                    : '🎓 Your learning universe is being prepared. Epic educational content coming soon!'}
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
