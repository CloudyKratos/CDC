
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
            <rect width="1000" height="500" fill="#e0f2fe" />
            
            {/* Accurate Continent shapes */}
            <g fill="#22c55e" stroke="#059669" strokeWidth="0.5" opacity="0.8">
              {/* North America */}
              <path d="M 50 120 Q 80 100 120 110 Q 160 120 200 115 Q 240 110 280 125 Q 320 140 340 170 Q 360 200 350 230 Q 340 260 320 280 Q 280 300 240 290 Q 200 280 160 270 Q 120 260 90 240 Q 60 220 50 180 Q 45 150 50 120 Z M 80 180 Q 90 190 110 185 Q 130 180 140 170 Q 145 160 140 150 Q 130 145 115 150 Q 100 155 90 165 Q 80 175 80 180 Z" />
              
              {/* South America */}
              <path d="M 280 280 Q 310 270 340 290 Q 360 310 370 340 Q 380 370 375 400 Q 370 430 360 460 Q 350 480 330 485 Q 310 490 290 485 Q 270 480 255 465 Q 240 450 235 430 Q 230 410 235 390 Q 240 370 250 350 Q 260 330 270 310 Q 275 295 280 280 Z" />
              
              {/* Europe */}
              <path d="M 480 100 Q 520 90 560 105 Q 590 120 600 140 Q 605 160 595 175 Q 580 185 560 180 Q 540 175 520 170 Q 500 165 485 155 Q 470 145 465 130 Q 460 115 470 105 Q 475 100 480 100 Z" />
              
              {/* Africa */}
              <path d="M 490 180 Q 530 170 570 190 Q 600 210 615 240 Q 625 270 620 300 Q 615 330 605 360 Q 595 390 580 410 Q 560 425 535 420 Q 510 415 490 405 Q 470 395 455 380 Q 445 365 450 345 Q 455 325 465 305 Q 475 285 485 265 Q 488 245 490 225 Q 490 200 490 180 Z" />
              
              {/* Asia */}
              <path d="M 600 80 Q 650 70 700 80 Q 750 90 800 105 Q 850 120 880 140 Q 900 160 895 185 Q 890 210 875 230 Q 855 245 830 250 Q 800 255 770 250 Q 740 245 710 235 Q 680 225 655 210 Q 630 195 615 175 Q 605 155 600 135 Q 598 115 600 95 Q 600 85 600 80 Z M 720 140 Q 740 130 760 135 Q 780 140 790 155 Q 795 170 785 180 Q 775 185 760 180 Q 745 175 735 165 Q 725 155 720 145 Q 718 140 720 140 Z" />
              
              {/* Australia */}
              <path d="M 780 350 Q 820 340 860 355 Q 890 370 900 390 Q 905 410 895 425 Q 885 435 870 440 Q 850 445 830 440 Q 810 435 795 425 Q 780 415 775 400 Q 770 385 775 370 Q 778 360 780 350 Z" />
              
              {/* Greenland */}
              <path d="M 380 60 Q 400 50 420 55 Q 440 60 450 75 Q 455 90 450 105 Q 445 115 435 120 Q 420 125 405 120 Q 390 115 385 100 Q 380 85 380 70 Q 378 60 380 60 Z" />
            </g>

            {/* Grid Lines */}
            {showGrid && (
              <g stroke="#0284c7" strokeWidth="0.8" opacity="0.6">
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
              <g className="text-xs font-semibold" fill="#1e40af">
                {/* Longitude labels (top) */}
                <text x="83" y="20" textAnchor="middle" className="font-bold">180°W</text>
                <text x="167" y="20" textAnchor="middle">150°W</text>
                <text x="250" y="20" textAnchor="middle">120°W</text>
                <text x="333" y="20" textAnchor="middle">90°W</text>
                <text x="417" y="20" textAnchor="middle">60°W</text>
                <text x="500" y="20" textAnchor="middle" className="font-bold">0°</text>
                <text x="583" y="20" textAnchor="middle">60°E</text>
                <text x="667" y="20" textAnchor="middle">90°E</text>
                <text x="750" y="20" textAnchor="middle">120°E</text>
                <text x="833" y="20" textAnchor="middle">150°E</text>
                <text x="917" y="20" textAnchor="middle" className="font-bold">180°E</text>

                {/* Latitude labels (left) */}
                <text x="20" y="50" textAnchor="start">60°N</text>
                <text x="20" y="133" textAnchor="start">30°N</text>
                <text x="20" y="255" textAnchor="start" className="font-bold">0°</text>
                <text x="20" y="375" textAnchor="start">30°S</text>
                <text x="20" y="460" textAnchor="start">60°S</text>

                {/* Prime Meridian and Equator labels */}
                <text x="505" y="40" className="font-bold text-sm" fill="#dc2626">Prime Meridian</text>
                <text x="20" y="240" className="font-bold text-sm" fill="#dc2626">Equator</text>
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
