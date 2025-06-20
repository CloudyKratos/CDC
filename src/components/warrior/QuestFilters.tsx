
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuestFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedFilter: string;
  onFilterChange: (value: string) => void;
  activeFilters: string[];
  onClearFilters: () => void;
}

const QuestFilters = ({
  searchTerm,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  activeFilters,
  onClearFilters
}: QuestFiltersProps) => {
  const filterOptions = [
    { value: "all", label: "All Quests" },
    { value: "completed", label: "Completed" },
    { value: "pending", label: "Pending" },
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
    { value: "wellness", label: "Wellness" },
    { value: "productivity", label: "Productivity" },
    { value: "learning", label: "Learning" },
    { value: "social", label: "Social" }
  ];

  return (
    <div className="space-y-4 p-4 bg-black/30 rounded-lg border border-purple-800/30">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
        <Input
          placeholder="Search quests..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-black/50 border-purple-700/50 text-white placeholder:text-purple-400 focus:border-purple-500"
        />
      </div>

      {/* Filter Dropdown */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-purple-400" />
          <Select value={selectedFilter} onValueChange={onFilterChange}>
            <SelectTrigger className="w-40 bg-black/50 border-purple-700/50 text-white">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-purple-700/50">
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-white hover:bg-purple-800/30">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-1 flex-wrap">
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="secondary" className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                  {filterOptions.find(f => f.value === filter)?.label || filter}
                </Badge>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-purple-400 hover:text-white"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestFilters;
