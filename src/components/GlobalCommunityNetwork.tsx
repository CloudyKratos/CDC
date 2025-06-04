
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Users, MapPin, Activity, Search, Filter } from 'lucide-react';
import LocationService from '@/services/LocationService';

interface MemberLocation {
  id: string;
  name: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  isOnline: boolean;
  lastSeen: string;
  tags: string[];
  memberCount: number;
}

const GlobalCommunityNetwork = () => {
  const [memberLocations, setMemberLocations] = useState<MemberLocation[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<MemberLocation[]>([]);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [sortBy, setSortBy] = useState('most-active');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredMember, setHoveredMember] = useState<MemberLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  const mockData: MemberLocation[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      country: 'Singapore',
      city: 'Singapore',
      latitude: 1.3521,
      longitude: 103.8198,
      isOnline: true,
      lastSeen: 'now',
      tags: ['Tech', 'AI', 'Startup'],
      memberCount: 24
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      country: 'United States',
      city: 'San Francisco',
      latitude: 37.7749,
      longitude: -122.4194,
      isOnline: true,
      lastSeen: 'now',
      tags: ['Design', 'Product', 'SaaS'],
      memberCount: 89
    },
    {
      id: '3',
      name: 'Elena Rodriguez',
      country: 'Spain',
      city: 'Barcelona',
      latitude: 41.3851,
      longitude: 2.1734,
      isOnline: false,
      lastSeen: '2 hours ago',
      tags: ['Marketing', 'Growth', 'Social'],
      memberCount: 31
    },
    {
      id: '4',
      name: 'David Kim',
      country: 'South Korea',
      city: 'Seoul',
      latitude: 37.5665,
      longitude: 126.9780,
      isOnline: true,
      lastSeen: 'now',
      tags: ['Finance', 'Crypto', 'Investment'],
      memberCount: 67
    },
    {
      id: '5',
      name: 'James Wilson',
      country: 'United Kingdom',
      city: 'London',
      latitude: 51.5074,
      longitude: -0.1278,
      isOnline: false,
      lastSeen: '1 hour ago',
      tags: ['Consulting', 'Strategy', 'Leadership'],
      memberCount: 43
    },
    {
      id: '6',
      name: 'Priya Sharma',
      country: 'India',
      city: 'Bangalore',
      latitude: 12.9716,
      longitude: 77.5946,
      isOnline: true,
      lastSeen: 'now',
      tags: ['Engineering', 'DevOps', 'Cloud'],
      memberCount: 156
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setMemberLocations(mockData);
      setFilteredLocations(mockData);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = [...memberLocations];

    if (showOnlyActive) {
      filtered = filtered.filter(member => member.isOnline);
    }

    if (searchTerm) {
      filtered = filtered.filter(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort
    switch (sortBy) {
      case 'most-active':
        filtered.sort((a, b) => b.memberCount - a.memberCount);
        break;
      case 'recently-joined':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nearby':
        // Simple distance calculation - in real app would use user location
        filtered.sort((a, b) => a.latitude - b.latitude);
        break;
    }

    setFilteredLocations(filtered);
  }, [memberLocations, showOnlyActive, searchTerm, sortBy]);

  const totalMembers = memberLocations.reduce((sum, loc) => sum + loc.memberCount, 0);
  const onlineMembers = memberLocations.filter(loc => loc.isOnline).reduce((sum, loc) => sum + loc.memberCount, 0);
  const uniqueRegions = new Set(memberLocations.map(loc => loc.country)).size;
  const activityRate = Math.round((onlineMembers / totalMembers) * 100);

  const convertToMapCoordinates = (lat: number, lng: number) => {
    // Convert lat/lng to percentage positions on the map
    const x = ((lng + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  if (isLoading) {
    return (
      <div className="h-full p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col space-y-2 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🌐 Global Community Network
            </h1>
          </div>
          <Badge className="bg-green-500 text-white px-3 py-1 text-sm font-medium animate-pulse">
            🟢 Live
          </Badge>
        </div>
        <p className="text-gray-600 text-lg">Discover, connect, and grow with members around the world.</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-blue-600">{totalMembers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-green-200 bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm text-gray-600">Online Now</p>
              <p className="text-2xl font-bold text-green-600">{onlineMembers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">Regions</p>
              <p className="text-2xl font-bold text-purple-600">{uniqueRegions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">Activity Rate</p>
              <p className="text-2xl font-bold text-orange-600">{activityRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, location, or interests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter by Region
        </Button>
      </div>

      {/* Map Display Panel */}
      <Card className="relative overflow-hidden bg-black rounded-lg shadow-2xl">
        <div className="relative h-96 md:h-[500px]">
          {/* Black and White Dot Map Background */}
          <div 
            className="absolute inset-0 bg-black"
            style={{
              backgroundImage: `
                radial-gradient(circle at 1px 1px, white 1px, transparent 0),
                radial-gradient(circle at 3px 3px, rgba(255,255,255,0.3) 0.5px, transparent 0)
              `,
              backgroundSize: '20px 20px, 40px 40px'
            }}
          >
            {/* Continent outlines using CSS patterns */}
            <div className="absolute inset-0 opacity-40">
              <svg className="w-full h-full" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <pattern id="dots" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="0.5" fill="white" opacity="0.8"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots)" opacity="0.2"/>
              </svg>
            </div>
          </div>

          {/* Member Location Pins */}
          {filteredLocations.map((member) => {
            const coords = convertToMapCoordinates(member.latitude, member.longitude);
            const pinSize = Math.max(8, Math.min(24, member.memberCount / 10 + 8));
            
            return (
              <div
                key={member.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{
                  left: `${coords.x}%`,
                  top: `${coords.y}%`,
                }}
                onMouseEnter={() => setHoveredMember(member)}
                onMouseLeave={() => setHoveredMember(null)}
              >
                <div
                  className={`rounded-full transition-all duration-300 group-hover:scale-150 ${
                    member.isOnline 
                      ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50 animate-pulse' 
                      : 'bg-violet-400 shadow-lg shadow-violet-400/30'
                  }`}
                  style={{
                    width: `${pinSize}px`,
                    height: `${pinSize}px`,
                  }}
                >
                  {member.isOnline && (
                    <div className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-75"></div>
                  )}
                </div>
                
                {/* Tooltip */}
                {hoveredMember?.id === member.id && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl p-3 min-w-48 z-10 border">
                    <div className="font-semibold text-gray-900">{member.name}</div>
                    <div className="text-sm text-gray-600">{member.city}, {member.country}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className={`w-2 h-2 rounded-full ${member.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="text-xs text-gray-500">
                        {member.isOnline ? 'Online' : `Last seen ${member.lastSeen}`}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button size="sm" className="w-full mt-2">
                      Connect
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Auto-rotate indicator */}
          {autoRotate && (
            <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-xs">
              Auto-rotating...
            </div>
          )}
        </div>
      </Card>

      {/* Connection Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch 
              checked={autoRotate}
              onCheckedChange={setAutoRotate}
              id="auto-rotate"
            />
            <label htmlFor="auto-rotate" className="text-sm font-medium">
              Auto-Rotate
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch 
              checked={showOnlyActive}
              onCheckedChange={setShowOnlyActive}
              id="active-only"
            />
            <label htmlFor="active-only" className="text-sm font-medium">
              Only Active Pins
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Sort By:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="most-active">Most Active</SelectItem>
              <SelectItem value="recently-joined">Recently Joined</SelectItem>
              <SelectItem value="nearby">Nearby</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mini Legend */}
      <Card className="p-4 bg-gray-50">
        <h3 className="font-semibold mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
            <span>Active Community</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
              <div className="w-3 h-3 bg-violet-400 rounded-full"></div>
              <div className="w-4 h-4 bg-violet-400 rounded-full"></div>
            </div>
            <span>Pin Size = Member Count</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3 text-gray-600" />
            <span>Hover for Details</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-black border border-white rounded-sm"></div>
            <span>Dot Map Background</span>
          </div>
        </div>
      </Card>

      {/* Mobile CTA */}
      <div className="md:hidden">
        <Button className="w-full" size="lg">
          📱 View Nearby Members
        </Button>
      </div>
    </div>
  );
};

export default GlobalCommunityNetwork;
