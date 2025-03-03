
import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatPanel } from "@/components/ChatPanel";
import { Calendar, CheckCircle2, X, Smile, PlusCircle, TrendingUp, Star, ListTodo, Edit3, Palette } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Custom hook for habit tracking
const useHabitTracking = () => {
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem("habits");
    return saved ? JSON.parse(saved) : [
      { id: "1", name: "Morning Meditation", completed: false, streak: 0 },
      { id: "2", name: "Daily Reading", completed: false, streak: 3 },
      { id: "3", name: "Gratitude Journal", completed: false, streak: 5 }
    ];
  });

  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);

  const toggleHabit = (id: string) => {
    setHabits(habits.map(habit => 
      habit.id === id ? { ...habit, completed: !habit.completed, streak: !habit.completed ? habit.streak + 1 : habit.streak - 1 } : habit
    ));
  };

  const addHabit = (name: string) => {
    setHabits([...habits, { id: Date.now().toString(), name, completed: false, streak: 0 }]);
  };

  return { habits, toggleHabit, addHabit };
};

const Dashboard = () => {
  const [activeItem, setActiveItem] = useState("home");
  const [showMorningDialog, setShowMorningDialog] = useState(false);
  const [newPriority, setNewPriority] = useState("");
  const [priorities, setPriorities] = useState(() => {
    const saved = localStorage.getItem("priorities");
    return saved ? JSON.parse(saved) : [];
  });
  const [colorTheme, setColorTheme] = useState(() => {
    return localStorage.getItem("colorTheme") || "blue";
  });
  const { toast } = useToast();
  const { habits, toggleHabit, addHabit } = useHabitTracking();
  const [newHabitName, setNewHabitName] = useState("");
  const [gratitudeItems, setGratitudeItems] = useState([
    { id: "1", text: "" },
    { id: "2", text: "" },
    { id: "3", text: "" }
  ]);
  const [dailyFocus, setDailyFocus] = useState("");
  const [dailyAffirmation, setDailyAffirmation] = useState("");
  const [showHabitDialog, setShowHabitDialog] = useState(false);
  
  // Save priorities to localStorage
  useEffect(() => {
    localStorage.setItem("priorities", JSON.stringify(priorities));
  }, [priorities]);
  
  // Save color theme to localStorage
  useEffect(() => {
    localStorage.setItem("colorTheme", colorTheme);
    
    // Apply theme classes
    document.documentElement.classList.remove("theme-blue", "theme-purple", "theme-green", "theme-orange");
    document.documentElement.classList.add(`theme-${colorTheme}`);
  }, [colorTheme]);
  
  useEffect(() => {
    // Show the morning strategy dialog when the component mounts
    const hasCompletedStrategy = localStorage.getItem("morningStrategyCompleted");
    const lastCheckDate = localStorage.getItem("morningStrategyDate");
    const today = new Date().toDateString();
    
    if (!hasCompletedStrategy || lastCheckDate !== today) {
      setShowMorningDialog(true);
    }
    
    // Load saved morning strategy data
    const savedStrategy = localStorage.getItem("morningStrategyData");
    if (savedStrategy) {
      const data = JSON.parse(savedStrategy);
      if (data.gratitudeItems) setGratitudeItems(data.gratitudeItems);
      if (data.dailyFocus) setDailyFocus(data.dailyFocus);
      if (data.dailyAffirmation) setDailyAffirmation(data.dailyAffirmation);
    }
  }, []);
  
  const handleMorningStrategy = (completed: boolean) => {
    if (completed) {
      // Save the strategy data
      const strategyData = {
        gratitudeItems,
        dailyFocus,
        dailyAffirmation
      };
      localStorage.setItem("morningStrategyData", JSON.stringify(strategyData));
    }
    
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
  
  const handleAddPriority = () => {
    if (newPriority.trim()) {
      setPriorities([...priorities, { id: Date.now().toString(), text: newPriority, completed: false }]);
      setNewPriority("");
      toast({
        title: "Priority Added",
        description: "Your new priority has been added!",
      });
    }
  };
  
  const handleTogglePriority = (id: string) => {
    setPriorities(priorities.map(priority => 
      priority.id === id ? { ...priority, completed: !priority.completed } : priority
    ));
  };

  const handleGratitudeChange = (id: string, text: string) => {
    setGratitudeItems(items => 
      items.map(item => item.id === id ? { ...item, text } : item)
    );
  };
  
  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      addHabit(newHabitName);
      setNewHabitName("");
      setShowHabitDialog(false);
      toast({
        title: "Habit Added",
        description: "Your new habit has been added to your tracking list!",
      });
    }
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 doodle-pattern">
      <Sidebar onSelectItem={setActiveItem} activeItem={activeItem} />
      
      <div className="flex-1 overflow-hidden p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {(activeItem === "chat" || activeItem.startsWith("community-")) && (
            <div className="h-full col-span-1 lg:col-span-2">
              <ChatPanel channelType={activeItem.startsWith("community-") ? activeItem : "chat"} />
            </div>
          )}
          
          {activeItem === "home" && (
            <div className="col-span-1 lg:col-span-2 h-full overflow-y-auto scrollbar-thin pb-4">
              <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-8 animate-fade-in">
                <h1 className="text-2xl md:text-3xl font-bold mb-4 flex items-center">
                  Welcome back!
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-2">
                        <Palette className="h-5 w-5 text-primary" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Choose theme</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setColorTheme("blue")}
                            className={`w-8 h-8 rounded-full bg-blue-500 ${colorTheme === "blue" ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
                          />
                          <button
                            onClick={() => setColorTheme("purple")}
                            className={`w-8 h-8 rounded-full bg-purple-500 ${colorTheme === "purple" ? "ring-2 ring-offset-2 ring-purple-500" : ""}`}
                          />
                          <button
                            onClick={() => setColorTheme("green")}
                            className={`w-8 h-8 rounded-full bg-green-500 ${colorTheme === "green" ? "ring-2 ring-offset-2 ring-green-500" : ""}`}
                          />
                          <button
                            onClick={() => setColorTheme("orange")}
                            className={`w-8 h-8 rounded-full bg-orange-500 ${colorTheme === "orange" ? "ring-2 ring-offset-2 ring-orange-500" : ""}`}
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  This is your dashboard where you can access all your work and track your personal growth.
                </p>
                
                <Tabs defaultValue="focus" className="mb-8">
                  <TabsList className="mb-4 bg-gray-100 dark:bg-gray-700">
                    <TabsTrigger value="focus" className="text-sm">Today's Focus</TabsTrigger>
                    <TabsTrigger value="habits" className="text-sm">Habit Tracker</TabsTrigger>
                    <TabsTrigger value="reflection" className="text-sm">Reflection</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="focus" className="animate-fade-in">
                    <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/10 dark:border-primary/20">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">Today's Focus</h3>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => setShowMorningDialog(true)}
                        >
                          Edit Strategy
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 shadow-sm transition hover:shadow-md">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            <Smile className="h-4 w-4 mr-1 text-yellow-500" />
                            Morning Reflection
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">What am I grateful for today?</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs"
                            onClick={() => setShowMorningDialog(true)}
                          >
                            Complete Reflection
                          </Button>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 shadow-sm transition hover:shadow-md">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            <Star className="h-4 w-4 mr-1 text-amber-500" />
                            Today's Priority
                          </h4>
                          <div className="mb-3">
                            <div className="flex items-center mb-2">
                              <Input 
                                value={newPriority} 
                                onChange={(e) => setNewPriority(e.target.value)}
                                placeholder="Add a priority..." 
                                className="text-xs h-8"
                              />
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="ml-1 h-8 w-8"
                                onClick={handleAddPriority}
                              >
                                <PlusCircle className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="max-h-[100px] overflow-y-auto scrollbar-thin">
                              {priorities.length === 0 ? (
                                <p className="text-xs text-gray-400 dark:text-gray-500">No priorities yet</p>
                              ) : (
                                <ul className="space-y-1">
                                  {priorities.map(priority => (
                                    <li 
                                      key={priority.id} 
                                      className="flex items-center text-xs"
                                    >
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 mr-1"
                                        onClick={() => handleTogglePriority(priority.id)}
                                      >
                                        {priority.completed ? (
                                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                                        ) : (
                                          <div className="h-3 w-3 rounded-full border border-gray-300 dark:border-gray-600" />
                                        )}
                                      </Button>
                                      <span className={priority.completed ? "line-through text-gray-400" : ""}>
                                        {priority.text}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 shadow-sm transition hover:shadow-md">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1 text-indigo-500" />
                            Evening Review
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">What went well today?</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs"
                          >
                            Complete Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="habits" className="animate-fade-in">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-100 dark:border-indigo-800/20">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Habit Tracker</h3>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowHabitDialog(true)}
                          className="text-xs"
                        >
                          <PlusCircle className="h-3 w-3 mr-1" />
                          Add Habit
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {habits.map(habit => (
                          <div key={habit.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center">
                              <Button
                                variant={habit.completed ? "default" : "outline"}
                                size="icon"
                                className="h-7 w-7 mr-3"
                                onClick={() => toggleHabit(habit.id)}
                              >
                                {habit.completed ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-3 w-3" />}
                              </Button>
                              <div>
                                <p className="text-sm font-medium">{habit.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {habit.streak > 0 ? `${habit.streak} day streak 🔥` : "Start your streak today!"}
                                </p>
                              </div>
                            </div>
                            <Badge variant={habit.completed ? "default" : "outline"}>
                              {habit.completed ? "Completed" : "Pending"}
                            </Badge>
                          </div>
                        ))}
                        
                        {habits.length === 0 && (
                          <div className="p-6 text-center bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400">No habits added yet</p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="mt-2"
                              onClick={() => setShowHabitDialog(true)}
                            >
                              Add Your First Habit
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="reflection" className="animate-fade-in">
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-800/20">
                      <h3 className="text-lg font-semibold mb-4">Daily Journal</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <Edit3 className="h-4 w-4 mr-1 text-amber-500" />
                            Today's Reflection
                          </h4>
                          <Textarea 
                            placeholder="What's on your mind today?" 
                            className="min-h-[100px]"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <ListTodo className="h-4 w-4 mr-1 text-amber-500" />
                            Lessons Learned
                          </h4>
                          <Textarea 
                            placeholder="What did you learn today?" 
                            className="min-h-[80px]"
                          />
                        </div>
                        <Button className="w-full">Save Journal Entry</Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-medium mb-2">Activity Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Messages sent</span>
                        <span>24</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Tasks completed</span>
                        <span>7</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Habit completion</span>
                        <span>85%</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-medium mb-2">Recent Community</h3>
                    <ul className="space-y-2">
                      <li className="text-sm rounded-md p-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <p className="font-medium">New post in #announcements</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">5 minutes ago</p>
                      </li>
                      <li className="text-sm rounded-md p-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <p className="font-medium">Live roundtable starting soon</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">20 minutes ago</p>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-medium mb-2">Upcoming Events</h3>
                    <ul className="space-y-2">
                      <li className="text-sm rounded-md p-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <p className="font-medium">Community Meeting</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Tomorrow, 3:00 PM</p>
                      </li>
                      <li className="text-sm rounded-md p-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <p className="font-medium">Q&A Session with Mentors</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Thursday, 2:00 PM</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeItem === "calendar" && (
            <div className="col-span-1 lg:col-span-2 h-full">
              <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-8 animate-fade-in">
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
                  <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-900 border-b">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 grid-rows-5 h-[500px]">
                    {Array.from({ length: 35 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="border-r border-b p-1 relative hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                      >
                        <div className="text-xs text-gray-500 mb-1">{((i % 31) + 1)}</div>
                        
                        {i === 10 && (
                          <div className="text-xs p-1 bg-primary/10 text-primary dark:bg-primary/20 rounded mb-1 cursor-pointer hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
                            Investor Meeting
                          </div>
                        )}
                        
                        {i === 15 && (
                          <div className="text-xs p-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded mb-1 cursor-pointer hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                            Community Call
                          </div>
                        )}
                        
                        {i === 22 && (
                          <div className="text-xs p-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded mb-1 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                            Workshop
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <h3 className="font-medium mb-2">Upcoming Community Events</h3>
                  <div className="space-y-2">
                    <div className="flex items-center p-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors cursor-pointer">
                      <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                      <span className="text-sm flex-1">Founder's Roundtable</span>
                      <span className="text-xs text-gray-500">Tomorrow, 3:00 PM</span>
                    </div>
                    <div className="flex items-center p-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors cursor-pointer">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm flex-1">Pitch Practice Session</span>
                      <span className="text-xs text-gray-500">Wed, 2:00 PM</span>
                    </div>
                    <div className="flex items-center p-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors cursor-pointer">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                      <span className="text-sm flex-1">Community Workshop</span>
                      <span className="text-xs text-gray-500">Fri, 1:00 PM</span>
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Morning Strategy</DialogTitle>
            <DialogDescription>
              Start your day with intention. Complete your morning strategy to set yourself up for success.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <h4 className="text-sm font-medium mb-1">🙏 Gratitude</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">What are three things you're grateful for today?</p>
                
                {gratitudeItems.map((item, index) => (
                  <div key={item.id} className="mb-2">
                    <Input 
                      value={item.text} 
                      onChange={(e) => handleGratitudeChange(item.id, e.target.value)}
                      placeholder={`Gratitude item ${index + 1}`}
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="text-sm font-medium mb-1">🎯 Daily Focus</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">What's the one most important task you need to complete today?</p>
                <Input 
                  value={dailyFocus} 
                  onChange={(e) => setDailyFocus(e.target.value)}
                  placeholder="Your most important task..."
                  className="text-sm"
                />
              </div>
              
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h4 className="text-sm font-medium mb-1">💪 Daily Affirmation</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">What positive statement will guide your day?</p>
                <Input 
                  value={dailyAffirmation} 
                  onChange={(e) => setDailyAffirmation(e.target.value)}
                  placeholder="I am..."
                  className="text-sm"
                />
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
      
      <Dialog open={showHabitDialog} onOpenChange={setShowHabitDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Habit</DialogTitle>
            <DialogDescription>
              Create a new habit to track your daily progress.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-3">
              <div>
                <label htmlFor="habit-name" className="text-sm font-medium">Habit name</label>
                <Input 
                  id="habit-name"
                  value={newHabitName} 
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g., Morning Meditation"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHabitDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddHabit}>
              Add Habit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
