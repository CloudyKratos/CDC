
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import Icons from '@/utils/IconUtils';
import LearningCard, { LearningItem } from './LearningCard';

interface CommandRoomContentProps {
  activeTab: string;
  filteredItems: LearningItem[];
  searchQuery: string;
  activeFiltersCount: number;
  onFavorite: (id: string) => void;
  onItemClick: (item: LearningItem) => void;
}

const CommandRoomContent: React.FC<CommandRoomContentProps> = ({
  activeTab,
  filteredItems,
  searchQuery,
  activeFiltersCount,
  onFavorite,
  onItemClick
}) => {
  return (
    <TabsContent value={activeTab} className="space-y-6">
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mb-6">
            <Icons.Search size={40} className="text-purple-400 opacity-60" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No learning materials found</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            {searchQuery || activeFiltersCount > 0
              ? "Try adjusting your search or filters to discover more content"
              : "Your learning sanctuary awaits. Create your first piece of wisdom."
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <LearningCard
              key={item.id}
              item={item}
              onFavorite={onFavorite}
              onClick={onItemClick}
            />
          ))}
        </div>
      )}
    </TabsContent>
  );
};

export default CommandRoomContent;
