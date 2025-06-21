
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDailyQuests } from "@/hooks/useDailyQuests";
import { useWarriorProgress } from "@/hooks/useWarriorProgress";
import QuestCard from "./QuestCard";
import { toast } from "sonner";
import { Trophy, Target, Zap, RefreshCw } from "lucide-react";
import AnimatedProgressBar from "./AnimatedProgressBar";

const StableQuestManager = () => {
  const { quests, toggleQuestCompletion, getQuestStats, checkAndResetQuests } = useDailyQuests();
  const { addReward } = useWarriorProgress();
  
  const stats = getQuestStats();

  const handleQuestComplete = async (questId: number) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest || quest.completed || quest.locked) return;

    // Complete the quest
    const updatedQuests = toggleQuestCompletion(questId);
    const updatedStats = getQuestStats();
    
    // Add rewards
    await addReward(quest.xp, quest.coins);
    
    // Success message
    toast.success(`Quest completed! +${quest.xp} XP, +${quest.coins} coins`, {
      duration: 3000,
    });

    // Check if all quests are completed
    if (updatedStats.completed === updatedStats.total) {
      toast.success("🎉 All daily quests completed! Bonus XP awarded!", {
        duration: 5000,
      });
      await addReward(100, 50); // Bonus rewards
    }
  };

  const handleRefreshQuests = () => {
    checkAndResetQuests();
    toast.info("Daily quests refreshed!");
  };

  return (
    <div className="space-y-6">
      {/* Quest Progress Overview */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-indigo-900/50 border-indigo-500/30 text-white backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
              <Target className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
              Daily Quest Progress
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-indigo-900/20 rounded-lg border border-indigo-500/30">
              <div className="text-3xl font-bold text-indigo-400 mb-1">{stats.completed}</div>
              <div className="text-sm text-indigo-300">Completed</div>
            </div>
            <div className="text-center p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
              <div className="text-3xl font-bold text-purple-400 mb-1">{stats.total}</div>
              <div className="text-sm text-purple-300">Total Quests</div>
            </div>
            <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-500/30">
              <div className="text-3xl font-bold text-green-400 mb-1">{stats.totalXpEarned}</div>
              <div className="text-sm text-green-300">XP Earned</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-indigo-200">Overall Progress</span>
              <span className="text-xl font-bold text-white">{Math.round(stats.progressPercentage)}%</span>
            </div>
            
            <AnimatedProgressBar 
              value={stats.completed}
              max={stats.total}
              color="purple"
              size="lg"
              showPercentage={false}
              label=""
            />

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshQuests}
                className="border-indigo-500/50 text-indigo-300 hover:bg-indigo-600/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Quests
              </Button>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-blue-400">
                  <Zap className="h-4 w-4" />
                  <span>+{stats.totalXpEarned} XP</span>
                </div>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Trophy className="h-4 w-4" />
                  <span>+{stats.totalCoinsEarned} coins</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quest List */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 border-slate-500/30 text-white backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              Today's Quests
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onComplete={handleQuestComplete}
              />
            ))}
          </div>
          
          {quests.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No quests available. Check back tomorrow!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StableQuestManager;
