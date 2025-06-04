
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icons from '@/utils/IconUtils';

export interface FilterState {
  category: string;
  level: string;
  coach: string;
  format: string;
}

interface LearningFiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

const LearningFilters: React.FC<LearningFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  activeFiltersCount
}) => {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg border border-purple-200/30 dark:border-purple-800/30">
      <div className="flex items-center gap-2">
        <Icons.Filter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
      </div>

      <Select value={filters.category} onValueChange={(value) => onFilterChange('category', value)}>
        <SelectTrigger className="w-40 bg-white/70 dark:bg-gray-800/70">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="rituals">Rituals</SelectItem>
          <SelectItem value="mindset">Mindset</SelectItem>
          <SelectItem value="systems">Systems</SelectItem>
          <SelectItem value="wellness">Wellness</SelectItem>
          <SelectItem value="productivity">Productivity</SelectItem>
          <SelectItem value="strategy">Strategy</SelectItem>
          <SelectItem value="wisdom">Wisdom</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.level} onValueChange={(value) => onFilterChange('level', value)}>
        <SelectTrigger className="w-36 bg-white/70 dark:bg-gray-800/70">
          <SelectValue placeholder="Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          <SelectItem value="beginner">Beginner</SelectItem>
          <SelectItem value="intermediate">Intermediate</SelectItem>
          <SelectItem value="advanced">Advanced</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.coach} onValueChange={(value) => onFilterChange('coach', value)}>
        <SelectTrigger className="w-36 bg-white/70 dark:bg-gray-800/70">
          <SelectValue placeholder="Coach" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Coaches</SelectItem>
          <SelectItem value="alex">Alex Chen</SelectItem>
          <SelectItem value="maya">Maya Singh</SelectItem>
          <SelectItem value="jordan">Jordan Blake</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.format} onValueChange={(value) => onFilterChange('format', value)}>
        <SelectTrigger className="w-32 bg-white/70 dark:bg-gray-800/70">
          <SelectValue placeholder="Format" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Formats</SelectItem>
          <SelectItem value="video">Video</SelectItem>
          <SelectItem value="pdf">PDF</SelectItem>
          <SelectItem value="checklist">Checklist</SelectItem>
          <SelectItem value="template">Template</SelectItem>
        </SelectContent>
      </Select>

      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            {activeFiltersCount} active
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <Icons.X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      )}
    </div>
  );
};

export default LearningFilters;
