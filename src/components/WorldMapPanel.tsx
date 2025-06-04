
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FlatWorldMap from './FlatWorldMap';
import LocationSettingsModal from './LocationSettingsModal';
import { Globe, BarChart3 } from 'lucide-react';

const WorldMapPanel: React.FC = () => {
  const [showLocationSettings, setShowLocationSettings] = useState(false);

  return (
    <div className="h-full p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Globe className="h-7 w-7 text-blue-500" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🌐 Global Community Network
          </h2>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-600 text-lg">Discover, connect, and grow with members around the world.</p>
      </div>

      <Tabs defaultValue="world-map" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
          <TabsTrigger value="world-map" className="flex items-center gap-2 text-base">
            <Globe className="h-5 w-5" />
            World Map
          </TabsTrigger>
          <TabsTrigger value="community-stats" className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5" />
            Statistics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="world-map" className="mt-0">
          <FlatWorldMap />
        </TabsContent>
        
        <TabsContent value="community-stats" className="mt-0">
          <div className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-4">Community Statistics</h3>
            <p className="text-gray-600">Detailed analytics and member insights coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>

      <LocationSettingsModal 
        isOpen={showLocationSettings}
        onClose={() => setShowLocationSettings(false)}
      />
    </div>
  );
};

export default WorldMapPanel;
