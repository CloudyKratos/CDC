
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  count: number;
}

interface CategoryOverviewProps {
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
  courseCounts: Record<string, number>;
  completedCounts: Record<string, number>;
}

const CategoryOverview: React.FC<CategoryOverviewProps> = ({
  categories,
  onCategorySelect,
  courseCounts,
  completedCounts
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {categories.map((category) => {
        const courseCount = courseCounts[category.id] || 0;
        const completedCount = completedCounts[category.id] || 0;
        const completionRate = courseCount > 0 ? Math.round((completedCount / courseCount) * 100) : 0;

        return (
          <Card 
            key={category.id} 
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200 hover:border-gray-300"
            onClick={() => onCategorySelect(category.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center text-2xl`}>
                  {category.icon}
                </div>
                <Badge variant="outline" className="text-xs">
                  {courseCount} courses
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {category.description}
                  </p>
                </div>

                {courseCount > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">{completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`bg-gradient-to-r ${category.color} h-1.5 rounded-full transition-all duration-300`}
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {completedCount} of {courseCount} completed
                    </div>
                  </div>
                )}

                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-between group-hover:bg-gray-50 mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCategorySelect(category.id);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Explore Courses</span>
                  </div>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CategoryOverview;
