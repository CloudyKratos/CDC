
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Pin, Bell, Users, Hash, Zap, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IntegratedChatFeaturesProps {
  onSearch: (query: string) => void;
  onFilter: (filter: string) => void;
  searchResults?: Array<any>;
  pinnedMessages?: Array<any>;
  activeUsers?: number;
  className?: string;
}

export const IntegratedChatFeatures: React.FC<IntegratedChatFeaturesProps> = ({
  onSearch,
  onFilter,
  searchResults = [],
  pinnedMessages = [],
  activeUsers = 0,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFeatures, setShowFeatures] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilter = (filter: string) => {
    setActiveFilter(filter);
    onFilter(filter);
  };

  const filters = [
    { id: 'all', label: 'All Messages', icon: MessageSquare },
    { id: 'pinned', label: 'Pinned', icon: Pin },
    { id: 'mentions', label: 'Mentions', icon: Bell },
    { id: 'media', label: 'Media', icon: Zap },
  ];

  return (
    <div className={cn(
      "bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700",
      className
    )}>
      {/* Main Features Bar */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && searchResults.length > 0 && (
              <Badge variant="secondary" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs">
                {searchResults.length}
              </Badge>
            )}
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
              <Users className="h-4 w-4" />
              <span>{activeUsers}</span>
            </div>
            
            {pinnedMessages.length > 0 && (
              <Badge variant="outline" className="gap-1">
                <Pin className="h-3 w-3" />
                {pinnedMessages.length}
              </Badge>
            )}
          </div>

          {/* Features Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFeatures(!showFeatures)}
            className="h-9 w-9 p-0"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Extended Features Panel */}
      {showFeatures && (
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <div className="space-y-3">
            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Filter by:
              </span>
              <div className="flex gap-1">
                {filters.map((filter) => (
                  <Button
                    key={filter.id}
                    variant={activeFilter === filter.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleFilter(filter.id)}
                    className="h-7 px-3 gap-1.5"
                  >
                    <filter.icon className="h-3 w-3" />
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Quick actions:
              </span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-7 px-3 gap-1.5">
                  <Hash className="h-3 w-3" />
                  Jump to Channel
                </Button>
                <Button variant="outline" size="sm" className="h-7 px-3 gap-1.5">
                  <Bell className="h-3 w-3" />
                  Notifications
                </Button>
                <Button variant="outline" size="sm" className="h-7 px-3 gap-1.5">
                  <Zap className="h-3 w-3" />
                  Shortcuts
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Preview */}
      {searchQuery && searchResults.length > 0 && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/10 border-t border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Found {searchResults.length} results for "{searchQuery}"
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSearch('')}
              className="h-6 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
