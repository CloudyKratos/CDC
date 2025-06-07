
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sword, Shield, Target, Trophy, Users, BookOpen, 
  Calendar, MessageSquare, Video, Zap, ArrowRight,
  TrendingUp, Award, Clock, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkspacePanelProps {
  className?: string;
}

const WorkspacePanel: React.FC<WorkspacePanelProps> = ({ className }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'training' | 'missions' | 'community'>('overview');

  const warriorStats = {
    level: 12,
    xp: 2850,
    nextLevelXp: 3000,
    completedMissions: 47,
    activeMissions: 3,
    totalPoints: 15420,
    rank: 'Elite Warrior',
    streak: 14
  };

  const activeMissions = [
    {
      id: 1,
      title: 'Master the Art of Public Speaking',
      description: 'Complete 5 stage presentations and receive positive feedback',
      progress: 60,
      difficulty: 'Hard',
      xpReward: 500,
      deadline: '2024-01-15',
      type: 'skill'
    },
    {
      id: 2,
      title: 'Build Your Network',
      description: 'Connect with 10 new warriors and engage in meaningful conversations',
      progress: 80,
      difficulty: 'Medium',
      xpReward: 300,
      deadline: '2024-01-20',
      type: 'social'
    },
    {
      id: 3,
      title: 'Leadership Challenge',
      description: 'Lead a team project and deliver results within timeline',
      progress: 25,
      difficulty: 'Expert',
      xpReward: 800,
      deadline: '2024-02-01',
      type: 'leadership'
    }
  ];

  const trainingModules = [
    {
      id: 1,
      title: 'Communication Mastery',
      description: 'Advanced techniques for effective communication',
      lessons: 12,
      duration: '6 hours',
      difficulty: 'Intermediate',
      completed: false,
      thumbnail: '🗣️'
    },
    {
      id: 2,
      title: 'Strategic Thinking',
      description: 'Develop strategic mindset and decision-making skills',
      lessons: 8,
      duration: '4 hours',
      difficulty: 'Advanced',
      completed: true,
      thumbnail: '🧠'
    },
    {
      id: 3,
      title: 'Team Leadership',
      description: 'Lead teams effectively and inspire excellence',
      lessons: 15,
      duration: '8 hours',
      difficulty: 'Expert',
      completed: false,
      thumbnail: '👑'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-orange-500';
      case 'expert': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'skill': return <Target className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      case 'leadership': return <Trophy className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const progressPercentage = (warriorStats.xp / warriorStats.nextLevelXp) * 100;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Warrior Status Header */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Sword className="w-6 h-6 text-yellow-400" />
                Warrior's Space
              </CardTitle>
              <CardDescription className="text-gray-300">
                Level {warriorStats.level} • {warriorStats.rank}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              🔥 {warriorStats.streak} Day Streak
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-300">Experience</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white">{warriorStats.xp} XP</span>
                  <span className="text-gray-400">{warriorStats.nextLevelXp} XP</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-300">Completed</span>
              </div>
              <div className="text-2xl font-bold text-white">{warriorStats.completedMissions}</div>
              <div className="text-xs text-gray-400">Missions</div>
            </div>

            <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-gray-300">Active</span>
              </div>
              <div className="text-2xl font-bold text-white">{warriorStats.activeMissions}</div>
              <div className="text-xs text-gray-400">Missions</div>
            </div>

            <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-300">Total Points</span>
              </div>
              <div className="text-2xl font-bold text-white">{warriorStats.totalPoints.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Earned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'training', label: 'Training', icon: BookOpen },
          { id: 'missions', label: 'Missions', icon: Target },
          { id: 'community', label: 'Community', icon: Users }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              activeSection === tab.id 
                ? "bg-blue-600 text-white shadow-md" 
                : "text-gray-400 hover:text-white hover:bg-gray-700/50"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Sections */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Active Missions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeMissions.slice(0, 3).map((mission) => (
                <div key={mission.id} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(mission.type)}
                      <h4 className="font-medium text-white">{mission.title}</h4>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={cn("text-xs", getDifficultyColor(mission.difficulty))}
                    >
                      {mission.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{mission.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">{mission.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${mission.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-yellow-400">+{mission.xpReward} XP</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {mission.deadline}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-400" />
                Recent Training
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {trainingModules.slice(0, 3).map((module) => (
                <div key={module.id} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{module.thumbnail}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">{module.title}</h4>
                      <p className="text-sm text-gray-400 mb-2">{module.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{module.lessons} lessons</span>
                        <span>{module.duration}</span>
                        <Badge variant="outline" size="sm" className="text-xs">
                          {module.difficulty}
                        </Badge>
                      </div>
                    </div>
                    {module.completed && (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeSection === 'missions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeMissions.map((mission) => (
              <Card key={mission.id} className="bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(mission.type)}
                      <Badge 
                        variant="secondary" 
                        className={cn("text-xs", getDifficultyColor(mission.difficulty))}
                      >
                        {mission.difficulty}
                      </Badge>
                    </div>
                    <span className="text-yellow-400 text-sm font-medium">+{mission.xpReward} XP</span>
                  </div>
                  <CardTitle className="text-white text-lg">{mission.title}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {mission.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white">{mission.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${mission.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due: {mission.deadline}
                      </span>
                      <Button size="sm" variant="outline" className="text-xs">
                        Continue <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'training' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainingModules.map((module) => (
            <Card key={module.id} className="bg-gray-800/50 border-gray-700 hover:border-green-500/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="text-3xl mb-2">{module.thumbnail}</div>
                  {module.completed && (
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  )}
                </div>
                <CardTitle className="text-white text-lg">{module.title}</CardTitle>
                <CardDescription className="text-gray-400">
                  {module.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{module.lessons} lessons</span>
                    <span className="text-gray-400">{module.duration}</span>
                  </div>
                  
                  <Badge variant="outline" className="w-fit">
                    {module.difficulty}
                  </Badge>
                  
                  <Button 
                    className="w-full" 
                    variant={module.completed ? "outline" : "default"}
                  >
                    {module.completed ? 'Review' : 'Start Training'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeSection === 'community' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Warrior Network
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      A
                    </div>
                    <div>
                      <div className="text-white font-medium">Alex Warrior</div>
                      <div className="text-xs text-gray-400">Level 15 • Elite</div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Connect</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Join Stage
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkspacePanel;
