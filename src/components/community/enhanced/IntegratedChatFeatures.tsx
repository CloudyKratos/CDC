
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  Users, 
  Settings, 
  Bell,
  Hash,
  MessageSquare,
  MoreHorizontal,
  X,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface IntegratedChatFeaturesProps {
  onSearch: (query: string) => void;
  onFilter: (filter: string) => void;
  searchResults: any[];
  activeUsers: number;
  className?: string;
}

export const IntegratedChatFeatures: React.FC<IntegratedChatFeaturesProps> = ({
  onSearch,
  onFilter,
  searchResults,
  activeUsers,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilter = (filter: string) => {
    setActiveFilter(filter);
    onFilter(filter);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  const filters = [
    { id: 'all', label: 'All Messages', icon: MessageSquare },
    { id: 'mentions', label: 'Mentions', icon: Bell },
    { id: 'media', label: 'Media', icon: Hash },
    { id: 'links', label: 'Links', icon: MoreHorizontal }
  ];

  return (
    <div className={cn(
      "bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50",
      "safe-area-inset-top", // Mobile safe area support
      className
    )}>
      {/* Main Header - Mobile responsive */}
      <div className="px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
              <span className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                Community Chat
              </span>
            </div>
            
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 flex-shrink-0 hidden xs:flex">
              <Users className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">{activeUsers} online</span>
              <span className="sm:hidden">{activeUsers}</span>
            </Badge>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-9 w-9 sm:h-8 sm:w-8 p-0 touch-target", // Larger on mobile
                showFilters && "bg-slate-100 dark:bg-slate-800"
              )}
            >
              <Filter className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 w-9 sm:h-8 sm:w-8 p-0 touch-target hidden sm:flex"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search Bar - Mobile optimized */}
        <div className="mt-3 sm:mt-4 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className={cn(
                "pl-10 pr-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
                "focus:ring-2 focus:ring-blue-500/20 touch-manipulation",
                "h-10 sm:h-9 text-base sm:text-sm" // Better mobile sizing
              )}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 sm:h-6 sm:w-6 p-0 touch-target"
              >
                <X className="h-4 w-4 sm:h-3 sm:w-3" />
              </Button>
            )}
          </div>
          
          {searchQuery && searchResults.length > 0 && (
            <Badge variant="outline" className="mt-2 bg-blue-50 text-blue-700 border-blue-200">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </Badge>
          )}
        </div>
      </div>

      {/* Expandable Filters - Mobile optimized */}
      {showFilters && (
        <>
          <Separator />
          <div className="px-3 sm:px-6 py-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 flex-shrink-0 hidden sm:block">
                Filter by:
              </span>
              
              <div className="flex gap-2 min-w-max pb-1">
                {filters.map((filter) => {
                  const Icon = filter.icon;
                  const isActive = activeFilter === filter.id;
                  
                  return (
                    <Button
                      key={filter.id}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilter(filter.id)}
                      className={cn(
                        "h-8 sm:h-7 text-xs whitespace-nowrap touch-target px-3 sm:px-2",
                        "flex-shrink-0", // Prevent shrinking in flex container
                        isActive 
                          ? "bg-blue-600 text-white hover:bg-blue-700" 
                          : "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                      )}
                    >
                      <Icon className="h-3 w-3 mr-1.5" />
                      <span className="hidden sm:inline">{filter.label}</span>
                      <span className="sm:hidden">
                        {filter.label.split(' ')[0]} {/* Show first word on mobile */}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
