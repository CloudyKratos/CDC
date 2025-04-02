
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, BookOpen, Save, SmilePlus, Sun, CloudSun, Cloud, CloudRain, CloudLightning, Camera, Hash, Flame, FileText } from "lucide-react";
import { JournalEntry, StoicPractice } from "@/types/journal";
import { toast } from "sonner";

const MoodEmojis = {
  great: { icon: Sun, label: "Great", color: "text-yellow-500" },
  good: { icon: CloudSun, label: "Good", color: "text-blue-400" },
  neutral: { icon: Cloud, label: "Neutral", color: "text-gray-400" },
  bad: { icon: CloudRain, label: "Bad", color: "text-gray-500" },
  terrible: { icon: CloudLightning, label: "Terrible", color: "text-gray-600" }
};

type MoodType = keyof typeof MoodEmojis;

// Stoic practices that users can select from
const STOIC_PRACTICES: StoicPractice[] = [
  { id: "1", name: "Morning Reflection", description: "Reflect on the day ahead and set intentions", category: "morning" },
  { id: "2", name: "Negative Visualization", description: "Imagine losing what you value to appreciate it more", category: "anytime" },
  { id: "3", name: "Voluntary Discomfort", description: "Deliberately experience discomfort to build resilience", category: "anytime" },
  { id: "4", name: "Evening Review", description: "Review your day and assess your actions", category: "evening" },
  { id: "5", name: "Mindful Breathing", description: "Practice mindful breathing to stay present", category: "anytime" },
];

interface DailyJournalProps {
  onClose?: () => void;
  className?: string;
}

const DailyJournal: React.FC<DailyJournalProps> = ({ onClose, className }) => {
  const [activeTab, setActiveTab] = useState("reflection");
  const [journalEntry, setJournalEntry] = useState<Partial<JournalEntry>>({
    content: "",
    mood: "neutral",
    goals: [{ id: "1", text: "", completed: false }],
    gratitude: [""],
    date: new Date().toISOString().split('T')[0],
    morningReflection: "",
    eveningReflection: "",
    tags: [],
    stoicPractices: STOIC_PRACTICES.slice(0, 3).map(practice => ({
      id: practice.id,
      name: practice.name,
      completed: false
    }))
  });
  const [newGoal, setNewGoal] = useState("");
  const [newGratitude, setNewGratitude] = useState("");
  const [newTag, setNewTag] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const handleStoicPracticeToggle = (id: string) => {
    setJournalEntry({
      ...journalEntry,
      stoicPractices: journalEntry.stoicPractices?.map(practice => 
        practice.id === id ? { ...practice, completed: !practice.completed } : practice
      ) || []
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    
    setJournalEntry({
      ...journalEntry,
      tags: [...(journalEntry.tags || []), newTag]
    });
    setNewTag("");
  };

  const removeTag = (tagToRemove: string) => {
    setJournalEntry({
      ...journalEntry,
      tags: journalEntry.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  const saveJournal = () => {
    const entryToSave = {
      ...journalEntry,
      id: Date.now().toString(),
      photoUrl: imagePreview
    } as JournalEntry;
    
    // In a real app, we would save this to a backend or local storage
    console.log("Saving journal entry:", entryToSave);
    
    toast.success("Journal Saved", {
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
              Stoic Journal
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="reflection" className="text-xs md:text-sm">Reflection</TabsTrigger>
            <TabsTrigger value="practices" className="text-xs md:text-sm">Practices</TabsTrigger>
            <TabsTrigger value="goals" className="text-xs md:text-sm">Goals</TabsTrigger>
            <TabsTrigger value="gratitude" className="text-xs md:text-sm">Gratitude</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reflection" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Today's Reflection</h3>
              <Textarea 
                placeholder="How was your day? What's on your mind?"
                value={journalEntry.content}
                onChange={handleContentChange}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Morning Reflection</h3>
                <Textarea 
                  placeholder="What virtues will you focus on today?"
                  value={journalEntry.morningReflection}
                  onChange={(e) => setJournalEntry({...journalEntry, morningReflection: e.target.value})}
                  className="min-h-[80px]"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Evening Reflection</h3>
                <Textarea 
                  placeholder="What went well today? What could you improve?"
                  value={journalEntry.eveningReflection}
                  onChange={(e) => setJournalEntry({...journalEntry, eveningReflection: e.target.value})}
                  className="min-h-[80px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium mb-2">Photo Memory (Optional)</h3>
              {imagePreview ? (
                <div className="relative rounded-md overflow-hidden">
                  <img src={imagePreview} alt="Journal entry" className="w-full h-48 object-cover" />
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="absolute top-2 right-2 opacity-80 hover:opacity-100"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-md p-4 text-center">
                  <Camera className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Add a photo to your journal entry</p>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    id="journal-image-upload"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="journal-image-upload">
                    <Button type="button" variant="outline" size="sm" className="mx-auto">
                      Upload Image
                    </Button>
                  </label>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {journalEntry.tags?.map((tag, index) => (
                  <div key={index} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs flex items-center">
                    <Hash size={12} className="mr-1" />
                    {tag}
                    <button 
                      className="ml-1 text-primary/70 hover:text-primary" 
                      onClick={() => removeTag(tag)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center">
                <Input 
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag (e.g., work, family, health)"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={addTag}
                  className="ml-2"
                >
                  <PlusCircle size={18} />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="practices" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Today's Stoic Practices</h3>
              <div className="space-y-3">
                {journalEntry.stoicPractices?.map(practice => (
                  <div key={practice.id} className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={practice.completed}
                      onChange={() => handleStoicPracticeToggle(practice.id)}
                      id={`practice-${practice.id}`}
                      className="mr-3 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label 
                      htmlFor={`practice-${practice.id}`}
                      className={`flex-1 ${practice.completed ? 'line-through text-gray-400' : ''}`}
                    >
                      {practice.name}
                    </label>
                    <div className="ml-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <FileText size={14} className="text-gray-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Add Your Own Practice</h4>
                <div className="flex items-center">
                  <Input 
                    placeholder="Enter a personal stoic practice"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2"
                  >
                    <PlusCircle size={18} />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="gratitude" className="space-y-4">
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
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-4">
        <Button onClick={saveJournal} className="flex items-center">
          <Save size={16} className="mr-2" />
          Save Journal
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DailyJournal;
