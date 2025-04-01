
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle } from "lucide-react";

interface TaskProgressCardProps {
  title: string;
  tasks: {
    id: string;
    name: string;
    completed: boolean;
  }[];
}

const TaskProgressCard: React.FC<TaskProgressCardProps> = ({ title, tasks }) => {
  const completedCount = tasks.filter(task => task.completed).length;
  const progressPercentage = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <Card className="shadow-sm bg-gradient-to-br from-card to-secondary/20 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{completedCount} of {tasks.length}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="space-y-2 mt-4">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center text-sm">
                {task.completed ? (
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 mr-2 text-muted-foreground" />
                )}
                <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                  {task.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskProgressCard;
