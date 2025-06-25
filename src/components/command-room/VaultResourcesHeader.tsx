
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Star, Clock, TrendingUp, Filter, Search, Plus } from 'lucide-react';

interface VaultResourcesHeaderProps {
  totalCourses: number;
  completedCourses: number;
  totalHours: string;
  averageRating: number;
  onAddCourse?: () => void;
  isAdmin?: boolean;
}

const VaultResourcesHeader: React.FC<VaultResourcesHeaderProps> = ({
  totalCourses,
  completedCourses,
  totalHours,
  averageRating,
  onAddCourse,
  isAdmin
}) => {
  const completionRate = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Header Content */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Course Library
            </h2>
            <p className="text-gray-600">
              Expand your knowledge with curated learning content
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
          {isAdmin && (
            <Button onClick={onAddCourse} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="h-4 w-4" />
              Add Course
            </Button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-blue-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalCourses}</div>
          <div className="text-sm text-gray-600">Total Courses</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{completedCourses}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{totalHours}</div>
          <div className="text-sm text-gray-600">Total Hours</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{completionRate}%</div>
          <div className="text-sm text-gray-600">Completion Rate</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm text-gray-600">{completedCourses}/{totalCourses} courses</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default VaultResourcesHeader;
