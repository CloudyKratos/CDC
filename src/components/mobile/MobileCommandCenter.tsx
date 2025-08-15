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
  TrendingUp,
  ArrowRight,
  Zap,
  Calendar
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
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      bgGradient: 'from-indigo-50/80 via-purple-50/80 to-pink-50/80',
      shadowColor: 'shadow-indigo-200/50',
      stats: {
        primary: `${completedVideos}/${totalVideos}`,
        secondary: 'Completed',
        progress: (completedVideos / totalVideos) * 100
      },
      features: [
        { name: 'Video Courses', count: videos.length, icon: PlayCircle, color: 'text-indigo-600' },
        { name: 'Study Hours', count: '24.5h', icon: Clock, color: 'text-purple-600' },
        { name: 'Certificates', count: completedVideos, icon: Trophy, color: 'text-pink-600' }
      ]
    },
    {
      id: 'progress',
      title: 'Progress Hub',
      subtitle: 'Track your learning journey',
      icon: BarChart3,
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      bgGradient: 'from-emerald-50/80 via-teal-50/80 to-cyan-50/80',
      shadowColor: 'shadow-emerald-200/50',
      stats: {
        primary: `${Math.round(overallProgress)}%`,
        secondary: 'Overall Progress',
        progress: overallProgress
      },
      features: [
        { name: 'Avg. Score', count: '87%', icon: Star, color: 'text-emerald-600' },
        { name: 'Streak', count: '12 days', icon: Target, color: 'text-teal-600' },
        { name: 'Growth', count: '+15%', icon: TrendingUp, color: 'text-cyan-600' }
      ]
    },
    {
      id: 'community',
      title: 'Community Hub',
      subtitle: 'Connect with fellow learners',
      icon: Users,
      gradient: 'from-orange-500 via-red-500 to-pink-500',
      bgGradient: 'from-orange-50/80 via-red-50/80 to-pink-50/80',
      shadowColor: 'shadow-orange-200/50',
      stats: {
        primary: '1.2K',
        secondary: 'Active Members',
        progress: 85
      },
      features: [
        { name: 'Discussions', count: '24', icon: Users, color: 'text-orange-600' },
        { name: 'Study Groups', count: '8', icon: Target, color: 'text-red-600' },
        { name: 'Events', count: '3', icon: Calendar, color: 'text-pink-600' }
      ]
    }
  ];

  const handleSectionTap = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-purple-500/10 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse animation-delay-2s"></div>
      </div>
      
      <MobileHeader 
        title="Command Center"
        subtitle="Your learning headquarters"
        showBack={true}
        backPath="/dashboard"
        actions={
          isAdmin ? (
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-primary to-purple-500 text-white touch-target-optimal shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          ) : undefined
        }
      />

      <main className="relative z-10 pt-20 pb-safe px-4 space-y-6">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20 overflow-hidden mobile-card-enhanced shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="p-4 bg-gradient-to-r from-primary to-purple-500 rounded-2xl shadow-lg animate-gentle-bounce">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Welcome Back!</h1>
                <p className="text-sm text-muted-foreground mt-1">Ready to continue your learning journey?</p>
              </div>
            </div>
            
            <div className="bg-background/90 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-inner">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-semibold">Daily Goal</span>
                </div>
                <Badge variant="secondary" className="text-xs">2/3 completed</Badge>
              </div>
              <Progress value={67} className="h-3 bg-muted/50" />
              <p className="text-xs text-muted-foreground mt-2">Keep going! You're doing great today.</p>
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
                  "overflow-hidden transition-all duration-500 ease-out transform touch-feedback mobile-card-enhanced",
                  isExpanded 
                    ? `shadow-2xl scale-[1.03] border-primary/40 ${section.shadowColor}` 
                    : "hover:shadow-lg hover:scale-[1.01] shadow-md"
                )}
              >
                <CardHeader 
                  className="pb-4 cursor-pointer touch-target-optimal"
                  onClick={() => handleSectionTap(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="relative">
                        <div className={cn(
                          "p-4 rounded-2xl bg-gradient-to-br text-white shadow-lg transition-all duration-300",
                          section.gradient,
                          isExpanded && "scale-110 shadow-xl"
                        )}>
                          <Icon className="h-6 w-6" />
                        </div>
                        {isExpanded && (
                          <div className="absolute inset-0 rounded-2xl bg-white/20 animate-ping"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-bold truncate">{section.title}</CardTitle>
                        <p className="text-sm text-muted-foreground truncate">{section.subtitle}</p>
                      </div>
                    </div>
                    
                    <div className="text-right flex items-center gap-3 flex-shrink-0">
                      <div>
                        <p className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                          {section.stats.primary}
                        </p>
                        <p className="text-xs text-muted-foreground">{section.stats.secondary}</p>
                      </div>
                      <div className={cn(
                        "p-2 rounded-full bg-muted/50 transition-all duration-300",
                        isExpanded && "bg-primary/20 rotate-90"
                      )}>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Progress
                      </span>
                      <span className="text-xs font-semibold">
                        {Math.round(section.stats.progress)}%
                      </span>
                    </div>
                    <Progress 
                      value={section.stats.progress} 
                      className="h-2.5 bg-muted/30" 
                    />
                  </div>
                </CardHeader>

                {/* Expanded Content */}
                <div className={cn(
                  "transition-all duration-500 ease-out overflow-hidden",
                  isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                )}>
                  <CardContent className="pt-0 pb-6">
                    <div className={cn(
                      "rounded-2xl p-5 bg-gradient-to-br backdrop-blur-sm border border-white/20 shadow-inner",
                      section.bgGradient
                    )}>
                      <div className="grid grid-cols-3 gap-3 mb-5">
                        {section.features.map((feature, index) => {
                          const FeatureIcon = feature.icon;
                          return (
                            <div 
                              key={index} 
                              className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 hover:shadow-md transition-all duration-200 hover:scale-105"
                              style={{
                                animationDelay: `${index * 100}ms`
                              }}
                            >
                              <div className="mb-3">
                                <FeatureIcon className={cn("h-6 w-6 mx-auto", feature.color)} />
                              </div>
                              <p className="text-lg font-bold text-gray-900 mb-1">{feature.count}</p>
                              <p className="text-xs text-gray-600 font-medium">{feature.name}</p>
                            </div>
                          );
                        })}
                      </div>
                      
                      <Button 
                        className={cn(
                          "w-full bg-gradient-to-r text-white shadow-lg hover:shadow-xl transition-all duration-200 touch-target-optimal font-semibold rounded-xl",
                          section.gradient,
                          "hover:scale-105"
                        )}
                        size="lg"
                      >
                        <span>Explore {section.title}</span>
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <Card className="mobile-card-enhanced shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-sm">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <span>This Week's Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-5 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-xl border border-primary/20 hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent mb-2">18</div>
                <div className="text-sm font-medium text-muted-foreground">Lessons Completed</div>
              </div>
              <div className="text-center p-5 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-xl border border-emerald-500/20 hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent mb-2">95%</div>
                <div className="text-sm font-medium text-muted-foreground">Average Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Quick Access */}
        <Card className="bg-gradient-to-r from-muted/30 to-muted/20 border-muted/50 mobile-card-enhanced hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02]">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl shadow-sm">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-base">Learning Preferences</h4>
                <p className="text-sm text-muted-foreground mt-1">Customize your experience</p>
              </div>
              <div className="p-2 bg-muted/50 rounded-full">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MobileCommandCenter;