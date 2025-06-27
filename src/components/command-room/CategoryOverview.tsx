
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, TrendingUp } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="text-center py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Learning Path</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore our carefully curated course categories designed to accelerate your entrepreneurial journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const courseCount = courseCounts[category.id] || 0;
          const completedCount = completedCounts[category.id] || 0;
          const completionRate = courseCount > 0 ? Math.round((completedCount / courseCount) * 100) : 0;

          return (
            <Card 
              key={category.id} 
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-gray-200 hover:border-blue-200 transform hover:scale-[1.02] overflow-hidden"
              onClick={() => onCategorySelect(category.id)}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {category.icon}
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                      {courseCount} courses
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {category.description}
                    </p>
                  </div>

                  {courseCount > 0 && (
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Your Progress</span>
                        <span className="font-bold text-gray-900">{completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${category.color} h-2 rounded-full transition-all duration-500 group-hover:scale-x-105 origin-left`}
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{completedCount} completed</span>
                        <span>{courseCount - completedCount} remaining</span>
                      </div>
                    </div>
                  )}

                  <Button 
                    variant="ghost" 
                    className="w-full justify-between group-hover:bg-blue-50 group-hover:text-blue-700 mt-4 h-12"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCategorySelect(category.id);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5" />
                      <span className="font-medium">Explore Courses</span>
                    </div>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Learning Journey</h3>
          <p className="text-gray-600 text-sm">Track your progress across all categories</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Object.values(courseCounts).reduce((a, b) => a + b, 0)}
            </div>
            <div className="text-xs text-gray-600">Total Courses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Object.values(completedCounts).reduce((a, b) => a + b, 0)}
            </div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {categories.length}
            </div>
            <div className="text-xs text-gray-600">Categories</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryOverview;
