
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Star, 
  Clock, 
  TrendingUp, 
  Plus, 
  Award,
  Users,
  Target,
  Sparkles
} from 'lucide-react';

interface PremiumVaultHeaderProps {
  totalCourses: number;
  completedCourses: number;
  totalHours: string;
  averageRating: number;
  onAddCourse?: () => void;
  isAdmin?: boolean;
}

const PremiumVaultHeader: React.FC<PremiumVaultHeaderProps> = ({
  totalCourses,
  completedCourses,
  totalHours,
  averageRating,
  onAddCourse,
  isAdmin
}) => {
  const completionRate = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;
  const nextMilestone = completedCourses < 5 ? 5 : completedCourses < 10 ? 10 : completedCourses < 25 ? 25 : 50;
  const progressToMilestone = Math.round((completedCourses / nextMilestone) * 100);

  return (
    <div className="relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 opacity-95" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-10" />
      
      <div className="relative z-10 p-8 text-white">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-2xl">
                  <BookOpen className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Premium Course Vault
                </h1>
                <p className="text-blue-100 text-lg font-medium">
                  Master new skills with our curated collection of expert-led courses
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <Button 
                variant="secondary" 
                className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
              >
                <Target className="h-4 w-4 mr-2" />
                My Learning Path
              </Button>
              {isAdmin && (
                <Button 
                  onClick={onAddCourse} 
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Premium Course
                </Button>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/30 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-200" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalCourses}</div>
                  <div className="text-sm text-blue-200">Total Courses</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500/30 rounded-lg">
                  <Award className="h-5 w-5 text-green-200" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{completedCourses}</div>
                  <div className="text-sm text-green-200">Completed</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/30 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-200" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalHours}h</div>
                  <div className="text-sm text-purple-200">Learning Time</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-500/30 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-200" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{averageRating.toFixed(1)}</div>
                  <div className="text-sm text-yellow-200">Avg Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Learning Progress</h3>
                <p className="text-blue-200">
                  {completedCourses} of {totalCourses} courses completed • {completionRate}% completion rate
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-4 py-2">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {progressToMilestone}% to next milestone
                </Badge>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-4 py-2">
                  <Users className="h-4 w-4 mr-2" />
                  Premium Member
                </Badge>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="relative">
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 transition-all duration-1000 ease-out rounded-full shadow-lg"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              
              {/* Milestone Markers */}
              <div className="flex justify-between items-center mt-2 text-xs text-blue-200">
                <span>Beginner</span>
                <span>Intermediate</span>
                <span>Advanced</span>
                <span>Expert</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumVaultHeader;
