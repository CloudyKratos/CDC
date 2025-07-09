import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Construction, 
  Calendar, 
  Users, 
  Video, 
  Star, 
  Clock,
  Sparkles,
  Rocket,
  Bell,
  X
} from 'lucide-react';

interface WorkInProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

export const WorkInProgressModal: React.FC<WorkInProgressModalProps> = ({
  isOpen,
  onClose,
  feature = "Stage Rooms"
}) => {
  const roadmapItems = [
    {
      title: "Real-time Video Calls",
      description: "High-quality video conferencing with screen sharing",
      progress: 75,
      status: "In Development",
      eta: "Q1 2025",
      icon: Video
    },
    {
      title: "Interactive Whiteboards",
      description: "Collaborative drawing and presentation tools",
      progress: 45,
      status: "Planning",
      eta: "Q2 2025",
      icon: Sparkles
    },
    {
      title: "Recording & Replays",
      description: "Save and replay your important sessions",
      progress: 20,
      status: "Concept",
      eta: "Q2 2025",
      icon: Calendar
    },
    {
      title: "Breakout Rooms",
      description: "Split participants into smaller discussion groups",
      progress: 10,
      status: "Planned",
      eta: "Q3 2025",
      icon: Users
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Development": return "bg-blue-500";
      case "Planning": return "bg-yellow-500";
      case "Concept": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="relative">
              <Construction className="h-8 w-8 text-yellow-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
            </div>
            {feature} - Coming Soon!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Hero Section */}
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="relative mx-auto w-20 h-20 mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse opacity-20" />
              <div className="relative w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Rocket className="h-10 w-10 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold theme-text-primary mb-2">
              We're Building Something Amazing!
            </h3>
            <p className="theme-text-secondary mb-4">
              {feature} is under active development. Get ready for next-generation 
              collaborative experiences that will transform how teams connect and work together.
            </p>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              <Star className="h-3 w-3 mr-1" />
              Premium Feature
            </Badge>
          </div>

          {/* Progress Overview */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold theme-text-primary">Overall Progress</h4>
              <span className="text-sm theme-text-muted">38% Complete</span>
            </div>
            <Progress value={38} className="h-2 mb-2" />
            <div className="flex items-center gap-2 text-sm theme-text-muted">
              <Clock className="h-4 w-4" />
              Estimated Launch: Q2 2025
            </div>
          </div>

          {/* Roadmap */}
          <div>
            <h4 className="font-semibold theme-text-primary mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Development Roadmap
            </h4>
            <div className="space-y-4">
              {roadmapItems.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(item.status)}`}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium theme-text-primary">{item.title}</h5>
                      <Badge variant="outline" className="text-xs">
                        {item.eta}
                      </Badge>
                    </div>
                    <p className="text-sm theme-text-secondary mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <Progress value={item.progress} className="h-1.5 flex-1 mr-3" />
                      <span className="text-xs theme-text-muted">{item.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
            <h4 className="font-semibold theme-text-primary mb-2 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Stay Updated
            </h4>
            <p className="text-sm theme-text-secondary mb-4">
              Want to be the first to know when {feature} launches? We'll notify you as soon as it's ready!
            </p>
            <div className="flex gap-3">
              <Button variant="default" className="flex-1">
                <Bell className="h-4 w-4 mr-2" />
                Notify Me
              </Button>
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
              <Video className="h-8 w-8 mx-auto mb-2 theme-text-muted" />
              <p className="text-sm font-medium theme-text-primary">HD Video</p>
              <p className="text-xs theme-text-muted">Crystal clear quality</p>
            </div>
            <div className="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
              <Users className="h-8 w-8 mx-auto mb-2 theme-text-muted" />
              <p className="text-sm font-medium theme-text-primary">Multi-user</p>
              <p className="text-xs theme-text-muted">Up to 50 participants</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};