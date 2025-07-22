import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile, Plus, MoreHorizontal } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface ReactionData {
  emoji: string;
  count: number;
  users: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  hasReacted: boolean;
}

interface EnhancedMessageReactionsProps {
  messageId: string;
  reactions: ReactionData[];
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  onReactionHover?: (reaction: ReactionData) => void;
  maxDisplay?: number;
  showQuickReactions?: boolean;
  className?: string;
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];
const ALL_REACTIONS = [
  '👍', '👎', '❤️', '💔', '😂', '😭', '😮', '😱', '😡', '😤',
  '🎉', '🎊', '🔥', '💯', '⭐', '✨', '💎', '🚀', '⚡', '💪',
  '👏', '🙌', '🤝', '👋', '💡', '🎯', '🏆', '🥇', '📈', '💰'
];

export const EnhancedMessageReactions: React.FC<EnhancedMessageReactionsProps> = ({
  messageId,
  reactions,
  onAddReaction,
  onRemoveReaction,
  onReactionHover,
  maxDisplay = 6,
  showQuickReactions = true,
  className = ''
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showAllReactions, setShowAllReactions] = useState(false);

  const displayReactions = reactions.filter(r => r.count > 0);
  const visibleReactions = showAllReactions ? displayReactions : displayReactions.slice(0, maxDisplay);
  const hiddenReactionsCount = displayReactions.length - maxDisplay;

  const handleReactionClick = (emoji: string, hasReacted: boolean) => {
    if (hasReacted) {
      onRemoveReaction(messageId, emoji);
    } else {
      onAddReaction(messageId, emoji);
    }
  };

  const handleQuickReaction = (emoji: string) => {
    const existingReaction = reactions.find(r => r.emoji === emoji);
    if (existingReaction?.hasReacted) {
      onRemoveReaction(messageId, emoji);
    } else {
      onAddReaction(messageId, emoji);
    }
  };

  if (displayReactions.length === 0 && !showQuickReactions) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Existing Reactions */}
      {displayReactions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <AnimatePresence>
            {visibleReactions.map((reaction) => (
              <motion.div
                key={reaction.emoji}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={reaction.hasReacted ? "default" : "outline"}
                  size="sm"
                  className={`h-7 px-2 rounded-full text-xs transition-all duration-200 ${
                    reaction.hasReacted 
                      ? 'bg-primary/20 text-primary border-primary/30 hover:bg-primary/30' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                  onClick={() => handleReactionClick(reaction.emoji, reaction.hasReacted)}
                  onMouseEnter={() => onReactionHover?.(reaction)}
                >
                  <span className="mr-1">{reaction.emoji}</span>
                  <span className="font-medium">{reaction.count}</span>
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Show more reactions button */}
          {hiddenReactionsCount > 0 && !showAllReactions && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 rounded-full text-xs"
              onClick={() => setShowAllReactions(true)}
            >
              <MoreHorizontal size={12} className="mr-1" />
              +{hiddenReactionsCount}
            </Button>
          )}
        </div>
      )}

      {/* Quick Reactions & Add Button */}
      {showQuickReactions && (
        <div className="flex items-center gap-1">
          {/* Quick reaction buttons */}
          <div className="flex gap-1">
            {QUICK_REACTIONS.map((emoji) => {
              const existingReaction = reactions.find(r => r.emoji === emoji);
              const hasReacted = existingReaction?.hasReacted || false;
              
              return (
                <motion.div
                  key={emoji}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 w-7 p-0 rounded-full hover:bg-secondary ${
                      hasReacted ? 'bg-primary/10 text-primary' : ''
                    }`}
                    onClick={() => handleQuickReaction(emoji)}
                  >
                    <span className="text-sm">{emoji}</span>
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* More reactions picker */}
          <Popover open={showReactionPicker} onOpenChange={setShowReactionPicker}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 rounded-full hover:bg-secondary"
              >
                <Smile size={14} className="text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="start">
              <div className="space-y-3">
                <div className="text-sm font-medium text-foreground">Add a reaction</div>
                <div className="grid grid-cols-8 gap-2">
                  {ALL_REACTIONS.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 hover:bg-secondary rounded-lg transition-all duration-200 hover:scale-110"
                      onClick={() => {
                        onAddReaction(messageId, emoji);
                        setShowReactionPicker(false);
                      }}
                    >
                      <span className="text-lg">{emoji}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};
