
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Check, X } from "lucide-react";

export type MorningStrategyData = {
  dailyFocus: string;
  topThreeTasks: string[];
  gratitude: string;
};

export interface MorningStrategyPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: MorningStrategyData) => void;
}

const MorningStrategyPopup: React.FC<MorningStrategyPopupProps> = ({ 
  isOpen, 
  onClose,
  onComplete 
}) => {
  const [dailyFocus, setDailyFocus] = useState("");
  const [topThreeTasks, setTopThreeTasks] = useState(["", "", ""]);
  const [gratitude, setGratitude] = useState("");

  const handleTaskChange = (index: number, value: string) => {
    const newTasks = [...topThreeTasks];
    newTasks[index] = value;
    setTopThreeTasks(newTasks);
  };

  const handleSubmit = () => {
    const data: MorningStrategyData = {
      dailyFocus,
      topThreeTasks,
      gratitude
    };
    
    if (onComplete) {
      onComplete(data);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Morning Strategy Session
          </DialogTitle>
          <DialogDescription>
            Take 5 minutes to set your intentions for the day
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-2">
          <div className="space-y-2">
            <label className="font-medium text-sm">What's your main focus today?</label>
            <Textarea 
              placeholder="I will focus on..."
              value={dailyFocus}
              onChange={(e) => setDailyFocus(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          
          <div className="space-y-2">
            <label className="font-medium text-sm">Top three tasks to accomplish:</label>
            <div className="space-y-2">
              {topThreeTasks.map((task, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </div>
                  <Textarea 
                    placeholder={`Task ${index + 1}`}
                    value={task}
                    onChange={(e) => handleTaskChange(index, e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="font-medium text-sm">What are you grateful for today?</label>
            <Textarea 
              placeholder="I'm grateful for..."
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Check className="mr-2 h-4 w-4" />
            Complete Morning Strategy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MorningStrategyPopup;
