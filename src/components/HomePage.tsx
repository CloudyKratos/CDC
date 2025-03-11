import React, { useState, useEffect } from "react";
import { 
  Clock, 
  BarChart3, 
  Users, 
  Calendar, 
  MessageSquare, 
  FileText,
  ArrowRight,
  Sparkles,
  Star,
  TrendingUp,
  Book,
  ListTodo,
  Sun
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DailyJournal from "./home/DailyJournal";
import TodoList from "./home/TodoList";
import MorningStrategyPopup from "./home/MorningStrategyPopup";

const HomePage = () => {
  const [showMorningStrategy, setShowMorningStrategy] = useState(false);
  const [showStrategyReminder, setShowStrategyReminder] = useState(true);
  
  useEffect(() => {
    const hour = new Date().getHours();
    const isFirstVisitToday = !localStorage.getItem(`morning-strategy-${new Date().toDateString()}`);
    
    if (hour >= 5 && hour <= 11 && isFirstVisitToday) {
      const timer = setTimeout(() => {
        setShowMorningStrategy(true);
        localStorage.setItem(`morning-strategy-${new Date().toDateString()}`, 'true');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const currentTime = new Date();
  const hours = currentTime.getHours();
  
  let greeting = "Good morning";
  if (hours >= 12 && hours < 17) {
    greeting = "Good afternoon";
  } else if (hours >= 17) {
    greeting = "Good evening";
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const upcomingEvents = [
    { 
      id: 1, 
      title: "Weekly Round Table", 
      date: "Today", 
      time: "3:00 PM", 
      participants: 12,
      category: "community",
      location: "Round Table Channel"
    },
    { 
      id: 2, 
      title: "Entrepreneurship Workshop", 
      date: "Tomorrow", 
      time: "11:00 AM", 
      participants: 32,
      category: "workshop",
      location: "General Channel"
    },
    { 
      id: 3, 
      title: "Business Strategy Session", 
      date: "Fri, May 12", 
      time: "2:00 PM", 
      participants: 8,
      category: "meeting",
      location: "Private Call"
    }
  ];
  
  const activityFeed = [
    { 
      id: 1, 
      type: "message", 
      content: "John shared a new post in Hall of Fame", 
      time: "10 min ago", 
      icon: MessageSquare 
    },
    { 
      id: 2, 
      type: "document", 
      content: "Sarah updated the Business Plan document", 
      time: "1 hour ago", 
      icon: FileText 
    },
    { 
      id: 3, 
      type: "community", 
      content: "New member Michael joined the community", 
      time: "2 hours ago", 
      icon: Users 
    }
  ];
  
  const todaysGoals = [
    { id: 1, title: "Community Engagement", progress: 60 },
    { id: 2, title: "Documents Review", progress: 25 },
    { id: 3, title: "Event Planning", progress: 80 }
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      <MorningStrategyPopup 
        isOpen={showMorningStrategy} 
        onClose={() => setShowMorningStrategy(false)} 
      />
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-1">{greeting}, {user.name || "User"}!</h1>
          <p className="text-muted-foreground">
            Here's what's happening in your workspace today
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <p className="text-xs text-muted-foreground">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock size={20} className="text-primary" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200/50 dark:border-purple-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">128</div>
              <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Users size={18} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center">
              <TrendingUp size={12} className="mr-1 text-green-500" />
              <span>12% increase this week</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200/50 dark:border-blue-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Messages Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">64</div>
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <MessageSquare size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center">
              <TrendingUp size={12} className="mr-1 text-green-500" />
              <span>8% increase since yesterday</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 border-amber-200/50 dark:border-amber-800/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">3</div>
              <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Calendar size={18} className="text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center">
              <span>Next: Weekly Round Table at 3:00 PM</span>
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="space-y-6">
          <DailyJournal />
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Activity Feed</CardTitle>
              <CardDescription>Recent activities in your workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityFeed.map(activity => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                      activity.type === "message" 
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
                        : activity.type === "document"
                        ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                    }`}>
                      <activity.icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.content}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full text-sm text-muted-foreground hover:text-foreground">
                See All Activities
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="space-y-6">
          <TodoList />
          
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Upcoming Events</CardTitle>
                <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => document.getElementById('calendar')?.scrollIntoView({ behavior: 'smooth' })}>
                  <ArrowRight size={16} />
                </Button>
              </div>
              <CardDescription>Your scheduled events for the next few days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-start space-x-3 bg-card/50 p-3 rounded-lg border border-border/50 hover:bg-card/80 transition-all">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                      <Calendar size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <Badge variant="outline" className={
                          event.category === "community" 
                            ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800/30" 
                            : event.category === "workshop"
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/30"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800/30"
                        }>
                          {event.category}
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-3">
                        <span>{event.date} • {event.time}</span>
                        <span>•</span>
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center mt-2">
                        <div className="flex -space-x-1.5">
                          {[...Array(3)].map((_, i) => (
                            <Avatar key={i} className="h-5 w-5 border-2 border-background">
                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User${i + event.id}`} alt="Participant" />
                              <AvatarFallback>U{i}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">+{event.participants - 3} attending</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => document.getElementById('calendar')?.scrollIntoView({ behavior: 'smooth' })}>
                View All Events
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Star size={32} className="text-primary" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold mb-2">Featured: Community Round Table</h3>
                <p className="text-muted-foreground mb-4">Join our weekly discussion on entrepreneurship strategies today at 3:00 PM</p>
                <Button className="bg-primary hover:bg-primary/90" onClick={() => document.getElementById('calendar')?.scrollIntoView({ behavior: 'smooth' })}>
                  Join Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
