
import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatPanel } from "@/components/ChatPanel";
import { WorkspacePanel } from "@/components/WorkspacePanel";
import { Calendar, CheckCircle2, X } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [activeItem, setActiveItem] = useState("home");
  const [showMorningDialog, setShowMorningDialog] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // Show the morning strategy dialog when the component mounts
    const hasCompletedStrategy = localStorage.getItem("morningStrategyCompleted");
    const lastCheckDate = localStorage.getItem("morningStrategyDate");
    const today = new Date().toDateString();
    
    if (!hasCompletedStrategy || lastCheckDate !== today) {
      setShowMorningDialog(true);
    }
  }, []);
  
  const handleMorningStrategy = (completed: boolean) => {
    localStorage.setItem("morningStrategyCompleted", completed ? "true" : "false");
    localStorage.setItem("morningStrategyDate", new Date().toDateString());
    
    setShowMorningDialog(false);
    
    if (completed) {
      toast({
        title: "Morning Strategy Completed",
        description: "Great job on completing your morning strategy!",
      });
    }
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar onSelectItem={setActiveItem} activeItem={activeItem} />
      
      <div className="flex-1 overflow-hidden p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {(activeItem === "chat" || activeItem.startsWith("community-")) && (
            <>
              <div className="h-full lg:order-1">
                <ChatPanel channelType={activeItem.startsWith("community-") ? activeItem : "chat"} />
              </div>
              <div className="h-full lg:order-2">
                <WorkspacePanel />
              </div>
            </>
          )}
          
          {activeItem === "home" && (
            <div className="col-span-1 lg:col-span-2 h-full">
              <div className="h-full bg-white rounded-lg border border-gray-100 p-8 animate-fade-in">
                <h1 className="text-2xl font-bold mb-4">Welcome back!</h1>
                <p className="text-gray-600 mb-6">
                  This is your dashboard where you can access all your work and connect with other entrepreneurs.
                </p>
                
                <div className="mb-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <h3 className="text-lg font-semibold mb-3">Today's Focus</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Morning Reflection</h4>
                      <p className="text-sm text-gray-500 mb-3">What am I grateful for today?</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs"
                        onClick={() => setShowMorningDialog(true)}
                      >
                        Complete Reflection
                      </Button>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Today's Priority</h4>
                      <p className="text-sm text-gray-500 mb-3">Focus on your most important task</p>
                      <Button variant="outline" size="sm" className="w-full text-xs">Set Priority</Button>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Evening Review</h4>
                      <p className="text-sm text-gray-500 mb-3">What went well today?</p>
                      <Button variant="outline" size="sm" className="w-full text-xs">Complete Review</Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h3 className="text-lg font-medium mb-2">Recent Messages</h3>
                    <p className="text-sm text-gray-500">You have 3 unread messages</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h3 className="text-lg font-medium mb-2">Recent Documents</h3>
                    <p className="text-sm text-gray-500">You edited "Q3 Goals" recently</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h3 className="text-lg font-medium mb-2">Upcoming Events</h3>
                    <p className="text-sm text-gray-500">Meeting with investors tomorrow</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeItem === "calendar" && (
            <div className="col-span-1 lg:col-span-2 h-full">
              <div className="h-full bg-white rounded-lg border border-gray-100 p-8 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Calendar</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Month
                    </Button>
                    <Button variant="outline" size="sm">Today</Button>
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-7 bg-gray-50 border-b">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 grid-rows-5 h-[500px]">
                    {Array.from({ length: 35 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="border-r border-b p-1 relative hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-xs text-gray-500 mb-1">{((i % 31) + 1)}</div>
                        
                        {i === 10 && (
                          <div className="text-xs p-1 bg-primary/10 text-primary rounded mb-1 cursor-pointer">
                            Investor Meeting
                          </div>
                        )}
                        
                        {i === 15 && (
                          <div className="text-xs p-1 bg-green-100 text-green-800 rounded mb-1 cursor-pointer">
                            Community Call
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6 p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Upcoming Community Events</h3>
                  <div className="space-y-2">
                    <div className="flex items-center p-2 hover:bg-gray-50 rounded">
                      <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                      <span className="text-sm flex-1">Founder's Roundtable</span>
                      <span className="text-xs text-gray-500">Tomorrow, 3:00 PM</span>
                    </div>
                    <div className="flex items-center p-2 hover:bg-gray-50 rounded">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm flex-1">Pitch Practice Session</span>
                      <span className="text-xs text-gray-500">Wed, 2:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeItem === "profile" && (
            <div className="col-span-1 lg:col-span-2 h-full">
              <div className="h-full bg-white rounded-lg border border-gray-100 p-8 animate-fade-in">
                <div className="flex items-center mb-8">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-6 border-4 border-white shadow-md">
                    <span className="text-3xl font-bold">UN</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">User Name</h1>
                    <p className="text-gray-600">Entrepreneur / Founder</p>
                    <div className="flex mt-2">
                      <Button size="sm" variant="default" className="mr-2">Edit Profile</Button>
                      <Button size="sm" variant="outline">Share Profile</Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-3">Personal Information</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-gray-500">Display Name</label>
                          <p className="font-medium">User Name</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Email</label>
                          <p className="font-medium">user@example.com</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Location</label>
                          <p className="font-medium">San Francisco, CA</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-3">Bio</h3>
                      <p className="text-sm text-gray-700">
                        Entrepreneur focused on building sustainable businesses. 
                        Passionate about technology and community building.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-3">Community Engagement</h3>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Messages Sent</span>
                        <span className="font-medium">254</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Events Attended</span>
                        <span className="font-medium">12</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Documents Created</span>
                        <span className="font-medium">8</span>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-3">Preferences</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Email Notifications</span>
                          <Button size="sm" variant="outline">Configure</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Theme</span>
                          <Button size="sm" variant="outline">Light</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Language</span>
                          <Button size="sm" variant="outline">English</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeItem !== "chat" && 
           activeItem !== "home" && 
           activeItem !== "calendar" && 
           activeItem !== "profile" &&
           !activeItem.startsWith("community-") && (
            <div className="col-span-1 lg:col-span-2 h-full flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">{activeItem.charAt(0).toUpperCase() + activeItem.slice(1)} Coming Soon</h2>
                <p className="text-gray-600">This feature is currently under development.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={showMorningDialog} onOpenChange={setShowMorningDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Morning Strategy</DialogTitle>
            <DialogDescription>
              Start your day with intention. Have you completed your morning strategy?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium mb-1">🙏 Gratitude</h4>
                <p className="text-xs text-gray-600">What are three things you're grateful for today?</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium mb-1">🎯 Daily Focus</h4>
                <p className="text-xs text-gray-600">What's the one most important task you need to complete today?</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium mb-1">💪 Daily Affirmation</h4>
                <p className="text-xs text-gray-600">What positive statement will guide your day?</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => handleMorningStrategy(false)} className="gap-2">
              <X className="h-4 w-4" />
              Skip for Now
            </Button>
            <Button onClick={() => handleMorningStrategy(true)} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              I've Completed It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
