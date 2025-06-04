
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Users, MapPin, Activity, Search, Filter } from 'lucide-react';

interface MemberLocation {
  id: string;
  name: string;
  country: string;
  region: string;
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
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [sortBy, setSortBy] = useState('most-active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  const mockData: MemberLocation[] = [
    {
      id: '1',
      name: 'North America',
      country: 'United States',
      region: 'North America',
      latitude: 39.8283,
      longitude: -98.5795,
      isOnline: true,
      lastSeen: 'now',
      tags: ['Tech', 'Business', 'Innovation'],
      memberCount: 89
    },
    {
      id: '2',
      name: 'Europe',
      country: 'Germany',
      region: 'Europe',
      latitude: 51.1657,
      longitude: 10.4515,
      isOnline: true,
      lastSeen: 'now',
      tags: ['Finance', 'Startup', 'AI'],
      memberCount: 67
    },
    {
      id: '3',
      name: 'Asia Pacific',
      country: 'Singapore',
      region: 'Asia Pacific',
      latitude: 1.3521,
      longitude: 103.8198,
      isOnline: true,
      lastSeen: 'now',
      tags: ['Tech', 'Innovation', 'Growth'],
      memberCount: 156
    },
    {
      id: '4',
      name: 'South America',
      country: 'Brazil',
      region: 'South America',
      latitude: -14.2350,
      longitude: -51.9253,
      isOnline: false,
      lastSeen: '2 hours ago',
      tags: ['Marketing', 'Social', 'Community'],
      memberCount: 31
    },
    {
      id: '5',
      name: 'Middle East & Africa',
      country: 'UAE',
      region: 'Middle East & Africa',
      latitude: 23.4241,
      longitude: 53.8478,
      isOnline: true,
      lastSeen: 'now',
      tags: ['Business', 'Investment', 'Strategy'],
      memberCount: 43
    },
    {
      id: '6',
      name: 'Oceania',
      country: 'Australia',
      region: 'Oceania',
      latitude: -25.2744,
      longitude: 133.7751,
      isOnline: false,
      lastSeen: '1 hour ago',
      tags: ['Tech', 'Environment', 'Innovation'],
      memberCount: 24
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
        member.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        filtered.sort((a, b) => a.region.localeCompare(b.region));
        break;
      case 'nearby':
        filtered.sort((a, b) => a.latitude - b.latitude);
        break;
    }

    setFilteredLocations(filtered);
  }, [memberLocations, showOnlyActive, searchTerm, sortBy]);

  const totalMembers = memberLocations.reduce((sum, loc) => sum + loc.memberCount, 0);
  const onlineMembers = memberLocations.filter(loc => loc.isOnline).reduce((sum, loc) => sum + loc.memberCount, 0);
  const uniqueRegions = memberLocations.length;
  const activityRate = Math.round((onlineMembers / totalMembers) * 100);

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
      <div className="flex flex-col space-y-2">
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
            placeholder="Search by region, country, or interests..."
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

      {/* Simple World Map - Regional Cards */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-500" />
          Regional Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLocations.map((location) => (
            <Card 
              key={location.id} 
              className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedRegion === location.region ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedRegion(selectedRegion === location.region ? null : location.region)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${
                    location.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`}></div>
                  <h4 className="font-semibold text-gray-900">{location.region}</h4>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {location.memberCount} members
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="h-3 w-3" />
                  <span>{location.country}</span>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Activity className="h-3 w-3" />
                  <span>{location.isOnline ? 'Active now' : `Last seen ${location.lastSeen}`}</span>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {location.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <Button size="sm" className="w-full mt-3" variant={location.isOnline ? "default" : "outline"}>
                  {location.isOnline ? 'Connect Now' : 'View Members'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Connection Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch 
              checked={showOnlyActive}
              onCheckedChange={setShowOnlyActive}
              id="active-only"
            />
            <label htmlFor="active-only" className="text-sm font-medium">
              Only Active Regions
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
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span>Active Region</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span>Inactive Region</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-3 w-3 text-gray-600" />
            <span>Click to View Members</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3 text-gray-600" />
            <span>Regional Activity</span>
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
