
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter } from 'lucide-react';

interface CommandRoomFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedTag: string;
  onTagChange: (tag: string) => void;
  resourceTypes: { value: string; label: string }[];
  allTags: string[];
}

const CommandRoomFilters: React.FC<CommandRoomFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedTag,
  onTagChange,
  resourceTypes,
  allTags
}) => {
  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Search className="w-5 h-5" />
          Find Resources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="px-4 py-2 rounded-md bg-white/20 border-white/30 text-white"
            >
              {resourceTypes.map(type => (
                <option key={type.value} value={type.value} className="text-black">
                  {type.label}
                </option>
              ))}
            </select>
            <select
              value={selectedTag}
              onChange={(e) => onTagChange(e.target.value)}
              className="px-4 py-2 rounded-md bg-white/20 border-white/30 text-white"
            >
              <option value="all" className="text-black">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag} className="text-black">{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommandRoomFilters;
