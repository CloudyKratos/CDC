import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Search } from 'lucide-react';

const EMOJI_CATEGORIES = {
  recent: {
    name: 'Recent',
    emojis: []
  },
  smileys: {
    name: 'Smileys & Emotion',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
      '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
      '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
      '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬'
    ]
  },
  people: {
    name: 'People & Body',
    emojis: [
      '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟',
      '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎',
      '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'
    ]
  },
  animals: {
    name: 'Animals & Nature',
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
      '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒',
      '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇'
    ]
  },
  food: {
    name: 'Food & Drink',
    emojis: [
      '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒',
      '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬',
      '🥒', '🌶️', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🍞'
    ]
  },
  activities: {
    name: 'Activities',
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
      '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '⛳', '🪁', '🏹',
      '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿'
    ]
  },
  travel: {
    name: 'Travel & Places',
    emojis: [
      '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
      '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛺', '🚨',
      '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞'
    ]
  },
  objects: {
    name: 'Objects',
    emojis: [
      '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️',
      '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥',
      '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️'
    ]
  },
  symbols: {
    name: 'Symbols',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
      '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐'
    ]
  },
  flags: {
    name: 'Flags',
    emojis: [
      '🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇦🇨', '🇦🇩'
    ]
  }
};

const RECENT_EMOJIS_KEY = 'lovable-chat-recent-emojis';

interface EnhancedEmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}

export const EnhancedEmojiPicker: React.FC<EnhancedEmojiPickerProps> = ({
  onEmojiSelect,
  className = ''
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('smileys');

  // Load recent emojis from localStorage
  const recentEmojis = useMemo(() => {
    try {
      const stored = localStorage.getItem(RECENT_EMOJIS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  // Update recent emojis with current ones
  const categoriesWithRecent = useMemo(() => {
    const categories = { ...EMOJI_CATEGORIES };
    categories.recent.emojis = recentEmojis;
    return categories;
  }, [recentEmojis]);

  // Filter emojis based on search query
  const filteredEmojis = useMemo(() => {
    if (!searchQuery) return null;
    
    const query = searchQuery.toLowerCase();
    const allEmojis = Object.values(EMOJI_CATEGORIES)
      .flatMap(category => category.emojis)
      .filter(emoji => emoji.includes(query));
    
    return allEmojis;
  }, [searchQuery]);

  const handleEmojiClick = (emoji: string) => {
    // Add to recent emojis
    try {
      const recent = [...recentEmojis];
      const existingIndex = recent.indexOf(emoji);
      
      if (existingIndex > -1) {
        recent.splice(existingIndex, 1);
      }
      
      recent.unshift(emoji);
      const limitedRecent = recent.slice(0, 20); // Keep only 20 recent emojis
      
      localStorage.setItem(RECENT_EMOJIS_KEY, JSON.stringify(limitedRecent));
    } catch (error) {
      console.warn('Failed to save recent emoji:', error);
    }

    onEmojiSelect(emoji);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-7 w-7 p-0 rounded-md hover:bg-muted transition-colors ${className}`}
          title="Add reaction"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="center" sideOffset={8}>
        <div className="flex flex-col h-80">
          {/* Search */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search emojis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8"
              />
            </div>
          </div>

          {searchQuery ? (
            // Search Results
            <ScrollArea className="flex-1 p-2">
              <div className="grid grid-cols-8 gap-1">
                {filteredEmojis?.map((emoji, index) => (
                  <Button
                    key={`${emoji}-${index}`}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-lg hover:bg-muted rounded-lg transition-all duration-200 hover:scale-110"
                    onClick={() => handleEmojiClick(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
              {filteredEmojis?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No emojis found
                </div>
              )}
            </ScrollArea>
          ) : (
            // Category Tabs
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex-1 flex flex-col">
              <TabsList className="grid grid-cols-4 gap-0 h-9 mx-3 mt-2">
                <TabsTrigger value="recent" className="text-xs px-1" disabled={recentEmojis.length === 0}>
                  🕒
                </TabsTrigger>
                <TabsTrigger value="smileys" className="text-xs px-1">😀</TabsTrigger>
                <TabsTrigger value="people" className="text-xs px-1">👋</TabsTrigger>
                <TabsTrigger value="animals" className="text-xs px-1">🐶</TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-hidden">
                {Object.entries(categoriesWithRecent).map(([key, category]) => (
                  <TabsContent key={key} value={key} className="h-full m-0 p-2">
                    <ScrollArea className="h-full">
                      <div className="grid grid-cols-8 gap-1">
                        {category.emojis.map((emoji, index) => (
                          <Button
                            key={`${emoji}-${index}`}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-lg hover:bg-muted rounded-lg transition-all duration-200 hover:scale-110"
                            onClick={() => handleEmojiClick(emoji)}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                      {category.emojis.length === 0 && key === 'recent' && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          No recent emojis
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};