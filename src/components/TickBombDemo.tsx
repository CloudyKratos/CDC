
import React, { useContext } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import WorkInProgressBanner from "./WorkInProgressBanner";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/App";
import { toast } from "sonner";
import { Clock, AlertOctagon, RefreshCcw } from "lucide-react";

const TickBombDemo: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  
  const handleInactivityTimeout = () => {
    toast.error("Session timeout warning!", {
      description: "You would be logged out due to inactivity in a real scenario",
      duration: 5000,
      icon: <AlertOctagon className="h-5 w-5 text-red-600" />
    });
  };
  
  const simulateLogout = () => {
    toast.info("Simulating forced logout", {
      description: "In a production environment, this would log you out immediately"
    });
    setTimeout(() => {
      logout();
    }, 3000);
  };
  
  return (
    <Card className="shadow-md border-gray-200 dark:border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Activity Monitoring System</CardTitle>
            <CardDescription>
              Security feature to enforce activity policies
            </CardDescription>
          </div>
          <Clock className="h-6 w-6 text-gray-500 dark:text-gray-400" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <WorkInProgressBanner 
          variant="tick-bomb"
          title="Inactivity Warning"
          description="Your session will expire due to inactivity." 
          inactivityTimeout={30} // 30 seconds for demonstration
          onTimeout={handleInactivityTimeout}
        />
        
        <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-4 text-sm">
          <h3 className="font-medium text-gray-900 dark:text-gray-200 mb-2">How the Tick Bomb works:</h3>
          <ol className="list-decimal ml-5 space-y-1 text-gray-600 dark:text-gray-400">
            <li>The system monitors user activity (mouse movements, clicks, keystrokes)</li>
            <li>After a period of inactivity, the timer starts counting down</li>
            <li>As time runs out, visual warnings increase in urgency</li>
            <li>If no activity is detected before timeout, user session is terminated</li>
          </ol>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4 dark:border-gray-800">
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Reset Timer
        </Button>
        <Button variant="destructive" onClick={simulateLogout}>
          Simulate Force Logout
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TickBombDemo;
