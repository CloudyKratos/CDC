
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Lightbulb, BookOpen } from "lucide-react";

interface InsightCardProps {
  title: string;
  content: string;
  category: string;
  readTime: string;
  onClick?: () => void;
}

const EntrepreneurialInsightCard: React.FC<InsightCardProps> = ({
  title,
  content,
  category,
  readTime,
  onClick
}) => {
  return (
    <Card className="overflow-hidden backdrop-blur-sm border border-primary/10 transition-all duration-300 hover:shadow-md hover:border-primary/20">
      <CardHeader className="p-4 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {category}
          </Badge>
          <div className="flex items-center text-xs text-muted-foreground">
            <BookOpen className="h-3 w-3 mr-1" />
            {readTime}
          </div>
        </div>
        <CardTitle className="text-lg mt-2">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3">{content}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="ghost" className="p-0 h-auto text-primary" onClick={onClick}>
          <span className="flex items-center">
            <Lightbulb className="h-4 w-4 mr-1" />
            Read insight
            <ArrowRight className="h-3 w-3 ml-1" />
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EntrepreneurialInsightCard;
