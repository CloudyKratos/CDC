
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const LearningStreak: React.FC = () => (
  <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
    <CardHeader>
      <CardTitle className="text-slate-900 dark:text-white">Learning Streak</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600 mb-2">15 Days</div>
        <p className="text-slate-600 dark:text-slate-400">Keep it up!</p>
      </div>
    </CardContent>
  </Card>
);

export const WeeklyProgress: React.FC = () => (
  <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
    <CardHeader>
      <CardTitle className="text-slate-900 dark:text-white">Completed This Week</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center">
        <div className="text-3xl font-bold text-green-600 mb-2">8</div>
        <p className="text-slate-600 dark:text-slate-400">Resources completed</p>
      </div>
    </CardContent>
  </Card>
);
