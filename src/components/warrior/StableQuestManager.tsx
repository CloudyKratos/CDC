
import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import { toast } from "sonner";
import EnhancedQuestCard from "./EnhancedQuestCard";
import QuestFilters from "./QuestFilters";
import { useDailyQuests } from "@/hooks/useDailyQuests";
import { useWarriorProgress } from "@/hooks/useWarriorProgress";

const StableQuestManager = () => {
  const { quests, toggleQuestCompletion, getQuestStats } = useDailyQuests();
  const { progress, addReward } = useWarriorProgress();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  const handleQuestComplete = useCallback(async (questId: number) => {
    if (isProcessing === questId) return;
    
    setIsProcessing(questId);
    
    try {
      const updatedQuests = toggleQuestCompletion(questId);
      const quest = updatedQuests.find(q => q.id === questId);
      
      if (quest && quest.completed) {
        const newProgress = await addReward(quest.xp, quest.coins);
        
        if (newProgress.level > progress.level) {
          toast.success(`🎉 LEVEL UP! You're now Level ${newProgress.level}!`, {
            duration: 6000,
          });
        } else {
          toast.success(`✅ Quest completed! +${quest.xp} XP, +${quest.coins} coins`, {
            duration: 4000,
          });
        }
      } else if (quest && !quest.completed) {
        toast.info("Quest marked as incomplete", {
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error completing quest:', error);
      toast.error("Failed to complete quest. Please try again.");
    } finally {
      setIsProcessing(null);
    }
  }, [toggleQuestCompletion, addReward, progress.level, isProcessing]);

  const activeFilters = useMemo(() => {
    const filters = [];
    if (selectedFilter !== "all") {
      filters.push(selectedFilter);
    }
    return filters;
  }, [selectedFilter]);

  const filteredQuests = useMemo(() => {
    return quests.filter(quest => {
      const matchesSearch = quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quest.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = selectedFilter === "all" || 
                           (selectedFilter === "completed" && quest.completed) ||
                           (selectedFilter === "pending" && !quest.completed) ||
                           (selectedFilter === quest.difficulty) ||
                           (selectedFilter === quest.category);
      
      return matchesSearch && matchesFilter;
    });
  }, [quests, searchTerm, selectedFilter]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedFilter("all");
  }, []);

  const questStats = useMemo(() => getQuestStats(), [quests]);

  return (
    <Card className="bg-gradient-to-br from-black/50 to-purple-900/30 border-purple-800/40 text-white backdrop-blur-sm shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Target className="h-6 w-6 text-green-400" />
            Today's Quests
            <div className="flex items-center gap-2 ml-4">
              <Badge className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium border border-green-500/30">
                {questStats.completed}/{questStats.total}
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium border border-purple-500/30">
                {questStats.totalXpEarned} XP earned
              </Badge>
            </div>
          </CardTitle>
        </div>
        
        <QuestFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          activeFilters={activeFilters}
          onClearFilters={clearFilters}
        />
      </CardHeader>
      
      <CardContent className="space-y-4">
        {filteredQuests.length === 0 ? (
          <div className="text-center py-12 text-purple-300">
            <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No quests found</p>
            <p className="text-sm">
              {searchTerm || selectedFilter !== "all" 
                ? "Try adjusting your search or filter" 
                : "Check back later for new quests"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuests.map((quest) => (
              <EnhancedQuestCard
                key={quest.id}
                quest={quest}
                onComplete={handleQuestComplete}
                isProcessing={isProcessing === quest.id}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StableQuestManager;
