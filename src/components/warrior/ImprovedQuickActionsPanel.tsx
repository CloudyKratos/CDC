
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Calendar, Users, Map, BookOpen, ChevronRight, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

interface ImprovedQuickActionsPanelProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const ImprovedQuickActionsPanel = ({ isCollapsed, onToggle }: ImprovedQuickActionsPanelProps) => {
  const quickActions = [
    { 
      icon: Calendar, 
      label: "Calendar", 
      path: "/dashboard?tab=calendar", 
      color: "purple",
      description: "View events & schedule",
      badge: "2 today"
    },
    { 
      icon: Users, 
      label: "Community", 
      path: "/dashboard?tab=community", 
      color: "blue",
      description: "Join discussions",
      badge: "5 online"
    },
    { 
      icon: Map, 
      label: "World Map", 
      path: "/dashboard?tab=worldmap", 
      color: "green",
      description: "Explore locations",
      badge: "New"
    },
    { 
      icon: BookOpen, 
      label: "Learning Hub", 
      path: "/dashboard?tab=command-room", 
      color: "orange",
      description: "Access resources",
      badge: "Updated"
    }
  ];

  return (
    <Card className="bg-black/40 border-purple-800/30 text-white backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
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
            <Link key={index} to={action.path} className="block">
              <Button 
                variant="ghost"
                className={`w-full justify-start p-4 h-auto bg-${action.color}-600/10 hover:bg-${action.color}-600/20 text-white border border-${action.color}-600/20 hover:border-${action.color}-600/40 transition-all duration-200 hover:scale-[1.02] group`}
              >
                <div className="flex items-start gap-3 w-full">
                  <action.icon className="h-5 w-5 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{action.label}</span>
                      <div className="flex items-center gap-2">
                        {action.badge && (
                          <Badge variant="secondary" className={`text-xs bg-${action.color}-500/20 text-${action.color}-300 border-${action.color}-500/30`}>
                            {action.badge}
                          </Badge>
                        )}
                        <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{action.description}</p>
                  </div>
                </div>
              </Button>
            </Link>
          ))}
          
          {/* External Link to Main Dashboard */}
          <div className="pt-2 border-t border-purple-800/30">
            <Link to="/dashboard" className="block">
              <Button 
                variant="ghost"
                className="w-full justify-start p-3 h-auto bg-gray-600/10 hover:bg-gray-600/20 text-white border border-gray-600/20 hover:border-gray-600/40 transition-all duration-200 hover:scale-[1.02] group"
              >
                <div className="flex items-center gap-3 w-full">
                  <ExternalLink className="h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">Main Dashboard</span>
                  <ChevronRight className="h-4 w-4 ml-auto opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ImprovedQuickActionsPanel;
