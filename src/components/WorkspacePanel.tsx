
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Target, 
  Users, 
  Calendar, 
  BookOpen, 
  Sword,
  Shield,
  Star,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  PlayCircle,
  MessageSquare,
  Zap
} from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xpReward: number;
  timeEstimate: string;
  completed: boolean;
  progress: number;
}

interface TrainingModule {
  id: string;
  title: string;
  category: string;
  duration: string;
  completed: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: number;
  maxProgress: number;
}

const WorkspacePanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState({
    totalXP: 1250,
    level: 8,
    streak: 12,
    completedMissions: 24,
    completedTraining: 18
  });

  useEffect(() => {
    // Simulate loading missions
    setMissions([
      {
        id: '1',
        title: 'Master the Morning Routine',
        description: 'Complete your daily morning routine for 7 consecutive days',
        difficulty: 'beginner',
        xpReward: 100,
        timeEstimate: '7 days',
        completed: false,
        progress: 60
      },
      {
        id: '2',
        title: 'Network Building Challenge',
        description: 'Connect with 10 new professionals in your field',
        difficulty: 'intermediate',
        xpReward: 250,
        timeEstimate: '2 weeks',
        completed: false,
        progress: 30
      },
      {
        id: '3',
        title: 'Leadership Summit',
        description: 'Organize and host a virtual leadership session',
        difficulty: 'advanced',
        xpReward: 500,
        timeEstimate: '1 month',
        completed: true,
        progress: 100
      }
    ]);

    // Simulate loading training modules
    setTrainingModules([
      {
        id: '1',
        title: 'Strategic Thinking Fundamentals',
        category: 'Leadership',
        duration: '45 mins',
        completed: true,
        difficulty: 'beginner',
        description: 'Learn the core principles of strategic thinking and decision making'
      },
      {
        id: '2',
        title: 'Advanced Communication Skills',
        category: 'Communication',
        duration: '1.5 hours',
        completed: false,
        difficulty: 'intermediate',
        description: 'Master advanced techniques for effective communication in professional settings'
      },
      {
        id: '3',
        title: 'Team Management Excellence',
        category: 'Management',
        duration: '2 hours',
        completed: false,
        difficulty: 'advanced',
        description: 'Comprehensive guide to managing high-performing teams'
      }
    ]);

    // Simulate loading achievements
    setAchievements([
      {
        id: '1',
        title: 'Early Bird',
        description: 'Complete 10 morning routines',
        icon: '🌅',
        earned: true,
        progress: 10,
        maxProgress: 10
      },
      {
        id: '2',
        title: 'Social Butterfly',
        description: 'Network with 25 professionals',
        icon: '🦋',
        earned: false,
        progress: 8,
        maxProgress: 25
      },
      {
        id: '3',
        title: 'Warrior Master',
        description: 'Reach level 10',
        icon: '⚔️',
        earned: false,
        progress: 8,
        maxProgress: 10
      }
    ]);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Sword className="h-8 w-8 text-indigo-600" />
                Warrior's Space
              </h1>
              <p className="text-gray-600 mt-2">Your personal development command center</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{userStats.totalXP}</div>
                <div className="text-sm text-gray-500">Total XP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">Lv. {userStats.level}</div>
                <div className="text-sm text-gray-500">Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{userStats.streak}</div>
                <div className="text-sm text-gray-500">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="missions" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Missions
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Training
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Community
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">
                    +1 from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Training Progress</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">67%</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Community Rank</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">#42</div>
                  <p className="text-xs text-muted-foreground">
                    Top 15% of warriors
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest achievements and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Completed "Leadership Summit" mission</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      +500 XP
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Started "Advanced Communication Skills" training</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                    <Badge variant="outline" className="text-blue-600">
                      In Progress
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Missions Tab */}
          <TabsContent value="missions" className="space-y-6">
            <div className="grid gap-6">
              {missions.map((mission) => (
                <Card key={mission.id} className={mission.completed ? 'bg-green-50 border-green-200' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {mission.completed ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Target className="h-5 w-5 text-gray-400" />}
                          {mission.title}
                        </CardTitle>
                        <CardDescription className="mt-2">{mission.description}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getDifficultyColor(mission.difficulty)}>
                          {mission.difficulty}
                        </Badge>
                        <div className="text-sm font-medium text-indigo-600">+{mission.xpReward} XP</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {mission.timeEstimate}
                        </span>
                        <span className="font-medium">{mission.progress}% Complete</span>
                      </div>
                      <Progress value={mission.progress} className="h-2" />
                      {!mission.completed && (
                        <Button className="w-full">
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Continue Mission
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <div className="grid gap-6">
              {trainingModules.map((module) => (
                <Card key={module.id} className={module.completed ? 'bg-blue-50 border-blue-200' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {module.completed ? <CheckCircle className="h-5 w-5 text-blue-600" /> : <BookOpen className="h-5 w-5 text-gray-400" />}
                          {module.title}
                        </CardTitle>
                        <CardDescription className="mt-2">{module.description}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getDifficultyColor(module.difficulty)}>
                          {module.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-purple-600">
                          {module.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        {module.duration}
                      </span>
                      <Button variant={module.completed ? "outline" : "default"}>
                        {module.completed ? "Review" : "Start Training"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className={achievement.earned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'}>
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <CardTitle className={achievement.earned ? 'text-yellow-800' : 'text-gray-500'}>
                      {achievement.title}
                    </CardTitle>
                    <CardDescription>{achievement.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-2"
                      />
                      {achievement.earned && (
                        <Badge className="w-full justify-center bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          Earned!
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Leaderboard
                  </CardTitle>
                  <CardDescription>Top warriors this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((rank) => (
                      <div key={rank} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            rank <= 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {rank}
                          </div>
                          <div>
                            <p className="font-medium">Warrior {rank}</p>
                            <p className="text-sm text-gray-500">{2500 - (rank - 1) * 200} XP</p>
                          </div>
                        </div>
                        {rank <= 3 && <Trophy className="h-5 w-5 text-yellow-500" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Community Chat
                  </CardTitle>
                  <CardDescription>Connect with fellow warriors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium">Warrior Alex</p>
                      <p className="text-sm text-gray-600">Just completed the Network Building Challenge! 🎉</p>
                      <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium">Warrior Sarah</p>
                      <p className="text-sm text-gray-600">Anyone up for a group training session this weekend?</p>
                      <p className="text-xs text-gray-400 mt-1">15 minutes ago</p>
                    </div>
                    <Button className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Join Conversation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WorkspacePanel;
