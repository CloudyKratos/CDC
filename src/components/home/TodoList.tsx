
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Edit, 
  AlertCircle, 
  CheckCircle2,
  Circle,
  ArrowUp,
  ArrowRight,
  ArrowDown
} from "lucide-react";
import { TodoItem } from "@/types/journal";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TodoListProps {
  className?: string;
}

const TodoList: React.FC<TodoListProps> = ({ className }) => {
  const [todos, setTodos] = useState<TodoItem[]>([
    {
      id: "1",
      text: "Complete daily journal entry",
      completed: false,
      priority: "high",
      category: "personal"
    },
    {
      id: "2",
      text: "Join community round table discussion",
      completed: false,
      priority: "medium",
      dueDate: "2023-05-12",
      category: "community"
    },
    {
      id: "3",
      text: "Review business plan document",
      completed: true,
      priority: "low",
      category: "work"
    }
  ]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const { toast } = useToast();

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <ArrowUp size={14} className="text-red-500" />;
      case "medium":
        return <ArrowRight size={14} className="text-amber-500" />;
      case "low":
        return <ArrowDown size={14} className="text-green-500" />;
      default:
        return null;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "personal":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800/30";
      case "work":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/30";
      case "community":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/30";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800/30";
    }
  };

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    
    const newItem: TodoItem = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false,
      priority: "medium",
    };
    
    setTodos([newItem, ...todos]);
    setNewTodo("");
    
    toast({
      title: "Task Added",
      description: "New task has been added to your list."
    });
  };

  const handleToggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
    
    toast({
      title: "Task Deleted",
      description: "The task has been removed from your list."
    });
  };

  const startEdit = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (!editText.trim()) return;
    
    setTodos(todos.map(todo => 
      todo.id === editingId ? { ...todo, text: editText } : todo
    ));
    
    setEditingId(null);
    setEditText("");
    
    toast({
      title: "Task Updated",
      description: "Your changes have been saved."
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const changePriority = (id: string, priority: 'high' | 'medium' | 'low') => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, priority } : todo
    ));
  };

  return (
    <Card className={`shadow-md ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckSquare size={18} className="mr-2 text-primary" />
          To-Do List
        </CardTitle>
        <CardDescription>
          Track your tasks and stay productive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new todo */}
        <div className="flex items-center space-x-2">
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
          />
          <Button onClick={handleAddTodo} size="icon">
            <Plus size={16} />
          </Button>
        </div>
        
        {/* Todo list */}
        <div className="space-y-2">
          {todos.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No tasks yet. Add some to get started!
            </div>
          ) : (
            todos.map(todo => (
              <div 
                key={todo.id} 
                className={cn(
                  "flex items-center p-3 rounded-lg border border-border/50",
                  todo.completed ? "bg-secondary/30 text-muted-foreground" : "bg-card/50 hover:bg-card/80"
                )}
              >
                {editingId === todo.id ? (
                  <div className="flex-1 flex items-center space-x-2">
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button size="sm" onClick={saveEdit}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={cancelEdit}>Cancel</Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center mr-2">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => handleToggleTodo(todo.id)}
                        className="mr-2"
                      />
                      <div className="mr-2">{getPriorityIcon(todo.priority)}</div>
                    </div>
                    <div className="flex-1">
                      <p className={cn(
                        "text-sm", 
                        todo.completed && "line-through"
                      )}>
                        {todo.text}
                      </p>
                      <div className="flex items-center mt-1">
                        {todo.category && (
                          <Badge variant="outline" className={`mr-2 text-xs ${getCategoryColor(todo.category)}`}>
                            {todo.category}
                          </Badge>
                        )}
                        {todo.dueDate && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <CalendarIcon size={12} className="mr-1" />
                            {new Date(todo.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowUp size={14} className={todo.priority === 'high' ? 'text-red-500' : 'text-muted-foreground'} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => changePriority(todo.id, 'high')}>
                            <ArrowUp size={14} className="mr-2 text-red-500" />
                            <span>High Priority</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => changePriority(todo.id, 'medium')}>
                            <ArrowRight size={14} className="mr-2 text-amber-500" />
                            <span>Medium Priority</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => changePriority(todo.id, 'low')}>
                            <ArrowDown size={14} className="mr-2 text-green-500" />
                            <span>Low Priority</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => startEdit(todo)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteTodo(todo.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <div className="flex items-center">
          <CheckCircle2 size={14} className="mr-1 text-green-500" />
          {todos.filter(t => t.completed).length} completed
        </div>
        <div className="flex items-center">
          <Circle size={14} className="mr-1 text-blue-500" />
          {todos.filter(t => !t.completed).length} remaining
        </div>
        {todos.some(t => t.priority === 'high' && !t.completed) && (
          <div className="flex items-center">
            <AlertCircle size={14} className="mr-1 text-red-500" />
            {todos.filter(t => t.priority === 'high' && !t.completed).length} high priority
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default TodoList;
