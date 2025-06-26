
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Grid, List } from 'lucide-react';

interface CourseFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  categories: string[];
  filteredCount: number;
  totalCount: number;
  onClearFilters: () => void;
}

const CourseFilters: React.FC<CourseFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedDifficulty,
  onDifficultyChange,
  viewMode,
  onViewModeChange,
  categories,
  filteredCount,
  totalCount,
  onClearFilters
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Enhanced Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search courses, instructors, or topics..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-base"
          />
        </div>

        {/* View Toggle */}
        <div className="flex border border-gray-300 rounded-xl overflow-hidden">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            onClick={() => onViewModeChange('grid')}
            className="rounded-none"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            onClick={() => onViewModeChange('list')}
            className="rounded-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Premium Filter Pills */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">Filters:</span>
        </div>
        
        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`cursor-pointer transition-all duration-200 ${
                selectedCategory === category 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-md' 
                  : 'text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }`}
              onClick={() => onCategoryChange(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Badge>
          ))}
        </div>

        <div className="h-6 w-px bg-gray-300" />

        {/* Difficulty Filters */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'beginner', 'intermediate', 'advanced'].map((difficulty) => (
            <Badge
              key={difficulty}
              variant={selectedDifficulty === difficulty ? "default" : "outline"}
              className={`cursor-pointer transition-all duration-200 ${
                selectedDifficulty === difficulty 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-md' 
                  : 'text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }`}
              onClick={() => onDifficultyChange(difficulty)}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Badge>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredCount}</span> of <span className="font-semibold">{totalCount}</span> premium courses
        </span>
        {filteredCount !== totalCount && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            Clear All Filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default CourseFilters;
