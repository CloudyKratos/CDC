import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  BarChart3, 
  Users, 
  Settings, 
  Plus,
  Sparkles,
  Trophy,
  Target,
  ChevronRight,
  PlayCircle,
  Clock,
  Star,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MobileHeader from './MobileHeader';
import { mockLearningContent } from '../command-room/mockData';

interface MobileCommandCenterProps {
  isAdmin?: boolean;
}

const MobileCommandCenter: React.FC<MobileCommandCenterProps> = ({ isAdmin = false }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [userProgress] = useState<Record<string, number>>({
    '1': 75,
    '2': 100,
    '3': 25,
    '4': 0,
    '5': 90
  });

  const videos = mockLearningContent;
  const completedVideos = Object.values(userProgress).filter(p => p === 100).length;
  const totalVideos = videos.length;
  const overallProgress = (Object.values(userProgress).reduce((sum, p) => sum + p, 0) / totalVideos) || 0;

  const sections = [
    {
      id: 'learning',
      title: 'Learning Vault',
      subtitle: 'Premium courses & content',
      icon: BookOpen,
      color: 'from-blue-500 to-purple-500',
      bgColor: 'from-blue-50 to-purple-50',
      stats: {
        primary: `${completedVideos}/${totalVideos}`,
        secondary: 'Completed',
        progress: (completedVideos / totalVideos) * 100
      },
      features: [
        { name: 'Video Courses', count: videos.length, icon: PlayCircle },
        { name: 'Study Hours', count: '24.5h', icon: Clock },
        { name: 'Certificates', count: completedVideos, icon: Trophy }
      ]
    },
    {
      id: 'progress',
      title: 'Progress Hub',
      subtitle: 'Track your learning journey',
      icon: BarChart3,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      stats: {
        primary: `${Math.round(overallProgress)}%`,
        secondary: 'Overall Progress',
        progress: overallProgress
      },
      features: [
        { name: 'Avg. Score', count: '87%', icon: Star },
        { name: 'Streak', count: '12 days', icon: Target },
        { name: 'Growth', count: '+15%', icon: TrendingUp }
      ]
    },
    {
      id: 'community',
      title: 'Community Hub',
      subtitle: 'Connect with fellow learners',
      icon: Users,
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      stats: {
        primary: '1.2K',
        secondary: 'Active Members',
        progress: 85
      },
      features: [
        { name: 'Discussions', count: '24', icon: Users },
        { name: 'Study Groups', count: '8', icon: Target },
        { name: 'Events', count: '3', icon: Trophy }
      ]
    }
  ];

  const handleSectionTap = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-purple-500/10">
      <MobileHeader 
        title="Command Center"
        subtitle="Your learning headquarters"
        showBack={true}
        backPath="/dashboard"
        actions={
          isAdmin ? (
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-primary to-purple-500 text-white touch-target-optimal"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          ) : undefined
        }
      />

      <main className="pt-20 pb-safe px-4 space-y-6">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-primary to-purple-500 rounded-xl shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold">Welcome Back!</h1>
                <p className="text-sm text-muted-foreground">Ready to continue your learning journey?</p>
              </div>
            </div>
            
            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Daily Goal</span>
                <span className="text-sm text-muted-foreground">2/3 completed</span>
              </div>
              <Progress value={67} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Learning Sections */}
        <div className="space-y-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const isExpanded = activeSection === section.id;
            
            return (
              <Card 
                key={section.id}
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-out transform touch-feedback",
                  isExpanded 
                    ? "shadow-lg scale-[1.02] border-primary/30" 
                    : "hover:shadow-md hover:scale-[1.01]"
                )}
              >
                <CardHeader 
                  className="pb-4 cursor-pointer"
                  onClick={() => handleSectionTap(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-xl bg-gradient-to-br text-white shadow-sm transition-transform duration-200",
                        section.color,
                        isExpanded && "scale-110"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{section.subtitle}</p>
                      </div>
                    </div>
                    
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <p className="text-lg font-bold">{section.stats.primary}</p>
                        <p className="text-xs text-muted-foreground">{section.stats.secondary}</p>
                      </div>
                      <ChevronRight className={cn(
                        "h-5 w-5 transition-transform duration-300",
                        isExpanded && "rotate-90"
                      )} />
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <Progress value={section.stats.progress} className="h-2" />
                  </div>
                </CardHeader>

                {/* Expanded Content */}
                <div className={cn(
                  "transition-all duration-300 ease-out overflow-hidden",
                  isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}>
                  <CardContent className="pt-0 pb-6">
                    <div className={cn(
                      "rounded-xl p-4 bg-gradient-to-br",
                      section.bgColor
                    )}>
                      <div className="grid grid-cols-3 gap-4">
                        {section.features.map((feature, index) => {
                          const FeatureIcon = feature.icon;
                          return (
                            <div key={index} className="text-center p-3 bg-white/70 rounded-lg">
                              <FeatureIcon className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                              <p className="text-sm font-semibold text-gray-900">{feature.count}</p>
                              <p className="text-xs text-gray-600">{feature.name}</p>
                            </div>
                          );
                        })}
                      </div>
                      
                      <Button 
                        className={cn(
                          "w-full mt-4 bg-gradient-to-r text-white shadow-sm",
                          section.color
                        )}
                        size="sm"
                      >
                        Explore {section.title}
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              This Week's Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">18</div>
                <div className="text-sm text-muted-foreground">Lessons Completed</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-500 mb-1">95%</div>
                <div className="text-sm text-muted-foreground">Average Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Quick Access */}
        <Card className="bg-muted/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <h4 className="font-medium">Learning Preferences</h4>
                <p className="text-sm text-muted-foreground">Customize your experience</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MobileCommandCenter;