
import React, { useContext } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import WorkInProgressBanner from "./WorkInProgressBanner";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/App";
import { toast } from "sonner";
import { Clock, AlertOctagon, RefreshCcw, Camera } from "lucide-react";

interface TickBombDemoProps {
  className?: string;
}

const TickBombDemo: React.FC<TickBombDemoProps> = ({ className }) => {
  const { user, logout } = useContext(AuthContext);
  
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
  
  return (
    <Card className={`shadow-md border-red-200 dark:border-red-800 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Community Accountability System</CardTitle>
            <CardDescription>
              Morning Strategy verification required
            </CardDescription>
          </div>
          <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Clock className="h-6 w-6 text-red-500" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <WorkInProgressBanner 
          variant="tick-bomb"
          title="Morning Strategy Verification Overdue"
          description="Your morning walk verification is required to maintain community accountability." 
          inactivityTimeout={120} // 2 minutes for demonstration
          onTimeout={handleInactivityTimeout}
        />
        
        <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-4 text-sm">
          <h3 className="font-medium text-gray-900 dark:text-gray-200 mb-2">Community Accountability System:</h3>
          <ol className="list-decimal ml-5 space-y-1 text-gray-600 dark:text-gray-400">
            <li>The 6AM morning walk verification is a core community commitment</li>
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
  );
};

export default TickBombDemo;
