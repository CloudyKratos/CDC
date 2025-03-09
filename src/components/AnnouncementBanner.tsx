
import React, { useState } from 'react';
import { Megaphone, X, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface AnnouncementProps {
  announcement: {
    title: string;
    content: string;
    date: string;
  };
}

const AnnouncementBanner: React.FC<AnnouncementProps> = ({ announcement }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="relative mb-4 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200/50 dark:border-purple-900/30 rounded-lg backdrop-blur-sm shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-10 w-10 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Megaphone size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {announcement.title}
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-7 w-7 text-gray-500 hover:bg-gray-200/70 dark:hover:bg-gray-800/70 rounded-full -mt-1.5 -mr-1.5"
                  onClick={() => setIsVisible(false)}
                >
                  <X size={14} />
                </Button>
              </div>
              
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                {announcement.content}
              </p>
              
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                <Calendar size={12} className="mr-1" />
                <span>{announcement.date}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 flex justify-end">
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-xs h-7 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 group"
            >
              Join Roundtable
              <ArrowRight size={12} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementBanner;
