
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Target, Search } from "lucide-react";
import QuestCard from "./QuestCard";

interface Quest {
  id: number;
  title: string;
  description: string;
  xp: number;
  coins: number;
  completed: boolean;
  difficulty: string;
  category: string;
  estimatedTime: string;
  locked?: boolean;
}

interface QuestsListProps {
  quests: Quest[];
  onQuestComplete: (questId: number) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filter: string;
  onFilterChange: (value: string) => void;
  completedCount: number;
  totalCount: number;
}

const QuestsList = ({
  quests,
  onQuestComplete,
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  completedCount,
  totalCount
}: QuestsListProps) => {
  return (
    <Card className="bg-black/40 border-purple-800/30 text-white backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-400" />
              Today's Quests
              <Badge variant="secondary" className="ml-2">
                {completedCount}/{totalCount}
              </Badge>
            </CardTitle>
            <CardDescription className="text-purple-300 mt-1">
              Complete your daily challenges to earn XP, coins, and maintain your streak
            </CardDescription>
          </div>
        </div>
        
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
            <Input
              placeholder="Search quests..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-purple-900/20 border-purple-700/30 text-white placeholder:text-purple-400"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="px-3 py-2 bg-purple-900/20 border border-purple-700/30 rounded-md text-white"
          >
            <option value="all">All Quests</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="wellness">Wellness</option>
            <option value="productivity">Productivity</option>
            <option value="social">Social</option>
            <option value="learning">Learning</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {quests.length === 0 ? (
          <div className="text-center py-8 text-purple-300">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No quests found matching your criteria</p>
          </div>
        ) : (
          quests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onComplete={onQuestComplete}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default QuestsList;
