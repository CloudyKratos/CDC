
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Plus, X, Sparkles, Heart } from 'lucide-react';
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

  // Popular suggestions
  const skillSuggestions = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'Go',
    'Leadership', 'Communication', 'Project Management', 'Design', 'Marketing'
  ];
  
  const interestSuggestions = [
    'Technology', 'Reading', 'Photography', 'Travel', 'Music', 'Sports',
    'Gaming', 'Cooking', 'Art', 'Fitness', 'Learning', 'Networking'
  ];

  const addSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (!trimmedSkill) return;

    if (skills.includes(trimmedSkill)) {
      toast.error('Skill already added');
      return;
    }

    if (skills.length >= 10) {
      toast.error('Maximum 10 skills allowed');
      return;
    }

    onSkillsChange([...skills, trimmedSkill]);
    setNewSkill('');
  };

  const removeSkill = (skillToRemove: string) => {
    onSkillsChange(skills.filter(skill => skill !== skillToRemove));
  };

  const addInterest = () => {
    const trimmedInterest = newInterest.trim();
    if (!trimmedInterest) return;

    if (interests.includes(trimmedInterest)) {
      toast.error('Interest already added');
      return;
    }

    if (interests.length >= 10) {
      toast.error('Maximum 10 interests allowed');
      return;
    }

    onInterestsChange([...interests, trimmedInterest]);
    setNewInterest('');
  };

  const removeInterest = (interestToRemove: string) => {
    onInterestsChange(interests.filter(interest => interest !== interestToRemove));
  };

  const addSuggestion = (suggestion: string, type: 'skill' | 'interest') => {
    if (type === 'skill' && !skills.includes(suggestion) && skills.length < 10) {
      onSkillsChange([...skills, suggestion]);
    } else if (type === 'interest' && !interests.includes(suggestion) && interests.length < 10) {
      onInterestsChange([...interests, suggestion]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: 'skill' | 'interest') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'skill') {
        addSkill();
      } else {
        addInterest();
      }
    }
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Skills & Interests
        </CardTitle>
        <CardDescription>
          Showcase your expertise and what you're passionate about (max 10 each)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Skills Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Skills</Label>
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'skill')}
              placeholder="Add a skill (e.g., JavaScript, Leadership)"
              className="flex-1"
              disabled={disabled || skills.length >= 10}
              maxLength={50}
            />
            <Button 
              type="button" 
              onClick={addSkill} 
              size="sm"
              disabled={disabled || !newSkill.trim() || skills.length >= 10}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          
          {/* Skills Display */}
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="gap-1 pr-1">
                {skill}
                {!disabled && (
                  <button 
                    onClick={() => removeSkill(skill)}
                    className="ml-1 hover:text-destructive transition-colors"
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>

          {/* Skills Suggestions */}
          {!disabled && skills.length < 10 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Popular skills:</p>
              <div className="flex flex-wrap gap-1">
                {skillSuggestions
                  .filter(suggestion => !skills.includes(suggestion))
                  .slice(0, 6)
                  .map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => addSuggestion(suggestion, 'skill')}
                    >
                      + {suggestion}
                    </Button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Interests Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-1">
            <Heart className="h-4 w-4" />
            Interests
          </Label>
          <div className="flex gap-2">
            <Input
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'interest')}
              placeholder="Add an interest (e.g., Photography, Travel)"
              className="flex-1"
              disabled={disabled || interests.length >= 10}
              maxLength={50}
            />
            <Button 
              type="button" 
              onClick={addInterest} 
              size="sm"
              disabled={disabled || !newInterest.trim() || interests.length >= 10}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          
          {/* Interests Display */}
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, index) => (
              <Badge key={index} variant="outline" className="gap-1 pr-1">
                {interest}
                {!disabled && (
                  <button 
                    onClick={() => removeInterest(interest)}
                    className="ml-1 hover:text-destructive transition-colors"
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>

          {/* Interests Suggestions */}
          {!disabled && interests.length < 10 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Popular interests:</p>
              <div className="flex flex-wrap gap-1">
                {interestSuggestions
                  .filter(suggestion => !interests.includes(suggestion))
                  .slice(0, 6)
                  .map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => addSuggestion(suggestion, 'interest')}
                    >
                      + {suggestion}
                    </Button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Counter */}
        <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>Skills: {skills.length}/10</span>
          <span>Interests: {interests.length}/10</span>
        </div>
      </CardContent>
    </Card>
  );
};
