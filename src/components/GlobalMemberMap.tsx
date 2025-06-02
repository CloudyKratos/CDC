import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Users, MapPin, Clock } from 'lucide-react';
import LocationService from '@/services/LocationService';

interface MemberLocation {
  id: string;
  country: string;
  city: string;
  timezone: string;
  latitude: number;
  longitude: number;
  memberCount: number;
}

const GlobalMemberMap = () => {
  const [memberLocations, setMemberLocations] = useState<MemberLocation[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMemberLocations();
  }, []);

  const loadMemberLocations = async () => {
    try {
      setIsLoading(true);
      const locations = await LocationService.getVisibleMemberLocations();
      
      // Group by country and city to get member counts
      const locationMap = new Map<string, MemberLocation>();
      
      locations.forEach(location => {
        const key = `${location.country}-${location.city || 'Unknown'}`;
        const existing = locationMap.get(key);
        
        if (existing) {
          existing.memberCount += 1;
        } else {
          locationMap.set(key, {
            id: location.id || location.user_id,
            country: location.country,
            city: location.city || 'Unknown',
            timezone: location.timezone || 'UTC',
            latitude: location.latitude || 0,
            longitude: location.longitude || 0,
            memberCount: 1
          });
        }
      });
      
      const groupedLocations = Array.from(locationMap.values());
      setMemberLocations(groupedLocations);
      setTotalMembers(locations.length);
    } catch (error) {
      console.error('Error loading member locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTopCountries = () => {
    const countryMap = new Map<string, number>();
    
    memberLocations.forEach(location => {
      const existing = countryMap.get(location.country) || 0;
      countryMap.set(location.country, existing + location.memberCount);
    });
    
    return Array.from(countryMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  const formatLocalTime = (timezone: string) => {
    try {
      return new Date().toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour12: true,
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{totalMembers}</p>
                <p className="text-sm text-gray-600">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{getTopCountries().length}</p>
                <p className="text-sm text-gray-600">Countries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{memberLocations.length}</p>
                <p className="text-sm text-gray-600">Cities</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Countries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Top Countries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getTopCountries().map(([country, count], index) => (
              <div key={country} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <span className="font-medium">{country}</span>
                </div>
                <Badge className="bg-blue-500">
                  {count} member{count !== 1 ? 's' : ''}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Member Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Member Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {memberLocations.map((location) => (
              <div key={location.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{location.city}, {location.country}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-3 w-3" />
                      <span>{formatLocalTime(location.timezone)}</span>
                    </div>
                  </div>
                </div>
                <Badge className="bg-green-500">
                  {location.memberCount} member{location.memberCount !== 1 ? 's' : ''}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalMemberMap;
