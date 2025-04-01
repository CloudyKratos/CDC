import React from "react";
import { 
  Activity,
  BarChart3,
  Users,
  Calendar,
  MessageSquare,
  FileText,
  TrendingUp,
  ChevronRight,
  ArrowUpRight,
  BookOpen,
  Globe,
  Bell,
  Compass,
  Map,
  Mountain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import DailyJournal from "./home/DailyJournal";
import TodoList from "./home/TodoList";

const HomePage = () => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    // In a real app this would navigate to the specified section
    console.log(`Navigating to ${path}`);
  };

  return (
    <div className="space-y-8">
      {/* Entrepreneur Welcome Banner */}
      <div className="relative p-6 rounded-xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 opacity-80"></div>
        <div className="absolute inset-0 bg-[url('/lovable-uploads/f3cc1e68-26e7-4ec4-a61d-f3292452ce2d.png')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Your Entrepreneurial Journey</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Navigate your business landscape with precision. Track growth, connect with partners, and plan your next summit.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button className="bg-primary/90 hover:bg-primary flex gap-2 items-center">
              <Compass size={16} />
              <span>Explore Growth Tools</span>
            </Button>
            <Button variant="outline" className="border-primary/20 bg-background/50 hover:bg-background/80 flex gap-2 items-center">
              <Map size={16} />
              <span>Business Roadmap</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full md:w-auto mb-2 p-1 bg-background/80 backdrop-blur-sm border border-border/50 rounded-lg">
          <TabsTrigger value="overview" className="rounded-md">Overview</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-md">Analytics</TabsTrigger>
          <TabsTrigger value="tasks" className="rounded-md">Tasks</TabsTrigger>
          <TabsTrigger value="projects" className="hidden md:inline-flex rounded-md">Projects</TabsTrigger>
          <TabsTrigger value="team" className="hidden md:inline-flex rounded-md">Team</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          {/* Quick Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200/50 dark:border-purple-800/30 hover:shadow-md transition-all hover:-translate-y-1 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>

            {/* Active Users Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200/50 dark:border-blue-800/30 hover:shadow-md transition-all hover:-translate-y-1 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+2,350</div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  +180.1% from last month
                </p>
              </CardContent>
            </Card>

            {/* Tasks Progress Card */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 border-green-200/50 dark:border-green-800/30 hover:shadow-md transition-all hover:-translate-y-1 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Goals Progress</CardTitle>
                <Mountain className="h-4 w-4 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">83%</div>
                <Progress value={83} className="h-2 mt-2" />
              </CardContent>
            </Card>

            {/* Upcoming Events Card */}
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10 border-orange-200/50 dark:border-orange-800/30 hover:shadow-md transition-all hover:-translate-y-1 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Events</CardTitle>
                <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Next: Entrepreneur Summit in 3h
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <DailyJournal />
            <TodoList />
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Analytics data will be displayed here.</p>
              <div className="h-[300px] w-full bg-gray-100 dark:bg-gray-800 rounded-md mt-4 flex items-center justify-center">
                <BarChart3 className="h-12 w-12 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks" className="mt-6">
          <TodoList fullWidth={true} />
        </TabsContent>
        
        <TabsContent value="projects" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Projects Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Your projects and milestones will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="team" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Team member information and performance metrics will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Entrepreneur Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-all backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-gray-200/70 dark:border-gray-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-primary" />
              Business Network
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground">Connect with investors, partners and mentors.</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full justify-between border-primary/20" 
              onClick={() => handleNavigate('chat')}
            >
              <span>Open Messages</span>
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-all backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-gray-200/70 dark:border-gray-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Business Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground">Manage your critical business timeline.</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full justify-between border-primary/20"
              onClick={() => handleNavigate('calendar')}
            >
              <span>View Calendar</span>
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-all backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-gray-200/70 dark:border-gray-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Business Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground">Access essential business documents and templates.</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full justify-between border-primary/20"
              onClick={() => handleNavigate('documents')}
            >
              <span>Browse Resources</span>
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button 
          variant="outline" 
          className="h-auto py-3 px-4 flex items-center justify-between hover:bg-primary/5 border-primary/20 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30"
          onClick={() => handleNavigate('community')}
        >
          <div className="flex items-center">
            <Globe className="h-5 w-5 mr-2 text-primary" />
            <span>Entrepreneur Community</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button 
          variant="outline" 
          className="h-auto py-3 px-4 flex items-center justify-between hover:bg-primary/5 border-primary/20 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30"
          onClick={() => handleNavigate('knowledge')}
        >
          <div className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-primary" />
            <span>Business Resources</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button 
          variant="outline" 
          className="h-auto py-3 px-4 flex items-center justify-between hover:bg-primary/5 border-primary/20 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30"
          onClick={() => handleNavigate('notifications')}
        >
          <div className="flex items-center">
            <Bell className="h-5 w-5 mr-2 text-primary" />
            <span>Business Alerts</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button 
          variant="outline" 
          className="h-auto py-3 px-4 flex items-center justify-between hover:bg-primary/5 border-primary/20 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30"
          onClick={() => handleNavigate('settings')}
        >
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary" />
            <span>Team Management</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
