
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Calendar, Users, MessageSquare, BookOpen, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";

interface QuickActionsPanelProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const QuickActionsPanel = ({ isCollapsed, onToggle }: QuickActionsPanelProps) => {
  const quickActions = [
    { icon: Calendar, label: "Calendar", path: "/dashboard?tab=calendar", color: "purple" },
    { icon: Users, label: "Community", path: "/dashboard?tab=community", color: "blue" },
    { icon: MessageSquare, label: "Command Room", path: "/dashboard?tab=command-room", color: "green" },
    { icon: BookOpen, label: "Learning", path: "/dashboard?tab=command-room", color: "orange" }
  ];

  return (
    <Card className="bg-black/40 border-purple-800/30 text-white backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Quick Actions
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-6 w-6 text-purple-300 hover:text-white"
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="space-y-3">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.path}>
              <Button className={`w-full justify-start bg-${action.color}-600/20 hover:bg-${action.color}-600/30 text-white border-${action.color}-600/30 transition-all duration-200 hover:scale-105`}>
                <action.icon className="h-4 w-4 mr-2" />
                {action.label}
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
            </Link>
          ))}
        </CardContent>
      )}
    </Card>
  );
};

export default QuickActionsPanel;
