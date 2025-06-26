
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useWarriorProgress } from '@/hooks/useWarriorProgress';

const MorningPictureUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedToday, setUploadedToday] = useState(false);
  const [uploadTime, setUploadTime] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addReward } = useWarriorProgress();

  // Check if current time is within allowed window (6am - 9am)
  const isWithinTimeWindow = () => {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= 6 && currentHour < 9;
  };

  // Check if user already uploaded today
  const checkTodayUpload = () => {
    const today = new Date().toDateString();
    const storedUpload = localStorage.getItem('morningPictureUpload');
    
    if (storedUpload) {
      const uploadData = JSON.parse(storedUpload);
      return uploadData.date === today;
    }
    return false;
  };

  // Load upload status on mount
  React.useEffect(() => {
    const hasUploadedToday = checkTodayUpload();
    setUploadedToday(hasUploadedToday);
    
    if (hasUploadedToday) {
      const storedUpload = localStorage.getItem('morningPictureUpload');
      if (storedUpload) {
        const uploadData = JSON.parse(storedUpload);
        setUploadTime(uploadData.time);
      }
    }
  }, []);

  const getCurrentTimeFormatted = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const validateImageTimestamp = (file: File): boolean => {
    const fileDate = new Date(file.lastModified);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const fileDay = new Date(fileDate.getFullYear(), fileDate.getMonth(), fileDate.getDate());
    
    // Check if file was created today
    if (fileDay.getTime() !== today.getTime()) {
      toast.error('Picture must be taken today!', {
        description: 'Please take a fresh picture to verify your morning routine.'
      });
      return false;
    }

    // Check if file was created within reasonable time (not too old)
    const hoursDiff = (now.getTime() - fileDate.getTime()) / (1000 * 60 * 60);
    if (hoursDiff > 6) {
      toast.error('Picture seems too old!', {
        description: 'Please take a recent picture to verify your morning routine.'
      });
      return false;
    }

    return true;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check time window
    if (!isWithinTimeWindow()) {
      toast.error('Upload time window closed!', {
        description: 'Morning pictures can only be uploaded between 6:00 AM - 9:00 AM',
        duration: 4000
      });
      return;
    }

    // Check if already uploaded today
    if (uploadedToday) {
      toast.error('Already uploaded today!', {
        description: 'You can only upload one morning picture per day.',
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate image timestamp
    if (!validateImageTimestamp(file)) {
      return;
    }

    setIsUploading(true);

    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const now = new Date();
      const uploadData = {
        date: now.toDateString(),
        time: getCurrentTimeFormatted(),
        timestamp: now.toISOString(),
        filename: file.name
      };

      // Store upload data
      localStorage.setItem('morningPictureUpload', JSON.stringify(uploadData));
      
      setUploadedToday(true);
      setUploadTime(uploadData.time);

      // Award XP for completing morning routine verification
      await addReward(50, 20);

      toast.success('Morning routine verified! 🌅', {
        description: `Uploaded at ${uploadData.time} • +50 XP +20 coins`,
        duration: 5000
      });

    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed', {
        description: 'Please try again'
      });
    } finally {
      setIsUploading(false);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getTimeWindowStatus = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour < 6) {
      return {
        status: 'early',
        message: 'Upload window opens at 6:00 AM',
        color: 'text-yellow-600 dark:text-yellow-400'
      };
    } else if (currentHour >= 9) {
      return {
        status: 'late',
        message: 'Upload window closed at 9:00 AM',
        color: 'text-red-600 dark:text-red-400'
      };
    } else {
      return {
        status: 'open',
        message: `Upload window open until 9:00 AM`,
        color: 'text-green-600 dark:text-green-400'
      };
    }
  };

  const timeStatus = getTimeWindowStatus();

  return (
    <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-orange-400/20 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              <Camera className="h-6 w-6 text-orange-500" />
              Morning Routine Verification
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Upload a picture taken between 6:00 AM - 9:00 AM to verify your early morning routine
            </p>
          </div>
          {uploadedToday && (
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <CheckCircle className="h-4 w-4 mr-1" />
              Verified Today
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Time Window Status */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
          <Clock className="h-5 w-5 text-gray-500" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Upload Window Status
              </span>
              {timeStatus.status === 'open' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              )}
            </div>
            <p className={`text-sm ${timeStatus.color}`}>
              {timeStatus.message}
            </p>
          </div>
        </div>

        {/* Upload Status */}
        {uploadedToday ? (
          <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200/50 dark:border-green-800/50">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              <div>
                <h4 className="font-semibold text-green-900 dark:text-green-100">
                  Morning Routine Verified! 🌅
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Uploaded today at {uploadTime} • You earned +50 XP and +20 coins
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Upload Button */}
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading || uploadedToday || !isWithinTimeWindow()}
              />
              <Button
                className={`w-full gap-2 transition-all duration-200 ${
                  isWithinTimeWindow() && !uploadedToday
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:scale-105'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
                disabled={isUploading || uploadedToday || !isWithinTimeWindow()}
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    {uploadedToday ? 'Already Verified Today' : 'Upload Morning Picture'}
                  </>
                )}
              </Button>
            </div>

            {/* Instructions */}
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p>• Take a picture of yourself or your morning routine</p>
              <p>• Photo must be taken today between 6:00 AM - 9:00 AM</p>
              <p>• Earn +50 XP and +20 coins for verification</p>
              <p>• One upload per day allowed</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MorningPictureUpload;
