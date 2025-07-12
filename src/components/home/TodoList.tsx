import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  X, 
  MoreHorizontal, 
  CalendarClock,
  Users,
  Tag,
  Sparkles
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
import { useAuth } from "@/contexts/auth/AuthContext";

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
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading user's actual tasks from database
  useEffect(() => {
    const loadUserTasks = async () => {
      if (user) {
        setIsLoading(true);
        // In a real implementation, this would fetch from your database
        // const userTasks = await fetchTasksFromDB(user.id);
        // setTasks(userTasks);
        
        // For now, set empty array for new users
        setTasks([]);
      }
      setIsLoading(false);
    };

    loadUserTasks();
  }, [user]);

  const toggleTaskCompletion = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
    // TODO: Update in database
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
      // TODO: Save to database
    }
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    // TODO: Delete from database
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

  if (isLoading) {
    return (
      <Card className={cn(
        "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
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
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tasks yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Add your first task to get started on your journey
            </p>
          </div>
        ) : (
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
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex w-full space-x-2">
          <Input
            placeholder="Add your first task..."
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
