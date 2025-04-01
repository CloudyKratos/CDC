
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BellRing, Calendar, Users, LineChart, Clock, Sparkles, BookOpen, Target, ArrowUpRight } from "lucide-react";
import DailyJournal from "./home/DailyJournal";
import TodoList from "./home/TodoList";
import MorningStrategyPopup from "./home/MorningStrategyPopup";
import BusinessMetricsCard from "./home/BusinessMetricsCard";
import TopographicBackground from "./home/TopographicBackground";
import EntrepreneurialInsightCard from "./home/EntrepreneurialInsightCard";
import TaskProgressCard from "./home/TaskProgressCard";
import { toast } from "sonner";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showJournal, setShowJournal] = useState(false);
  const [showMorningStrategy, setShowMorningStrategy] = useState(false);
  
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
      title: "5 Strategies for Sustainable Growth",
      content: "Learn how successful entrepreneurs balance rapid growth with long-term sustainability. This insight explores key metrics to track and strategies to implement.",
      category: "Growth",
      readTime: "4 min read"
    },
    {
      id: "2",
      title: "Building a Resilient Business Model",
      content: "Discover how to create a business model that can withstand market fluctuations and adapt to changing consumer behaviors.",
      category: "Strategy",
      readTime: "6 min read"
    }
  ];

  return (
    <div className="space-y-6 relative">
      <TopographicBackground />
      
      <div className="relative">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Business Dashboard
            </h2>
            <p className="text-muted-foreground">
              Your entrepreneurial journey at a glance
            </p>
          </div>
          
          <div className="flex items-center gap-2">
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
              variant="default" 
              size="sm"
              onClick={() => setShowMorningStrategy(true)}
              className="gap-1"
            >
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Morning Strategy</span>
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3 md:w-auto">
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
              <span>Insights</span>
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
              <Card className="md:col-span-1">
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
              
              <Card className="md:col-span-1">
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
              
              <TaskProgressCard title="Business Tasks" tasks={businessTasks} />
            </div>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <TodoList className="h-full" />
              {showJournal ? (
                <DailyJournal onClose={() => setShowJournal(false)} />
              ) : (
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen size={18} className="mr-2 text-primary" />
                      Entrepreneurial Insights
                    </CardTitle>
                    <CardDescription>
                      Latest insights to help grow your business
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
                        View all insights
                        <ArrowUpRight className="h-4 w-4 ml-1" />
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="metrics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Business Metrics</CardTitle>
                <CardDescription>
                  Detailed performance analytics for your business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  The business metrics dashboard will display charts and detailed analytics. This section is under development.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Business Insights</CardTitle>
                <CardDescription>
                  Strategic insights to help grow your business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  The business insights section will provide articles, guides, and resources for entrepreneurs. This section is under development.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {showMorningStrategy && (
        <MorningStrategyPopup 
          isOpen={showMorningStrategy} 
          onClose={() => setShowMorningStrategy(false)} 
        />
      )}
    </div>
  );
};

export default HomePage;
