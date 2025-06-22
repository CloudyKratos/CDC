
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Camera, 
  CheckCircle, 
  Upload, 
  Star,
  Target,
  Flame,
  Brain,
  Dumbbell,
  Briefcase,
  Users,
  Sprout,
  GripVertical,
  Zap,
  Trophy,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus
} from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface Task {
  id: string;
  category: 'mind' | 'body' | 'mission' | 'connection' | 'self';
  text: string;
  completed: boolean;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

const EnhancedCDCMorningStrategyCard = () => {
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoCaption, setPhotoCaption] = useState("");
  const [showDiary, setShowDiary] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    movement: true,
    missions: true,
    gratitude: true
  });
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", category: 'mind', text: "", completed: false, description: "", priority: 'medium' },
    { id: "2", category: 'body', text: "", completed: false, description: "", priority: 'high' },
    { id: "3", category: 'mission', text: "", completed: false, description: "", priority: 'high' },
    { id: "4", category: 'connection', text: "", completed: false, description: "", priority: 'medium' },
    { id: "5", category: 'self', text: "", completed: false, description: "", priority: 'low' }
  ]);
  const [gratitudeItems, setGratitudeItems] = useState(["", "", ""]);
  const [xpEarned, setXpEarned] = useState(0);
  const [streak, setStreak] = useState(5);
  const [animatingTask, setAnimatingTask] = useState<string | null>(null);

  const taskCategories = {
    mind: { 
      icon: Brain, 
      label: "Mind", 
      placeholder: "Read, listen, learn...",
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30"
    },
    body: { 
      icon: Dumbbell, 
      label: "Body", 
      placeholder: "Workout, exercise...",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50 dark:bg-green-950/30"
    },
    mission: { 
      icon: Briefcase, 
      label: "Mission", 
      placeholder: "Main goal task...",
      color: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30"
    },
    connection: { 
      icon: Users, 
      label: "Connection", 
      placeholder: "Check-in with someone...",
      color: "from-pink-500 to-rose-600",
      bgColor: "bg-pink-50 dark:bg-pink-950/30"
    },
    self: { 
      icon: Sprout, 
      label: "Self", 
      placeholder: "Inner growth habit...",
      color: "from-orange-500 to-amber-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/30"
    }
  };

  const priorityColors = {
    low: "text-gray-500",
    medium: "text-yellow-500",
    high: "text-red-500"
  };

  // Simulated sound effect
  const playCompletionSound = () => {
    // In a real app, you'd play an actual sound file
    console.log("🔔 Task completion sound!");
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const today = new Date().toDateString();
      const fileDate = new Date(file.lastModified).toDateString();
      
      if (fileDate === today || Math.abs(Date.now() - file.lastModified) < 24 * 60 * 60 * 1000) {
        setPhotoUploaded(true);
        setShowDiary(true);
        setXpEarned(prev => prev + 50);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setPhotoPreview(e.target?.result as string);
        reader.readAsDataURL(file);
        
        playCompletionSound();
        toast.success("Movement verified! +50 XP", {
          description: "Great job starting your day with movement!",
          icon: <Sparkles className="h-4 w-4" />,
        });
      } else {
        toast.error("Photo must be taken today", {
          description: "Please upload a recent photo from today's movement.",
        });
      }
    }
  };

  const updateTask = (id: string, field: 'text' | 'description', value: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, [field]: value } : task
    ));
  };

  const updateTaskPriority = (id: string, priority: 'low' | 'medium' | 'high') => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, priority } : task
    ));
  };

  const toggleTaskCompletion = (id: string) => {
    setAnimatingTask(id);
    playCompletionSound();
    
    setTasks(prev => {
      const updated = prev.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      );
      
      const completedCount = updated.filter(task => task.completed && task.text.trim()).length;
      const allCompleted = completedCount === 5 && updated.every(task => task.text.trim());
      
      if (allCompleted && !tasks.every(task => task.completed)) {
        setXpEarned(prev => prev + 100);
        setStreak(prev => prev + 1);
        toast.success("All missions complete! +100 XP", {
          description: "You're crushing your daily objectives!",
          icon: <Trophy className="h-4 w-4" />,
        });
      }
      
      return updated;
    });

    setTimeout(() => setAnimatingTask(null), 600);
  };

  const updateGratitude = (index: number, value: string) => {
    setGratitudeItems(prev => {
      const updated = [...prev];
      updated[index] = value;
      
      const filledCount = updated.filter(item => item.trim()).length;
      if (filledCount === 3 && !gratitudeItems.every(item => item.trim())) {
        setXpEarned(prev => prev + 30);
        playCompletionSound();
        toast.success("Gratitude practice complete! +30 XP", {
          description: "Gratitude transforms perspective into power!",
          icon: <Star className="h-4 w-4" />,
        });
      }
      
      return updated;
    });
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setTasks(items);
    toast.success("Tasks reordered!", { duration: 1000 });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const completedTasks = tasks.filter(task => task.completed && task.text.trim()).length;
  const allTasksCompleted = completedTasks === 5 && tasks.every(task => task.text.trim());
  const gratitudeCompleted = gratitudeItems.every(item => item.trim());
  const progressPercentage = ((completedTasks / 5) + (photoUploaded ? 0.2 : 0) + (gratitudeCompleted ? 0.2 : 0)) * 100;

  return (
    <TooltipProvider>
      <Card className="backdrop-blur-md bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/70 border-2 border-purple-400/30 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 via-blue-400/5 to-pink-400/5 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-300/20 to-transparent rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-300/20 to-transparent rounded-full blur-xl"></div>
        
        <CardHeader className="pb-4 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="flex items-center gap-3 text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
                <div className="relative">
                  <Star className="h-6 w-6 md:h-8 md:w-8 text-purple-500 animate-pulse" />
                  <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500 animate-bounce" />
                </div>
                CDC Morning Strategy
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
                Start your day with commitment, discipline, and consistency
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {/* Streak Indicator */}
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-lg">
                    <Flame className="h-4 w-4" />
                    <span className="font-bold">{streak}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Day streak! Keep it up!</p>
                </TooltipContent>
              </Tooltip>
              
              {/* XP Badge */}
              {xpEarned > 0 && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white animate-pulse shadow-lg px-3 py-1">
                  <Zap className="h-3 w-3 mr-1" />
                  +{xpEarned} XP
                </Badge>
              )}
              
              {/* Progress Circle */}
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - progressPercentage / 100)}`}
                    className="text-purple-500 transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 relative z-10">
          {/* Morning Movement Verification */}
          <div className="space-y-4">
            <button
              onClick={() => toggleSection('movement')}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200/50 dark:border-blue-800/50 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
                  <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Morning Movement Verification</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Upload a photo of your walk/run/exercise taken today
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {photoUploaded && <CheckCircle className="h-5 w-5 text-green-500" />}
                <div className={expandedSections.movement ? "rotate-180" : ""}>
                  <ArrowDown className="h-4 w-4" />
                </div>
              </div>
            </button>
            
            {expandedSections.movement && (
              <div className="space-y-4 px-4 animate-fade-in">
                <div className="flex gap-3 flex-col sm:flex-row">
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={photoUploaded}
                    />
                    <Button 
                      variant={photoUploaded ? "default" : "outline"}
                      className={`gap-2 transition-all duration-300 group-hover:scale-105 ${
                        photoUploaded 
                          ? "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/25" 
                          : "hover:shadow-lg hover:shadow-blue-500/25"
                      }`}
                      disabled={photoUploaded}
                    >
                      <Upload className="h-4 w-4" />
                      {photoUploaded ? "Movement Verified!" : "Upload Photo"}
                    </Button>
                  </div>
                  
                  <Input
                    placeholder="Optional caption..."
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                    className="flex-1 border-blue-200 dark:border-blue-800 focus:ring-2 focus:ring-blue-500/20"
                    disabled={!photoUploaded}
                  />
                </div>
                
                {photoPreview && (
                  <div className="flex items-center gap-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                    <img 
                      src={photoPreview} 
                      alt="Movement verification" 
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        <span>Movement verified • Auto-timestamped • +50 XP</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mission Log - Enhanced with Drag & Drop */}
          <div className="space-y-4">
            <button
              onClick={() => toggleSection('missions')}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200/50 dark:border-purple-800/50 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/50">
                  <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Mission Log</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    5 tactical objectives for today • Drag to reorder
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-purple-300 text-purple-700 dark:text-purple-300">
                  {completedTasks}/5
                </Badge>
                {allTasksCompleted && <Trophy className="h-5 w-5 text-yellow-500" />}
                <div className={expandedSections.missions ? "rotate-180" : ""}>
                  <ArrowDown className="h-4 w-4" />
                </div>
              </div>
            </button>
            
            {expandedSections.missions && (
              <div className="space-y-3 animate-fade-in">
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="tasks">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                        {tasks.map((task, index) => {
                          const category = taskCategories[task.category];
                          const IconComponent = category.icon;
                          
                          return (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`group relative transition-all duration-300 ${
                                    snapshot.isDragging ? "rotate-2 scale-105 shadow-xl" : ""
                                  } ${animatingTask === task.id ? "animate-pulse scale-105" : ""}`}
                                >
                                  <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                    task.completed 
                                      ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                                      : `${category.bgColor} border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg hover:border-purple-300/50`
                                  }`}>
                                    <div className="flex items-center gap-3">
                                      {/* Drag Handle */}
                                      <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100 transition-opacity">
                                        <GripVertical className="h-4 w-4 text-gray-400" />
                                      </div>
                                      
                                      {/* Quick Complete Button */}
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            onClick={() => toggleTaskCompletion(task.id)}
                                            disabled={!task.text.trim()}
                                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                              task.completed
                                                ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/25"
                                                : "border-gray-300 hover:border-purple-500 hover:shadow-md hover:scale-110"
                                            }`}
                                          >
                                            {task.completed && <CheckCircle className="h-4 w-4" />}
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{task.completed ? "Mark incomplete" : "Complete task"}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                      
                                      {/* Category Icon */}
                                      <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color} text-white shadow-md`}>
                                        <IconComponent className="h-4 w-4" />
                                      </div>
                                      
                                      {/* Task Input */}
                                      <div className="flex-1">
                                        <Input
                                          placeholder={`${category.label}: ${category.placeholder}`}
                                          value={task.text}
                                          onChange={(e) => updateTask(task.id, 'text', e.target.value)}
                                          className={`border-0 bg-transparent p-0 h-auto focus-visible:ring-1 focus-visible:ring-purple-500/50 ${
                                            task.completed ? "line-through text-gray-500" : ""
                                          }`}
                                        />
                                      </div>
                                      
                                      {/* Priority Selector */}
                                      <div className="flex gap-1">
                                        {(['low', 'medium', 'high'] as const).map((level) => (
                                          <Tooltip key={level}>
                                            <TooltipTrigger asChild>
                                              <button
                                                onClick={() => updateTaskPriority(task.id, level)}
                                                className={`w-3 h-3 rounded-full transition-all duration-200 hover:scale-125 ${
                                                  task.priority === level
                                                    ? priorityColors[level].replace('text-', 'bg-') + " shadow-md"
                                                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                                                }`}
                                              />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>{level.charAt(0).toUpperCase() + level.slice(1)} priority</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    {/* Task Description */}
                                    {showDiary && task.text.trim() && (
                                      <div className="mt-3 ml-12 animate-fade-in">
                                        <Textarea
                                          placeholder={`Describe your ${category.label.toLowerCase()} task details...`}
                                          value={task.description}
                                          onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                                          className="min-h-[60px] resize-none border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-purple-500/20"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                
                {allTasksCompleted && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-800 animate-fade-in">
                    <Trophy className="h-4 w-4" />
                    <span>All missions complete • +100 XP • Streak increased!</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enhanced Gratitude Practice */}
          <div className="space-y-4">
            <button
              onClick={() => toggleSection('gratitude')}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200/50 dark:border-orange-800/50 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/50">
                  <Star className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Gratitude Practice</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    3 things you're grateful for today
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {gratitudeCompleted && <Star className="h-5 w-5 text-yellow-500" />}
                <div className={expandedSections.gratitude ? "rotate-180" : ""}>
                  <ArrowDown className="h-4 w-4" />
                </div>
              </div>
            </button>
            
            {expandedSections.gratitude && (
              <div className="space-y-3 animate-fade-in">
                {gratitudeItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 group">
                    <div className="relative">
                      <span className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center text-sm font-bold shadow-md group-hover:scale-110 transition-transform duration-200">
                        {index + 1}
                      </span>
                      {item.trim() && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <Textarea
                      placeholder={`Gratitude ${index + 1}...`}
                      value={item}
                      onChange={(e) => updateGratitude(index, e.target.value)}
                      className="flex-1 min-h-[60px] resize-none border-orange-200 dark:border-orange-800 bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 hover:shadow-md"
                    />
                  </div>
                ))}
                
                {gratitudeCompleted && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-800 animate-fade-in">
                    <Star className="h-4 w-4" />
                    <span>Gratitude practice complete • +30 XP</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enhanced Progress Summary */}
          <div className="pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-3 rounded-lg text-center transition-all duration-300 ${
                photoUploaded 
                  ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800" 
                  : "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
              }`}>
                <Camera className={`h-6 w-6 mx-auto mb-1 ${photoUploaded ? "text-green-500" : "text-gray-400"}`} />
                <div className="text-xs font-medium">Movement</div>
                <div className={`text-xs ${photoUploaded ? "text-green-600" : "text-gray-400"}`}>
                  {photoUploaded ? "Verified ✓" : "Pending"}
                </div>
              </div>
              
              <div className={`p-3 rounded-lg text-center transition-all duration-300 ${
                allTasksCompleted
                  ? "bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800"
                  : "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
              }`}>
                <Target className={`h-6 w-6 mx-auto mb-1 ${allTasksCompleted ? "text-purple-500" : "text-gray-400"}`} />
                <div className="text-xs font-medium">Tasks</div>
                <div className={`text-xs ${allTasksCompleted ? "text-purple-600" : "text-gray-400"}`}>
                  {completedTasks}/5 Complete
                </div>
              </div>
              
              <div className={`p-3 rounded-lg text-center transition-all duration-300 ${
                gratitudeCompleted
                  ? "bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800"
                  : "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
              }`}>
                <Star className={`h-6 w-6 mx-auto mb-1 ${gratitudeCompleted ? "text-orange-500" : "text-gray-400"}`} />
                <div className="text-xs font-medium">Gratitude</div>
                <div className={`text-xs ${gratitudeCompleted ? "text-orange-600" : "text-gray-400"}`}>
                  {gratitudeCompleted ? "Complete ✓" : "In Progress"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default EnhancedCDCMorningStrategyCard;
