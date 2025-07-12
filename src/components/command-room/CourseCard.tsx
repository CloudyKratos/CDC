
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Users } from 'lucide-react';
import CourseUnlockButton from '@/components/coins/CourseUnlockButton';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  duration?: string;
  students?: number;
  cost: number;
  thumbnail?: string;
  isPremium?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  description,
  duration = '2-3 hours',
  students = 0,
  cost,
  thumbnail,
  isPremium = true
}) => {
  return (
    <Card className="h-full transition-all duration-200 hover:shadow-lg">
      {thumbnail && (
        <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-t-lg">
          {/* Placeholder for thumbnail */}
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/50" />
          </div>
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
          {isPremium && (
            <Badge variant="secondary" className="ml-2 shrink-0">
              Premium
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-3">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Course Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {duration}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {students.toLocaleString()} students
          </div>
        </div>

        {/* Unlock Button */}
        <CourseUnlockButton
          courseId={id}
          courseName={title}
          cost={cost}
          className="w-full"
          onUnlocked={() => {
            // Handle course unlock - could navigate to course content
            console.log(`Course ${id} unlocked!`);
          }}
        />
      </CardContent>
    </Card>
  );
};

export default CourseCard;
