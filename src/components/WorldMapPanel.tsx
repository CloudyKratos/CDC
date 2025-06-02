
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorldMap from './WorldMap';
import GlobalMemberMap from './GlobalMemberMap';
import LocationSettingsModal from './LocationSettingsModal';
import { Globe, MapPin } from 'lucide-react';

const WorldMapPanel: React.FC = () => {
  const [showLocationSettings, setShowLocationSettings] = useState(false);

  return (
    <div className="h-full p-6">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="h-6 w-6 text-blue-500" />
        <h2 className="text-2xl font-bold">World Map</h2>
      </div>

      <Tabs defaultValue="global-map" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="global-map" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Global Member Map
          </TabsTrigger>
          <TabsTrigger value="community-stats" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Community Stats
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="global-map" className="mt-6">
          <GlobalMemberMap />
        </TabsContent>
        
        <TabsContent value="community-stats" className="mt-6">
          <WorldMap />
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
