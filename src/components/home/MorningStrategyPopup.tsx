
import React, { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, CheckCircle, Save, Camera as CameraIcon, SunMedium, Brain, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Progress } from '@/components/ui/progress';

export interface MorningStrategyData {
  reflections: string;
  intentions: string;
  gratitude: string;
  photoProof?: string | null;
}

interface MorningStrategyPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: MorningStrategyData) => void;
}

const MorningStrategyPopup: React.FC<MorningStrategyPopupProps> = ({ 
  isOpen, 
  onClose, 
  onComplete 
}) => {
  const [step, setStep] = useState(1);
  const [morningData, setMorningData] = useState<MorningStrategyData>({
    reflections: '',
    intentions: '',
    gratitude: '',
    photoProof: null
  });
  const [photoTaken, setPhotoTaken] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [processingCompletion, setProcessingCompletion] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const totalSteps = 4;
  
  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };
  
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleInputChange = (field: keyof MorningStrategyData, value: string) => {
    setMorningData({
      ...morningData,
      [field]: value
    });
  };
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Could not access camera", {
        description: "Please check your camera permissions and try again."
      });
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };
  
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        const photoData = canvasRef.current.toDataURL('image/jpeg');
        setMorningData({
          ...morningData,
          photoProof: photoData
        });
        setPhotoTaken(true);
        stopCamera();
      }
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingPhoto(true);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setMorningData({
            ...morningData,
            photoProof: event.target.result as string
          });
          setPhotoTaken(true);
          setUploadingPhoto(false);
        }
      };
      
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const handleComplete = () => {
    setProcessingCompletion(true);
    
    // Simulate processing
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setProgressValue(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setProcessingCompletion(false);
          onComplete(morningData);
          onClose();
        }, 500);
      }
    }, 200);
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center mb-4 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <CameraIcon className="h-5 w-5 text-blue-500 mr-2" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Morning walks and fresh air help clear your mind for a productive day. Start with a photo of your walk.
              </div>
            </div>
            
            {!photoTaken ? (
              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline
                    className="w-full max-h-[300px] object-cover"
                  ></video>
                  <canvas ref={canvasRef} className="hidden"></canvas>
                </div>
                
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                  <Button 
                    onClick={startCamera} 
                    className="flex-1"
                    type="button"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Start Camera
                  </Button>
                  
                  <Button 
                    onClick={capturePhoto} 
                    className="flex-1"
                    type="button"
                    disabled={!videoRef.current?.srcObject}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Take Photo
                  </Button>
                  
                  <div className="relative flex-1">
                    <Button 
                      onClick={() => fileInputRef.current?.click()} 
                      className="w-full"
                      type="button"
                      disabled={uploadingPhoto}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Photo
                    </Button>
                    <input 
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploadingPhoto}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative">
                  <img 
                    src={morningData.photoProof || ''} 
                    alt="Morning walk" 
                    className="w-full max-h-[300px] object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="bg-white/80 hover:bg-white"
                      onClick={() => {
                        setPhotoTaken(false);
                        setMorningData({
                          ...morningData,
                          photoProof: null
                        });
                      }}
                    >
                      Retake
                    </Button>
                  </div>
                </div>
                <div className="text-center text-green-600 dark:text-green-400 font-medium flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Morning walk photo captured!
                </div>
              </div>
            )}
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center mb-4 bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <SunMedium className="h-5 w-5 text-green-500 mr-2" />
              <div className="text-sm text-green-700 dark:text-green-300">
                Reflect on your intention for the day. What do you want to accomplish?
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="intentions">Today's Intentions</Label>
              <Textarea
                id="intentions"
                placeholder="I will focus on completing..."
                value={morningData.intentions}
                onChange={(e) => handleInputChange('intentions', e.target.value)}
                className="min-h-[150px] resize-none"
              />
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center mb-4 bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
              <Brain className="h-5 w-5 text-purple-500 mr-2" />
              <div className="text-sm text-purple-700 dark:text-purple-300">
                Reflect on your mental state. How are you feeling? What are you grateful for?
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="reflections">Morning Reflections</Label>
              <Textarea
                id="reflections"
                placeholder="I'm feeling..."
                value={morningData.reflections}
                onChange={(e) => handleInputChange('reflections', e.target.value)}
                className="min-h-[150px] resize-none"
              />
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center mb-4 bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <SunMedium className="h-5 w-5 text-yellow-500 mr-2" />
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                Express gratitude for three things in your life right now.
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="gratitude">Gratitude</Label>
              <Textarea
                id="gratitude"
                placeholder="I am grateful for..."
                value={morningData.gratitude}
                onChange={(e) => handleInputChange('gratitude', e.target.value)}
                className="min-h-[150px] resize-none"
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Morning Strategy</DialogTitle>
          <DialogDescription>
            Complete your morning walk and reflection to deactivate the tick bomb.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4 flex justify-between">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div 
                key={index}
                className={`rounded-full w-2 h-2 ${
                  index + 1 === step 
                    ? 'bg-primary' 
                    : index + 1 < step 
                      ? 'bg-green-500' 
                      : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
          
          {renderStepContent()}
        </div>
        
        <DialogFooter className="flex items-center justify-between">
          {processingCompletion ? (
            <div className="w-full space-y-2">
              <div className="text-center text-sm text-muted-foreground">
                Processing your morning strategy...
              </div>
              <Progress 
                value={progressValue} 
                className="w-full"
              />
            </div>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={step === 1 ? onClose : prevStep}
                type="button"
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </Button>
              
              <Button 
                type="button"
                onClick={step === totalSteps ? handleComplete : nextStep}
                disabled={(step === 1 && !photoTaken) || 
                          (step === 2 && morningData.intentions.trim() === '') ||
                          (step === 3 && morningData.reflections.trim() === '') ||
                          (step === 4 && morningData.gratitude.trim() === '')}
              >
                {step === totalSteps ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Complete
                  </>
                ) : (
                  'Next'
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MorningStrategyPopup;
export type { MorningStrategyData };
