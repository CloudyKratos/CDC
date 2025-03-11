
import React from "react";
import { 
  Activity,
  BarChart3,
  Users,
  Calendar,
  MessageSquare,
  FileText,
  TrendingUp,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const HomePage = () => {
  return (
    <div className="space-y-8">
      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200/50 dark:border-purple-800/30">
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
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200/50 dark:border-blue-800/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +180.1% from last month
            </p>
          </CardContent>
        </Card>

        {/* Tasks Progress Card */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 border-green-200/50 dark:border-green-800/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Progress</CardTitle>
            <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">83%</div>
            <Progress value={83} className="h-2 mt-2" />
          </CardContent>
        </Card>

        {/* Upcoming Events Card */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10 border-orange-200/50 dark:border-orange-800/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground mt-2">
              Next: Team Meeting in 3h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DailyJournal />
        <TodoList />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          variant="outline" 
          className="h-auto p-4 flex items-center justify-between hover:bg-primary/5"
          onClick={() => document.getElementById('calendar')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            <span>View Calendar</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button 
          variant="outline" 
          className="h-auto p-4 flex items-center justify-between hover:bg-primary/5"
          onClick={() => document.getElementById('messages')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-primary" />
            <span>Open Messages</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button 
          variant="outline" 
          className="h-auto p-4 flex items-center justify-between hover:bg-primary/5"
          onClick={() => document.getElementById('documents')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            <span>Documents</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
