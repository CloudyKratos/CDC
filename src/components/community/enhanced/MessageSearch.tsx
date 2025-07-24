
import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Calendar, User, Hash } from 'lucide-react';
import { Message } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';

interface MessageSearchProps {
  messages: Message[];
  onSearch: (query: string) => void;
  searchResults: Message[];
  currentQuery: string;
  className?: string;
}

export const MessageSearch: React.FC<MessageSearchProps> = ({
  messages = [], // Provide default empty array
  onSearch,
  searchResults = [], // Provide default empty array
  currentQuery,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(currentQuery);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [selectedUser, setSelectedUser] = useState<string>('');

  // Ensure messages is always an array
  const safeMessages = Array.isArray(messages) ? messages : [];
  const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];

  // Get unique users from messages
  const uniqueUsers = useMemo(() => {
    const users = new Map();
    safeMessages.forEach(msg => {
      if (msg?.sender && !users.has(msg.sender.id)) {
        users.set(msg.sender.id, msg.sender);
      }
    });
    return Array.from(users.values());
  }, [safeMessages]);

  // Filter messages based on search criteria
  const filteredResults = useMemo(() => {
    let results = safeSearchResults;

    // Filter by date
    if (selectedFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (selectedFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      results = results.filter(msg => msg?.created_at && new Date(msg.created_at) >= filterDate);
    }

    // Filter by user
    if (selectedUser) {
      results = results.filter(msg => msg?.sender_id === selectedUser);
    }

    return results;
  }, [safeSearchResults, selectedFilter, selectedUser]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleFilterClick = (filter: typeof selectedFilter) => {
    setSelectedFilter(filter);
  };

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term || !text) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className={`h-full flex flex-col space-y-4 ${className}`}>
      {/* Search Header */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-lg">Message Search</h3>
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <Input
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={selectedFilter === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => handleFilterClick('all')}
          >
            All Time
          </Badge>
          <Badge 
            variant={selectedFilter === 'today' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => handleFilterClick('today')}
          >
            <Calendar className="h-3 w-3 mr-1" />
            Today
          </Badge>
          <Badge 
            variant={selectedFilter === 'week' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => handleFilterClick('week')}
          >
            This Week
          </Badge>
          <Badge 
            variant={selectedFilter === 'month' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => handleFilterClick('month')}
          >
            This Month
          </Badge>
        </div>

        {/* User Filter */}
        {uniqueUsers.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by User:</p>
            <div className="flex flex-wrap gap-1">
              <Badge 
                variant={selectedUser === '' ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => setSelectedUser('')}
              >
                All Users
              </Badge>
              {uniqueUsers.slice(0, 5).map((user: any) => (
                <Badge 
                  key={user?.id || 'unknown'}
                  variant={selectedUser === user?.id ? 'default' : 'outline'}
                  className="cursor-pointer text-xs"
                  onClick={() => setSelectedUser(user?.id || '')}
                >
                  <User className="h-3 w-3 mr-1" />
                  {user?.full_name || user?.username || 'Unknown'}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {currentQuery && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} for "{currentQuery}"
          </div>
        )}

        {filteredResults.length === 0 && currentQuery ? (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No messages found</p>
            <p className="text-sm">Try different keywords or filters</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredResults.map((message) => (
              <div 
                key={message?.id || Math.random()}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {(message?.sender?.full_name || message?.sender?.username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-sm">
                      {message?.sender?.full_name || message?.sender?.username || 'Unknown User'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {message?.created_at ? formatDistanceToNow(new Date(message.created_at), { addSuffix: true }) : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {highlightSearchTerm(message?.content || '', currentQuery)}
                </p>
              </div>
            ))}
          </div>
        )}

        {!currentQuery && (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Start typing to search messages</p>
            <p className="text-sm">Find messages by content, user, or date</p>
          </div>
        )}
      </div>
    </div>
  );
};
