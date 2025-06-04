import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Clock, Users } from 'lucide-react';

interface TimeZone {
  name: string;
  utc: string;
  offset: number;
  region: string;
  cities: string[];
}

interface CommunityDistribution {
  id: string;
  latitude: number;
  longitude: number;
  timezone: string;
  memberCount: number;
  activity: 'active' | 'neutral';
}

const FlatWorldMap: React.FC = () => {
  const [showGrid, setShowGrid] = useState(true);
  const [showTimeZones, setShowTimeZones] = useState(true);
  const [show24Hour, setShow24Hour] = useState(true);
  const [selectedTimeZone, setSelectedTimeZone] = useState('UTC');
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Time zones data
  const timeZones: TimeZone[] = [
    { name: 'Pacific Standard Time', utc: 'UTC-8', offset: -8, region: 'US West Coast', cities: ['Los Angeles', 'San Francisco'] },
    { name: 'Eastern Standard Time', utc: 'UTC-5', offset: -5, region: 'US East Coast', cities: ['New York', 'Miami'] },
    { name: 'Greenwich Mean Time', utc: 'UTC+0', offset: 0, region: 'UK/Ireland', cities: ['London', 'Dublin'] },
    { name: 'Central European Time', utc: 'UTC+1', offset: 1, region: 'Central Europe', cities: ['Berlin', 'Paris'] },
    { name: 'India Standard Time', utc: 'UTC+5:30', offset: 5.5, region: 'India', cities: ['Delhi', 'Mumbai'] },
    { name: 'China Standard Time', utc: 'UTC+8', offset: 8, region: 'China/Singapore', cities: ['Beijing', 'Singapore'] },
    { name: 'Japan Standard Time', utc: 'UTC+9', offset: 9, region: 'Japan/Korea', cities: ['Tokyo', 'Seoul'] },
    { name: 'Australia Eastern Time', utc: 'UTC+10', offset: 10, region: 'Australia East', cities: ['Sydney', 'Melbourne'] }
  ];

  // Mock community distribution data
  const communityData: CommunityDistribution[] = [
    { id: '1', latitude: 40.7128, longitude: -74.0060, timezone: 'UTC-5', memberCount: 15, activity: 'active' },
    { id: '2', latitude: 51.5074, longitude: -0.1278, timezone: 'UTC+0', memberCount: 23, activity: 'active' },
    { id: '3', latitude: 35.6762, longitude: 139.6503, timezone: 'UTC+9', memberCount: 8, activity: 'neutral' },
    { id: '4', latitude: 28.7041, longitude: 77.1025, timezone: 'UTC+5:30', memberCount: 31, activity: 'active' },
    { id: '5', latitude: -33.8688, longitude: 151.2093, timezone: 'UTC+10', memberCount: 12, activity: 'neutral' },
    { id: '6', latitude: 37.7749, longitude: -122.4194, timezone: 'UTC-8', memberCount: 19, activity: 'active' },
    { id: '7', latitude: 52.5200, longitude: 13.4050, timezone: 'UTC+1', memberCount: 16, activity: 'active' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getMapPosition = (lat: number, lng: number) => {
    const mapWidth = 1000;
    const mapHeight = 500;
    const x = ((lng + 180) / 360) * mapWidth;
    const y = ((90 - lat) / 180) * mapHeight;
    return { x, y };
  };

  const getTimeInZone = (offset: number) => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const zoneTime = new Date(utc + (offset * 3600000));
    
    return zoneTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !show24Hour
    });
  };

  const getTimeZoneColor = (offset: number, index: number) => {
    const colors = [
      'rgba(239, 68, 68, 0.1)',   // red
      'rgba(245, 158, 11, 0.1)',  // orange
      'rgba(34, 197, 94, 0.1)',   // green
      'rgba(59, 130, 246, 0.1)',  // blue
      'rgba(139, 92, 246, 0.1)',  // purple
      'rgba(236, 72, 153, 0.1)',  // pink
      'rgba(20, 184, 166, 0.1)',  // teal
      'rgba(161, 161, 170, 0.1)'  // gray
    ];
    return colors[index % colors.length];
  };

  const convertTime = (fromOffset: number, toOffset: number) => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const targetTime = new Date(utc + (toOffset * 3600000));
    
    return targetTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !show24Hour
    });
  };

  const getUserTimeZoneOffset = () => {
    return -new Date().getTimezoneOffset() / 60;
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Time Zones Covered</p>
              <p className="text-2xl font-bold text-blue-600">{timeZones.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-green-200 bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Active Communities</p>
              <p className="text-2xl font-bold text-green-600">
                {communityData.filter(c => c.activity === 'active').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Your Time</p>
              <p className="text-xl font-bold text-purple-600">
                {getTimeInZone(getUserTimeZoneOffset())}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-orange-600">
                {communityData.reduce((sum, c) => sum + c.memberCount, 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch 
              checked={showGrid}
              onCheckedChange={setShowGrid}
              id="show-grid"
            />
            <label htmlFor="show-grid" className="text-sm font-medium">
              Grid Lines
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch 
              checked={showTimeZones}
              onCheckedChange={setShowTimeZones}
              id="show-timezones"
            />
            <label htmlFor="show-timezones" className="text-sm font-medium">
              Time Zone Bands
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Switch 
              checked={show24Hour}
              onCheckedChange={setShow24Hour}
              id="show-24hour"
            />
            <label htmlFor="show-24hour" className="text-sm font-medium">
              24H Format
            </label>
          </div>
        </div>
      </div>

      {/* Time Zone Converter */}
      <Card className="p-4 bg-gray-50">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Zone Converter
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Your Time</label>
            <div className="text-lg font-bold text-blue-600">
              {getTimeInZone(getUserTimeZoneOffset())} (UTC{getUserTimeZoneOffset() >= 0 ? '+' : ''}{getUserTimeZoneOffset()})
            </div>
          </div>
          
          <div>
            <label className="text-sm text-gray-600 block mb-1">Convert to</label>
            <Select value={selectedTimeZone} onValueChange={setSelectedTimeZone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeZones.map((tz) => (
                  <SelectItem key={tz.utc} value={tz.utc}>
                    {tz.region} ({tz.utc})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">Time There</label>
            <div className="text-lg font-bold text-green-600">
              {(() => {
                const selectedTz = timeZones.find(tz => tz.utc === selectedTimeZone);
                return selectedTz ? getTimeInZone(selectedTz.offset) : '--:--';
              })()} ({selectedTimeZone})
            </div>
          </div>
        </div>
      </Card>

      {/* World Map */}
      <Card className="p-6 relative overflow-hidden bg-white">
        <div className="relative w-full" style={{ paddingBottom: '50%' }}>
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1000 500"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Background */}
            <rect width="1000" height="500" fill="#f8fafc" />
            
            {/* Time Zone Bands */}
            {showTimeZones && timeZones.map((tz, index) => {
              const bandWidth = 1000 / 24;
              const x = ((tz.offset + 12) / 24) * 1000;
              
              return (
                <g key={tz.utc}>
                  <rect
                    x={x - bandWidth/2}
                    y="0"
                    width={bandWidth}
                    height="500"
                    fill={getTimeZoneColor(tz.offset, index)}
                    stroke={getTimeZoneColor(tz.offset, index).replace('0.1', '0.3')}
                    strokeWidth="1"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredZone(tz.utc)}
                    onMouseLeave={() => setHoveredZone(null)}
                  />
                  
                  {/* Time zone label */}
                  <text
                    x={x}
                    y="30"
                    textAnchor="middle"
                    className="text-xs font-medium fill-gray-600"
                  >
                    {tz.utc}
                  </text>
                  
                  <text
                    x={x}
                    y="45"
                    textAnchor="middle"
                    className="text-xs fill-gray-500"
                  >
                    {getTimeInZone(tz.offset)}
                  </text>
                </g>
              );
            })}

            {/* Continents - Simplified accurate shapes */}
            <g fill="#10b981" stroke="#059669" strokeWidth="0.5" opacity="0.7">
              {/* North America */}
              <path d="M 120 140 Q 140 120 180 130 Q 220 135 260 140 Q 300 145 320 170 Q 330 200 320 230 Q 310 250 290 260 Q 270 270 240 265 Q 210 260 180 250 Q 150 240 130 220 Q 115 200 115 175 Q 115 155 120 140 Z" />
              
              {/* South America */}
              <path d="M 270 280 Q 290 275 310 290 Q 325 310 330 340 Q 335 370 330 400 Q 325 430 315 450 Q 300 465 285 470 Q 270 475 255 470 Q 240 465 230 450 Q 225 435 228 420 Q 231 405 235 390 Q 240 375 245 360 Q 250 345 255 330 Q 260 315 265 300 Q 268 290 270 280 Z" />
              
              {/* Europe */}
              <path d="M 480 130 Q 510 125 540 135 Q 560 145 570 160 Q 575 175 570 185 Q 560 190 545 185 Q 530 180 515 175 Q 500 170 490 160 Q 485 150 485 140 Q 483 130 480 130 Z" />
              
              {/* Africa */}
              <path d="M 500 190 Q 530 185 560 200 Q 580 215 590 240 Q 595 265 590 290 Q 585 315 575 340 Q 565 365 550 380 Q 535 390 520 385 Q 505 380 495 365 Q 490 350 492 335 Q 494 320 498 305 Q 502 290 506 275 Q 510 260 512 245 Q 514 230 515 215 Q 515 200 500 190 Z" />
              
              {/* Asia */}
              <path d="M 580 100 Q 620 95 660 105 Q 700 115 740 130 Q 780 145 810 165 Q 830 185 825 205 Q 820 225 805 240 Q 785 250 760 245 Q 735 240 710 230 Q 685 220 665 205 Q 645 190 630 170 Q 620 150 615 130 Q 612 115 615 100 Q 615 95 580 100 Z" />
              
              {/* Australia */}
              <path d="M 770 360 Q 800 355 830 365 Q 850 375 860 390 Q 865 405 860 415 Q 855 425 845 430 Q 830 435 815 430 Q 800 425 790 415 Q 785 405 785 395 Q 785 385 787 375 Q 789 365 770 360 Z" />
            </g>

            {/* Grid Lines */}
            {showGrid && (
              <g stroke="#64748b" strokeWidth="0.5" opacity="0.4">
                {/* Longitude lines (every 30 degrees) */}
                {Array.from({ length: 13 }, (_, i) => {
                  const x = (i * 1000) / 12;
                  return <line key={`lng-${i}`} x1={x} y1="0" x2={x} y2="500" />;
                })}
                
                {/* Latitude lines (every 30 degrees) */}
                {Array.from({ length: 7 }, (_, i) => {
                  const y = (i * 500) / 6;
                  return <line key={`lat-${i}`} x1="0" y1={y} x2="1000" y2={y} />;
                })}
                
                {/* Prime Meridian (0°) */}
                <line x1="500" y1="0" x2="500" y2="500" stroke="#dc2626" strokeWidth="2" />
                
                {/* Equator (0°) */}
                <line x1="0" y1="250" x2="1000" y2="250" stroke="#dc2626" strokeWidth="2" />
              </g>
            )}

            {/* Coordinate Labels */}
            {showGrid && (
              <g className="text-xs font-medium" fill="#475569">
                {/* Longitude labels */}
                <text x="500" y="20" textAnchor="middle" className="font-bold" fill="#dc2626">0° Prime Meridian</text>
                <text x="20" y="255" className="font-bold" fill="#dc2626">0° Equator</text>
                
                {/* Other longitude markers */}
                <text x="167" y="20" textAnchor="middle">120°W</text>
                <text x="333" y="20" textAnchor="middle">60°W</text>
                <text x="667" y="20" textAnchor="middle">60°E</text>
                <text x="833" y="20" textAnchor="middle">120°E</text>
              </g>
            )}

            {/* Community Distribution Pins */}
            {communityData.map((community) => {
              const pos = getMapPosition(community.latitude, community.longitude);
              const isActive = community.activity === 'active';
              const pinSize = Math.max(4, Math.min(12, community.memberCount / 3));

              return (
                <g key={community.id}>
                  {/* Pulse ring for active communities */}
                  {isActive && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={pinSize + 6}
                      fill={isActive ? '#10b981' : '#f59e0b'}
                      opacity="0.2"
                      className="animate-ping"
                    />
                  )}
                  
                  {/* Main pin */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={pinSize}
                    fill={isActive ? '#10b981' : '#94a3b8'}
                    stroke="white"
                    strokeWidth="2"
                    className="cursor-pointer"
                    opacity="0.8"
                  />
                  
                  {/* Member count label */}
                  <text
                    x={pos.x}
                    y={pos.y + pinSize + 15}
                    textAnchor="middle"
                    className="text-xs font-medium"
                    fill="#374151"
                  >
                    {community.memberCount}
                  </text>
                </g>
              );
            })}

            {/* Hover tooltip */}
            {hoveredZone && (
              <g>
                {(() => {
                  const tz = timeZones.find(t => t.utc === hoveredZone);
                  if (!tz) return null;
                  
                  return (
                    <g>
                      <rect
                        x="400"
                        y="200"
                        width="200"
                        height="80"
                        fill="white"
                        stroke="#e5e7eb"
                        strokeWidth="1"
                        rx="4"
                        className="drop-shadow-lg"
                      />
                      <text x="410" y="220" className="text-sm font-semibold" fill="#1f2937">
                        {tz.name}
                      </text>
                      <text x="410" y="240" className="text-sm" fill="#6b7280">
                        {tz.utc}
                      </text>
                      <text x="410" y="260" className="text-sm font-medium" fill="#059669">
                        {getTimeInZone(tz.offset)}
                      </text>
                    </g>
                  );
                })()}
              </g>
            )}
          </svg>
        </div>
      </Card>

      {/* Legend & Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Legend</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              <span>Active Community Hubs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
              <span>Neutral Activity Zones</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-blue-200 border border-blue-300"></div>
              <span>Time Zone Bands (hover for details)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-red-600"></div>
              <span>Prime Meridian & Equator</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-3">Time Zone Coverage</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {timeZones.slice(0, 6).map((tz) => (
              <div key={tz.utc} className="flex justify-between">
                <span className="text-gray-600">{tz.region}:</span>
                <span className="font-medium">{getTimeInZone(tz.offset)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FlatWorldMap;
