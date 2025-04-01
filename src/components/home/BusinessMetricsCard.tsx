
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, DollarSign, Users, BarChart, Activity } from "lucide-react";

interface BusinessMetricsCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: "dollar" | "users" | "chart" | "activity";
  description: string;
}

const BusinessMetricsCard: React.FC<BusinessMetricsCardProps> = ({
  title,
  value,
  change,
  trend,
  icon,
  description
}) => {
  const renderIcon = () => {
    switch (icon) {
      case "dollar":
        return <DollarSign className="h-4 w-4" />;
      case "users":
        return <Users className="h-4 w-4" />;
      case "chart":
        return <BarChart className="h-4 w-4" />;
      case "activity":
        return <Activity className="h-4 w-4" />;
      default:
        return <BarChart className="h-4 w-4" />;
    }
  };

  const getTrendIcon = () => {
    if (trend === "up") {
      return <ArrowUp className="h-3 w-3 text-green-500" />;
    } else if (trend === "down") {
      return <ArrowDown className="h-3 w-3 text-red-500" />;
    }
    return null;
  };

  const getTrendColor = () => {
    if (trend === "up") {
      return "text-green-500";
    } else if (trend === "down") {
      return "text-red-500";
    }
    return "text-gray-500";
  };

  const getBadgeVariant = () => {
    if (trend === "up") {
      return "outline" as const;
    } else if (trend === "down") {
      return "destructive" as const;
    }
    return "outline" as const;
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow dark:bg-gray-800/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
            <div className="flex items-center mt-1">
              <Badge variant={getBadgeVariant()} className="h-5 flex items-center gap-1 font-normal">
                {getTrendIcon()}
                <span className={getTrendColor()}>{change}</span>
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">{description}</span>
            </div>
          </div>
          <div className="bg-primary/10 dark:bg-primary/20 p-2.5 rounded-lg">
            {renderIcon()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessMetricsCard;
