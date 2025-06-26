
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
  Target
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Learning Vault</h1>
            <p className="text-gray-600">Master skills through curated courses</p>
          </div>
        </div>

        {isAdmin && (
          <Button 
            onClick={onAddCourse} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{totalCourses}</div>
          <div className="text-sm text-gray-500">Total Courses</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{completedCourses}</div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalHours}h</div>
          <div className="text-sm text-gray-500">Total Hours</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-600">{averageRating.toFixed(1)}</div>
          <div className="text-sm text-gray-500">Avg Rating</div>
        </div>
      </div>

      {/* Progress Bar */}
      {totalCourses > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-gray-900">{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumVaultHeader;
