
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Play, Lock, Search } from 'lucide-react';
import { useCoins } from '@/hooks/useCoins';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ArenaInfo from './ArenaInfo';
import type { Tables } from '@/integrations/supabase/types';

type Course = Tables<'courses'>;

interface CourseGridProps {
  isAdmin?: boolean;
}

const CourseGrid: React.FC<CourseGridProps> = ({ isAdmin = false }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [unlockedCourses, setUnlockedCourses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  const { coins, unlockCourse, refreshCoins } = useCoins();

  useEffect(() => {
    fetchCourses();
    fetchUnlockedCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnlockedCourses = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('course_unlocks')
        .select('course_id')
        .eq('user_id', user.user.id);

      if (error) throw error;
      setUnlockedCourses(new Set(data?.map(item => item.course_id) || []));
    } catch (error) {
      console.error('Error fetching unlocked courses:', error);
    }
  };

  const handleUnlockCourse = async (courseId: string, cost: number) => {
    const success = await unlockCourse(courseId, cost);
    if (success) {
      setUnlockedCourses(prev => new Set([...prev, courseId]));
      await refreshCoins();
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = searchTerm === '' || 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesType = selectedType === 'all' || course.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = [...new Set(courses.map(c => c.category))];
  const types = ['course', 'recording', 'workshop'];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'recording': return '🎥';
      case 'workshop': return '🛠️';
      default: return '📚';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-muted rounded-t-lg"></div>
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Arena Info */}
      <ArenaInfo />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses, instructors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {types.map(type => (
              <SelectItem key={type} value={type}>
                {getTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const isUnlocked = !course.is_premium || unlockedCourses.has(course.id);
          const canAfford = coins.balance >= course.coin_cost;

          return (
            <Card key={course.id} className="group hover:shadow-lg transition-all duration-200">
              <div className="relative aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg overflow-hidden">
                {course.thumbnail_url ? (
                  <img 
                    src={course.thumbnail_url} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-4xl">{getTypeIcon(course.type)}</div>
                  </div>
                )}
                
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                )}

                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="bg-white/90">
                    {course.type}
                  </Badge>
                </div>

                <div className="absolute top-2 right-2">
                  <Badge className={getDifficultyColor(course.difficulty)}>
                    {course.difficulty}
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                  {course.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{course.instructor}</span>
                  <span>{course.duration}</span>
                </div>

                {course.is_premium && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-yellow-600">
                      <span className="font-semibold">{course.coin_cost} Coins</span>
                    </div>
                    
                    {isUnlocked ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Unlocked
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleUnlockCourse(course.id, course.coin_cost)}
                        disabled={!canAfford}
                        variant={canAfford ? "default" : "outline"}
                      >
                        <Lock className="w-4 h-4 mr-1" />
                        Unlock
                      </Button>
                    )}
                  </div>
                )}

                {isUnlocked && course.video_url && (
                  <Button 
                    className="w-full" 
                    onClick={() => window.open(course.video_url!, '_blank')}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Watch Now
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">No courses found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default CourseGrid;
