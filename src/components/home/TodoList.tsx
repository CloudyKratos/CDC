import React, { useState } from "react";
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  X, 
  MoreHorizontal, 
  CalendarClock,
  Users,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface TodoListProps {
  fullWidth?: boolean;
  className?: string;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  label?: string;
}

const TodoList: React.FC<TodoListProps> = ({ fullWidth = false, className }) => {
  const [tasks, setTasks] = useState<Task[]>([
    { 
      id: '1', 
      text: 'Review quarterly business strategy', 
      completed: false,
      priority: 'high',
      label: 'Strategy'
    },
    { 
      id: '2', 
      text: 'Prepare for investor meeting', 
      completed: false,
      priority: 'high',
      label: 'Finance'
    },
    { 
      id: '3', 
      text: 'Update marketing campaign assets', 
      completed: true,
      priority: 'medium',
      label: 'Marketing'
    },
    { 
      id: '4', 
      text: 'Review new feature requests', 
      completed: false,
      priority: 'medium',
      label: 'Product'
    },
    { 
      id: '5', 
      text: 'Schedule team building event', 
      completed: false,
      priority: 'low',
      label: 'HR'
    }
  ]);
  
  const [newTask, setNewTask] = useState("");

  const toggleTaskCompletion = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const addTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        text: newTask.trim(),
        completed: false,
        priority: 'medium'
      };
      setTasks([...tasks, task]);
      setNewTask("");
    }
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTask();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 dark:text-red-400';
      case 'medium':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'low':
        return 'text-green-500 dark:text-green-400';
      default:
        return 'text-blue-500 dark:text-blue-400';
    }
  };

  const getLabelColor = (label: string) => {
    switch (label) {
      case 'Strategy':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Finance':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Marketing':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
      case 'Product':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'HR':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Card className={cn(
      "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow",
      fullWidth ? "w-full" : "",
      className
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-2 text-primary" />
          Daily Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          {tasks.map(task => (
            <div 
              key={task.id}
              className={cn(
                "flex items-start justify-between p-3 rounded-lg transition-colors",
                task.completed 
                  ? "bg-gray-50 dark:bg-gray-900/30" 
                  : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30"
              )}
            >
              <div className="flex items-start space-x-3 flex-1">
                <button
                  onClick={() => toggleTaskCompletion(task.id)}
                  className="flex-shrink-0 mt-0.5"
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400" />
                  )}
                </button>
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-medium",
                    task.completed && "line-through text-gray-500 dark:text-gray-400"
                  )}>
                    {task.text}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {task.label && (
                      <Badge variant="outline" className={cn("text-xs font-normal px-2 py-0.5", getLabelColor(task.label))}>
                        <Tag className="mr-1 h-3 w-3" />
                        {task.label}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 ml-2">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  task.priority === 'high' ? "bg-red-500" :
                  task.priority === 'medium' ? "bg-yellow-500" : "bg-green-500"
                )} />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => toggleTaskCompletion(task.id)}>
                      {task.completed ? "Mark as incomplete" : "Mark as complete"}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CalendarClock className="mr-2 h-4 w-4" />
                      Set deadline
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" />
                      Assign to team
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-red-600">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex w-full space-x-2">
          <Input
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={addTask} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TodoList;
