
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icons from '@/utils/IconUtils';
import { LearningItem } from './LearningCard';

interface LearningDetailModalProps {
  item: LearningItem | null;
  isOpen: boolean;
  onClose: () => void;
  onStartLearning: (item: LearningItem) => void;
}

const LearningDetailModal: React.FC<LearningDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onStartLearning
}) => {
  if (!item) return null;

  const modules = [
    { id: 1, title: 'Introduction & Foundations', duration: '12 min', completed: true },
    { id: 2, title: 'Core Principles', duration: '18 min', completed: true },
    { id: 3, title: 'Practical Application', duration: '24 min', completed: false },
    { id: 4, title: 'Advanced Techniques', duration: '16 min', completed: false },
    { id: 5, title: 'Integration & Review', duration: '14 min', completed: false },
  ];

  const relatedItems = [
    'Morning Ritual Framework',
    'Energy Management Protocol',
    'Stoic Decision Matrix'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-purple-200/50 dark:border-purple-800/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {item.title}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="relative h-64 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg overflow-hidden">
              {item.thumbnail ? (
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/80 dark:bg-gray-800/80 flex items-center justify-center backdrop-blur-sm">
                    <Icons.BookOpen className="h-10 w-10 text-purple-500" />
                  </div>
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className="bg-purple-500/90 text-white">
                    {item.category}
                  </Badge>
                  <Badge className="bg-blue-500/90 text-white">
                    {item.level}
                  </Badge>
                  <Badge className="bg-green-500/90 text-white">
                    {item.format}
                  </Badge>
                </div>
                
                <p className="text-white text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Progress and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                {item.type === 'course' && item.progress !== undefined && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Your Progress</span>
                      <span className="text-gray-900 dark:text-white font-medium">{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-3" />
                  </div>
                )}
              </div>
              
              <Button 
                onClick={() => onStartLearning(item)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <Icons.Play className="h-4 w-4 mr-2" />
                {item.progress === 0 ? 'Start Learning' : 'Continue'}
              </Button>
            </div>

            {/* Course Modules */}
            {item.type === 'course' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Course Modules</h3>
                <div className="space-y-3">
                  {modules.map((module) => (
                    <div 
                      key={module.id}
                      className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-purple-200/30 dark:border-purple-800/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          module.completed 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {module.completed ? (
                            <Icons.Check className="h-4 w-4" />
                          ) : (
                            <Icons.Play className="h-3 w-3" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{module.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{module.duration}</p>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        <Icons.Play className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meta Information */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Coach</span>
                <p className="font-medium text-gray-900 dark:text-white">{item.coach}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                <p className="font-medium text-gray-900 dark:text-white">{item.lastReviewed}</p>
              </div>
            </div>

            {/* Related Resources */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Related Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {relatedItems.map((relatedItem, index) => (
                  <div 
                    key={index}
                    className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-purple-200/30 dark:border-purple-800/30 hover:bg-white/70 dark:hover:bg-gray-800/70 cursor-pointer transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{relatedItem}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default LearningDetailModal;
