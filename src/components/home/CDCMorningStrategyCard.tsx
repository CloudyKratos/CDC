
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
  BookOpen
} from "lucide-react";
import { toast } from "sonner";

interface Task {
  id: string;
  category: 'mind' | 'body' | 'mission' | 'connection' | 'self';
  text: string;
  completed: boolean;
  description: string;
}

const CDCMorningStrategyCard = () => {
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [photoCaption, setPhotoCaption] = useState("");
  const [showDiary, setShowDiary] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", category: 'mind', text: "", completed: false, description: "" },
    { id: "2", category: 'body', text: "", completed: false, description: "" },
    { id: "3", category: 'mission', text: "", completed: false, description: "" },
    { id: "4", category: 'connection', text: "", completed: false, description: "" },
    { id: "5", category: 'self', text: "", completed: false, description: "" }
  ]);
  const [gratitudeItems, setGratitudeItems] = useState(["", "", ""]);
  const [xpEarned, setXpEarned] = useState(0);

  const taskCategories = {
    mind: { icon: Brain, label: "Mind", placeholder: "Read, listen, learn..." },
    body: { icon: Dumbbell, label: "Body", placeholder: "Workout, exercise..." },
    mission: { icon: Briefcase, label: "Mission", placeholder: "Main goal task..." },
    connection: { icon: Users, label: "Connection", placeholder: "Check-in with someone..." },
    self: { icon: Sprout, label: "Self", placeholder: "Inner growth habit..." }
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
        toast.success("Morning movement verified! +50 XP", {
          description: "Great job starting your day with movement!",
          icon: <Flame className="h-4 w-4" />,
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

  const toggleTaskCompletion = (id: string) => {
    setTasks(prev => {
      const updated = prev.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      );
      
      const completedCount = updated.filter(task => task.completed && task.text.trim()).length;
      const allCompleted = completedCount === 5 && updated.every(task => task.text.trim());
      
      if (allCompleted && !tasks.every(task => task.completed)) {
        setXpEarned(prev => prev + 100);
        toast.success("All missions complete! +100 XP", {
          description: "You're crushing your daily objectives!",
          icon: <Target className="h-4 w-4" />,
        });
      }
      
      return updated;
    });
  };

  const updateGratitude = (index: number, value: string) => {
    setGratitudeItems(prev => {
      const updated = [...prev];
      updated[index] = value;
      
      const filledCount = updated.filter(item => item.trim()).length;
      if (filledCount === 3 && !gratitudeItems.every(item => item.trim())) {
        setXpEarned(prev => prev + 30);
        toast.success("Gratitude practice complete! +30 XP", {
          description: "Gratitude transforms perspective into power!",
          icon: <Star className="h-4 w-4" />,
        });
      }
      
      return updated;
    });
  };

  const completedTasks = tasks.filter(task => task.completed && task.text.trim()).length;
  const allTasksCompleted = completedTasks === 5 && tasks.every(task => task.text.trim());
  const gratitudeCompleted = gratitudeItems.every(item => item.trim());

  return (
    <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-purple-400/20 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              <Star className="h-6 w-6 text-purple-500" />
              CDC Morning Strategy
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Start your day with commitment, discipline, and consistency
            </CardDescription>
          </div>
          {xpEarned > 0 && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white animate-pulse shadow-lg">
              +{xpEarned} XP
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Morning Movement Verification */}
        <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200/50 dark:border-blue-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
              <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">Morning Movement Verification</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Upload a photo of your walk/run/exercise taken today
              </p>
            </div>
            {photoUploaded && <CheckCircle className="h-5 w-5 text-green-500" />}
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={photoUploaded}
              />
              <Button 
                variant={photoUploaded ? "default" : "outline"}
                className={`gap-2 transition-all duration-200 ${photoUploaded ? "bg-green-600 hover:bg-green-700 shadow-lg" : "hover:scale-105"}`}
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
              className="flex-1 border-blue-200 dark:border-blue-800"
              disabled={!photoUploaded}
            />
          </div>
          
          {photoUploaded && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-2 rounded-md">
              <CheckCircle className="h-4 w-4" />
              <span>Movement verified • Auto-timestamped • +50 XP</span>
            </div>
          )}
        </div>

        {/* Mission Log - 5 Key Tasks */}
        <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200/50 dark:border-purple-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/50">
              <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">Mission Log</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                5 tactical objectives for today
              </p>
            </div>
            <Badge variant="outline" className="border-purple-300 text-purple-700 dark:text-purple-300">
              {completedTasks}/5
            </Badge>
            {allTasksCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
          </div>
          
          <div className="space-y-3">
            {tasks.map((task) => {
              const category = taskCategories[task.category];
              const IconComponent = category.icon;
              
              return (
                <div key={task.id} className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/60 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-200 hover:shadow-md">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTaskCompletion(task.id)}
                      disabled={!task.text.trim()}
                      className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                    <div className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700">
                      <IconComponent className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder={`${category.label}: ${category.placeholder}`}
                        value={task.text}
                        onChange={(e) => updateTask(task.id, 'text', e.target.value)}
                        className={`border-0 bg-transparent p-0 h-auto focus-visible:ring-0 ${task.completed ? "line-through text-gray-500" : ""}`}
                      />
                    </div>
                  </div>
                  
                  {showDiary && task.text.trim() && (
                    <div className="ml-12 animate-fade-in">
                      <Textarea
                        placeholder={`Describe your ${category.label.toLowerCase()} task details...`}
                        value={task.description}
                        onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                        className="min-h-[60px] resize-none border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {allTasksCompleted && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-2 rounded-md">
              <CheckCircle className="h-4 w-4" />
              <span>All missions complete • +100 XP</span>
            </div>
          )}
        </div>

        {/* Gratitude Practice */}
        <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200/50 dark:border-orange-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/50">
              <Star className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">Gratitude Practice</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                3 things you're grateful for today
              </p>
            </div>
            {gratitudeCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
          </div>
          
          <div className="space-y-3">
            {gratitudeItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-sm font-medium w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400 mt-2">
                  {index + 1}
                </span>
                <Textarea
                  placeholder={`Gratitude ${index + 1}...`}
                  value={item}
                  onChange={(e) => updateGratitude(index, e.target.value)}
                  className="flex-1 min-h-[60px] resize-none border-orange-200 dark:border-orange-800 bg-white/80 dark:bg-gray-800/80"
                />
              </div>
            ))}
          </div>
          
          {gratitudeCompleted && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-2 rounded-md">
              <CheckCircle className="h-4 w-4" />
              <span>Gratitude practice complete • +30 XP</span>
            </div>
          )}
        </div>

        {/* Progress Summary */}
        <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Today's Progress</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Camera className="h-4 w-4 text-blue-500" />
                <span className={`text-xs ${photoUploaded ? "text-green-600" : "text-gray-400"}`}>
                  Movement
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4 text-purple-500" />
                <span className={`text-xs ${allTasksCompleted ? "text-green-600" : "text-gray-400"}`}>
                  Tasks ({completedTasks}/5)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-orange-500" />
                <span className={`text-xs ${gratitudeCompleted ? "text-green-600" : "text-gray-400"}`}>
                  Gratitude
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CDCMorningStrategyCard;
