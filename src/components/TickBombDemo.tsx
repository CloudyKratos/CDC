
import React, { useContext, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import WorkInProgressBanner from "./WorkInProgressBanner";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/App";
import { toast } from "sonner";
import { Clock, AlertOctagon, RefreshCcw, Camera, Shield, Calendar, CheckCircle2 } from "lucide-react";
import AccountabilityTimeBomb from "./AccountabilityTimeBomb";

interface TickBombDemoProps {
  className?: string;
}

const TickBombDemo: React.FC<TickBombDemoProps> = ({ className }) => {
  const { user, logout } = useContext(AuthContext);
  const [showLegacyVersion, setShowLegacyVersion] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  
  const handleInactivityTimeout = () => {
    toast.error("Accountability warning!", {
      description: "Your morning strategy verification is overdue. Complete it to deactivate this timer.",
      duration: 5000,
      icon: <AlertOctagon className="h-5 w-5 text-red-600" />
    });
  };
  
  const simulateLogout = () => {
    toast.info("Simulating accountability action", {
      description: "In a production environment, this would trigger accountability measures"
    });
    setTimeout(() => {
      logout();
    }, 3000);
  };
  
  const handleTaskComplete = () => {
    toast.success("Task completed successfully!", {
      description: "Your morning accountability has been verified",
      duration: 5000,
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />
    });
  };
  
  const handleTimebombTimeout = () => {
    toast.error("Missed task deadline!", {
      description: "You've missed your accountability deadline",
      duration: 5000,
    });
  };
  
  return (
    <div className="space-y-6">
      <Card className={`shadow-md border-sky-100 dark:border-sky-800/50 ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Stoic Accountability System</CardTitle>
              <CardDescription>
                Enhanced time-based accountability system
              </CardDescription>
            </div>
            <div className="h-10 w-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
              <Shield className="h-6 w-6 text-sky-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* New Accountability Time Bomb */}
          <AccountabilityTimeBomb 
            title="Morning Strategy Verification"
            description="Your morning walk and reflection must be verified to maintain your accountability streak."
            duration={10} // 10 minutes for demonstration
            severity="medium"
            taskType="morning"
            onComplete={handleTaskComplete}
            onTimeout={handleTimebombTimeout}
          />
          
          {/* Toggles to show other versions */}
          <div className="pt-4 space-y-2">
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => setShowLegacyVersion(!showLegacyVersion)}
              >
                {showLegacyVersion ? "Hide Legacy Version" : "Show Legacy Version"}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => setShowVariants(!showVariants)}
              >
                {showVariants ? "Hide Variants" : "Show Variants"}
              </Button>
            </div>
          </div>
          
          {/* Legacy Version */}
          {showLegacyVersion && (
            <div className="mt-4 border-t pt-4 border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-medium mb-2">Legacy Version:</h3>
              <WorkInProgressBanner 
                variant="tick-bomb"
                title="Morning Strategy Verification Overdue"
                description="Your morning walk verification is required to maintain community accountability." 
                inactivityTimeout={120} // 2 minutes for demonstration
                onTimeout={handleInactivityTimeout}
              />
            </div>
          )}
          
          {/* Variants */}
          {showVariants && (
            <div className="mt-4 border-t pt-4 border-gray-200 dark:border-gray-800 space-y-4">
              <h3 className="text-sm font-medium mb-2">Different Severity Levels:</h3>
              
              <AccountabilityTimeBomb 
                title="Low Severity Example"
                description="This is a low severity reminder."
                duration={5}
                severity="low"
                taskType="meditation"
                dismissable={true}
              />
              
              <AccountabilityTimeBomb 
                title="High Severity Example"
                description="This requires immediate attention!"
                duration={3}
                severity="high"
                taskType="workout"
              />
              
              <AccountabilityTimeBomb 
                title="Critical Severity Example"
                description="Critical accountability breach imminent!"
                duration={1}
                severity="critical"
                taskType="evening"
              />
            </div>
          )}
          
          <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-4 text-sm">
            <h3 className="font-medium text-gray-900 dark:text-gray-200 mb-2">Stoic Accountability System:</h3>
            <ol className="list-decimal ml-5 space-y-1 text-gray-600 dark:text-gray-400">
              <li>The 6AM morning walk verification is a core Stoic community commitment</li>
              <li>Missing verifications activate the accountability system for 48 hours</li>
              <li>The system displays increasingly urgent reminders</li>
              <li>Complete a new morning strategy with photo verification to deactivate</li>
            </ol>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4 dark:border-gray-800">
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="bg-white dark:bg-gray-800"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Reset Timer
          </Button>
          <Button 
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            onClick={() => {
              document.getElementById('morning-strategy-button')?.click();
              toast.success("Good choice!", {
                description: "Complete your morning walk verification to deactivate the timer"
              });
            }}
          >
            <Camera className="h-4 w-4 mr-2" />
            Upload Morning Walk
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TickBombDemo;
