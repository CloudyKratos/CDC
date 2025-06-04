
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
  const [userTimezone] = useState('Asia/Kolkata'); // IST timezone

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

  // Convert lat/lng to map coordinates (simple projection)
  const getMapPosition = (lat: number, lng: number) => {
    const mapWidth = 800;
    const mapHeight = 400;
    
    // Simple equirectangular projection
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

      {/* Map Container */}
      <Card className="p-6 relative overflow-hidden">
        <div className="relative w-full" style={{ paddingBottom: '50%' }}>
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 800 400"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* World Map Background */}
            <rect width="800" height="400" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            
            {/* Grid Lines */}
            {showGrid && (
              <g stroke="#d1d5db" strokeWidth="0.5" opacity="0.6">
                {/* Longitude lines */}
                {Array.from({ length: 25 }, (_, i) => {
                  const x = (i * 800) / 24;
                  return <line key={`lng-${i}`} x1={x} y1="0" x2={x} y2="400" />;
                })}
                {/* Latitude lines */}
                {Array.from({ length: 13 }, (_, i) => {
                  const y = (i * 400) / 12;
                  return <line key={`lat-${i}`} x1="0" y1={y} x2="800" y2={y} />;
                })}
                {/* Prime Meridian */}
                <line x1="400" y1="0" x2="400" y2="400" stroke="#ef4444" strokeWidth="1" />
                {/* Equator */}
                <line x1="0" y1="200" x2="800" y2="200" stroke="#ef4444" strokeWidth="1" />
              </g>
            )}

            {/* Continent Outlines (simplified) */}
            <g fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1">
              {/* North America */}
              <path d="M 120 80 L 280 60 L 300 120 L 250 180 L 180 160 L 120 120 Z" />
              {/* South America */}
              <path d="M 200 220 L 260 240 L 280 320 L 240 360 L 200 340 L 180 280 Z" />
              {/* Europe */}
              <path d="M 380 80 L 450 70 L 470 120 L 420 140 L 380 120 Z" />
              {/* Africa */}
              <path d="M 420 140 L 480 160 L 500 280 L 460 320 L 420 300 L 400 220 Z" />
              {/* Asia */}
              <path d="M 480 60 L 650 80 L 680 160 L 620 200 L 520 180 L 480 120 Z" />
              {/* Australia */}
              <path d="M 580 280 L 650 290 L 670 320 L 620 340 L 580 330 Z" />
            </g>

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
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="8"
                    fill={statusColors[member.status]}
                    stroke="white"
                    strokeWidth="2"
                    className={`cursor-pointer transition-all duration-200 hover:r-12 ${
                      member.status === 'online' ? 'animate-pulse' : ''
                    }`}
                    onClick={() => setSelectedMember(member)}
                  />
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="12"
                    fill={statusColors[member.status]}
                    opacity="0.3"
                    className={member.status === 'online' ? 'animate-ping' : ''}
                  />
                </g>
              );
            })}

            {/* Map Labels */}
            <text x="400" y="20" textAnchor="middle" className="text-sm font-medium fill-gray-700">
              Prime Meridian
            </text>
            <text x="20" y="205" className="text-sm font-medium fill-gray-700">
              Equator
            </text>
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
