
import React from 'react';
import InProgressFeatureBanner from '../InProgressFeatureBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Mic, Video, Settings } from 'lucide-react';

const StageWorkInProgress: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <InProgressFeatureBanner
        title="Stage Call System - Coming Soon"
        description="Our advanced stage call feature with participant management, hand raising, and real-time collaboration is currently under development."
        type="coming-soon"
        className="mb-6"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <CardTitle className="text-gray-600">Participant Management</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500">
              Advanced participant controls with role-based permissions and real-time status updates.
            </p>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <Mic className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <CardTitle className="text-gray-600">Audio Controls</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500">
              Professional audio management with mute controls, hand raising, and speaker queue.
            </p>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <Video className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <CardTitle className="text-gray-600">Video Integration</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500">
              High-quality video streaming with screen sharing and recording capabilities.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Settings className="h-5 w-5" />
            Development Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Core Infrastructure</span>
              <span className="text-blue-600 font-medium">90%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '90%' }}></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>WebRTC Integration</span>
              <span className="text-blue-600 font-medium">75%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>User Interface</span>
              <span className="text-blue-600 font-medium">60%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-gray-500">
        <p className="text-sm">
          We're working hard to bring you the best stage call experience. 
          Check back soon for updates!
        </p>
      </div>
    </div>
  );
};

export default StageWorkInProgress;
