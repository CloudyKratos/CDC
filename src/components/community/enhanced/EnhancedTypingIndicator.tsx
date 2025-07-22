import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedTypingIndicatorProps {
  typingUsers: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  className?: string;
  showAvatars?: boolean;
}

export const EnhancedTypingIndicator: React.FC<EnhancedTypingIndicatorProps> = ({
  typingUsers,
  className = '',
  showAvatars = true
}) => {
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].name} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`;
    } else if (typingUsers.length === 3) {
      return `${typingUsers[0].name}, ${typingUsers[1].name} and ${typingUsers[2].name} are typing...`;
    } else {
      return `${typingUsers.length} people are typing...`;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`px-4 py-2 text-sm text-muted-foreground italic ${className}`}
      >
        <div className="flex items-center gap-3">
          {showAvatars && typingUsers.length <= 3 && (
            <div className="flex -space-x-2">
              {typingUsers.slice(0, 3).map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium text-primary">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-primary/60 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-primary/80"
            >
              {getTypingText()}
            </motion.span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};