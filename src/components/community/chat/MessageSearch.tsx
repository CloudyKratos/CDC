import React, { useState, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, X, Calendar, User } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from 'date-fns';
import { Message } from '@/types/chat';

interface MessageSearchProps {
  messages: Message[];
  onMessageSelect?: (messageId: string) => void;
}

type SearchFilter = 'all' | 'user' | 'date' | 'has-reactions' | 'has-replies';

export const MessageSearch: React.FC<MessageSearchProps> = ({
  messages,
  onMessageSelect
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<SearchFilter>('all');

  // Get unique users for filter
  const uniqueUsers = useMemo(() => {
    const users = new Map();
    messages.forEach(message => {
      if (message.sender && !users.has(message.sender_id)) {
        users.set(message.sender_id, {
          id: message.sender_id,
          name: message.sender.full_name || message.sender.username || 'Unknown User'
        });
      }
    });
    return Array.from(users.values());
  }, [messages]);

  // Filter and search messages
  const filteredMessages = useMemo(() => {
    let filtered = [...messages];

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(message =>
        message.content.toLowerCase().includes(query) ||
        (message.sender?.full_name || '').toLowerCase().includes(query) ||
        (message.sender?.username || '').toLowerCase().includes(query)
      );
    }

    // User filter
    if (selectedUser !== 'all') {
      filtered = filtered.filter(message => message.sender_id === selectedUser);
    }

    // Type filter
    switch (searchFilter) {
      case 'has-reactions':
        filtered = filtered.filter(message => 
          message.reactions && message.reactions.length > 0
        );
        break;
      case 'has-replies':
        filtered = filtered.filter(message => 
          message.thread_count && message.thread_count > 0
        );
        break;
      // Add more filters as needed
    }

    // Sort by relevance (most recent first for now)
    return filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [messages, searchQuery, selectedUser, searchFilter]);

  const handleMessageClick = useCallback((messageId: string) => {
    onMessageSelect?.(messageId);
    setOpen(false);
  }, [onMessageSelect]);

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedUser('all');
    setSearchFilter('all');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Search className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-96 p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Messages
          </SheetTitle>
        </SheetHeader>

        <div className="p-4 border-b space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {selectedUser === 'all' ? 'All users' : 
                    uniqueUsers.find(u => u.id === selectedUser)?.name || 'All users'
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                {uniqueUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={searchFilter} onValueChange={(value) => setSearchFilter(value as SearchFilter)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All messages</SelectItem>
                <SelectItem value="has-reactions">With reactions</SelectItem>
                <SelectItem value="has-replies">With replies</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedUser !== 'all' || searchFilter !== 'all') && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  "{searchQuery}"
                </Badge>
              )}
              {selectedUser !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  {uniqueUsers.find(u => u.id === selectedUser)?.name}
                </Badge>
              )}
              {searchFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  {searchFilter === 'has-reactions' ? 'Has reactions' : 'Has replies'}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="h-6 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchQuery || selectedUser !== 'all' || searchFilter !== 'all'
                      ? 'No messages found'
                      : 'Start typing to search messages'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground mb-3">
                    Found {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
                  </p>
                  {filteredMessages.map(message => (
                    <div
                      key={message.id}
                      className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleMessageClick(message.id)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {message.sender?.full_name || message.sender?.username || 'Unknown User'}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2 break-words">
                        {message.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {message.edited && (
                          <Badge variant="outline" className="text-xs">edited</Badge>
                        )}
                        {message.reactions && message.reactions.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {message.reactions.length} reaction{message.reactions.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                        {message.thread_count && message.thread_count > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {message.thread_count} repl{message.thread_count !== 1 ? 'ies' : 'y'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};