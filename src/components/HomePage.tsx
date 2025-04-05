
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BellRing, Calendar, Users, LineChart, Clock, Sparkles, BookOpen, Target, ArrowUpRight, Camera, Home } from "lucide-react";
import { Link } from "react-router-dom";
import DailyJournal from "./home/DailyJournal";
import TodoList from "./home/TodoList";
import MorningStrategyPopup, { MorningStrategyData } from "./home/MorningStrategyPopup";
import BusinessMetricsCard from "./home/BusinessMetricsCard";
import TopographicBackground from "./home/TopographicBackground";
import EntrepreneurialInsightCard from "./home/EntrepreneurialInsightCard";
import TaskProgressCard from "./home/TaskProgressCard";
import WorkInProgressBanner from "./WorkInProgressBanner";
import { toast } from "sonner";
import TickBombDemo from "./TickBombDemo";
import Icons from "@/utils/IconUtils";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showJournal, setShowJournal] = useState(false);
  const [showMorningStrategy, setShowMorningStrategy] = useState(false);
  const [morningStrategyCompleted, setMorningStrategyCompleted] = useState<boolean>(false);
  const [tickBombActive, setTickBombActive] = useState<boolean>(false);
  
  // Check if morning strategy is completed
  useEffect(() => {
    const lastCompleted = localStorage.getItem('lastMorningStrategyCompleted');
    
    if (lastCompleted) {
      const lastCompletedDate = new Date(lastCompleted);
      const now = new Date();
      const oneDayAgo = new Date(now);
      oneDayAgo.setHours(now.getHours() - 24); // Changed from 48 to 24 hours
      
      // If completed in the last 24 hours
      if (lastCompletedDate > oneDayAgo) {
        setMorningStrategyCompleted(true);
        setTickBombActive(false);
      } else {
        setMorningStrategyCompleted(false);
        setTickBombActive(true);
      }
    } else {
      // No completion record found
      setMorningStrategyCompleted(false);
      setTickBombActive(true);
    }
  }, []);
  
  const upcomingEvents = [
    {
      id: "1",
      title: "Team Standup",
      time: "9:30 AM",
      participants: 5,
    },
    {
      id: "2",
      title: "Investor Meeting",
      time: "11:00 AM",
      participants: 3,
    },
    {
      id: "3",
      title: "Product Review",
      time: "2:00 PM",
      participants: 8,
    }
  ];
  
  const businessTasks = [
    { id: "1", name: "Update business plan", completed: true },
    { id: "2", name: "Review quarterly metrics", completed: true },
    { id: "3", name: "Prepare investor presentation", completed: false },
    { id: "4", name: "Schedule team building event", completed: false },
  ];
  
  const entrepreneurialInsights = [
    {
      id: "1",
      title: "Commit First, Figure Out Later",
      content: "CDC Warrior Mindset: Commitment breeds results. Make the decision to commit first, then develop the plan to achieve it.",
      category: "CDC",
      readTime: "3 min read"
    },
    {
      id: "2",
      title: "Daily Discipline Builds Unstoppable Momentum",
      content: "Small, consistent actions compound over time. Discover how elite performers use discipline as the foundation for extraordinary results.",
      category: "CDC",
      readTime: "5 min read"
    },
    {
      id: "3",
      title: "Consistency: The Ultimate Competitive Edge",
      content: "While others quit, consistency separates warriors from dreamers. Learn practical strategies to maintain consistency when motivation fades.",
      category: "CDC",
      readTime: "4 min read"
    }
  ];

  const handleMorningStrategyComplete = (data: MorningStrategyData) => {
    setMorningStrategyCompleted(true);
    setTickBombActive(false);
    
    // Save to localStorage or your backend
    localStorage.setItem('lastMorningStrategyCompleted', new Date().toISOString());
    
    toast.success("Morning strategy completed!", {
      description: "Your tick bomb has been deactivated for 24 hours.",
    });
  };

  return (
    <div className="space-y-6 relative min-h-screen bg-gradient-to-br from-background to-primary/5 p-4 md:p-6">
      <div className="absolute inset-0 -z-10 opacity-50">
        <TopographicBackground />
      </div>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15 dark:opacity-25 -z-5">
        <img 
          src="/lovable-uploads/164358ca-4f3f-427d-8763-57b886bb4b8f.png" 
          alt="Celestial whales background"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 rounded-xl border border-primary/10 shadow-md">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Home className="h-6 w-6 text-primary" />
              Warrior's Space
            </h2>
            <p className="text-muted-foreground">
              Commitment. Discipline. Consistency.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button 
                variant="outline" 
                size="sm"
                className="gap-1"
              >
                <Icons.LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Workspace</span>
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowJournal(true)}
              className="gap-1"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Daily Journal</span>
            </Button>
            <Button 
              variant={morningStrategyCompleted ? "outline" : "default"}
              size="sm"
              onClick={() => setShowMorningStrategy(true)}
              className={`gap-1 ${!morningStrategyCompleted ? "animate-pulse" : ""}`}
            >
              {morningStrategyCompleted ? (
                <Target className="h-4 w-4" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {morningStrategyCompleted ? "Morning Strategy" : "Morning Walk"}
              </span>
            </Button>
          </div>
        </header>
        
        {tickBombActive && (
          <div className="mt-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 rounded-xl border border-red-400/30 shadow-md">
            <div className="flex items-start gap-3">
              <div className="bg-red-500/10 p-3 rounded-full">
                <Icons.Clock className="h-6 w-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-1">Time Bomb Active</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Complete your morning strategy walk within the next 24 hours to deactivate the time bomb.
                  Warriors start each day with intention and clarity.
                </p>
                <Button 
                  onClick={() => setShowMorningStrategy(true)}
                  size="sm"
                  className="gap-2 animate-pulse"
                >
                  <Camera size={16} />
                  Complete Morning Walk & Strategy
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <TickBombDemo />
            </div>
          </div>
        )}
        
        <Card className="mt-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-celestial-gold/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-center celestial-text bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-yellow-400">
              CDC: The Warrior's Path
            </CardTitle>
            <CardDescription className="text-center max-w-3xl mx-auto">
              <p className="mb-2">
                Warriors understand that <strong>Commitment</strong>, <strong>Discipline</strong>, and <strong>Consistency</strong> are the foundation of all extraordinary achievement.
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center mt-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Icons.Target className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-medium">Commitment</h4>
                  <p className="text-xs text-center text-muted-foreground">Decision before action</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Icons.Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-medium">Discipline</h4>
                  <p className="text-xs text-center text-muted-foreground">Action despite feelings</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Icons.RefreshCw className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-medium">Consistency</h4>
                  <p className="text-xs text-center text-muted-foreground">Repeated excellence</p>
                </div>
              </div>
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md grid w-full grid-cols-3 md:w-auto">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-1">
              <LineChart className="h-4 w-4" />
              <span>Metrics</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>CDC Insights</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <BusinessMetricsCard 
                title="Revenue" 
                value="$24,380" 
                change="+12.5%" 
                trend="up" 
                icon="dollar"
                description="vs last month" 
              />
              <BusinessMetricsCard 
                title="New Customers" 
                value="126" 
                change="+18.2%" 
                trend="up" 
                icon="users"
                description="vs last month"
              />
              <BusinessMetricsCard 
                title="Conversion Rate" 
                value="3.8%" 
                change="-0.4%" 
                trend="down" 
                icon="chart"
                description="vs last month"
              />
              <BusinessMetricsCard 
                title="Active Projects" 
                value="8" 
                change="+2" 
                trend="up" 
                icon="activity" 
                description="this quarter"
              />
            </div>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <Card className="md:col-span-1 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-primary/10">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium">Today's Schedule</CardTitle>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="flex items-start space-x-3">
                        <div className="bg-muted p-1.5 rounded-md">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="font-medium">{event.title}</div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{event.time}</span>
                            <div className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              <span>{event.participants}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-1 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-primary/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-md">
                        <Users className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">Sarah joined your team</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-md">
                        <BellRing className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">Project milestone achieved</p>
                        <p className="text-xs text-muted-foreground">Yesterday</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-md">
                        <LineChart className="h-4 w-4 text-purple-500" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">Monthly report is ready</p>
                        <p className="text-xs text-muted-foreground">2 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <TaskProgressCard title="Warrior Tasks" tasks={businessTasks} />
            </div>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <TodoList className="h-full backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-primary/10" />
              {showJournal ? (
                <DailyJournal onClose={() => setShowJournal(false)} />
              ) : (
                <Card className="h-full backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen size={18} className="mr-2 text-primary" />
                      CDC Insights
                    </CardTitle>
                    <CardDescription>
                      Warrior wisdom to fuel your journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {entrepreneurialInsights.map(insight => (
                      <EntrepreneurialInsightCard
                        key={insight.id}
                        title={insight.title}
                        content={insight.content}
                        category={insight.category}
                        readTime={insight.readTime}
                        onClick={() => {
                          toast("Opening insight...", {
                            description: "This feature will be available soon!",
                            action: {
                              label: "View All",
                              onClick: () => console.log("View all insights"),
                            },
                          });
                        }}
                      />
                    ))}
                    <Button variant="outline" className="w-full mt-2">
                      <span className="flex items-center">
                        View all CDC insights
                        <ArrowUpRight className="h-4 w-4 ml-1" />
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="metrics" className="space-y-4">
            <WorkInProgressBanner 
              title="Warrior Metrics Dashboard in Development"
              description="We're building a comprehensive metrics dashboard with in-depth analytics, customizable charts, and data export capabilities."
            />
            <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-primary/10">
              <CardHeader>
                <CardTitle>Warrior Metrics</CardTitle>
                <CardDescription>
                  Detailed performance analytics for your journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  The warrior metrics dashboard will display charts and detailed analytics, helping you track:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>Daily CDC practice and adherence</li>
                  <li>Progress towards key goals and objectives</li>
                  <li>Performance metrics across all key areas</li>
                  <li>Habit tracking and consistency scores</li>
                  <li>Benchmark data against elite performers</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-4">
            <WorkInProgressBanner 
              title="CDC Insights Hub in Development"
              description="Our insights library is being expanded with curated content from elite performers, tactical strategies, and personalized growth insights."
            />
            <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-primary/10">
              <CardHeader>
                <CardTitle>CDC Insights</CardTitle>
                <CardDescription>
                  Warrior wisdom to help you grow and excel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  The CDC insights section will provide tactical strategies, proven frameworks, and resources for warriors, including:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>High-performance mindset training</li>
                  <li>CDC implementation frameworks</li>
                  <li>Case studies of elite performers</li>
                  <li>Tactical daily routines and protocols</li>
                  <li>Advanced accountability systems</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {showMorningStrategy && (
        <MorningStrategyPopup 
          isOpen={showMorningStrategy} 
          onClose={() => setShowMorningStrategy(false)}
          onComplete={handleMorningStrategyComplete}
        />
      )}
    </div>
  );
};

export default HomePage;
