import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, Loader2, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface SearchResult {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  channel_id: string;
  rank: number;
  sender?: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

interface ImprovedMessageSearchProps {
  channelId?: string;
  onMessageSelect?: (messageId: string) => void;
  onClose?: () => void;
  placeholder?: string;
}

export const ImprovedMessageSearch: React.FC<ImprovedMessageSearchProps> = ({
  channelId,
  onMessageSelect,
  onClose,
  placeholder = "Search messages..."
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const { user } = useAuth();

  // Debounced search function
  const performSearch = useCallback(async (term: string) => {
    if (!term.trim() || term.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      console.log('🔍 Searching messages for:', term);

      // Call the search function
      const { data: searchResults, error } = await supabase
        .rpc('search_messages', {
          search_term: term,
          channel_uuid: channelId || null,
          limit_count: 20
        });

      if (error) {
        console.error('❌ Search error:', error);
        toast.error('Search failed. Please try again.');
        return;
      }

      if (!searchResults) {
        setResults([]);
        return;
      }

      console.log('✅ Search results:', searchResults.length);

      // Fetch sender profiles for the results
      const senderIds = [...new Set(searchResults.map(r => r.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', senderIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Combine results with profiles
      const enrichedResults = searchResults.map(result => ({
        ...result,
        sender: profilesMap.get(result.sender_id)
      }));

      setResults(enrichedResults);

    } catch (error) {
      console.error('❌ Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [channelId]);

  // Handle search with debouncing
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  }, [performSearch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle message selection
  const handleMessageClick = (messageId: string) => {
    onMessageSelect?.(messageId);
    onClose?.();
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setHasSearched(false);
  };

  // Highlight search terms in content
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-900/50">$1</mark>');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          autoFocus
        />
        {(searchTerm || isSearching) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border rounded-lg bg-card"
          >
            <ScrollArea className="max-h-96">
              {results.length > 0 ? (
                <div className="p-2">
                  {results.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleMessageClick(result.id)}
                      className="p-3 rounded-md hover:bg-accent/50 cursor-pointer transition-colors border-b border-border/50 last:border-b-0"
                    >
                      <div className="flex items-start space-x-3">
                        <MessageCircle className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-1">
                            <span className="font-medium">
                              {result.sender?.full_name || result.sender?.username || 'Unknown User'}
                            </span>
                            <span>•</span>
                            <span>
                              {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p 
                            className="text-sm text-foreground line-clamp-2"
                            dangerouslySetInnerHTML={{
                              __html: highlightText(result.content, searchTerm)
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No messages found</p>
                  <p className="text-xs mt-1">Try different search terms</p>
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};