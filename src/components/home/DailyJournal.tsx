
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PlusCircle, BookOpen, Save, SmilePlus, Sun, CloudSun, Cloud, CloudRain, CloudLightning } from "lucide-react";
import { JournalEntry } from "@/types/journal";
import { useToast } from "@/hooks/use-toast";

const MoodEmojis = {
  great: { icon: Sun, label: "Great", color: "text-yellow-500" },
  good: { icon: CloudSun, label: "Good", color: "text-blue-400" },
  neutral: { icon: Cloud, label: "Neutral", color: "text-gray-400" },
  bad: { icon: CloudRain, label: "Bad", color: "text-gray-500" },
  terrible: { icon: CloudLightning, label: "Terrible", color: "text-gray-600" }
};

type MoodType = keyof typeof MoodEmojis;

interface DailyJournalProps {
  onClose?: () => void;
  className?: string;
}

const DailyJournal: React.FC<DailyJournalProps> = ({ onClose, className }) => {
  const [journalEntry, setJournalEntry] = useState<Partial<JournalEntry>>({
    content: "",
    mood: "neutral",
    goals: [{ id: "1", text: "", completed: false }],
    gratitude: [""],
    date: new Date().toISOString().split('T')[0]
  });
  const [newGoal, setNewGoal] = useState("");
  const [newGratitude, setNewGratitude] = useState("");
  const { toast } = useToast();

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJournalEntry({
      ...journalEntry,
      content: e.target.value
    });
  };

  const handleMoodChange = (mood: MoodType) => {
    setJournalEntry({
      ...journalEntry,
      mood
    });
  };

  const handleGoalChange = (id: string, text: string) => {
    setJournalEntry({
      ...journalEntry,
      goals: journalEntry.goals?.map(goal => 
        goal.id === id ? { ...goal, text } : goal
      ) || []
    });
  };

  const handleGoalToggle = (id: string) => {
    setJournalEntry({
      ...journalEntry,
      goals: journalEntry.goals?.map(goal => 
        goal.id === id ? { ...goal, completed: !goal.completed } : goal
      ) || []
    });
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    
    setJournalEntry({
      ...journalEntry,
      goals: [
        ...(journalEntry.goals || []),
        { id: Date.now().toString(), text: newGoal, completed: false }
      ]
    });
    setNewGoal("");
  };

  const addGratitude = () => {
    if (!newGratitude.trim()) return;
    
    setJournalEntry({
      ...journalEntry,
      gratitude: [...(journalEntry.gratitude || []), newGratitude]
    });
    setNewGratitude("");
  };

  const saveJournal = () => {
    const entryToSave = {
      ...journalEntry,
      id: Date.now().toString(),
    } as JournalEntry;
    
    // In a real app, we would save this to a backend or local storage
    console.log("Saving journal entry:", entryToSave);
    
    toast({
      title: "Journal Saved",
      description: "Your daily journal entry has been saved.",
    });
    
    if (onClose) {
      onClose();
    }
  };

  return (
    <Card className={`shadow-md ${className}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <BookOpen size={18} className="mr-2 text-primary" />
              Daily Journal
            </CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            {Object.entries(MoodEmojis).map(([key, { icon: Icon, label, color }]) => (
              <Button
                key={key}
                variant="ghost"
                size="icon"
                className={`h-9 w-9 rounded-full ${journalEntry.mood === key ? 'bg-primary/10 ' + color : color + ' opacity-50'}`}
                onClick={() => handleMoodChange(key as MoodType)}
                title={label}
              >
                <Icon size={18} />
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Today's Reflection</h3>
          <Textarea 
            placeholder="How was your day? What's on your mind?"
            value={journalEntry.content}
            onChange={handleContentChange}
            className="min-h-[100px]"
          />
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Today's Goals</h3>
          <div className="space-y-2">
            {journalEntry.goals?.map(goal => (
              <div key={goal.id} className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={goal.completed}
                  onChange={() => handleGoalToggle(goal.id)}
                  className="mr-2"
                />
                <Input 
                  value={goal.text}
                  onChange={(e) => handleGoalChange(goal.id, e.target.value)}
                  placeholder="Enter a goal"
                  className={goal.completed ? "line-through text-gray-400" : ""}
                />
              </div>
            ))}
            <div className="flex items-center">
              <Input 
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Add a new goal"
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && addGoal()}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={addGoal}
                className="ml-2"
              >
                <PlusCircle size={18} />
              </Button>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Gratitude</h3>
          <div className="space-y-2">
            {journalEntry.gratitude?.map((item, index) => (
              <div key={index} className="flex items-center">
                <Input 
                  value={item}
                  onChange={(e) => {
                    const newGratitude = [...(journalEntry.gratitude || [])];
                    newGratitude[index] = e.target.value;
                    setJournalEntry({
                      ...journalEntry,
                      gratitude: newGratitude
                    });
                  }}
                  placeholder={`I'm grateful for...`}
                />
              </div>
            ))}
            <div className="flex items-center">
              <Input 
                value={newGratitude}
                onChange={(e) => setNewGratitude(e.target.value)}
                placeholder="Add something you're grateful for"
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && addGratitude()}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={addGratitude}
                className="ml-2"
              >
                <SmilePlus size={18} />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={saveJournal} className="flex items-center">
          <Save size={16} className="mr-2" />
          Save Journal
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DailyJournal;
