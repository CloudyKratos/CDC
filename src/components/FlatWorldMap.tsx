
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, MapPin, Clock, User, MessageCircle } from 'lucide-react';

interface MemberLocation {
  id: string;
  name: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  status: 'online' | 'recent' | 'offline';
  lastSeen: string;
  tags: string[];
  bio: string;
}

interface MemberPanelProps {
  member: MemberLocation | null;
  onClose: () => void;
  userTimezone: string;
}

const MemberPanel: React.FC<MemberPanelProps> = ({ member, onClose, userTimezone }) => {
  const getLocalTime = (timezone: string) => {
    try {
      return new Date().toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Unknown';
    }
  };

  const getTimeDifference = (memberTimezone: string) => {
    try {
      const now = new Date();
      const userTime = new Date(now.toLocaleString("en-US", { timeZone: userTimezone }));
      const memberTime = new Date(now.toLocaleString("en-US", { timeZone: memberTimezone }));
      const diffHours = Math.round((memberTime.getTime() - userTime.getTime()) / (1000 * 60 * 60));
      
      if (diffHours === 0) return 'Same timezone';
      return diffHours > 0 ? `+${diffHours}h` : `${diffHours}h`;
    } catch {
      return '';
    }
  };

  if (!member) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
      <div className="p-6 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Member Profile</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold">{member.name.charAt(0)}</span>
            </div>
            <div>
              <h4 className="font-medium">{member.name}</h4>
              <p className="text-sm text-gray-600">{member.city}, {member.country}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              member.status === 'online' ? 'bg-green-500 animate-pulse' :
              member.status === 'recent' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm">
              {member.status === 'online' ? 'Online now' :
               member.status === 'recent' ? 'Active recently' : `Last seen ${member.lastSeen}`}
            </span>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Time Zone Info</span>
            </div>
            <div className="space-y-1 text-sm">
              <div>Local time: <span className="font-medium">{getLocalTime(member.timezone)}</span></div>
              <div>Difference: <span className="font-medium">{getTimeDifference(member.timezone)}</span></div>
              <div>Zone: <span className="font-medium">{member.timezone}</span></div>
            </div>
          </div>

          <div>
            <h5 className="font-medium mb-2">About</h5>
            <p className="text-sm text-gray-600">{member.bio}</p>
          </div>

          <div>
            <h5 className="font-medium mb-2">Interests</h5>
            <div className="flex flex-wrap gap-1">
              {member.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <Button className="w-full" size="sm">
              <User className="h-4 w-4 mr-2" />
              Connect
            </Button>
            <Button variant="outline" className="w-full" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FlatWorldMap: React.FC = () => {
  const [selectedMember, setSelectedMember] = useState<MemberLocation | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showInactive, setShowInactive] = useState(true);
  const [filterRegion, setFilterRegion] = useState('all');
  const [userTimezone] = useState('Asia/Kolkata');

  // Mock data for demonstration
  const mockMembers: MemberLocation[] = [
    {
      id: '1',
      name: 'Alex Johnson',
      country: 'United States',
      city: 'New York',
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York',
      status: 'online',
      lastSeen: 'now',
      tags: ['🧠 Mindset', '🔧 Builders'],
      bio: 'Software engineer passionate about building communities and sharing knowledge.'
    },
    {
      id: '2',
      name: 'Emma Wilson',
      country: 'United Kingdom',
      city: 'London',
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 'Europe/London',
      status: 'recent',
      lastSeen: '2 hours ago',
      tags: ['🌱 Wellness', '📚 Learning'],
      bio: 'Digital marketing specialist focused on wellness and personal development.'
    },
    {
      id: '3',
      name: 'Hiroshi Tanaka',
      country: 'Japan',
      city: 'Tokyo',
      latitude: 35.6762,
      longitude: 139.6503,
      timezone: 'Asia/Tokyo',
      status: 'online',
      lastSeen: 'now',
      tags: ['🔧 Builders', '🎯 Productivity'],
      bio: 'Product manager and tech enthusiast working on innovative solutions.'
    },
    {
      id: '4',
      name: 'Maria Silva',
      country: 'Brazil',
      city: 'São Paulo',
      latitude: -23.5505,
      longitude: -46.6333,
      timezone: 'America/Sao_Paulo',
      status: 'offline',
      lastSeen: '1 day ago',
      tags: ['🌱 Wellness', '🎨 Creative'],
      bio: 'UX designer and wellness coach helping others find balance in life.'
    },
    {
      id: '5',
      name: 'David Kim',
      country: 'Australia',
      city: 'Sydney',
      latitude: -33.8688,
      longitude: 151.2093,
      timezone: 'Australia/Sydney',
      status: 'recent',
      lastSeen: '4 hours ago',
      tags: ['🧠 Mindset', '💼 Business'],
      bio: 'Entrepreneur and business consultant focused on growth strategies.'
    }
  ];

  const [members] = useState<MemberLocation[]>(mockMembers);

  const filteredMembers = members.filter(member => {
    if (!showInactive && member.status === 'offline') return false;
    if (filterRegion !== 'all') {
      const regions = {
        'north-america': ['United States', 'Canada', 'Mexico'],
        'europe': ['United Kingdom', 'Germany', 'France', 'Spain', 'Italy'],
        'asia': ['Japan', 'China', 'India', 'Singapore', 'South Korea'],
        'oceania': ['Australia', 'New Zealand'],
        'south-america': ['Brazil', 'Argentina', 'Chile']
      };
      return regions[filterRegion as keyof typeof regions]?.includes(member.country);
    }
    return true;
  });

  // Convert lat/lng to cylindrical projection coordinates
  const getMapPosition = (lat: number, lng: number) => {
    const mapWidth = 1000;
    const mapHeight = 500;
    
    // Cylindrical projection with proper scaling
    const x = ((lng + 180) / 360) * mapWidth;
    const y = ((90 - lat) / 180) * mapHeight;
    
    return { x, y };
  };

  const getMemberStats = () => {
    const online = members.filter(m => m.status === 'online').length;
    const recent = members.filter(m => m.status === 'recent').length;
    const offline = members.filter(m => m.status === 'offline').length;
    
    return { online, recent, offline, total: members.length };
  };

  const stats = getMemberStats();

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-green-200 bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm text-gray-600">Online Now</p>
              <p className="text-2xl font-bold text-green-600">{stats.online}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-yellow-200 bg-gradient-to-r from-yellow-50 to-yellow-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">Active Recently</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.recent}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-red-200 bg-gradient-to-r from-red-50 to-red-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">Offline</p>
              <p className="text-2xl font-bold text-red-600">{stats.offline}</p>
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
              Show Grid Lines
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch 
              checked={showInactive}
              onCheckedChange={setShowInactive}
              id="show-inactive"
            />
            <label htmlFor="show-inactive" className="text-sm font-medium">
              Show Inactive Members
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filter by Region:</span>
          <Select value={filterRegion} onValueChange={setFilterRegion}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="north-america">North America</SelectItem>
              <SelectItem value="europe">Europe</SelectItem>
              <SelectItem value="asia">Asia</SelectItem>
              <SelectItem value="oceania">Oceania</SelectItem>
              <SelectItem value="south-america">South America</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cylindrical World Map */}
      <Card className="p-6 relative overflow-hidden bg-gray-50">
        <div className="relative w-full" style={{ paddingBottom: '50%' }}>
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1000 500"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Background */}
            <rect width="1000" height="500" fill="#f8fafc" />
            
            {/* Continent shapes - Simplified outlines */}
            <g fill="#a3e4c7" stroke="#22c55e" strokeWidth="1" opacity="0.7">
              {/* North America */}
              <path d="M 100 100 Q 150 80 250 90 Q 300 95 350 110 Q 380 130 360 180 Q 340 200 300 220 Q 250 240 200 230 Q 150 220 120 180 Q 100 140 100 100 Z" />
              
              {/* South America */}
              <path d="M 220 250 Q 260 240 300 260 Q 320 280 330 320 Q 340 360 320 400 Q 300 420 280 430 Q 260 425 240 410 Q 220 390 210 350 Q 200 310 210 280 Q 215 260 220 250 Z" />
              
              {/* Europe */}
              <path d="M 450 100 Q 500 90 550 100 Q 580 110 590 130 Q 585 150 570 160 Q 540 170 510 165 Q 480 160 460 145 Q 445 130 445 115 Q 445 105 450 100 Z" />
              
              {/* Africa */}
              <path d="M 480 180 Q 520 170 560 185 Q 590 200 600 240 Q 610 280 600 320 Q 590 360 570 380 Q 540 390 510 385 Q 480 380 460 360 Q 450 340 455 300 Q 460 260 470 220 Q 475 190 480 180 Z" />
              
              {/* Asia */}
              <path d="M 600 80 Q 650 70 720 85 Q 780 100 830 120 Q 870 140 880 170 Q 885 200 870 220 Q 850 240 800 245 Q 750 250 700 240 Q 650 230 620 210 Q 600 190 595 160 Q 590 130 595 100 Q 598 85 600 80 Z" />
              
              {/* Australia */}
              <path d="M 750 350 Q 800 340 850 350 Q 880 360 890 380 Q 885 400 870 410 Q 840 415 810 410 Q 780 405 760 395 Q 745 385 745 375 Q 745 365 750 350 Z" />
            </g>

            {/* Grid Lines */}
            {showGrid && (
              <g stroke="#94a3b8" strokeWidth="0.5" opacity="0.8">
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
                <line x1="500" y1="0" x2="500" y2="500" stroke="#ef4444" strokeWidth="1.5" />
                
                {/* Equator (0°) */}
                <line x1="0" y1="250" x2="1000" y2="250" stroke="#ef4444" strokeWidth="1.5" />
              </g>
            )}

            {/* Coordinate Labels */}
            {showGrid && (
              <g className="text-xs font-medium" fill="#475569">
                {/* Longitude labels (top) */}
                <text x="83" y="15" textAnchor="middle">180°</text>
                <text x="167" y="15" textAnchor="middle">150°</text>
                <text x="250" y="15" textAnchor="middle">120°</text>
                <text x="333" y="15" textAnchor="middle">90°</text>
                <text x="417" y="15" textAnchor="middle">60°</text>
                <text x="500" y="15" textAnchor="middle">0°</text>
                <text x="583" y="15" textAnchor="middle">60°</text>
                <text x="667" y="15" textAnchor="middle">90°</text>
                <text x="750" y="15" textAnchor="middle">120°</text>
                <text x="833" y="15" textAnchor="middle">150°</text>
                <text x="917" y="15" textAnchor="middle">180°</text>

                {/* Latitude labels (left) */}
                <text x="15" y="45" textAnchor="start">75°</text>
                <text x="15" y="128" textAnchor="start">45°</text>
                <text x="15" y="170" textAnchor="start">30°</text>
                <text x="15" y="255" textAnchor="start">0°</text>
                <text x="15" y="340" textAnchor="start">30°</text>
                <text x="15" y="380" textAnchor="start">45°</text>
                <text x="15" y="460" textAnchor="start">75°</text>

                {/* Prime Meridian and Equator labels */}
                <text x="505" y="35" className="font-semibold" fill="#dc2626">Prime Meridian</text>
                <text x="15" y="245" className="font-semibold" fill="#dc2626">Equator</text>
              </g>
            )}

            {/* Member Pins */}
            {filteredMembers.map((member) => {
              const pos = getMapPosition(member.latitude, member.longitude);
              const statusColors = {
                online: '#10b981',
                recent: '#f59e0b',
                offline: '#ef4444'
              };

              return (
                <g key={member.id}>
                  {/* Pulse ring for online users */}
                  {member.status === 'online' && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="15"
                      fill={statusColors[member.status]}
                      opacity="0.2"
                      className="animate-ping"
                    />
                  )}
                  
                  {/* Main pin */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="6"
                    fill={statusColors[member.status]}
                    stroke="white"
                    strokeWidth="2"
                    className={`cursor-pointer transition-all duration-200 hover:r-8 ${
                      member.status === 'online' ? 'animate-pulse' : ''
                    }`}
                    onClick={() => setSelectedMember(member)}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </Card>

      {/* Legend */}
      <Card className="p-4 bg-gray-50">
        <h3 className="font-semibold mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            <span>Online Now</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span>Active Recently</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>Offline</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-600" />
            <span>Click pin to view profile</span>
          </div>
        </div>
      </Card>

      {/* Member Panel */}
      {selectedMember && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSelectedMember(null)}
          />
          <MemberPanel 
            member={selectedMember} 
            onClose={() => setSelectedMember(null)}
            userTimezone={userTimezone}
          />
        </>
      )}
    </div>
  );
};

export default FlatWorldMap;
