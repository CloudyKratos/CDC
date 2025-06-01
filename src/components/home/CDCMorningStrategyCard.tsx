
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
  Heart, 
  Upload, 
  Star,
  Target,
  Flame
} from "lucide-react";
import { toast } from "sonner";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const CDCMorningStrategyCard = () => {
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [photoCaption, setPhotoCaption] = useState("");
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", text: "", completed: false },
    { id: "2", text: "", completed: false },
    { id: "3", text: "", completed: false },
    { id: "4", text: "", completed: false },
    { id: "5", text: "", completed: false }
  ]);
  const [gratitudeItems, setGratitudeItems] = useState(["", "", ""]);
  const [xpEarned, setXpEarned] = useState(0);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verify timestamp is today
      const today = new Date().toDateString();
      const fileDate = new Date(file.lastModified).toDateString();
      
      if (fileDate === today || Math.abs(Date.now() - file.lastModified) < 24 * 60 * 60 * 1000) {
        setPhotoUploaded(true);
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

  const updateTask = (id: string, text: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, text } : task
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
        toast.success("All tasks completed! +100 XP", {
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
          icon: <Heart className="h-4 w-4" />,
        });
      }
      
      return updated;
    });
  };

  const completedTasks = tasks.filter(task => task.completed && task.text.trim()).length;
  const allTasksCompleted = completedTasks === 5 && tasks.every(task => task.text.trim());
  const gratitudeCompleted = gratitudeItems.every(item => item.trim());

  return (
    <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-yellow-400/30 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <Star className="h-6 w-6 text-yellow-500" />
              CDC Morning Strategy
            </CardTitle>
            <CardDescription className="text-purple-300">
              Start your day with commitment, discipline, and consistency
            </CardDescription>
          </div>
          {xpEarned > 0 && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white animate-pulse">
              +{xpEarned} XP
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Morning Movement Verification */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-500" />
            <h4 className="font-semibold">🌅 Morning Movement Verification</h4>
            {photoUploaded && <CheckCircle className="h-5 w-5 text-green-500" />}
          </div>
          <p className="text-sm text-muted-foreground">
            Upload a photo of your walk/run/exercise taken today
          </p>
          
          <div className="flex gap-2">
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
                className={`gap-2 ${photoUploaded ? "bg-green-600 hover:bg-green-700" : ""}`}
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
              className="flex-1"
              disabled={!photoUploaded}
            />
          </div>
          
          {photoUploaded && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Movement verified • Auto-timestamped • +50 XP</span>
            </div>
          )}
        </div>

        {/* 5 Key Tasks */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            <h4 className="font-semibold">📋 5 Key Tasks</h4>
            <Badge variant="outline">{completedTasks}/5</Badge>
            {allTasksCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
          </div>
          <p className="text-sm text-muted-foreground">
            List 5 things you'll accomplish today
          </p>
          
          <div className="space-y-2">
            {tasks.map((task, index) => (
              <div key={task.id} className="flex items-center gap-3">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTaskCompletion(task.id)}
                  disabled={!task.text.trim()}
                />
                <span className="text-sm font-medium w-4">{index + 1}.</span>
                <Input
                  placeholder={`Task ${index + 1}...`}
                  value={task.text}
                  onChange={(e) => updateTask(task.id, e.target.value)}
                  className={`flex-1 ${task.completed ? "line-through text-muted-foreground" : ""}`}
                />
              </div>
            ))}
          </div>
          
          {allTasksCompleted && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>All tasks completed • +100 XP</span>
            </div>
          )}
        </div>

        {/* 3 Things You're Grateful For */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            <h4 className="font-semibold">💛 3 Things You're Grateful For</h4>
            {gratitudeCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
          </div>
          <p className="text-sm text-muted-foreground">
            Write down 3 things you're grateful for today
          </p>
          
          <div className="space-y-2">
            {gratitudeItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-sm font-medium w-4 mt-2">{index + 1}.</span>
                <Textarea
                  placeholder={`Gratitude ${index + 1}...`}
                  value={item}
                  onChange={(e) => updateGratitude(index, e.target.value)}
                  className="flex-1 min-h-[60px] resize-none"
                />
              </div>
            ))}
          </div>
          
          {gratitudeCompleted && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Gratitude practice complete • +30 XP</span>
            </div>
          )}
        </div>

        {/* Progress Summary */}
        <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Today's Progress:</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Camera className="h-4 w-4 text-blue-500" />
                <span className={`text-xs ${photoUploaded ? "text-green-600" : "text-muted-foreground"}`}>
                  Movement
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4 text-purple-500" />
                <span className={`text-xs ${allTasksCompleted ? "text-green-600" : "text-muted-foreground"}`}>
                  Tasks ({completedTasks}/5)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-red-500" />
                <span className={`text-xs ${gratitudeCompleted ? "text-green-600" : "text-muted-foreground"}`}>
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
