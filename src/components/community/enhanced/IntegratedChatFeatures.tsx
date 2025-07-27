
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
      "bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50",
      className
    )}>
      {/* Main Header */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Community Chat
              </span>
            </div>
            
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
              <Users className="h-3 w-3 mr-1" />
              {activeUsers} online
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-8 w-8 p-0",
                showFilters && "bg-slate-100 dark:bg-slate-800"
              )}
            >
              <Filter className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
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

      {/* Expandable Filters */}
      {showFilters && (
        <>
          <Separator />
          <div className="px-6 py-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 flex-shrink-0">
                Filter by:
              </span>
              
              <div className="flex gap-2">
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
                        "h-7 text-xs whitespace-nowrap",
                        isActive 
                          ? "bg-blue-600 text-white hover:bg-blue-700" 
                          : "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                      )}
                    >
                      <Icon className="h-3 w-3 mr-1.5" />
                      {filter.label}
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
