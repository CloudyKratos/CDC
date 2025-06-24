
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Flame, Target, Zap, Award } from 'lucide-react';

const CommandRoomHeader: React.FC = () => {
  return (
    <div className="text-center space-y-8 mb-16">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="relative flex flex-col lg:flex-row items-center justify-center gap-6 mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-60 group-hover:opacity-90 transition-all duration-500 animate-pulse"></div>
            <div className="relative p-6 bg-gradient-to-br from-cyan-500 via-purple-600 to-pink-600 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-500">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
          </div>
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-cyan-200 via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4 tracking-tight">
              Learning Universe
            </h1>
            <div className="flex items-center justify-center lg:justify-start gap-4">
              <Flame className="h-6 w-6 text-orange-400 animate-pulse" />
              <p className="text-xl lg:text-2xl text-cyan-100 font-semibold">Master Skills • Build Dreams • Achieve Greatness</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <p className="text-lg lg:text-xl text-blue-100/95 leading-relaxed font-medium">
          🚀 Welcome to your personal learning command center! Dive into expertly curated video courses, 
          track your progress with precision, unlock epic achievements, and level up your expertise in a 
          stunning immersive environment designed for champions.
        </p>
      </div>

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
  );
};

export default CommandRoomHeader;
