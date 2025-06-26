
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Zap } from 'lucide-react';

interface EmptyCoursesStateProps {
  searchTerm: string;
  selectedCategory: string;
  selectedDifficulty: string;
  isAdmin?: boolean;
  onAddVideo?: () => void;
}

const EmptyCoursesState: React.FC<EmptyCoursesStateProps> = ({
  searchTerm,
  selectedCategory,
  selectedDifficulty,
  isAdmin,
  onAddVideo
}) => {
  const hasFilters = searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all';

  return (
    <div className="text-center py-20 bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl border border-slate-200">
      <div className="max-w-md mx-auto space-y-6">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto">
          <BookOpen className="h-12 w-12 text-blue-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">No Courses Found</h3>
          <p className="text-gray-600">
            {hasFilters
              ? 'Try adjusting your search criteria or filters.' 
              : 'Start building your premium course library.'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={onAddVideo} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
            <Zap className="h-4 w-4 mr-2" />
            Add First Course
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyCoursesState;
