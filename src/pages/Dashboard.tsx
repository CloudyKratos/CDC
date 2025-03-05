
import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatPanel } from "@/components/ChatPanel";
import { 
  Calendar, 
  CheckCircle2, 
  X, 
  Smile, 
  PlusCircle, 
  TrendingUp, 
  Star, 
  ListTodo, 
  Edit3, 
  Palette,
  Bell,
  Sparkles,
  MessageSquare,
  BookOpen,
  Zap,
  Award
} from "lucide-react";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

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
    
    // Show toast notification
    const habit = habits.find(h => h.id === id);
    if (habit) {
      if (!habit.completed) {
        toast.success(`${habit.name} completed! 🎉`, {
          description: `You're on a ${habit.streak + 1} day streak!`
        });
      }
    }
  };

  const addHabit = (name: string) => {
    const newId = Date.now().toString();
    setHabits([...habits, { id: newId, name, completed: false, streak: 0 }]);
    return newId;
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(habit => habit.id !== id));
  };

  const getTotalCompletionPercentage = () => {
    if (habits.length === 0) return 0;
    const completedCount = habits.filter(h => h.completed).length;
    return Math.round((completedCount / habits.length) * 100);
  };

  return { habits, toggleHabit, addHabit, deleteHabit, getTotalCompletionPercentage };
};

// Custom hook for priorities
const usePriorities = () => {
  const [priorities, setPriorities] = useState(() => {
    const saved = localStorage.getItem("priorities");
    return saved ? JSON.parse(saved) : [];
  });
  
  // Save priorities to localStorage
  useEffect(() => {
    localStorage.setItem("priorities", JSON.stringify(priorities));
  }, [priorities]);

  const addPriority = (text: string) => {
    if (text.trim()) {
      const newPriority = { id: Date.now().toString(), text, completed: false };
      setPriorities([...priorities, newPriority]);
      return newPriority;
    }
    return null;
  };

  const togglePriority = (id: string) => {
    setPriorities(priorities.map(priority => 
      priority.id === id ? { ...priority, completed: !priority.completed } : priority
    ));
    
    // Show toast notification
    const priority = priorities.find(p => p.id === id);
    if (priority && !priority.completed) {
      toast.success(`Priority completed! 🎯`, {
        description: `"${priority.text}" marked as done`
      });
    }
  };

  const deletePriority = (id: string) => {
    setPriorities(priorities.filter(priority => priority.id !== id));
  };

  const getCompletionPercentage = () => {
    if (priorities.length === 0) return 0;
    const completedCount = priorities.filter(p => p.completed).length;
    return Math.round((completedCount / priorities.length) * 100);
  };

  return { 
    priorities, 
    addPriority, 
    togglePriority, 
    deletePriority,
    getCompletionPercentage
  };
};

// Journal entries hook
const useJournalEntries = () => {
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem("journalEntries");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("journalEntries", JSON.stringify(entries));
  }, [entries]);

  const addEntry = (reflection: string, lessons: string) => {
    if (reflection.trim() || lessons.trim()) {
      const newEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        reflection,
        lessons,
      };
      setEntries([newEntry, ...entries]);
      return newEntry;
    }
    return null;
  };

  return { entries, addEntry };
};

const Dashboard = () => {
  const [activeItem, setActiveItem] = useState("home");
  const [showMorningDialog, setShowMorningDialog] = useState(false);
  const [newPriority, setNewPriority] = useState("");
  const [colorTheme, setColorTheme] = useState(() => {
    return localStorage.getItem("colorTheme") || "blue";
  });
  const { habits, toggleHabit, addHabit, deleteHabit, getTotalCompletionPercentage } = useHabitTracking();
  const { priorities, addPriority, togglePriority, deletePriority, getCompletionPercentage } = usePriorities();
  const { entries, addEntry } = useJournalEntries();
  const [newHabitName, setNewHabitName] = useState("");
  const [gratitudeItems, setGratitudeItems] = useState(() => {
    const savedStrategy = localStorage.getItem("morningStrategyData");
    if (savedStrategy) {
      const data = JSON.parse(savedStrategy);
      if (data.gratitudeItems) return data.gratitudeItems;
    }
    return [
      { id: "1", text: "" },
      { id: "2", text: "" },
      { id: "3", text: "" }
    ];
  });
  
  const [dailyFocus, setDailyFocus] = useState(() => {
    const savedStrategy = localStorage.getItem("morningStrategyData");
    if (savedStrategy) {
      const data = JSON.parse(savedStrategy);
      if (data.dailyFocus) return data.dailyFocus;
    }
    return "";
  });
  
  const [dailyAffirmation, setDailyAffirmation] = useState(() => {
    const savedStrategy = localStorage.getItem("morningStrategyData");
    if (savedStrategy) {
      const data = JSON.parse(savedStrategy);
      if (data.dailyAffirmation) return data.dailyAffirmation;
    }
    return "";
  });
  
  const [showHabitDialog, setShowHabitDialog] = useState(false);
  const [showDeleteHabitDialog, setShowDeleteHabitDialog] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);
  const [journalReflection, setJournalReflection] = useState("");
  const [journalLessons, setJournalLessons] = useState("");
  const [showJournalSavedMessage, setShowJournalSavedMessage] = useState(false);
  const [focusTabValue, setFocusTabValue] = useState("focus");
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  
  // Apply color theme to localStorage
  useEffect(() => {
    localStorage.setItem("colorTheme", colorTheme);
    
    // Apply theme classes
    document.documentElement.classList.remove("theme-blue", "theme-purple", "theme-green", "theme-orange");
    document.documentElement.classList.add(`theme-${colorTheme}`);
  }, [colorTheme]);
  
  // Handle dark mode toggle
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode ? 'true' : 'false');
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  useEffect(() => {
    // Show the morning strategy dialog when the component mounts
    const hasCompletedStrategy = localStorage.getItem("morningStrategyCompleted");
    const lastCheckDate = localStorage.getItem("morningStrategyDate");
    const today = new Date().toDateString();
    
    if (!hasCompletedStrategy || lastCheckDate !== today) {
      // Only show after a short delay to avoid overwhelming the user upon first load
      const timer = setTimeout(() => {
        setShowMorningDialog(true);
      }, 1500);
      
      return () => clearTimeout(timer);
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
      toast.success("Morning Strategy Completed", {
        description: "Great job on completing your morning strategy!",
      });
    }
  };
  
  const handleAddPriority = () => {
    if (newPriority.trim()) {
      const added = addPriority(newPriority);
      if (added) {
        setNewPriority("");
        toast.success("Priority Added", {
          description: "Your new priority has been added!",
        });
      }
    }
  };
  
  const handleGratitudeChange = (id: string, text: string) => {
    setGratitudeItems(items => 
      items.map(item => item.id === id ? { ...item, text } : item)
    );
  };
  
  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      const id = addHabit(newHabitName);
      setNewHabitName("");
      setShowHabitDialog(false);
      toast.success("Habit Added", {
        description: "Your new habit has been added to your tracking list!",
      });
      return id;
    }
    return null;
  };
  
  const handleDeleteHabit = () => {
    if (habitToDelete) {
      deleteHabit(habitToDelete);
      setHabitToDelete(null);
      setShowDeleteHabitDialog(false);
      toast.success("Habit Deleted", {
        description: "Your habit has been removed from your tracking list.",
      });
    }
  };
  
  const handleSaveJournal = () => {
    const entry = addEntry(journalReflection, journalLessons);
    if (entry) {
      setJournalReflection("");
      setJournalLessons("");
      setShowJournalSavedMessage(true);
      setTimeout(() => setShowJournalSavedMessage(false), 3000);
      toast.success("Journal Entry Saved", {
        description: "Your reflection has been saved successfully!",
      });
    } else {
      toast.error("Cannot Save Empty Entry", {
        description: "Please write something before saving.",
      });
    }
  };
  
  const confirmDeleteHabit = (id: string) => {
    setHabitToDelete(id);
    setShowDeleteHabitDialog(true);
  };

  // Get today's date information for the header
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', options);
  
  // Calculate daily progress
  const dailyProgress = getTotalCompletionPercentage();
  const priorityProgress = getCompletionPercentage();
  
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
              <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-6 md:p-8 animate-fade-in shadow-sm">
                {/* Header with greeting and date */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b dark:border-gray-700">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1 flex items-center animate-fade-in">
                      Good {today.getHours() < 12 ? "Morning" : today.getHours() < 18 ? "Afternoon" : "Evening"}!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 animate-slide-in">
                      {formattedDate}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3 mt-3 sm:mt-0">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Palette className="h-4 w-4" />
                          <span>Theme</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3" align="end">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">Appearance</h3>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setDarkMode(!darkMode)}
                              className="h-8 px-2"
                            >
                              {darkMode ? "Light Mode" : "Dark Mode"}
                            </Button>
                          </div>
                          
                          <div className="space-y-1.5">
                            <h3 className="text-sm font-medium">Accent Color</h3>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => setColorTheme("blue")}
                                className={`w-8 h-8 rounded-full bg-blue-500 transition-all ${colorTheme === "blue" ? "ring-2 ring-offset-2 ring-blue-500 scale-110" : "opacity-70 hover:opacity-100"}`}
                                aria-label="Blue theme"
                              />
                              <button
                                onClick={() => setColorTheme("purple")}
                                className={`w-8 h-8 rounded-full bg-purple-500 transition-all ${colorTheme === "purple" ? "ring-2 ring-offset-2 ring-purple-500 scale-110" : "opacity-70 hover:opacity-100"}`}
                                aria-label="Purple theme"
                              />
                              <button
                                onClick={() => setColorTheme("green")}
                                className={`w-8 h-8 rounded-full bg-green-500 transition-all ${colorTheme === "green" ? "ring-2 ring-offset-2 ring-green-500 scale-110" : "opacity-70 hover:opacity-100"}`}
                                aria-label="Green theme"
                              />
                              <button
                                onClick={() => setColorTheme("orange")}
                                className={`w-8 h-8 rounded-full bg-orange-500 transition-all ${colorTheme === "orange" ? "ring-2 ring-offset-2 ring-orange-500 scale-110" : "opacity-70 hover:opacity-100"}`}
                                aria-label="Orange theme"
                              />
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1.5"
                      onClick={() => setShowMorningDialog(true)}
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Strategy</span>
                    </Button>
                    
                    <Button variant="outline" size="icon" className="relative">
                      <Bell className="h-4 w-4" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
                    </Button>
                  </div>
                </div>
                
                {/* Daily Progress Summary */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="col-span-1 animate-fade-in" style={{animationDelay: "100ms"}}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                        Daily Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Habits Completed</span>
                          <span className="text-xs font-medium">{dailyProgress}%</span>
                        </div>
                        <Progress value={dailyProgress} className="h-2 mb-3" />
                        
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Priorities</span>
                          <span className="text-xs font-medium">{priorityProgress}%</span>
                        </div>
                        <Progress value={priorityProgress} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="col-span-1 animate-fade-in" style={{animationDelay: "200ms"}}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Star className="h-4 w-4 mr-2 text-amber-500" />
                        Today's Focus
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {dailyFocus ? (
                        <div className="p-3 bg-primary/5 dark:bg-primary/10 rounded-md">
                          <p className="text-sm">{dailyFocus}</p>
                        </div>
                      ) : (
                        <div className="p-3 rounded-md border border-dashed border-gray-200 dark:border-gray-700 text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Set your focus for today</p>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="mt-1"
                            onClick={() => setShowMorningDialog(true)}
                          >
                            <PlusCircle className="h-3 w-3 mr-1" />
                            Add Focus
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card className="col-span-1 animate-fade-in" style={{animationDelay: "300ms"}}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                        Community Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs space-y-2">
                        <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-900/50 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                          <span className="flex-1">New posts in #founders</span>
                          <span className="text-gray-500">5m</span>
                        </div>
                        <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-900/50 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></div>
                          <span className="flex-1">Upcoming event</span>
                          <span className="text-gray-500">1h</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Tabs 
                  defaultValue={focusTabValue} 
                  value={focusTabValue}
                  onValueChange={setFocusTabValue}
                  className="mb-8"
                >
                  <TabsList className="mb-4 bg-gray-100 dark:bg-gray-800 p-1">
                    <TabsTrigger value="focus" className="text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Today's Focus</TabsTrigger>
                    <TabsTrigger value="habits" className="text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Habit Tracker</TabsTrigger>
                    <TabsTrigger value="reflection" className="text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Reflection</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="focus" className="animate-fade-in">
                    <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/10 dark:border-primary/20">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">Today's Focus</h3>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs group"
                          onClick={() => setShowMorningDialog(true)}
                        >
                          <span>Edit Strategy</span>
                          <Edit3 className="ml-1.5 h-3 w-3 opacity-70 group-hover:opacity-100" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="transition hover:shadow-md hover:border-primary/20 group cursor-pointer">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center">
                              <Smile className="h-4 w-4 mr-1.5 text-yellow-500" />
                              Morning Reflection
                            </CardTitle>
                            <CardDescription>
                              What am I grateful for today?
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-3">
                            {gratitudeItems.some(item => item.text) ? (
                              <div className="space-y-1 text-sm">
                                {gratitudeItems.filter(item => item.text).map((item, index) => (
                                  <div key={item.id} className="flex items-start">
                                    <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs mr-2 mt-0.5">
                                      {index + 1}
                                    </div>
                                    <p>{item.text}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="w-full text-xs"
                                onClick={() => setShowMorningDialog(true)}
                              >
                                Complete Reflection
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                        <Card className="transition hover:shadow-md hover:border-primary/20 group">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center">
                              <Star className="h-4 w-4 mr-1.5 text-amber-500" />
                              Today's Priority
                            </CardTitle>
                            <CardDescription>
                              What's most important today?
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-3">
                            <div className="mb-3">
                              <div className="flex items-center mb-2">
                                <Input 
                                  value={newPriority} 
                                  onChange={(e) => setNewPriority(e.target.value)}
                                  placeholder="Add a priority..." 
                                  className="text-xs h-8"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleAddPriority();
                                    }
                                  }}
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
                                        className="flex items-center text-xs group/item"
                                      >
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-5 w-5 mr-1"
                                          onClick={() => togglePriority(priority.id)}
                                        >
                                          {priority.completed ? (
                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                          ) : (
                                            <div className="h-3.5 w-3.5 rounded-full border border-gray-300 dark:border-gray-600" />
                                          )}
                                        </Button>
                                        <span className={`flex-1 ${priority.completed ? "line-through text-gray-400" : ""}`}>
                                          {priority.text}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-5 w-5 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                          onClick={() => deletePriority(priority.id)}
                                        >
                                          <X className="h-3 w-3 text-gray-400 hover:text-red-500" />
                                        </Button>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="transition hover:shadow-md hover:border-primary/20 group">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center">
                              <TrendingUp className="h-4 w-4 mr-1.5 text-indigo-500" />
                              Daily Affirmation
                            </CardTitle>
                            <CardDescription>
                              Your positive statement for today
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-3">
                            {dailyAffirmation ? (
                              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-md">
                                <p className="text-sm italic">"{dailyAffirmation}"</p>
                              </div>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full text-xs"
                                onClick={() => setShowMorningDialog(true)}
                              >
                                Set Affirmation
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="habits" className="animate-fade-in">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-100 dark:border-indigo-800/20">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center">
                            <Award className="h-4 w-4 mr-2 text-indigo-500" />
                            Habit Tracker
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Track your daily habits and build consistency
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowHabitDialog(true)}
                          className="text-xs gap-1.5"
                        >
                          <PlusCircle className="h-3 w-3" />
                          Add Habit
                        </Button>
                      </div>
                      
                      {/* Progress bar showing completion for the day */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600 dark:text-gray-300">Today's Progress</span>
                          <span className="font-medium">{getTotalCompletionPercentage()}%</span>
                        </div>
                        <Progress value={getTotalCompletionPercentage()} className="h-2" />
                      </div>
                      
                      <div className="space-y-3">
                        {habits.map(habit => (
                          <div 
                            key={habit.id} 
                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group"
                          >
                            <div className="flex items-center">
                              <Button
                                variant={habit.completed ? "default" : "outline"}
                                size="icon"
                                className="h-7 w-7 mr-3 transition-all"
                                onClick={() => toggleHabit(habit.id)}
                              >
                                {habit.completed ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-3 w-3" />}
                              </Button>
                              <div>
                                <p className="text-sm font-medium">{habit.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                  {habit.streak > 0 ? (
                                    <>
                                      <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded text-[10px] mr-1.5">
                                        {habit.streak} day streak
                                      </span>
                                      <span>🔥</span>
                                    </>
                                  ) : (
                                    "Start your streak today!"
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={habit.completed ? "default" : "outline"} className="transition-all">
                                {habit.completed ? "Completed" : "Pending"}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => confirmDeleteHabit(habit.id)}
                              >
                                <X className="h-4 w-4 text-gray-400 hover:text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        {habits.length === 0 && (
                          <div className="p-6 text-center bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                            <div className="mb-2">
                              <div className="inline-block p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">
                                <Award className="h-6 w-6 text-indigo-500" />
                              </div>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 mb-3">No habits added yet</p>
                            <Button 
                              variant="outline" 
                              size="sm"
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
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center">
                            <BookOpen className="h-4 w-4 mr-2 text-amber-500" />
                            Daily Journal
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Reflect on your day and capture your thoughts
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <Edit3 className="h-4 w-4 mr-1 text-amber-500" />
                            Today's Reflection
                          </h4>
                          <Textarea 
                            placeholder="What's on your mind today?" 
                            className="min-h-[100px] resize-none"
                            value={journalReflection}
                            onChange={(e) => setJournalReflection(e.target.value)}
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <ListTodo className="h-4 w-4 mr-1 text-amber-500" />
                            Lessons Learned
                          </h4>
                          <Textarea 
                            placeholder="What did you learn today?" 
                            className="min-h-[80px] resize-none"
                            value={journalLessons}
                            onChange={(e) => setJournalLessons(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            {showJournalSavedMessage && (
                              <p className="text-xs text-green-600 dark:text-green-400 animate-fade-in">
                                Journal entry saved successfully!
                              </p>
                            )}
                          </div>
                          <Button onClick={handleSaveJournal} className="gap-1.5">
                            <BookOpen className="h-4 w-4" />
                            Save Journal Entry
                          </Button>
                        </div>
                        
                        {entries.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800/30">
                            <h4 className="text-sm font-medium mb-3">Recent Entries</h4>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin">
                              {entries.slice(0, 3).map(entry => {
                                const date = new Date(entry.date);
                                return (
                                  <div key={entry.id} className="p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700">
                                    <div className="flex justify-between items-start mb-2">
                                      <h5 className="text-xs font-medium">
                                        {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                      </h5>
                                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                        {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    <p className="text-xs line-clamp-2">{entry.reflection}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gray-50 dark:bg-gray-800/50 hover:shadow-md transition-shadow animate-fade-in" style={{animationDelay: "100ms"}}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Activity Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-50 dark:bg-gray-800/50 hover:shadow-md transition-shadow animate-fade-in" style={{animationDelay: "200ms"}}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Recent Community</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ul>
                        <li className="border-b dark:border-gray-700 last:border-0">
                          <Button variant="ghost" className="w-full justify-start text-sm py-2 h-auto rounded-none">
                            <div className="text-left">
                              <p className="font-medium">New post in #announcements</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">5 minutes ago</p>
                            </div>
                          </Button>
                        </li>
                        <li className="border-b dark:border-gray-700 last:border-0">
                          <Button variant="ghost" className="w-full justify-start text-sm py-2 h-auto rounded-none">
                            <div className="text-left">
                              <p className="font-medium">Live roundtable starting soon</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">20 minutes ago</p>
                            </div>
                          </Button>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-50 dark:bg-gray-800/50 hover:shadow-md transition-shadow animate-fade-in" style={{animationDelay: "300ms"}}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Upcoming Events</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ul>
                        <li className="border-b dark:border-gray-700 last:border-0">
                          <Button variant="ghost" className="w-full justify-start text-sm py-2 h-auto rounded-none">
                            <div className="text-left">
                              <p className="font-medium">Community Meeting</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Tomorrow, 3:00 PM</p>
                            </div>
                          </Button>
                        </li>
                        <li className="border-b dark:border-gray-700 last:border-0">
                          <Button variant="ghost" className="w-full justify-start text-sm py-2 h-auto rounded-none">
                            <div className="text-left">
                              <p className="font-medium">Q&A Session with Mentors</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Thursday, 2:00 PM</p>
                            </div>
                          </Button>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
          
          {activeItem === "calendar" && (
            <div className="col-span-1 lg:col-span-2 h-full">
              <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-6 md:p-8 animate-fade-in shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Calendar</h2>
                  <div className="flex gap-2">
                    <div className="flex border rounded-md overflow-hidden">
                      <Button variant="ghost" size="sm" className="rounded-none border-r">Day</Button>
                      <Button variant="ghost" size="sm" className="rounded-none border-r bg-gray-50 dark:bg-gray-700">Week</Button>
                      <Button variant="ghost" size="sm" className="rounded-none">Month</Button>
                    </div>
                    <Button variant="outline" size="sm">Today</Button>
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden shadow-sm">
                  <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-900 border-b">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 grid-rows-5 h-[500px]">
                    {Array.from({ length: 35 }).map((_, i) => {
                      const isToday = i === 15; // Pretend this is today for demo
                      return (
                        <div 
                          key={i} 
                          className={`border-r border-b p-1 relative hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${isToday ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                        >
                          <div className={`text-xs ${isToday ? 'flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white font-medium mb-1 mx-auto' : 'text-gray-500 mb-1'}`}>
                            {((i % 31) + 1)}
                          </div>
                          
                          {i === 10 && (
                            <div className="text-xs p-1.5 bg-primary/10 text-primary dark:bg-primary/20 rounded mb-1 cursor-pointer hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
                              <div className="font-medium">Investor Meeting</div>
                              <div className="text-[10px] opacity-80">2:00 PM - 3:30 PM</div>
                            </div>
                          )}
                          
                          {i === 15 && (
                            <div className="text-xs p-1.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded mb-1 cursor-pointer hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                              <div className="font-medium">Community Call</div>
                              <div className="text-[10px] opacity-80">1:00 PM - 2:00 PM</div>
                            </div>
                          )}
                          
                          {i === 22 && (
                            <div className="text-xs p-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded mb-1 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                              <div className="font-medium">Workshop</div>
                              <div className="text-[10px] opacity-80">10:00 AM - 12:00 PM</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">Upcoming Community Events</h3>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      <PlusCircle className="h-3 w-3 mr-1.5" />
                      Add Event
                    </Button>
                  </div>
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
              <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-6 md:p-8 animate-fade-in shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:gap-8 mb-8">
                  <div className="mb-4 md:mb-0">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary border-4 border-white dark:border-gray-800 shadow-md relative group">
                      <span className="text-3xl font-bold">UN</span>
                      <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <span className="text-white text-xs">Change</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h1 className="text-2xl font-bold">User Name</h1>
                        <p className="text-gray-600 dark:text-gray-400">Entrepreneur / Founder</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="default" className="gap-1.5">
                          <Edit3 className="h-4 w-4" />
                          Edit Profile
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1.5">
                          <Palette className="h-4 w-4" />
                          Theme
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        🔥 5 day streak
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        🧠 Active Learner
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        💬 Community Member
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="w-full justify-start mb-6">
                    <TabsTrigger value="info">Personal Info</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="info" className="animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-[1fr_2fr] gap-3">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Display Name</div>
                            <div className="font-medium">User Name</div>
                            
                            <div className="text-sm text-gray-500 dark:text-gray-400">Email</div>
                            <div className="font-medium">user@example.com</div>
                            
                            <div className="text-sm text-gray-500 dark:text-gray-400">Location</div>
                            <div className="font-medium">San Francisco, CA</div>
                            
                            <div className="text-sm text-gray-500 dark:text-gray-400">Member Since</div>
                            <div className="font-medium">January 2023</div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Bio</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Textarea 
                            className="min-h-[120px] resize-none"
                            placeholder="Tell others about yourself..."
                            defaultValue="Entrepreneur focused on building sustainable businesses. Passionate about technology and community building."
                          />
                          <Button className="mt-4 w-full sm:w-auto">Save Bio</Button>
                        </CardContent>
                      </Card>
                      
                      <Card className="md:col-span-2">
                        <CardHeader>
                          <CardTitle className="text-lg">Appearance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="text-sm font-medium mb-3">Color Theme</h3>
                              <div className="flex flex-wrap gap-3">
                                <button
                                  onClick={() => setColorTheme("blue")}
                                  className={`w-10 h-10 rounded-full bg-blue-500 transition-all ${colorTheme === "blue" ? "ring-2 ring-offset-2 ring-blue-500 scale-110" : "opacity-70 hover:opacity-100"}`}
                                  aria-label="Blue theme"
                                />
                                <button
                                  onClick={() => setColorTheme("purple")}
                                  className={`w-10 h-10 rounded-full bg-purple-500 transition-all ${colorTheme === "purple" ? "ring-2 ring-offset-2 ring-purple-500 scale-110" : "opacity-70 hover:opacity-100"}`}
                                  aria-label="Purple theme"
                                />
                                <button
                                  onClick={() => setColorTheme("green")}
                                  className={`w-10 h-10 rounded-full bg-green-500 transition-all ${colorTheme === "green" ? "ring-2 ring-offset-2 ring-green-500 scale-110" : "opacity-70 hover:opacity-100"}`}
                                  aria-label="Green theme"
                                />
                                <button
                                  onClick={() => setColorTheme("orange")}
                                  className={`w-10 h-10 rounded-full bg-orange-500 transition-all ${colorTheme === "orange" ? "ring-2 ring-offset-2 ring-orange-500 scale-110" : "opacity-70 hover:opacity-100"}`}
                                  aria-label="Orange theme"
                                />
                              </div>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium mb-3">Display Mode</h3>
                              <div className="grid grid-cols-2 gap-3">
                                <Button
                                  variant={darkMode ? "outline" : "default"}
                                  className="justify-start h-auto py-2"
                                  onClick={() => setDarkMode(false)}
                                >
                                  <div className="flex flex-col items-start">
                                    <span>Light Mode</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      Light background
                                    </span>
                                  </div>
                                </Button>
                                <Button
                                  variant={darkMode ? "default" : "outline"}
                                  className="justify-start h-auto py-2"
                                  onClick={() => setDarkMode(true)}
                                >
                                  <div className="flex flex-col items-start">
                                    <span>Dark Mode</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      Dark background
                                    </span>
                                  </div>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="activity" className="animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                            Message Activity
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Messages Sent</span>
                            <span className="font-medium">254</span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Channels Active</span>
                            <span className="font-medium">8</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Last Active</span>
                            <span className="font-medium">Today</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-green-500" />
                            Event Participation
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Events Attended</span>
                            <span className="font-medium">12</span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Events Created</span>
                            <span className="font-medium">3</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Upcoming RSVPs</span>
                            <span className="font-medium">2</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center">
                            <Award className="h-4 w-4 mr-2 text-amber-500" />
                            Achievements
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Badges Earned</span>
                            <span className="font-medium">8</span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Best Streak</span>
                            <span className="font-medium">15 days</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Level</span>
                            <span className="font-medium">Intermediate</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="md:col-span-3">
                        <CardHeader>
                          <CardTitle className="text-lg">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="border-t dark:border-gray-700">
                            {[
                              { action: "Completed morning strategy", time: "Today, 8:30 AM", icon: CheckCircle2, iconClass: "text-green-500" },
                              { action: "Sent message in #founders", time: "Yesterday, 3:45 PM", icon: MessageSquare, iconClass: "text-primary" },
                              { action: "Added new habit", time: "Yesterday, 10:20 AM", icon: PlusCircle, iconClass: "text-indigo-500" },
                              { action: "Attended community call", time: "March 15, 2:00 PM", icon: Calendar, iconClass: "text-amber-500" },
                              { action: "Completed 7-day habit streak", time: "March 12, 9:15 PM", icon: Award, iconClass: "text-orange-500" }
                            ].map((item, index) => (
                              <div key={index} className="flex items-start p-4 border-b dark:border-gray-700 last:border-0">
                                <div className={`p-2 rounded-full ${item.iconClass} bg-gray-100 dark:bg-gray-900 mr-3`}>
                                  <item.icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="font-medium">{item.action}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.time}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="settings" className="animate-fade-in">
                    <div className="grid grid-cols-1 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Notification Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">Email Notifications</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Receive email updates about community activity</p>
                              </div>
                              <Button variant="outline">Configure</Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">Push Notifications</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Get alerts about new messages and events</p>
                              </div>
                              <Button variant="outline">Configure</Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">Reminder Schedule</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Set up reminders for habits and tasks</p>
                              </div>
                              <Button variant="outline">Configure</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Privacy Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">Profile Visibility</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Control who can see your profile information</p>
                              </div>
                              <Button variant="outline">Public</Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">Activity Status</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Show others when you're online</p>
                              </div>
                              <Button variant="outline">Visible</Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">Data Preferences</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Manage how your data is used</p>
                              </div>
                              <Button variant="outline">Manage</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Account Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">Change Password</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Update your account password</p>
                              </div>
                              <Button variant="outline">Change</Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">Language</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Set your preferred language</p>
                              </div>
                              <Button variant="outline">English</Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-red-500 dark:text-red-400">Delete Account</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete your account and data</p>
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive">Delete</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction>Delete Account</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
          
          {activeItem !== "chat" && 
           activeItem !== "home" && 
           activeItem !== "calendar" && 
           activeItem !== "profile" &&
           !activeItem.startsWith("community-") && (
            <div className="col-span-1 lg:col-span-2 h-full flex items-center justify-center">
              <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                  <span className="text-2xl font-bold">
                    {activeItem.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-semibold mb-4">{activeItem.charAt(0).toUpperCase() + activeItem.slice(1)} Coming Soon</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">This feature is currently under development and will be available in a future update.</p>
                <Button
                  onClick={() => setActiveItem('home')}
                  className="mx-auto"
                >
                  Return to Dashboard
                </Button>
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddHabit();
                    }
                  }}
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
      
      <AlertDialog open={showDeleteHabitDialog} onOpenChange={setShowDeleteHabitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this habit and its tracking history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteHabit}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
