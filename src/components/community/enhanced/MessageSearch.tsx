import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Calendar, User, Hash, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion, AnimatePresence } from 'framer-motion';
import type { Message } from '@/types/chat';

interface SearchFilter {
  author?: string;
  channel?: string;
  dateFrom?: Date;
  dateTo?: Date;
  hasAttachments?: boolean;
  hasReactions?: boolean;
}

interface MessageSearchResult {
  message: Message;
  matchedText: string;
  context: {
    before: string;
    after: string;
  };
}

interface MessageSearchProps {
  messages: Message[];
  onMessageClick: (messageId: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

export const MessageSearch: React.FC<MessageSearchProps> = ({
  messages,
  onMessageClick,
  isOpen,
  onOpenChange,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter>({});
  const [results, setResults] = useState<MessageSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, filters, messages]);

  const performSearch = async () => {
    setIsSearching(true);
    
    try {
      const searchResults: MessageSearchResult[] = [];
      const searchTerm = query.toLowerCase();

      messages.forEach((message) => {
        const content = message.content.toLowerCase();
        const index = content.indexOf(searchTerm);
        
        if (index !== -1) {
          // Apply filters
          if (filters.author && message.sender?.full_name !== filters.author) return;
          if (filters.dateFrom && new Date(message.created_at) < filters.dateFrom) return;
          if (filters.dateTo && new Date(message.created_at) > filters.dateTo) return;
          
          // Create context around the match
          const start = Math.max(0, index - 50);
          const end = Math.min(content.length, index + searchTerm.length + 50);
          
          searchResults.push({
            message,
            matchedText: message.content.substring(index, index + searchTerm.length),
            context: {
              before: message.content.substring(start, index),
              after: message.content.substring(index + searchTerm.length, end)
            }
          });
        }
      });

      setResults(searchResults);
      setSelectedResult(0);
    } finally {
      setIsSearching(false);
    }
  };

  const highlightMatch = (text: string, matchedText: string) => {
    const parts = text.split(new RegExp(`(${matchedText})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === matchedText.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
          {part}
        </mark>
      ) : part
    );
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedResult(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedResult(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedResult]) {
      onMessageClick(results[selectedResult].message.id);
      onOpenChange(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const uniqueAuthors = Array.from(
    new Set(messages.map(m => m.sender?.full_name).filter(Boolean))
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          <Search size={16} />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Search size={20} />
            Search Messages
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search messages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-4"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X size={12} />
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filters:</span>
            </div>

            {/* Author Filter */}
            <Select value={filters.author || ''} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, author: value || undefined }))
            }>
              <SelectTrigger className="w-40 h-8">
                <SelectValue placeholder="Any author" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any author</SelectItem>
                {uniqueAuthors.map(author => (
                  <SelectItem key={author} value={author!}>
                    {author}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Range Filter */}
            <div className="flex items-center gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Calendar size={12} className="mr-1" />
                    {filters.dateFrom ? formatDate(filters.dateFrom.toISOString()) : 'From'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <CalendarComponent
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => setFilters(prev => ({ ...prev, dateFrom: date }))}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Calendar size={12} className="mr-1" />
                    {filters.dateTo ? formatDate(filters.dateTo.toISOString()) : 'To'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <CalendarComponent
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => setFilters(prev => ({ ...prev, dateTo: date }))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Clear Filters */}
            {Object.keys(filters).some(key => filters[key as keyof SearchFilter]) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-destructive hover:text-destructive"
              >
                <X size={12} className="mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {Object.keys(filters).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {filters.author && (
                <Badge variant="secondary" className="text-xs">
                  <User size={10} className="mr-1" />
                  {filters.author}
                  <X 
                    size={10} 
                    className="ml-1 cursor-pointer" 
                    onClick={() => setFilters(prev => ({ ...prev, author: undefined }))}
                  />
                </Badge>
              )}
              {filters.dateFrom && (
                <Badge variant="secondary" className="text-xs">
                  From {formatDate(filters.dateFrom.toISOString())}
                  <X 
                    size={10} 
                    className="ml-1 cursor-pointer" 
                    onClick={() => setFilters(prev => ({ ...prev, dateFrom: undefined }))}
                  />
                </Badge>
              )}
              {filters.dateTo && (
                <Badge variant="secondary" className="text-xs">
                  To {formatDate(filters.dateTo.toISOString())}
                  <X 
                    size={10} 
                    className="ml-1 cursor-pointer" 
                    onClick={() => setFilters(prev => ({ ...prev, dateTo: undefined }))}
                  />
                </Badge>
              )}
            </div>
          )}

          <Separator />

          {/* Search Results */}
          <div className="space-y-2">
            {query && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {isSearching ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''}`}
                </span>
                {results.length > 0 && (
                  <span>Use ↑↓ arrows to navigate, Enter to select</span>
                )}
              </div>
            )}

            <ScrollArea className="h-96">
              <AnimatePresence>
                {results.map((result, index) => (
                  <motion.div
                    key={result.message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        index === selectedResult 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'hover:bg-secondary/50'
                      }`}
                      onClick={() => {
                        onMessageClick(result.message.id);
                        onOpenChange(false);
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">
                          {result.message.sender?.full_name || 'Anonymous'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(result.message.created_at)} at {formatTime(result.message.created_at)}
                        </span>
                      </div>
                      
                      <div className="text-sm leading-relaxed">
                        {result.context.before}
                        {highlightMatch(result.matchedText, query)}
                        {result.context.after}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {query && results.length === 0 && !isSearching && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search size={24} className="mx-auto mb-2 opacity-50" />
                  <div>No messages found matching your search</div>
                  <div className="text-xs mt-1">Try adjusting your search terms or filters</div>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};