
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, Target, Zap, Award, Plus, Youtube } from 'lucide-react';

interface CommandRoomHeaderProps {
  isAdmin?: boolean;
  onAddVideo?: () => void;
}

const CommandRoomHeader: React.FC<CommandRoomHeaderProps> = ({ isAdmin, onAddVideo }) => {
  return (
    <div className="mb-8">
      {/* Main Header Section */}
      <div className="flex flex-col lg:flex-row items-start justify-between gap-6 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 via-purple-600 to-pink-600 rounded-xl">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-200 via-purple-200 to-pink-200 bg-clip-text text-transparent tracking-tight">
                Learning Command Room
              </h1>
              <p className="text-cyan-100 text-lg font-medium mt-1">
                Master Skills • Build Knowledge • Achieve Excellence
              </p>
            </div>
          </div>
          
          {/* Quick Stats Row */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 px-3 py-1">
              <Target className="h-4 w-4 mr-2" />
              Skill Hub
            </Badge>
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/30 px-3 py-1">
              <Zap className="h-4 w-4 mr-2" />
              Fast Learning
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 px-3 py-1">
              <Award className="h-4 w-4 mr-2" />
              Achievements
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
          {isAdmin && (
            <Button 
              onClick={onAddVideo}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
            >
              <Youtube className="h-5 w-5 mr-2" />
              Add YouTube Video
            </Button>
          )}
          <Button 
            variant="outline"
            className="border-cyan-400/40 text-cyan-300 bg-cyan-500/10 px-6 py-3 rounded-xl font-semibold"
          >
            <Plus className="h-5 w-5 mr-2" />
            Quick Add
          </Button>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <p className="text-blue-100/90 leading-relaxed">
          🚀 Welcome to your learning command center! Access curated video courses, track your progress, 
          and unlock achievements as you advance your skills.
        </p>
      </div>
    </div>
  );
};

export default CommandRoomHeader;
