
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Tag, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface SkillsInterestsManagerProps {
  skills: string[];
  interests: string[];
  onSkillsChange: (skills: string[]) => void;
  onInterestsChange: (interests: string[]) => void;
  disabled?: boolean;
}

export const SkillsInterestsManager: React.FC<SkillsInterestsManagerProps> = ({
  skills,
  interests,
  onSkillsChange,
  onInterestsChange,
  disabled = false
}) => {
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const addSkill = () => {
    const skill = newSkill.trim();
    if (!skill) {
      toast.error('Please enter a skill');
      return;
    }
    
    if (skills.includes(skill)) {
      toast.error('This skill is already added');
      return;
    }
    
    if (skills.length >= 20) {
      toast.error('You can add up to 20 skills');
      return;
    }
    
    onSkillsChange([...skills, skill]);
    setNewSkill('');
    toast.success('Skill added');
  };

  const removeSkill = (skillToRemove: string) => {
    onSkillsChange(skills.filter(skill => skill !== skillToRemove));
    toast.success('Skill removed');
  };

  const addInterest = () => {
    const interest = newInterest.trim();
    if (!interest) {
      toast.error('Please enter an interest');
      return;
    }
    
    if (interests.includes(interest)) {
      toast.error('This interest is already added');
      return;
    }
    
    if (interests.length >= 20) {
      toast.error('You can add up to 20 interests');
      return;
    }
    
    onInterestsChange([...interests, interest]);
    setNewInterest('');
    toast.success('Interest added');
  };

  const removeInterest = (interestToRemove: string) => {
    onInterestsChange(interests.filter(interest => interest !== interestToRemove));
    toast.success('Interest removed');
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="space-y-6">
      {/* Skills Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Skills
          </CardTitle>
          <CardDescription>
            Add your technical and professional skills ({skills.length}/20)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="e.g., React, Python, Project Management"
              onKeyPress={(e) => handleKeyPress(e, addSkill)}
              disabled={disabled}
              className="flex-1"
            />
            <Button 
              type="button" 
              onClick={addSkill} 
              size="sm"
              disabled={disabled || !newSkill.trim() || skills.length >= 20}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="flex items-center gap-1 pr-1 hover:bg-secondary/80 transition-colors"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => removeSkill(skill)}
                    disabled={disabled}
                    className="ml-1 hover:text-destructive disabled:opacity-50"
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          
          {skills.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No skills added yet. Add your first skill above.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Interests Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Interests
          </CardTitle>
          <CardDescription>
            Share your hobbies and interests ({interests.length}/20)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="e.g., Photography, Hiking, Machine Learning"
              onKeyPress={(e) => handleKeyPress(e, addInterest)}
              disabled={disabled}
              className="flex-1"
            />
            <Button 
              type="button" 
              onClick={addInterest} 
              size="sm"
              disabled={disabled || !newInterest.trim() || interests.length >= 20}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          
          {interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="flex items-center gap-1 pr-1 hover:bg-muted/50 transition-colors"
                >
                  <span>{interest}</span>
                  <button
                    onClick={() => removeInterest(interest)}
                    disabled={disabled}
                    className="ml-1 hover:text-destructive disabled:opacity-50"
                    aria-label={`Remove ${interest}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          
          {interests.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No interests added yet. Add your first interest above.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
