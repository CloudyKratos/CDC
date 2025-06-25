
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sun, 
  CheckCircle, 
  Clock, 
  Target, 
  Flame, 
  ArrowRight,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useWarriorProgress } from '@/hooks/useWarriorProgress';
import { toast } from 'sonner';

const EnhancedCDCMorningStrategyCard: React.FC = () => {
  const { addReward, progress } = useWarriorProgress();
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);

  const morningSteps = [
    {
      title: "Mindful Awakening",
      description: "Take 3 deep breaths and set your intention",
      duration: 2,
      xp: 10,
      icon: Sun
    },
    {
      title: "Goal Visualization",
      description: "Visualize your top 3 goals for today",
      duration: 3,
      xp: 15,
      icon: Target
    },
    {
      title: "Energy Activation",
      description: "Light movement or stretching routine",
      duration: 5,
      xp: 20,
      icon: Flame
    },
    {
      title: "Priority Setting",
      description: "Identify your most important task",
      duration: 2,
      xp: 15,
      icon: CheckCircle
    }
  ];

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            handleStepComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  const startStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setTimeRemaining(morningSteps[stepIndex].duration * 60);
    setIsActive(true);
  };

  const pauseStep = () => {
    setIsActive(false);
  };

  const resumeStep = () => {
    setIsActive(true);
  };

  const handleStepComplete = async () => {
    const step = morningSteps[currentStep];
    setIsActive(false);
    
    const newCompleted = [...completedSteps];
    newCompleted[currentStep] = true;
    setCompletedSteps(newCompleted);

    await addReward(step.xp, 5);
    
    toast.success(`🎉 ${step.title} completed! +${step.xp} XP`, {
      description: "Great job staying consistent with your morning routine!"
    });

    // Auto-advance to next step if available
    if (currentStep < morningSteps.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 1000);
    }
  };

  const resetRoutine = () => {
    setCurrentStep(0);
    setIsActive(false);
    setTimeRemaining(0);
    setCompletedSteps([]);
  };

  const totalCompleted = completedSteps.filter(Boolean).length;
  const overallProgress = (totalCompleted / morningSteps.length) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-sm">
              <Sun className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-gray-900">Morning Strategy</span>
              <div className="text-sm text-orange-600 font-normal">
                Start your day with intention
              </div>
            </div>
          </CardTitle>
          <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
            {totalCompleted}/{morningSteps.length} Complete
          </Badge>
        </div>
        
        {/* Overall Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Daily Progress</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2 bg-orange-100" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Step Display */}
        {isActive && (
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  {React.createElement(morningSteps[currentStep].icon, {
                    className: "h-5 w-5 text-orange-600"
                  })}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {morningSteps[currentStep].title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {morningSteps[currentStep].description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-xs text-gray-500">remaining</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {isActive ? (
                <Button onClick={pauseStep} variant="outline" size="sm">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button onClick={resumeStep} size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              )}
              <Button onClick={handleStepComplete} variant="outline" size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete
              </Button>
            </div>
          </div>
        )}

        {/* Steps List */}
        <div className="space-y-3">
          {morningSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = completedSteps[index];
            const isCurrent = index === currentStep;
            
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  isCompleted
                    ? 'bg-green-50 border-green-200'
                    : isCurrent && isActive
                    ? 'bg-orange-100 border-orange-300'
                    : 'bg-white border-gray-200 hover:border-orange-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isCompleted 
                      ? 'bg-green-100' 
                      : isCurrent && isActive 
                      ? 'bg-orange-200' 
                      : 'bg-gray-100'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <StepIcon className={`h-4 w-4 ${
                        isCurrent && isActive ? 'text-orange-600' : 'text-gray-500'
                      }`} />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{step.title}</div>
                    <div className="text-sm text-gray-600">{step.description}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      +{step.xp} XP
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {step.duration}m
                    </div>
                  </div>
                  
                  {!isCompleted && (!isActive || index !== currentStep) && (
                    <Button
                      onClick={() => startStep(index)}
                      size="sm"
                      variant="outline"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {totalCompleted === morningSteps.length ? (
            <Button onClick={resetRoutine} className="flex-1" variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset for Tomorrow
            </Button>
          ) : (
            <Button 
              onClick={() => !isActive && startStep(totalCompleted)} 
              className="flex-1 bg-orange-500 hover:bg-orange-600"
              disabled={isActive}
            >
              {isActive ? (
                <>In Progress...</>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  {totalCompleted === 0 ? 'Start Morning Routine' : 'Continue Routine'}
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedCDCMorningStrategyCard;
