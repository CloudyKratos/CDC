
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Flame, Target, Zap, Award } from 'lucide-react';

const CommandRoomHeader: React.FC = () => {
  return (
    <div className="text-center space-y-6 mb-12">
      <div className="relative">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 mb-6">
          <div className="relative">
            <div className="p-4 bg-gradient-to-br from-cyan-500 via-purple-600 to-pink-600 rounded-full shadow-xl">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
          </div>
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-200 via-purple-200 to-pink-200 bg-clip-text text-transparent mb-3 tracking-tight">
              Learning Universe
            </h1>
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <Flame className="h-5 w-5 text-orange-400" />
              <p className="text-lg lg:text-xl text-cyan-100 font-semibold">Master Skills • Build Dreams • Achieve Greatness</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <p className="text-base lg:text-lg text-blue-100/95 leading-relaxed font-medium">
          🚀 Welcome to your personal learning command center! Dive into expertly curated video courses, 
          track your progress with precision, unlock epic achievements, and level up your expertise.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        <Badge className="bg-gradient-to-r from-emerald-500/80 to-green-500/80 text-white border-0 px-4 py-2 text-sm font-bold rounded-full shadow-lg">
          <Target className="h-4 w-4 mr-2" />
          Skill Mastery Hub
        </Badge>
        <Badge className="bg-gradient-to-r from-amber-500/80 to-orange-500/80 text-white border-0 px-4 py-2 text-sm font-bold rounded-full shadow-lg">
          <Zap className="h-4 w-4 mr-2" />
          Lightning Learning
        </Badge>
        <Badge className="bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white border-0 px-4 py-2 text-sm font-bold rounded-full shadow-lg">
          <Award className="h-4 w-4 mr-2" />
          Achievement Unlocked
        </Badge>
      </div>
    </div>
  );
};

export default CommandRoomHeader;
