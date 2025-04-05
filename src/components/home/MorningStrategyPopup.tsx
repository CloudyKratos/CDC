
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Check, X, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from 'sonner';

export type MorningStrategyData = {
  dailyFocus: string;
  topThreeTasks: string[];
  gratitude: string;
  morningWalkImage?: string | null;
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
  const [morningWalkImage, setMorningWalkImage] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTaskChange = (index: number, value: string) => {
    const newTasks = [...topThreeTasks];
    newTasks[index] = value;
    setTopThreeTasks(newTasks);
  };

  const handleSubmit = () => {
    if (!morningWalkImage) {
      toast.error("Please upload your morning walk picture", {
        description: "A morning walk picture is required to complete your strategy session."
      });
      return;
    }
    
    const data: MorningStrategyData = {
      dailyFocus,
      topThreeTasks,
      gratitude,
      morningWalkImage
    };
    
    if (onComplete) {
      onComplete(data);
    }
    onClose();
  };
  
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Invalid file type", {
        description: "Please upload an image file"
      });
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Please upload an image smaller than 5MB"
      });
      return;
    }
    
    setImageUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMorningWalkImage(event.target?.result as string);
        setImageUploading(false);
      };
      reader.readAsDataURL(file);
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Morning Strategy Session
          </DialogTitle>
          <DialogDescription>
            Take 5 minutes to set your intentions for the day
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 my-2">
          <div className="space-y-3">
            <label className="font-medium text-sm">Morning Walk Picture</label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center bg-muted/30">
              {morningWalkImage ? (
                <div className="relative">
                  <img 
                    src={morningWalkImage} 
                    alt="Morning walk" 
                    className="rounded-lg max-h-64 mx-auto"
                  />
                  <Button 
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                    onClick={() => setMorningWalkImage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="flex flex-col items-center justify-center cursor-pointer py-6"
                  onClick={handleFileUpload}
                >
                  {imageUploading ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3"></div>
                      <p className="text-sm font-medium">Uploading image...</p>
                    </div>
                  ) : (
                    <>
                      <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                        <Camera className="h-8 w-8 text-primary" />
                      </div>
                      <p className="font-medium">Upload your morning walk picture</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Take a photo during your morning walk to document your morning ritual
                      </p>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="mt-4"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </Button>
                    </>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>
            {!morningWalkImage && (
              <p className="text-sm text-red-500">* Required: Upload a picture from your morning walk</p>
            )}
          </div>
          
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
          <Button onClick={handleSubmit} disabled={!morningWalkImage}>
            <Check className="mr-2 h-4 w-4" />
            Complete Morning Strategy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MorningStrategyPopup;
