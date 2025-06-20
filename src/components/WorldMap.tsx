
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, Users, Clock, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import LocationService from '@/services/LocationService';

interface UserLocation {
  id: string;
  name: string;
  email: string;
  region?: string;
  timezone?: string;
  isOnline: boolean;
  lastSeen?: string;
  country?: string;
  city?: string;
}

const WorldMap: React.FC = () => {
  const [users, setUsers] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchUserLocations();
  }, []);

  const fetchUserLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🌍 Fetching member locations...');
      
      // Try to get real location data first
      const locationData = await LocationService.getVisibleMemberLocations();
      
      if (locationData && locationData.length > 0) {
        console.log('✅ Retrieved location data:', locationData.length, 'members');
        
        const userLocations: UserLocation[] = locationData.map((item: any) => ({
          id: item.id || Math.random().toString(),
          name: item.profiles?.full_name || item.profiles?.username || 'Anonymous User',
          email: item.profiles?.email || '',
          region: getRegionFromCountry(item.country),
          timezone: item.timezone || 'UTC',
          isOnline: item.member_online_status?.is_online || false,
          lastSeen: item.member_online_status?.last_seen,
          country: item.country,
          city: item.city
        }));
        
        setUsers(userLocations);
      } else {
        // Fallback to profiles if no location data
        console.log('📍 No location data found, falling back to profiles...');
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .limit(50);

        if (profilesError) {
          throw profilesError;
        }

        if (profiles && profiles.length > 0) {
          const userLocations: UserLocation[] = profiles.map((profile: any) => ({
            id: profile.id || Math.random().toString(),
            name: profile.full_name || profile.username || profile.email || 'Anonymous User',
            email: profile.email || '',
            region: 'Unknown',
            timezone: 'UTC',
            isOnline: Math.random() > 0.6, // Random online status for demo
            lastSeen: new Date().toISOString(),
            country: 'Unknown',
            city: 'Unknown'
          }));
          setUsers(userLocations);
        } else {
          // Final fallback to mock data
          console.log('📊 Using mock data for demonstration');
          setUsers(getMockUsers());
        }
      }
    } catch (error) {
      console.error('❌ Error fetching user locations:', error);
      setError(error instanceof Error ? error.message : 'Failed to load user locations');
      // Use mock data as fallback
      setUsers(getMockUsers());
    } finally {
      setLoading(false);
    }
  };

  const getRegionFromCountry = (country: string): string => {
    const regionMap: Record<string, string> = {
      'US': 'North America',
      'CA': 'North America',
      'MX': 'North America',
      'GB': 'Europe',
      'DE': 'Europe',
      'FR': 'Europe',
      'IT': 'Europe',
      'ES': 'Europe',
      'JP': 'Asia Pacific',
      'KR': 'Asia Pacific',
      'CN': 'Asia Pacific',
      'IN': 'Asia Pacific',
      'AU': 'Asia Pacific',
      'BR': 'South America',
      'AR': 'South America',
      'CL': 'South America',
      'ZA': 'Africa',
      'EG': 'Africa',
      'NG': 'Africa'
    };
    return regionMap[country] || 'Other';
  };

  const getMockUsers = (): UserLocation[] => [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      region: 'North America',
      timezone: 'America/New_York',
      isOnline: true,
      country: 'United States',
      city: 'New York'
    },
    {
      id: '2',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      region: 'Asia Pacific',
      timezone: 'Asia/Tokyo',
      isOnline: false,
      lastSeen: '2 hours ago',
      country: 'Japan',
      city: 'Tokyo'
    },
    {
      id: '3',
      name: 'Alex Mueller',
      email: 'alex@example.com',
      region: 'Europe',
      timezone: 'Europe/Berlin',
      isOnline: true,
      country: 'Germany',
      city: 'Berlin'
    },
    {
      id: '4',
      name: 'Maria Garcia',
      email: 'maria@example.com',
      region: 'South America',
      timezone: 'America/Sao_Paulo',
      isOnline: false,
      lastSeen: '1 day ago',
      country: 'Brazil',
      city: 'São Paulo'
    },
    {
      id: '5',
      name: 'David Kim',
      email: 'david@example.com',
      region: 'Asia Pacific',
      timezone: 'Asia/Seoul',
      isOnline: true,
      country: 'South Korea',
      city: 'Seoul'
    },
    {
      id: '6',
      name: 'Emma Wilson',
      email: 'emma@example.com',
      region: 'Europe',
      timezone: 'Europe/London',
      isOnline: true,
      country: 'United Kingdom',
      city: 'London'
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

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchUserLocations();
  };

  const onlineUsers = users.filter(user => user.isOnline);
  const regionStats = getRegionStats();

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="h-6 w-6 text-blue-500 animate-spin" />
          <h2 className="text-2xl font-bold">Loading Global Community...</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Globe className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Global Community</h2>
        </div>
        
        {error && (
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Connection Issues
            </Badge>
            <Button
              onClick={handleRetry}
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-yellow-800 text-sm">
              <strong>Notice:</strong> {error}. Showing demonstration data below.
            </p>
          </CardContent>
        </Card>
      )}

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
              <div key={stat.region} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
            Currently Online ({onlineUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {onlineUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No members currently online</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {onlineUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{user.city || 'Unknown'}</span>
                      {user.region && (
                        <>
                          <span>•</span>
                          <span>{user.region}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.slice(0, 5).map((user, index) => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{user.name}</span> 
                    {user.isOnline ? (
                      <span className="text-green-600"> is online</span>
                    ) : (
                      <span className="text-gray-500"> was last seen {user.lastSeen || 'recently'}</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">{user.city}, {user.region}</p>
                </div>
                <Badge variant={user.isOnline ? "default" : "secondary"}>
                  {user.isOnline ? "Online" : "Offline"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorldMap;
