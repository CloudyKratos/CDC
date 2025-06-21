
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Calendar, Users, Map, BookOpen, ChevronRight, ChevronDown, ChevronUp, ExternalLink, Home, Sparkles } from "lucide-react";

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
      gradient: "from-purple-600 to-purple-700",
      description: "View events & schedule",
      badge: "2 today",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30"
    },
    { 
      icon: Users, 
      label: "Community", 
      path: "/dashboard?tab=community", 
      color: "blue",
      gradient: "from-blue-600 to-blue-700",
      description: "Join discussions",
      badge: "5 online",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30"
    },
    { 
      icon: Map, 
      label: "World Map", 
      path: "/dashboard?tab=worldmap", 
      color: "green",
      gradient: "from-green-600 to-green-700",
      description: "Explore locations",
      badge: "New",
      badgeColor: "bg-green-500/20 text-green-300 border-green-500/30"
    },
    { 
      icon: BookOpen, 
      label: "Learning Hub", 
      path: "/dashboard?tab=command-room", 
      color: "orange",
      gradient: "from-orange-600 to-orange-700",
      description: "Access resources",
      badge: "Updated",
      badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30"
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-blue-900/50 border-blue-500/30 text-white backdrop-blur-lg shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 rounded-2xl overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-1/4 w-28 h-28 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Quick Actions
            </span>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 text-blue-300 hover:text-white hover:bg-blue-600/20 transition-all duration-200 rounded-lg"
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="space-y-3 relative z-10">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.path} className="block">
              <Button 
                variant="ghost"
                className={`w-full justify-start p-5 h-auto bg-gradient-to-r ${action.gradient}/10 hover:${action.gradient}/20 text-white border border-${action.color}-600/20 hover:border-${action.color}-500/40 transition-all duration-300 hover:scale-[1.02] group rounded-xl relative overflow-hidden`}
              >
                {/* Hover glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="flex items-start gap-4 w-full relative z-10">
                  <div className={`p-2 bg-gradient-to-r ${action.gradient} rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-lg">{action.label}</span>
                      <div className="flex items-center gap-2">
                        {action.badge && (
                          <Badge variant="secondary" className={`text-xs ${action.badgeColor} border`}>
                            {action.badge}
                          </Badge>
                        )}
                        <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-200">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Button>
            </Link>
          ))}
          
          {/* Divider */}
          <div className="flex items-center gap-4 py-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
            <Sparkles className="h-4 w-4 text-gray-400" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
          </div>
          
          {/* Main Dashboard Link */}
          <Link to="/dashboard" className="block">
            <Button 
              variant="ghost"
              className="w-full justify-start p-5 h-auto bg-gradient-to-r from-gray-700/20 to-gray-800/20 hover:from-gray-600/30 hover:to-gray-700/30 text-white border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 hover:scale-[1.02] group rounded-xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-600/5 to-gray-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="flex items-center gap-4 w-full relative z-10">
                <div className="p-2 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <Home className="h-5 w-5 text-white" />
                </div>
                
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">Main Dashboard</span>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity duration-200" />
                      <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-200">
                    Return to main hub
                  </p>
                </div>
              </div>
            </Button>
          </Link>
        </CardContent>
      )}
    </Card>
  );
};

export default ImprovedQuickActionsPanel;
