
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, DollarSign, Users, BarChart } from "lucide-react";

interface MetricProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: "activity" | "dollar" | "users" | "chart";
  description?: string;
}

const BusinessMetricsCard: React.FC<MetricProps> = ({
  title,
  value,
  change,
  trend = "neutral",
  icon,
  description
}) => {
  const getIcon = () => {
    switch (icon) {
      case "activity":
        return <Activity className="h-5 w-5 text-primary" />;
      case "dollar":
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case "users":
        return <Users className="h-5 w-5 text-blue-500" />;
      case "chart":
        return <BarChart className="h-5 w-5 text-purple-500" />;
      default:
        return <Activity className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 bg-gradient-to-br from-card to-background/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            {getIcon()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold">{value}</div>
          {change && (
            <div className="flex items-center text-xs">
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : trend === "down" ? (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              ) : null}
              <Badge variant={trend === "up" ? "success" : trend === "down" ? "destructive" : "outline"} className="px-1.5 py-0">
                {change}
              </Badge>
              {description && <span className="ml-2 text-muted-foreground">{description}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessMetricsCard;
