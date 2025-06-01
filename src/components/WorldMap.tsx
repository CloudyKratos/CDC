
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Users, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserLocation {
  id: string;
  name: string;
  email: string;
  region?: string;
  timezone?: string;
  isOnline: boolean;
  lastSeen?: string;
}

const WorldMap: React.FC = () => {
  const [users, setUsers] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserLocations();
  }, []);

  const fetchUserLocations = async () => {
    try {
      // First, let's try to get users from profiles table
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.error('Error fetching profiles:', error);
        // Fallback to mock data if profiles table doesn't exist or has issues
        setUsers(getMockUsers());
      } else {
        // Transform profiles data to our UserLocation format
        const userLocations: UserLocation[] = (profiles || []).map((profile: any) => ({
          id: profile.id || Math.random().toString(),
          name: profile.name || profile.email || 'Unknown User',
          email: profile.email || '',
          region: profile.region || 'Unknown',
          timezone: profile.timezone || 'UTC',
          isOnline: Math.random() > 0.5, // Random online status for now
          lastSeen: new Date().toISOString()
        }));
        setUsers(userLocations);
      }
    } catch (error) {
      console.error('Error in fetchUserLocations:', error);
      setUsers(getMockUsers());
    } finally {
      setLoading(false);
    }
  };

  const getMockUsers = (): UserLocation[] => [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      region: 'North America',
      timezone: 'EST',
      isOnline: true
    },
    {
      id: '2',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      region: 'Asia Pacific',
      timezone: 'JST',
      isOnline: false,
      lastSeen: '2 hours ago'
    },
    {
      id: '3',
      name: 'Alex Mueller',
      email: 'alex@example.com',
      region: 'Europe',
      timezone: 'CET',
      isOnline: true
    },
    {
      id: '4',
      name: 'Maria Garcia',
      email: 'maria@example.com',
      region: 'South America',
      timezone: 'BRT',
      isOnline: false,
      lastSeen: '1 day ago'
    },
    {
      id: '5',
      name: 'David Kim',
      email: 'david@example.com',
      region: 'Asia Pacific',
      timezone: 'KST',
      isOnline: true
    }
  ];

  const getRegionStats = () => {
    const regionCounts = users.reduce((acc, user) => {
      const region = user.region || 'Unknown';
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(regionCounts).map(([region, count]) => ({
      region,
      count,
      online: users.filter(u => u.region === region && u.isOnline).length
    }));
  };

  const onlineUsers = users.filter(user => user.isOnline);
  const regionStats = getRegionStats();

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold">World Map</h2>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-20 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="h-6 w-6 text-blue-500" />
        <h2 className="text-2xl font-bold">Global Community</h2>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-blue-600">{users.length}</p>
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
                <p className="text-2xl font-bold text-green-600">{onlineUsers.length}</p>
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
                <p className="text-2xl font-bold text-purple-600">{regionStats.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Regional Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {regionStats.map((stat, index) => (
              <div key={stat.region} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-purple-500' :
                    index === 3 ? 'bg-orange-500' : 'bg-pink-500'
                  }`}></div>
                  <span className="font-medium">{stat.region}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{stat.count} members</Badge>
                  <Badge variant="outline" className="text-green-600">
                    {stat.online} online
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Online Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            Currently Online
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {onlineUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user.name}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{user.timezone}</span>
                    <span>•</span>
                    <span>{user.region}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorldMap;
