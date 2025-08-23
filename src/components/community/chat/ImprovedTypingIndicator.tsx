import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';

interface TypingUser {
  user_id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

interface ImprovedTypingIndicatorProps {
  typingUsers: TypingUser[];
  className?: string;
}

const TypingDots = () => (
  <div className="flex space-x-1">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-2 h-2 bg-primary/60 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          delay: i * 0.2,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

export const ImprovedTypingIndicator: React.FC<ImprovedTypingIndicatorProps> = ({
  typingUsers,
  className = ""
}) => {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (typingUsers.length === 0) {
      setDisplayText("");
      return;
    }

    const names = typingUsers.map(user => 
      user.full_name || user.username || 'Someone'
    );

    if (names.length === 1) {
      setDisplayText(`${names[0]} is typing`);
    } else if (names.length === 2) {
      setDisplayText(`${names[0]} and ${names[1]} are typing`);
    } else if (names.length === 3) {
      setDisplayText(`${names[0]}, ${names[1]}, and ${names[2]} are typing`);
    } else {
      setDisplayText(`${names[0]}, ${names[1]}, and ${names.length - 2} others are typing`);
    }
  }, [typingUsers]);

  if (typingUsers.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        transition={{ duration: 0.2 }}
        className={`flex items-center space-x-2 px-4 py-2 text-sm text-muted-foreground ${className}`}
      >
        {/* Show avatars for up to 3 typing users */}
        <div className="flex -space-x-2">
          {typingUsers.slice(0, 3).map((user) => (
            <Avatar key={user.user_id} className="w-6 h-6 border-2 border-background">
              <AvatarImage src={user.avatar_url} alt={user.username} />
              <AvatarFallback className="text-xs">
                {(user.full_name || user.username || '?')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>

        {/* Typing text and dots */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium">{displayText}</span>
          <TypingDots />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};