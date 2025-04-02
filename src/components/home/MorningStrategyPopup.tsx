
import React, { useState, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Sun, 
  Target, 
  Shield,
  ArrowRight, 
  CheckCircle2,
  Calendar,
  ListTodo,
  Camera,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface MorningStrategyPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: MorningStrategyData) => void;
}

export interface MorningStrategyData {
  intentions: string;
  priorities: string[];
  challenges: string;
  walkImage: string | null;
  completedAt: Date;
}

const MorningStrategyPopup: React.FC<MorningStrategyPopupProps> = ({ 
  isOpen, 
  onClose,
  onComplete
}) => {
  const [step, setStep] = useState(0);
  const [intentions, setIntentions] = useState("");
  const [priorities, setPriorities] = useState<string[]>(["", "", ""]);
  const [challenges, setChallenges] = useState("");
  const [walkImage, setWalkImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast: uiToast } = useToast();

  const steps = [
    {
      title: "Set Your Intentions",
      description: "What energy do you want to bring into today?",
      icon: Sun,
      color: "text-amber-500"
    },
    {
      title: "Define 3 Key Priorities",
      description: "What are the most important tasks for today?",
      icon: Target,
      color: "text-blue-500"
    },
    {
      title: "Anticipate Challenges",
      description: "What obstacles might you face, and how will you overcome them?",
      icon: Shield,
      color: "text-purple-500"
    },
    {
      title: "Upload Morning Walk",
      description: "Verify you're following the community 6AM morning walk strategy",
      icon: Camera,
      color: "text-green-500"
    }
  ];
  
  const handleComplete = () => {
    // Save the morning strategy data
    const morningData: MorningStrategyData = {
      intentions,
      priorities,
      challenges,
      walkImage,
      completedAt: new Date()
    };
    
    // Notify the parent component
    if (onComplete) {
      onComplete(morningData);
    }
    
    toast({
      title: "Morning Strategy Completed",
      description: "Your morning plan has been saved. Have a productive day!",
    });
    
    // Store completion time in localStorage
    localStorage.setItem('lastMorningStrategyCompleted', new Date().toISOString());
    
    onClose();
    // Reset for next time
    setStep(0);
  };
  
  const updatePriority = (index: number, value: string) => {
    const newPriorities = [...priorities];
    newPriorities[index] = value;
    setPriorities(newPriorities);
  };
  
  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };
  
  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string;
      setWalkImage(imageDataUrl);
      toast.success("Morning walk image uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4 py-4">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                <Sun size={40} className="text-amber-500" />
              </div>
            </div>
            <Textarea
              value={intentions}
              onChange={(e) => setIntentions(e.target.value)}
              placeholder="Today, my intention is to be focused, creative, and present in all my interactions..."
              className="min-h-[150px] text-base"
            />
            <div className="text-sm text-muted-foreground mt-2">
              <p>Think about:</p>
              <ul className="list-disc pl-5 space-y-1 mt-1">
                <li>How do you want to feel today?</li>
                <li>What mindset will serve you best?</li>
                <li>What values do you want to embody?</li>
              </ul>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4 py-4">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Target size={40} className="text-blue-500" />
              </div>
            </div>
            <div className="space-y-4">
              {priorities.map((priority, index) => (
                <div key={index} className="flex items-center">
                  <div className="mr-3 font-bold text-primary">{index + 1}</div>
                  <Input
                    value={priority}
                    onChange={(e) => updatePriority(index, e.target.value)}
                    placeholder={`Priority #${index + 1}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              <p>Remember:</p>
              <ul className="list-disc pl-5 space-y-1 mt-1">
                <li>Focus on what will move the needle the most</li>
                <li>Be specific and actionable</li>
                <li>Prioritize based on importance, not urgency</li>
              </ul>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 py-4">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Shield size={40} className="text-purple-500" />
              </div>
            </div>
            <Textarea
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="Today's potential challenges might be distractions from social media, the difficult conversation with my team, and managing my energy after lunch..."
              className="min-h-[150px] text-base"
            />
            <div className="text-sm text-muted-foreground mt-2">
              <p>Consider:</p>
              <ul className="list-disc pl-5 space-y-1 mt-1">
                <li>What obstacles typically derail your productivity?</li>
                <li>How will you respond when faced with these challenges?</li>
                <li>What resources or support might you need?</li>
              </ul>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 py-4">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Camera size={40} className="text-green-500" />
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              {walkImage ? (
                <div className="relative w-full max-w-md aspect-video border rounded-lg overflow-hidden">
                  <img 
                    src={walkImage} 
                    alt="Morning walk verification" 
                    className="object-cover w-full h-full"
                  />
                  <Button 
                    variant="outline"
                    size="sm" 
                    className="absolute top-2 right-2"
                    onClick={() => setWalkImage(null)}
                  >
                    Change Photo
                  </Button>
                </div>
              ) : (
                <>
                  <div 
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg w-full max-w-md aspect-video flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    onClick={triggerFileInput}
                  >
                    <ImageIcon className="h-16 w-16 text-gray-400" />
                    <p className="text-muted-foreground">Click to upload your morning walk photo</p>
                    <p className="text-xs text-muted-foreground">6AM morning walk verification</p>
                  </div>
                  <Button variant="outline" onClick={triggerFileInput}>
                    <Upload className="h-4 w-4 mr-2" />
                    Select Image
                  </Button>
                </>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            
            <div className="text-sm text-muted-foreground mt-4">
              <p className="font-medium mb-1">Community Morning Walk Policy:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Take a photo during your 6AM morning walk</li>
                <li>Photo should show the morning environment (sunrise, morning sky, etc.)</li>
                <li>Regular verification helps build consistency in the community</li>
                <li>Missing verifications will activate accountability features</li>
              </ul>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Morning Strategy</DialogTitle>
          <DialogDescription className="text-center">
            Set yourself up for success with our 4-step morning planning routine
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={`${step}`} onValueChange={(value) => setStep(parseInt(value))}>
          <TabsList className="grid grid-cols-4 mb-4">
            {steps.map((s, i) => (
              <TabsTrigger key={i} value={`${i}`} className="flex flex-col py-2 space-y-1">
                <s.icon size={16} className={s.color} />
                <span className="text-xs">{s.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {steps.map((s, i) => (
            <TabsContent key={i} value={`${i}`} className="pt-2">
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="text-muted-foreground mb-4">{s.description}</p>
              {step === i && renderStepContent()}
            </TabsContent>
          ))}
        </Tabs>
        
        <DialogFooter className="flex justify-between items-center mt-4">
          <div className="flex-1">
            {step > 0 && (
              <Button variant="ghost" onClick={prevStep}>
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            Step {step + 1} of {steps.length}
          </div>
          <div className="flex-1 flex justify-end">
            <Button onClick={nextStep} disabled={step === 3 && !walkImage}>
              {step < steps.length - 1 ? (
                <>
                  Next <ArrowRight size={16} className="ml-2" />
                </>
              ) : (
                <>
                  Complete <CheckCircle2 size={16} className="ml-2" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
        
        <div className="flex justify-center gap-4 mt-4 border-t pt-4">
          <Button variant="outline" size="sm" className="text-xs" onClick={onClose}>
            <Calendar size={14} className="mr-1" />
            Do Later
          </Button>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => {
            onClose();
            toast({
              title: "Strategy Skipped",
              description: "You can access this anytime from your dashboard.",
            });
          }}>
            <ListTodo size={14} className="mr-1" />
            Skip Today
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MorningStrategyPopup;
