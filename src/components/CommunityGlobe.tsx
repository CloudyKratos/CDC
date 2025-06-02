
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Users, MapPin, Clock } from 'lucide-react';

interface MemberRegion {
  id: string;
  name: string;
  country: string;
  continent: string;
  coordinates: { x: number; y: number };
  memberCount: number;
  onlineCount: number;
  timezone: string;
  color: string;
}

const CommunityGlobe: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<MemberRegion | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const memberRegions: MemberRegion[] = [
    {
      id: 'north-america',
      name: 'North America',
      country: 'United States',
      continent: 'North America',
      coordinates: { x: 25, y: 35 },
      memberCount: 142,
      onlineCount: 89,
      timezone: 'PST',
      color: '#3b82f6'
    },
    {
      id: 'europe',
      name: 'Europe',
      country: 'United Kingdom',
      continent: 'Europe',
      coordinates: { x: 50, y: 25 },
      memberCount: 98,
      onlineCount: 45,
      timezone: 'GMT',
      color: '#10b981'
    },
    {
      id: 'asia-pacific',
      name: 'Asia Pacific',
      country: 'Japan',
      continent: 'Asia',
      coordinates: { x: 80, y: 35 },
      memberCount: 76,
      onlineCount: 52,
      timezone: 'JST',
      color: '#f59e0b'
    },
    {
      id: 'australia',
      name: 'Australia',
      country: 'Australia',
      continent: 'Oceania',
      coordinates: { x: 85, y: 70 },
      memberCount: 34,
      onlineCount: 18,
      timezone: 'AEST',
      color: '#ef4444'
    },
    {
      id: 'south-america',
      name: 'South America',
      country: 'Brazil',
      continent: 'South America',
      coordinates: { x: 30, y: 65 },
      memberCount: 28,
      onlineCount: 12,
      timezone: 'BRT',
      color: '#8b5cf6'
    },
    {
      id: 'africa',
      name: 'Africa',
      country: 'South Africa',
      continent: 'Africa',
      coordinates: { x: 55, y: 70 },
      memberCount: 19,
      onlineCount: 8,
      timezone: 'SAST',
      color: '#06b6d4'
    }
  ];

  const totalMembers = memberRegions.reduce((sum, region) => sum + region.memberCount, 0);
  const totalOnline = memberRegions.reduce((sum, region) => sum + region.onlineCount, 0);

  const getRegionSize = (memberCount: number) => {
    const baseSize = 12;
    const scale = memberCount / 150;
    return Math.max(baseSize, baseSize + scale * 8);
  };

  const formatLocalTime = (timezone: string) => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-blue-600">{totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-white rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Online Now</p>
                <p className="text-2xl font-bold text-green-600">{totalOnline}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Regions</p>
                <p className="text-2xl font-bold text-purple-600">{memberRegions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Continents</p>
                <p className="text-2xl font-bold text-orange-600">6</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Globe */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            Global Community Map
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative">
            {/* Globe Background */}
            <div 
              className="relative h-96 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 overflow-hidden"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 1px, transparent 1px),
                  radial-gradient(circle at 70% 70%, rgba(255,255,255,0.05) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px, 30px 30px'
              }}
            >
              {/* Globe Circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 rounded-full bg-gradient-to-br from-blue-400 via-green-400 to-blue-600 shadow-2xl relative overflow-hidden">
                  {/* Globe Grid Lines */}
                  <div className="absolute inset-0">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={`lat-${i}`}
                        className="absolute w-full border-t border-white/20"
                        style={{ top: `${(i + 1) * 12.5}%` }}
                      />
                    ))}
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={`lng-${i}`}
                        className="absolute h-full border-l border-white/20"
                        style={{ left: `${(i + 1) * 8.33}%` }}
                      />
                    ))}
                  </div>

                  {/* Continent Shapes (Simplified) */}
                  <div className="absolute inset-0">
                    {/* North America */}
                    <div className="absolute w-16 h-20 bg-green-600/60 rounded-tl-3xl" style={{ left: '15%', top: '25%' }} />
                    {/* Europe */}
                    <div className="absolute w-12 h-12 bg-green-600/60 rounded" style={{ left: '45%', top: '20%' }} />
                    {/* Asia */}
                    <div className="absolute w-20 h-16 bg-green-600/60 rounded-r-2xl" style={{ left: '60%', top: '25%' }} />
                    {/* Africa */}
                    <div className="absolute w-10 h-16 bg-green-600/60 rounded-b-2xl" style={{ left: '48%', top: '45%' }} />
                    {/* South America */}
                    <div className="absolute w-8 h-16 bg-green-600/60 rounded-bl-3xl" style={{ left: '25%', top: '50%' }} />
                    {/* Australia */}
                    <div className="absolute w-8 h-6 bg-green-600/60 rounded" style={{ left: '75%', top: '65%' }} />
                  </div>

                  {/* Member Region Pins */}
                  {memberRegions.map((region) => (
                    <div
                      key={region.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-150"
                      style={{
                        left: `${region.coordinates.x}%`,
                        top: `${region.coordinates.y}%`,
                        zIndex: hoveredRegion === region.id ? 50 : 10
                      }}
                      onMouseEnter={() => setHoveredRegion(region.id)}
                      onMouseLeave={() => setHoveredRegion(null)}
                      onClick={() => setSelectedRegion(selectedRegion?.id === region.id ? null : region)}
                    >
                      {/* Pin */}
                      <div 
                        className="relative"
                        style={{
                          width: `${getRegionSize(region.memberCount)}px`,
                          height: `${getRegionSize(region.memberCount)}px`
                        }}
                      >
                        <div 
                          className="w-full h-full rounded-full border-2 border-white shadow-lg animate-pulse"
                          style={{ backgroundColor: region.color }}
                        />
                        {/* Pulse animation for online members */}
                        {region.onlineCount > 0 && (
                          <div 
                            className="absolute inset-0 rounded-full animate-ping"
                            style={{ backgroundColor: region.color, opacity: 0.4 }}
                          />
                        )}
                      </div>

                      {/* Tooltip */}
                      {hoveredRegion === region.id && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-lg shadow-lg p-3 min-w-48 z-50">
                          <div className="text-sm">
                            <p className="font-semibold text-gray-900">{region.name}</p>
                            <p className="text-gray-600">{region.country}</p>
                            <div className="mt-2 space-y-1">
                              <div className="flex justify-between">
                                <span>Members:</span>
                                <span className="font-medium">{region.memberCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Online:</span>
                                <span className="font-medium text-green-600">{region.onlineCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Local Time:</span>
                                <span className="font-medium">{formatLocalTime(region.timezone)}</span>
                              </div>
                            </div>
                          </div>
                          {/* Arrow */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                            <div className="w-3 h-3 bg-white transform rotate-45 border-r border-b border-gray-200"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Globe Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-full" />
                </div>
              </div>

              {/* Connection Lines (Optional) */}
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {selectedRegion && memberRegions
                    .filter(r => r.id !== selectedRegion.id)
                    .map(region => (
                      <line
                        key={`connection-${region.id}`}
                        x1={selectedRegion.coordinates.x}
                        y1={selectedRegion.coordinates.y}
                        x2={region.coordinates.x}
                        y2={region.coordinates.y}
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="0.2"
                        strokeDasharray="1,1"
                        className="animate-pulse"
                      />
                    ))
                  }
                </svg>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Region Details */}
      {selectedRegion && (
        <Card className="border-l-4" style={{ borderLeftColor: selectedRegion.color }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selectedRegion.color }}
              />
              {selectedRegion.name} Community
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: selectedRegion.color }}>
                  {selectedRegion.memberCount}
                </p>
                <p className="text-sm text-gray-600">Total Members</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{selectedRegion.onlineCount}</p>
                <p className="text-sm text-gray-600">Currently Online</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-700">
                  {Math.round((selectedRegion.onlineCount / selectedRegion.memberCount) * 100)}%
                </p>
                <p className="text-sm text-gray-600">Activity Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{formatLocalTime(selectedRegion.timezone)}</p>
                <p className="text-sm text-gray-600">Local Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Active Communities</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span>Pin size = Member count</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Click pins for details</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityGlobe;
