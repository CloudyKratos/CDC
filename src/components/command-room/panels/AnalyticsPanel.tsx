
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, TrendingDown, Activity, Users, Globe, Zap } from 'lucide-react';

const AnalyticsPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Users', value: '2,847', change: '+12.5%', trend: 'up', icon: Users },
          { label: 'Total Sessions', value: '15.2K', change: '+8.2%', trend: 'up', icon: Activity },
          { label: 'Global Reach', value: '47', change: '+3', trend: 'up', icon: Globe },
          { label: 'Performance', value: '99.2%', change: '-0.1%', trend: 'down', icon: Zap }
        ].map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="bg-black/20 backdrop-blur-lg border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm mb-1">{metric.label}</p>
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                  </div>
                  <Icon className="h-8 w-8 text-blue-400" />
                </div>
                <div className="flex items-center gap-1 mt-3">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                  <span className={`text-sm ${metric.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {metric.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-black/20 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-xl">Analytics Dashboard</CardTitle>
          <CardDescription className="text-white/60">
            Mission performance metrics and insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="text-center text-white/60">
              <BarChart3 className="h-16 w-16 mx-auto mb-4" />
              <p>Advanced analytics visualization coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPanel;
