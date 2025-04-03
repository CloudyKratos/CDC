
import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Calendar, CheckCircle2, Star, Clock, CircleX, CheckSquare, Smile, SunMedium, Brain, LucideIcon, ListTodo, Users, Goal, Map, Lightbulb, FlaskConical, Dumbbell, Leaf, Flower, Wind, Timer } from "lucide-react";

// Type definition for the morning strategy data
export interface MorningStrategyData {
  gratitude: string[];
  intentions: string[];
  focus: string;
  todo: { text: string; completed: boolean }[];
  mood: number;
  goals: { text: string; category: string }[];
  journal: string;
  date: Date;
}

// Helper types
type MoodOption = {
  value: number;
  label: string;
  emoji: React.ReactNode;
};

type GoalCategory = {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
};

type IntentionCategory = {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  description: string;
};

// Mood options for the selector
const moodOptions: MoodOption[] = [
  { value: 1, label: "Stressed", emoji: "😫" },
  { value: 2, label: "Tired", emoji: "😔" },
  { value: 3, label: "Neutral", emoji: "😐" },
  { value: 4, label: "Good", emoji: "🙂" },
  { value: 5, label: "Excellent", emoji: "😁" },
];

// Goal categories
const goalCategories: GoalCategory[] = [
  { id: "health", name: "Health", icon: Dumbbell, color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
  { id: "career", name: "Career", icon: Goal, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  { id: "learning", name: "Learning", icon: FlaskConical, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
  { id: "personal", name: "Personal", icon: Smile, color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" },
  { id: "relationships", name: "Relationships", icon: Users, color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" },
];

// Intention categories
const intentionCategories: IntentionCategory[] = [
  { 
    id: "mindfulness", 
    name: "Mindfulness", 
    icon: Brain, 
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    description: "Practice being present and aware throughout the day"
  },
  { 
    id: "productivity", 
    name: "Productivity", 
    icon: CheckSquare, 
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    description: "Focus on getting important things done efficiently"
  },
  { 
    id: "creativity", 
    name: "Creativity", 
    icon: Lightbulb, 
    color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
    description: "Seek inspiration and express yourself creatively"
  },
  { 
    id: "wellness", 
    name: "Wellness", 
    icon: Leaf, 
    color: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    description: "Prioritize your physical and mental well-being"
  },
  { 
    id: "connection", 
    name: "Connection", 
    icon: Users, 
    color: "bg-pink-100 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400",
    description: "Build and nurture meaningful relationships"
  },
];

interface MorningStrategyPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MorningStrategyData) => void;
  initialData?: Partial<MorningStrategyData>;
}

const MorningStrategyPopup: React.FC<MorningStrategyPopupProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [activeTab, setActiveTab] = useState("gratitude");
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<MorningStrategyData>({
    gratitude: ["", "", ""],
    intentions: [""],
    focus: "",
    todo: [{ text: "", completed: false }],
    mood: 3,
    goals: [{ text: "", category: "personal" }],
    journal: "",
    date: new Date(),
  });
  
  // Refs for auto-focus
  const gratitudeRefs = useRef<(HTMLInputElement | null)[]>([null, null, null]);
  const todoInputRef = useRef<HTMLInputElement | null>(null);
  
  // Initialize data with initialData if provided
  useEffect(() => {
    if (initialData) {
      setData(prev => ({
        ...prev,
        ...initialData,
        date: initialData.date || new Date(),
      }));
    }
  }, [initialData]);
  
  // Auto-focus the first gratitude input when opened
  useEffect(() => {
    if (isOpen && currentStep === 1 && gratitudeRefs.current[0]) {
      setTimeout(() => {
        gratitudeRefs.current[0]?.focus();
      }, 300);
    }
  }, [isOpen, currentStep]);
  
  const handleGratitudeChange = (index: number, value: string) => {
    const newGratitude = [...data.gratitude];
    newGratitude[index] = value;
    setData({ ...data, gratitude: newGratitude });
  };
  
  const handleIntentionChange = (index: number, value: string) => {
    const newIntentions = [...data.intentions];
    newIntentions[index] = value;
    setData({ ...data, intentions: newIntentions });
  };
  
  const addIntention = () => {
    setData({ ...data, intentions: [...data.intentions, ""] });
  };
  
  const removeIntention = (index: number) => {
    const newIntentions = data.intentions.filter((_, i) => i !== index);
    setData({ ...data, intentions: newIntentions });
  };
  
  const handleTodoChange = (index: number, value: string) => {
    const newTodos = [...data.todo];
    newTodos[index] = { ...newTodos[index], text: value };
    setData({ ...data, todo: newTodos });
  };
  
  const toggleTodoComplete = (index: number) => {
    const newTodos = [...data.todo];
    newTodos[index] = { ...newTodos[index], completed: !newTodos[index].completed };
    setData({ ...data, todo: newTodos });
  };
  
  const addTodo = () => {
    setData({ ...data, todo: [...data.todo, { text: "", completed: false }] });
    
    // Focus the new input after render
    setTimeout(() => {
      todoInputRef.current?.focus();
    }, 10);
  };
  
  const removeTodo = (index: number) => {
    const newTodos = data.todo.filter((_, i) => i !== index);
    setData({ ...data, todo: newTodos });
  };
  
  const handleGoalChange = (index: number, value: string) => {
    const newGoals = [...data.goals];
    newGoals[index] = { ...newGoals[index], text: value };
    setData({ ...data, goals: newGoals });
  };
  
  const handleGoalCategoryChange = (index: number, category: string) => {
    const newGoals = [...data.goals];
    newGoals[index] = { ...newGoals[index], category };
    setData({ ...data, goals: newGoals });
  };
  
  const addGoal = () => {
    setData({ ...data, goals: [...data.goals, { text: "", category: "personal" }] });
  };
  
  const removeGoal = (index: number) => {
    const newGoals = data.goals.filter((_, i) => i !== index);
    setData({ ...data, goals: newGoals });
  };
  
  const handleSave = () => {
    // Filter out empty entries
    const cleanData: MorningStrategyData = {
      ...data,
      gratitude: data.gratitude.filter(g => g.trim() !== ""),
      intentions: data.intentions.filter(i => i.trim() !== ""),
      todo: data.todo.filter(t => t.text.trim() !== ""),
      goals: data.goals.filter(g => g.text.trim() !== ""),
    };
    
    // Ensure we have at least some data
    if (cleanData.gratitude.length === 0 && 
        cleanData.intentions.length === 0 && 
        cleanData.todo.length === 0 && 
        cleanData.goals.length === 0 && 
        !cleanData.journal.trim()) {
      toast.error("Please add at least one item to your morning strategy");
      return;
    }
    
    onSave(cleanData);
    toast.success("Morning strategy saved", {
      description: "Your intentions have been set for the day",
    });
    onClose();
  };
  
  const handleMoodChange = (mood: number) => {
    setData({ ...data, mood });
  };
  
  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      
      // Update the active tab based on the step
      switch (currentStep + 1) {
        case 1:
          setActiveTab("gratitude");
          break;
        case 2:
          setActiveTab("intentions");
          break;
        case 3:
          setActiveTab("tasks");
          break;
        case 4:
          setActiveTab("goals");
          break;
        case 5:
          setActiveTab("journal");
          break;
      }
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      
      // Update the active tab based on the step
      switch (currentStep - 1) {
        case 1:
          setActiveTab("gratitude");
          break;
        case 2:
          setActiveTab("intentions");
          break;
        case 3:
          setActiveTab("tasks");
          break;
        case 4:
          setActiveTab("goals");
          break;
        case 5:
          setActiveTab("journal");
          break;
      }
    }
  };
  
  const getMoodEmoji = (moodValue: number) => {
    return moodOptions.find(m => m.value === moodValue)?.emoji || moodOptions[2].emoji;
  };
  
  const getMoodLabel = (moodValue: number) => {
    return moodOptions.find(m => m.value === moodValue)?.label || "Neutral";
  };
  
  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-6 pt-2">
        {[1, 2, 3, 4, 5].map(step => (
          <div key={step} className="flex items-center">
            <div 
              className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                step === currentStep 
                  ? 'bg-primary text-white' 
                  : step < currentStep 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
              onClick={() => setCurrentStep(step)}
            >
              {step < currentStep ? (
                <CheckCircle2 size={16} />
              ) : (
                <span className="text-sm">{step}</span>
              )}
            </div>
            {step < 5 && (
              <div 
                className={`w-12 h-0.5 transition-all ${
                  step < currentStep 
                    ? 'bg-primary' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-2xl overflow-hidden glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <SunMedium className="h-5 w-5 text-amber-500" />
            Morning Strategy & Intention Setting
          </DialogTitle>
          <DialogDescription>
            Start your day with mindfulness, purpose and clarity
          </DialogDescription>
        </DialogHeader>
        
        {renderStepIndicator()}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger 
              value="gratitude" 
              className="data-[state=active]:bg-purple-50 dark:data-[state=active]:bg-purple-900/20"
              onClick={() => setCurrentStep(1)}
            >
              <Star size={16} className="mr-1 md:mr-2 text-yellow-500" />
              <span className="hidden md:inline">Gratitude</span>
            </TabsTrigger>
            <TabsTrigger 
              value="intentions" 
              className="data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20"
              onClick={() => setCurrentStep(2)}
            >
              <Wind size={16} className="mr-1 md:mr-2 text-blue-500" />
              <span className="hidden md:inline">Intentions</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tasks" 
              className="data-[state=active]:bg-green-50 dark:data-[state=active]:bg-green-900/20"
              onClick={() => setCurrentStep(3)}
            >
              <ListTodo size={16} className="mr-1 md:mr-2 text-green-500" />
              <span className="hidden md:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger 
              value="goals" 
              className="data-[state=active]:bg-amber-50 dark:data-[state=active]:bg-amber-900/20"
              onClick={() => setCurrentStep(4)}
            >
              <Goal size={16} className="mr-1 md:mr-2 text-amber-500" />
              <span className="hidden md:inline">Goals</span>
            </TabsTrigger>
            <TabsTrigger 
              value="journal" 
              className="data-[state=active]:bg-pink-50 dark:data-[state=active]:bg-pink-900/20"
              onClick={() => setCurrentStep(5)}
            >
              <Flower size={16} className="mr-1 md:mr-2 text-pink-500" />
              <span className="hidden md:inline">Journal</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="gratitude" className="space-y-3 mt-2">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              <p>Write down three things you're grateful for this morning. This simple practice can significantly improve your mindset.</p>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key="gratitude"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-3">
                  {data.gratitude.map((item, index) => (
                    <div key={`gratitude-${index}`} className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mr-3">
                        {index + 1}
                      </div>
                      <Input
                        ref={el => gratitudeRefs.current[index] = el}
                        value={item}
                        onChange={(e) => handleGratitudeChange(index, e.target.value)}
                        placeholder={`I'm grateful for...`}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
          
          <TabsContent value="intentions" className="space-y-4 mt-2">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              <p>Set your intentions for the day. How do you want to show up and what energy do you want to bring?</p>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key="intentions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  {intentionCategories.map(category => (
                    <Card 
                      key={category.id}
                      className={`overflow-hidden cursor-pointer hover:border-${category.color.split(' ')[0].replace('bg-', '')} transition-all`}
                      onClick={() => {
                        const currentIntentions = [...data.intentions];
                        // Only add if it doesn't already contain something similar
                        if (!currentIntentions.some(i => i.toLowerCase().includes(category.name.toLowerCase()))) {
                          currentIntentions[0] = `I intend to practice ${category.name.toLowerCase()} today`;
                          setData({ ...data, intentions: currentIntentions });
                        }
                      }}
                    >
                      <CardContent className="p-3 flex items-center">
                        <div className={`h-8 w-8 rounded-full ${category.color} flex items-center justify-center mr-2`}>
                          <category.icon size={15} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{category.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{category.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="space-y-3">
                  {data.intentions.map((intention, index) => (
                    <div key={`intention-${index}`} className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3">
                        <Wind size={15} />
                      </div>
                      <Input
                        value={intention}
                        onChange={(e) => handleIntentionChange(index, e.target.value)}
                        placeholder="I intend to..."
                        className="flex-1"
                      />
                      {index > 0 && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="ml-2 text-gray-400 hover:text-red-500"
                          onClick={() => removeIntention(index)}
                        >
                          <CircleX size={16} />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2" 
                    onClick={addIntention}
                  >
                    Add another intention
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
          
          <TabsContent value="tasks" className="space-y-3 mt-2">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              <p>What are the most important tasks you want to accomplish today?</p>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-3">
                  {data.todo.map((todo, index) => (
                    <div key={`todo-${index}`} className="flex items-center">
                      <div 
                        className={`h-8 w-8 rounded-full ${
                          todo.completed 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        } flex items-center justify-center mr-3 cursor-pointer transition-all`}
                        onClick={() => toggleTodoComplete(index)}
                      >
                        {todo.completed ? <CheckCircle2 size={16} /> : <Timer size={16} />}
                      </div>
                      <Input
                        ref={index === data.todo.length - 1 ? todoInputRef : null}
                        value={todo.text}
                        onChange={(e) => handleTodoChange(index, e.target.value)}
                        placeholder="Task to complete..."
                        className={`flex-1 ${todo.completed ? 'line-through text-gray-400' : ''}`}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="ml-2 text-gray-400 hover:text-red-500"
                        onClick={() => removeTodo(index)}
                      >
                        <CircleX size={16} />
                      </Button>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2" 
                    onClick={addTodo}
                  >
                    Add another task
                  </Button>
                  
                  <div className="mt-4">
                    <h4 className="font-medium text-sm mb-2 flex items-center">
                      <Clock size={15} className="mr-2 text-primary" />
                      Today's Main Focus
                    </h4>
                    <Input
                      value={data.focus}
                      onChange={(e) => setData({ ...data, focus: e.target.value })}
                      placeholder="What's your #1 priority for today?"
                      className="border-primary/30 focus-visible:ring-primary"
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
          
          <TabsContent value="goals" className="space-y-3 mt-2">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              <p>What progress can you make today on your most important goals?</p>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key="goals"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-3">
                  {data.goals.map((goal, index) => (
                    <div key={`goal-${index}`} className="flex flex-col space-y-2">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 flex items-center justify-center mr-3">
                          <Goal size={16} />
                        </div>
                        <Input
                          value={goal.text}
                          onChange={(e) => handleGoalChange(index, e.target.value)}
                          placeholder="Progress I want to make today..."
                          className="flex-1"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="ml-2 text-gray-400 hover:text-red-500"
                          onClick={() => removeGoal(index)}
                        >
                          <CircleX size={16} />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 ml-11">
                        {goalCategories.map(category => (
                          <button
                            key={`${index}-${category.id}`}
                            type="button"
                            onClick={() => handleGoalCategoryChange(index, category.id)}
                            className={`px-2 py-1 rounded-full text-xs flex items-center ${
                              goal.category === category.id
                                ? category.color + ' font-medium'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                          >
                            <category.icon size={12} className="mr-1" />
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2" 
                    onClick={addGoal}
                  >
                    Add another goal
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
          
          <TabsContent value="journal" className="space-y-3 mt-2">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              <p>How are you feeling today? Use this space to check in with yourself.</p>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key="journal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Today's Mood</Label>
                    <div className="flex justify-between items-center p-2 border rounded-lg">
                      {moodOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleMoodChange(option.value)}
                          className={`flex flex-col items-center p-2 rounded-md transition-all ${
                            data.mood === option.value 
                              ? 'bg-primary/10 text-primary scale-110' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <span className="text-2xl mb-1">{option.emoji}</span>
                          <span className="text-xs font-medium">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label htmlFor="journal" className="mb-2 block">Journal Entry</Label>
                    <Textarea
                      id="journal"
                      value={data.journal}
                      onChange={(e) => setData({ ...data, journal: e.target.value })}
                      placeholder="What's on your mind this morning? How are you feeling about the day ahead?"
                      className="min-h-[120px]"
                    />
                  </div>
                  
                  <div className="flex items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 text-sm">
                    <div className="flex items-center justify-center bg-blue-100 dark:bg-blue-900/20 h-8 w-8 rounded-full mr-3">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="font-medium">Today is {data.date.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                      <p className="text-blue-500 dark:text-blue-300 text-xs">{data.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center mt-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="h-12 w-12 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center mr-4 text-2xl">
                    {getMoodEmoji(data.mood)}
                  </div>
                  <div>
                    <h4 className="font-medium">You're feeling {getMoodLabel(data.mood)} today</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {data.mood >= 4 
                        ? "Great! Use this positive energy to tackle your goals." 
                        : data.mood <= 2 
                        ? "Take some time for self-care today and be kind to yourself." 
                        : "Remember to take breaks and stay hydrated throughout the day."}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep < 5 ? (
              <Button 
                variant="default"
                onClick={nextStep}
              >
                Next
                <ArrowRight size={16} className="ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSave}>
                Save Morning Strategy
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MorningStrategyPopup;
