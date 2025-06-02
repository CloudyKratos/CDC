
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorldMap from './WorldMap';
import CommunityGlobe from './CommunityGlobe';
import LocationSettingsModal from './LocationSettingsModal';
import { Globe, MapPin, Users } from 'lucide-react';

const WorldMapPanel: React.FC = () => {
  const [showLocationSettings, setShowLocationSettings] = useState(false);

  return (
    <div className="h-full p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="h-6 w-6 text-blue-500" />
        <h2 className="text-2xl font-bold">Global Community</h2>
      </div>

      <Tabs defaultValue="community-globe" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="community-globe" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Community Globe
          </TabsTrigger>
          <TabsTrigger value="community-stats" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Community Stats
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="community-globe" className="mt-0">
          <CommunityGlobe />
        </TabsContent>
        
        <TabsContent value="community-stats" className="mt-0">
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
