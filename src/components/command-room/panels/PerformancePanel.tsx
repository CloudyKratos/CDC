
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Zap, Clock, TrendingUp } from 'lucide-react';

const PerformancePanel: React.FC = () => {
  return (
    <Card className="bg-black/20 backdrop-blur-lg border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-xl">Performance Metrics</CardTitle>
        <CardDescription className="text-white/60">
          System performance and optimization data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Response Time', value: '245ms', icon: Clock },
            { label: 'Throughput', value: '1.2K/s', icon: Activity },
            { label: 'Efficiency', value: '94.3%', icon: Zap },
            { label: 'Optimization', value: '+12.5%', icon: TrendingUp }
          ].map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <Icon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{metric.value}</p>
                <p className="text-white/60 text-sm">{metric.label}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformancePanel;
