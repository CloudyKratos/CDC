
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Users, MapPin, Clock, Zap } from 'lucide-react';

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
  flag: string;
}

const Enhanced3DGlobe: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<MemberRegion | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [globeRotation, setGlobeRotation] = useState(0);

  const memberRegions: MemberRegion[] = [
    {
      id: 'north-america',
      name: 'North America',
      country: 'United States',
      continent: 'North America',
      coordinates: { x: 22, y: 28 },
      memberCount: 142,
      onlineCount: 89,
      timezone: 'PST',
      color: '#3b82f6',
      flag: '🇺🇸'
    },
    {
      id: 'europe',
      name: 'Europe',
      country: 'United Kingdom',
      continent: 'Europe',
      coordinates: { x: 52, y: 22 },
      memberCount: 98,
      onlineCount: 45,
      timezone: 'GMT',
      color: '#10b981',
      flag: '🇬🇧'
    },
    {
      id: 'asia-pacific',
      name: 'Asia Pacific',
      country: 'Japan',
      continent: 'Asia',
      coordinates: { x: 78, y: 32 },
      memberCount: 76,
      onlineCount: 52,
      timezone: 'JST',
      color: '#f59e0b',
      flag: '🇯🇵'
    },
    {
      id: 'australia',
      name: 'Australia',
      country: 'Australia',
      continent: 'Oceania',
      coordinates: { x: 82, y: 68 },
      memberCount: 34,
      onlineCount: 18,
      timezone: 'AEST',
      color: '#ef4444',
      flag: '🇦🇺'
    },
    {
      id: 'south-america',
      name: 'South America',
      country: 'Brazil',
      continent: 'South America',
      coordinates: { x: 28, y: 62 },
      memberCount: 28,
      onlineCount: 12,
      timezone: 'BRT',
      color: '#8b5cf6',
      flag: '🇧🇷'
    },
    {
      id: 'africa',
      name: 'Africa',
      country: 'South Africa',
      continent: 'Africa',
      coordinates: { x: 55, y: 68 },
      memberCount: 19,
      onlineCount: 8,
      timezone: 'SAST',
      color: '#06b6d4',
      flag: '🇿🇦'
    }
  ];

  // Auto-rotate globe
  useEffect(() => {
    const interval = setInterval(() => {
      setGlobeRotation(prev => (prev + 0.5) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const totalMembers = memberRegions.reduce((sum, region) => sum + region.memberCount, 0);
  const totalOnline = memberRegions.reduce((sum, region) => sum + region.onlineCount, 0);

  const getRegionSize = (memberCount: number) => {
    const baseSize = 14;
    const scale = memberCount / 150;
    return Math.max(baseSize, baseSize + scale * 12);
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
      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-blue-100" />
              <div>
                <p className="text-sm text-blue-100">Total Members</p>
                <p className="text-2xl font-bold">{totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-green-400 rounded-full flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-100">Online Now</p>
                <p className="text-2xl font-bold">{totalOnline}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-purple-100" />
              <div>
                <p className="text-sm text-purple-100">Regions</p>
                <p className="text-2xl font-bold">{memberRegions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-orange-100" />
              <div>
                <p className="text-sm text-orange-100">Activity Rate</p>
                <p className="text-2xl font-bold">{Math.round((totalOnline / totalMembers) * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced 3D Globe */}
      <Card className="overflow-hidden border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-400" />
            Global Community Network
            <Badge variant="secondary" className="ml-auto bg-blue-600 text-white">
              Live
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative">
            {/* Enhanced Globe Background with better 3D effect */}
            <div 
              className="relative h-[500px] bg-gradient-to-b from-indigo-900 via-purple-900 to-black overflow-hidden"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                  radial-gradient(circle at 75% 75%, rgba(255, 119, 198, 0.2) 0%, transparent 50%),
                  radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
                `,
                backgroundSize: '800px 800px, 600px 600px, 50px 50px'
              }}
            >
              {/* Floating particles */}
              <div className="absolute inset-0">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`,
                      animationDuration: `${2 + Math.random() * 4}s`
                    }}
                  />
                ))}
              </div>

              {/* 3D Globe Container */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="relative w-96 h-96 rounded-full shadow-2xl"
                  style={{
                    background: `
                      radial-gradient(circle at 30% 20%, 
                        rgba(59, 130, 246, 0.8) 0%,
                        rgba(34, 197, 94, 0.6) 25%,
                        rgba(16, 185, 129, 0.7) 50%,
                        rgba(59, 130, 246, 0.9) 100%
                      )
                    `,
                    transform: `rotateY(${globeRotation}deg)`,
                    transformStyle: 'preserve-3d',
                    boxShadow: `
                      inset -20px -20px 50px rgba(0, 0, 0, 0.5),
                      inset 20px 20px 50px rgba(255, 255, 255, 0.1),
                      0 0 80px rgba(59, 130, 246, 0.3)
                    `
                  }}
                >
                  {/* Enhanced Globe Grid */}
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    {/* Latitude lines */}
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={`lat-${i}`}
                        className="absolute w-full border-t border-white/30"
                        style={{ 
                          top: `${(i + 1) * 10}%`,
                          transform: `scaleX(${Math.cos((i + 1) * 0.2)})`
                        }}
                      />
                    ))}
                    {/* Longitude lines */}
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={`lng-${i}`}
                        className="absolute h-full border-l border-white/25"
                        style={{ 
                          left: `${(i + 1) * 8.33}%`,
                          transformOrigin: 'center',
                          transform: `rotateY(${i * 15}deg)`
                        }}
                      />
                    ))}
                  </div>

                  {/* Enhanced Continent Shapes */}
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    {/* North America */}
                    <div 
                      className="absolute bg-emerald-400/70 rounded-tl-3xl shadow-lg"
                      style={{ 
                        width: '18%', 
                        height: '25%', 
                        left: '15%', 
                        top: '20%',
                        transform: 'perspective(400px) rotateX(-10deg)'
                      }} 
                    />
                    {/* Europe */}
                    <div 
                      className="absolute bg-emerald-400/70 rounded shadow-lg"
                      style={{ 
                        width: '12%', 
                        height: '15%', 
                        left: '45%', 
                        top: '15%',
                        transform: 'perspective(400px) rotateX(-5deg)'
                      }} 
                    />
                    {/* Asia */}
                    <div 
                      className="absolute bg-emerald-400/70 rounded-r-2xl shadow-lg"
                      style={{ 
                        width: '25%', 
                        height: '20%', 
                        left: '60%', 
                        top: '20%',
                        transform: 'perspective(400px) rotateX(-8deg)'
                      }} 
                    />
                    {/* Africa */}
                    <div 
                      className="absolute bg-emerald-400/70 rounded-b-2xl shadow-lg"
                      style={{ 
                        width: '12%', 
                        height: '20%', 
                        left: '48%', 
                        top: '40%',
                        transform: 'perspective(400px) rotateX(5deg)'
                      }} 
                    />
                    {/* South America */}
                    <div 
                      className="absolute bg-emerald-400/70 rounded-bl-3xl shadow-lg"
                      style={{ 
                        width: '10%', 
                        height: '20%', 
                        left: '25%', 
                        top: '45%',
                        transform: 'perspective(400px) rotateX(10deg)'
                      }} 
                    />
                    {/* Australia */}
                    <div 
                      className="absolute bg-emerald-400/70 rounded shadow-lg"
                      style={{ 
                        width: '8%', 
                        height: '8%', 
                        left: '75%', 
                        top: '62%',
                        transform: 'perspective(400px) rotateX(15deg)'
                      }} 
                    />
                  </div>

                  {/* Enhanced Member Region Pins */}
                  {memberRegions.map((region) => (
                    <div
                      key={region.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-150 z-10"
                      style={{
                        left: `${region.coordinates.x}%`,
                        top: `${region.coordinates.y}%`,
                        zIndex: hoveredRegion === region.id ? 100 : 10,
                        filter: hoveredRegion === region.id ? 'drop-shadow(0 0 20px rgba(255,255,255,0.8))' : 'none'
                      }}
                      onMouseEnter={() => setHoveredRegion(region.id)}
                      onMouseLeave={() => setHoveredRegion(null)}
                      onClick={() => setSelectedRegion(selectedRegion?.id === region.id ? null : region)}
                    >
                      {/* Enhanced Pin with 3D effect */}
                      <div 
                        className="relative group"
                        style={{
                          width: `${getRegionSize(region.memberCount)}px`,
                          height: `${getRegionSize(region.memberCount)}px`
                        }}
                      >
                        {/* Pin shadow */}
                        <div 
                          className="absolute inset-0 rounded-full blur-sm opacity-50"
                          style={{ 
                            backgroundColor: region.color,
                            transform: 'translateY(2px) scale(0.9)'
                          }}
                        />
                        
                        {/* Main pin */}
                        <div 
                          className="relative w-full h-full rounded-full border-3 border-white shadow-lg transform transition-all duration-200 group-hover:scale-110"
                          style={{ 
                            backgroundColor: region.color,
                            boxShadow: `
                              0 4px 8px rgba(0,0,0,0.3),
                              inset 0 2px 4px rgba(255,255,255,0.3)
                            `
                          }}
                        >
                          {/* Inner glow */}
                          <div 
                            className="absolute inset-1 rounded-full"
                            style={{
                              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 60%)`
                            }}
                          />
                          
                          {/* Flag emoji */}
                          <div className="absolute inset-0 flex items-center justify-center text-xs">
                            {region.flag}
                          </div>
                        </div>

                        {/* Online pulse effect */}
                        {region.onlineCount > 0 && (
                          <>
                            <div 
                              className="absolute inset-0 rounded-full animate-ping opacity-30"
                              style={{ backgroundColor: region.color }}
                            />
                            <div 
                              className="absolute inset-0 rounded-full animate-pulse opacity-20"
                              style={{ 
                                backgroundColor: region.color,
                                animationDelay: '0.5s'
                              }}
                            />
                          </>
                        )}
                      </div>

                      {/* Enhanced Tooltip */}
                      {hoveredRegion === region.id && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 z-50">
                          <div className="bg-white rounded-xl shadow-2xl p-4 min-w-64 border border-gray-200">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="text-2xl">{region.flag}</div>
                              <div>
                                <p className="font-bold text-gray-900">{region.name}</p>
                                <p className="text-sm text-gray-600">{region.country}</p>
                              </div>
                              <div 
                                className="w-4 h-4 rounded-full ml-auto"
                                style={{ backgroundColor: region.color }}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="bg-blue-50 rounded-lg p-2">
                                <p className="font-medium text-blue-900">{region.memberCount}</p>
                                <p className="text-blue-600">Members</p>
                              </div>
                              <div className="bg-green-50 rounded-lg p-2">
                                <p className="font-medium text-green-900">{region.onlineCount}</p>
                                <p className="text-green-600">Online</p>
                              </div>
                              <div className="bg-purple-50 rounded-lg p-2">
                                <p className="font-medium text-purple-900">{Math.round((region.onlineCount / region.memberCount) * 100)}%</p>
                                <p className="text-purple-600">Active</p>
                              </div>
                              <div className="bg-orange-50 rounded-lg p-2">
                                <p className="font-medium text-orange-900">{formatLocalTime(region.timezone)}</p>
                                <p className="text-orange-600">{region.timezone}</p>
                              </div>
                            </div>
                          </div>
                          {/* Tooltip arrow */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                            <div className="w-4 h-4 bg-white transform rotate-45 border-r border-b border-gray-200"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Globe highlight effect */}
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `
                        radial-gradient(circle at 25% 25%, 
                          rgba(255,255,255,0.3) 0%,
                          rgba(255,255,255,0.1) 30%,
                          transparent 60%
                        )
                      `
                    }}
                  />
                </div>
              </div>

              {/* Connection Lines between regions */}
              {selectedRegion && (
                <div className="absolute inset-0 pointer-events-none">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {memberRegions
                      .filter(r => r.id !== selectedRegion.id)
                      .map(region => (
                        <g key={`connection-${region.id}`}>
                          <line
                            x1={selectedRegion.coordinates.x}
                            y1={selectedRegion.coordinates.y}
                            x2={region.coordinates.x}
                            y2={region.coordinates.y}
                            stroke="rgba(255,255,255,0.4)"
                            strokeWidth="0.3"
                            strokeDasharray="2,2"
                            className="animate-pulse"
                          />
                          <circle
                            cx={region.coordinates.x}
                            cy={region.coordinates.y}
                            r="0.5"
                            fill="white"
                            className="animate-ping"
                          />
                        </g>
                      ))
                    }
                  </svg>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Region Details */}
      {selectedRegion && (
        <Card className="border-l-4 shadow-lg" style={{ borderLeftColor: selectedRegion.color }}>
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
            <CardTitle className="flex items-center gap-3">
              <div className="text-2xl">{selectedRegion.flag}</div>
              <div 
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: selectedRegion.color }}
              />
              <span>{selectedRegion.name} Community Hub</span>
              <Badge variant="outline" className="ml-auto">
                {selectedRegion.continent}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{selectedRegion.memberCount}</p>
                <p className="text-sm text-blue-600 font-medium">Total Members</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <Zap className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{selectedRegion.onlineCount}</p>
                <p className="text-sm text-green-600 font-medium">Currently Online</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <Globe className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round((selectedRegion.onlineCount / selectedRegion.memberCount) * 100)}%
                </p>
                <p className="text-sm text-purple-600 font-medium">Activity Rate</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-600">{formatLocalTime(selectedRegion.timezone)}</p>
                <p className="text-sm text-orange-600 font-medium">Local Time ({selectedRegion.timezone})</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Legend */}
      <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-green-400 rounded-full animate-pulse"></div>
              <span>Active Communities</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white/30 rounded-full"></div>
              <span>Pin size = Member count</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <span>Hover for details, click for connections</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-400" />
              <span>Auto-rotating globe view</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Enhanced3DGlobe;
