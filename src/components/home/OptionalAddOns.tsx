
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Quote, 
  Calendar, 
  Smile,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from "lucide-react";

const OptionalAddOns = () => {
  const [showWisdom, setShowWisdom] = useState(false);
  const [showStreak, setShowStreak] = useState(false);
  const [showMood, setShowMood] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Sample data - in real app this would come from backend
  const dailyQuote = {
    text: "The discipline you learn and character you build from setting and achieving a goal can be more valuable than the achievement of the goal itself.",
    author: "Bo Bennett"
  };

  const streakData = Array.from({ length: 10 }, (_, i) => ({
    day: i + 1,
    completed: Math.random() > 0.3
  }));

  const moodOptions = [
    { emoji: "😤", label: "Focused", color: "bg-blue-500" },
    { emoji: "💪", label: "Motivated", color: "bg-green-500" },
    { emoji: "😌", label: "Calm", color: "bg-purple-500" },
    { emoji: "🔥", label: "Energized", color: "bg-red-500" },
    { emoji: "🎯", label: "Determined", color: "bg-yellow-500" },
    { emoji: "✨", label: "Inspired", color: "bg-pink-500" }
  ];

  return (
    <div className="space-y-4">
      {/* Wisdom Snippet */}
      <Card className="bg-white/60 dark:bg-gray-900/60 border-yellow-200/50 dark:border-yellow-800/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Quote className="h-4 w-4 text-yellow-600" />
              Daily Wisdom
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWisdom(!showWisdom)}
              className="h-6 w-6 p-0"
            >
              {showWisdom ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>
        </CardHeader>
        
        {showWisdom && (
          <CardContent className="pt-0 animate-in slide-in-from-top-1 duration-200">
            <div className="p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border border-yellow-200/50">
              <blockquote className="text-sm italic text-gray-700 dark:text-gray-300 mb-2">
                "{dailyQuote.text}"
              </blockquote>
              <div className="flex items-center justify-between">
                <cite className="text-xs text-gray-500 dark:text-gray-400">
                  — {dailyQuote.author}
                </cite>
                <Button variant="ghost" size="sm" className="h-6 text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  New Quote
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Micro Streak Timeline */}
      <Card className="bg-white/60 dark:bg-gray-900/60 border-green-200/50 dark:border-green-800/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-green-600" />
              10-Day Streak
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowStreak(!showStreak)}
              className="h-6 w-6 p-0"
            >
              {showStreak ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>
        </CardHeader>
        
        {showStreak && (
          <CardContent className="pt-0 animate-in slide-in-from-top-1 duration-200">
            <div className="flex items-center justify-center gap-2 p-3">
              {streakData.map((day, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    day.completed 
                      ? "bg-green-500 shadow-lg shadow-green-500/30" 
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                  title={`Day ${day.day}: ${day.completed ? "Completed" : "Missed"}`}
                />
              ))}
            </div>
            <div className="text-center">
              <Badge variant="outline" className="text-xs border-green-300 text-green-700 dark:text-green-300">
                {streakData.filter(d => d.completed).length}/10 days completed
              </Badge>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Feeling Quadrant */}
      <Card className="bg-white/60 dark:bg-gray-900/60 border-purple-200/50 dark:border-purple-800/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Smile className="h-4 w-4 text-purple-600" />
              Mood Compass
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMood(!showMood)}
              className="h-6 w-6 p-0"
            >
              {showMood ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>
        </CardHeader>
        
        {showMood && (
          <CardContent className="pt-0 animate-in slide-in-from-top-1 duration-200">
            <div className="grid grid-cols-3 gap-2 mb-3">
              {moodOptions.map((mood, index) => (
                <Button
                  key={index}
                  variant={selectedMood === mood.label ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMood(mood.label)}
                  className={`h-auto py-2 px-2 flex flex-col items-center gap-1 transition-all duration-200 hover:scale-105 ${
                    selectedMood === mood.label 
                      ? `${mood.color} text-white shadow-lg` 
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className="text-lg">{mood.emoji}</span>
                  <span className="text-xs">{mood.label}</span>
                </Button>
              ))}
            </div>
            
            {selectedMood && (
              <div className="text-center">
                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                  Feeling {selectedMood} today
                </Badge>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default OptionalAddOns;
