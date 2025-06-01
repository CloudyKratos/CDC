
import React, { useState } from 'react';
import WorldMap from './WorldMap';
import LocationSettingsModal from './LocationSettingsModal';

const WorldMapPanel: React.FC = () => {
  const [showLocationSettings, setShowLocationSettings] = useState(false);

  return (
    <div className="h-full">
      <WorldMap />
      <LocationSettingsModal 
        isOpen={showLocationSettings}
        onClose={() => setShowLocationSettings(false)}
      />
    </div>
  );
};

export default WorldMapPanel;
