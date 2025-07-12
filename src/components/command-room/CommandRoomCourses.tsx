
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';
import CourseCard from './CourseCard';

const CommandRoomCourses: React.FC = () => {
  // Sample courses data - replace with real data from your API
  const courses = [
    {
      id: 'leadership-mastery',
      title: 'Leadership Mastery',
      description: 'Master the art of leadership with proven strategies from top executives and entrepreneurs.',
      duration: '4-5 hours',
      students: 1247,
      cost: 50,
      isPremium: true
    },
    {
      id: 'productivity-systems',
      title: 'Advanced Productivity Systems',
      description: 'Build systems that multiply your output and help you achieve more in less time.',
      duration: '3-4 hours',
      students: 892,
      cost: 35,
      isPremium: true
    },
    {
      id: 'mindset-transformation',
      title: 'Mindset Transformation',
      description: 'Transform your mindset to overcome limitations and unlock your full potential.',
      duration: '5-6 hours',
      students: 2156,
      cost: 75,
      isPremium: true
    },
    {
      id: 'financial-freedom',
      title: 'Path to Financial Freedom',
      description: 'Learn investment strategies and wealth-building principles from financial experts.',
      duration: '6-8 hours',
      students: 1634,
      cost: 100,
      isPremium: true
    },
    {
      id: 'communication-excellence',
      title: 'Communication Excellence',
      description: 'Master the art of persuasive communication in both personal and professional settings.',
      duration: '3-4 hours',
      students: 987,
      cost: 40,
      isPremium: true
    },
    {
      id: 'strategic-thinking',
      title: 'Strategic Thinking Framework',
      description: 'Develop strategic thinking skills to make better decisions and plan for long-term success.',
      duration: '4-5 hours',
      students: 756,
      cost: 60,
      isPremium: true
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Premium Courses
          </CardTitle>
          <CardDescription>
            Unlock advanced courses with coins earned from completing activities
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} {...course} />
        ))}
      </div>
    </div>
  );
};

export default CommandRoomCourses;
