
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const VISIBILITY_LEVELS = [
  { value: 'public', label: 'Public', description: 'Visible to everyone' },
  { value: 'members_only', label: 'Members Only', description: 'Only community members' },
  { value: 'cohort_only', label: 'Cohort Only', description: 'Restricted to cohort' },
  { value: 'private', label: 'Private', description: 'Only you can see this' }
];

interface VisibilitySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const VisibilitySelector: React.FC<VisibilitySelectorProps> = ({ value, onChange }) => {
  const selectedVisibility = VISIBILITY_LEVELS.find(level => level.value === value);

  return (
    <div className="space-y-2">
      <Label htmlFor="visibility_level">Visibility</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select visibility level" />
        </SelectTrigger>
        <SelectContent>
          {VISIBILITY_LEVELS.map((level) => (
            <SelectItem key={level.value} value={level.value}>
              <div>
                <div className="font-medium">{level.label}</div>
                <div className="text-sm text-gray-500">{level.description}</div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedVisibility && (
        <p className="text-sm text-gray-600">{selectedVisibility.description}</p>
      )}
    </div>
  );
};
