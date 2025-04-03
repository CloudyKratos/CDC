
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrainCircuit, Sunrise, SunMedium, Waves, MoonStar } from "lucide-react";
import AccountabilityTimeBomb from "./AccountabilityTimeBomb";
import { TaskType } from "@/types/workspace";

interface TickBombDemoProps {
  className?: string;
}

const TickBombDemo: React.FC<TickBombDemoProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<string>("morning");
  
  // Define different bomb types
  const timeBombs = [
    {
      id: "morning",
      title: "Morning Strategy & Journal",
      description: "Start your day with intention and reflection",
      duration: 15,
      severity: "medium" as const,
      taskType: "morning" as TaskType,
      icon: <Sunrise className="h-4 w-4" />
    },
    {
      id: "meditation",
      title: "Midday Meditation",
      description: "Take a break to reset and refocus",
      duration: 10,
      severity: "low" as const,
      taskType: "meditation" as TaskType,
      icon: <BrainCircuit className="h-4 w-4" />
    },
    {
      id: "workout",
      title: "Physical Activity",
      description: "Move your body to boost energy and clarity",
      duration: 30,
      severity: "high" as const,
      taskType: "workout" as TaskType,
      icon: <Waves className="h-4 w-4" />
    },
    {
      id: "evening",
      title: "Evening Reflection",
      description: "Review your day and plan for tomorrow",
      duration: 15,
      severity: "medium" as const,
      taskType: "evening" as TaskType,
      icon: <MoonStar className="h-4 w-4" />
    }
  ];
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <SunMedium className="h-5 w-5 mr-2 text-amber-500" />
          Accountability Time Bombs
        </CardTitle>
        <CardDescription>
          These timed activities keep you accountable to your daily habits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="morning" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            {timeBombs.map(bomb => (
              <TabsTrigger 
                key={bomb.id} 
                value={bomb.id}
                className="flex items-center justify-center"
              >
                {bomb.icon}
                <span className="ml-2 hidden sm:inline">{bomb.id.charAt(0).toUpperCase() + bomb.id.slice(1)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {timeBombs.map(bomb => (
            <TabsContent key={bomb.id} value={bomb.id} className="mt-0">
              <AccountabilityTimeBomb 
                title={bomb.title}
                description={bomb.description}
                duration={bomb.duration}
                severity={bomb.severity}
                taskType={bomb.taskType}
                onComplete={() => console.log(`${bomb.id} completed`)}
                onTimeout={() => console.log(`${bomb.id} timed out`)}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TickBombDemo;
