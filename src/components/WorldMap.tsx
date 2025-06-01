
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Settings, Globe, Users } from 'lucide-react';
import { toast } from 'sonner';

interface MemberLocation {
  id: string;
  user_id: string;
  region?: string;
  timezone?: string;
  is_location_visible: boolean;
  profile?: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
  online_status?: {
    is_online: boolean;
    last_seen: string;
  };
}

const WorldMap: React.FC = () => {
  const { user } = useAuth();
  const [locations, setLocations] = useState<MemberLocation[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberLocation | null>(null);
  const [showLocationSettings, setShowLocationSettings] = useState(false);

  // Sample regions for visual representation
  const regions = [
    { name: 'North America', coords: { x: 20, y: 30 }, members: [] as MemberLocation[] },
    { name: 'South America', coords: { x: 30, y: 60 }, members: [] as MemberLocation[] },
    { name: 'Europe', coords: { x: 50, y: 25 }, members: [] as MemberLocation[] },
    { name: 'Africa', coords: { x: 52, y: 50 }, members: [] as MemberLocation[] },
    { name: 'Asia', coords: { x: 70, y: 30 }, members: [] as MemberLocation[] },
    { name: 'Oceania', coords: { x: 80, y: 70 }, members: [] as MemberLocation[] },
  ];

  useEffect(() => {
    fetchMemberLocations();
    updateUserOnlineStatus(true);

    // Set up realtime subscriptions
    const locationsChannel = supabase
      .channel('member-locations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'member_locations'
        },
        () => fetchMemberLocations()
      )
      .subscribe();

    const statusChannel = supabase
      .channel('member-status-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'member_online_status'
        },
        () => fetchMemberLocations()
      )
      .subscribe();

    // Update online status periodically
    const statusInterval = setInterval(() => {
      updateUserOnlineStatus(true);
    }, 30000);

    // Handle page unload
    const handleUnload = () => {
      updateUserOnlineStatus(false);
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      locationsChannel.unsubscribe();
      statusChannel.unsubscribe();
      clearInterval(statusInterval);
      window.removeEventListener('beforeunload', handleUnload);
      updateUserOnlineStatus(false);
    };
  }, []);

  const fetchMemberLocations = async () => {
    try {
      const { data: locationData, error: locationError } = await supabase
        .from('member_locations')
        .select(`
          id,
          user_id,
          region,
          timezone,
          is_location_visible,
          profiles!member_locations_user_id_fkey (
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('is_location_visible', true);

      if (locationError) throw locationError;

      if (!locationData || locationData.length === 0) {
        setLocations([]);
        return;
      }

      // Get online status
      const userIds = locationData.map(loc => loc.user_id);
      const { data: statusData, error: statusError } = await supabase
        .from('member_online_status')
        .select('user_id, is_online, last_seen')
        .in('user_id', userIds);

      if (statusError) {
        console.error('Error fetching status:', statusError);
      }

      // Combine the data
      const combinedData: MemberLocation[] = locationData.map(location => ({
        ...location,
        profile: location.profiles,
        online_status: statusData?.find(s => s.user_id === location.user_id),
      }));

      setLocations(combinedData);
    } catch (error) {
      console.error('Error fetching member locations:', error);
      toast.error('Failed to load member locations');
    }
  };

  const updateUserOnlineStatus = async (isOnline: boolean) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase.rpc('update_user_online_status', {
        is_online_param: isOnline
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  const formatLocalTime = (timezone?: string) => {
    if (!timezone) return 'Unknown time';
    
    try {
      const now = new Date();
      const localTime = now.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      return localTime;
    } catch {
      return 'Unknown time';
    }
  };

  const getTimeDifference = (timezone?: string) => {
    if (!timezone) return '';
    
    try {
      const now = new Date();
      const userOffset = now.getTimezoneOffset();
      const targetDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
      const targetOffset = (now.getTime() - targetDate.getTime()) / (1000 * 60);
      const diffHours = Math.round((targetOffset - userOffset) / 60);
      
      if (diffHours === 0) return 'Same timezone';
      return diffHours > 0 ? `+${diffHours}h` : `${diffHours}h`;
    } catch {
      return '';
    }
  };

  // Group members by region
  const groupedRegions = regions.map(region => ({
    ...region,
    members: locations.filter(loc => loc.region === region.name)
  }));

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center justify-between p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Member World Map
            </h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="h-4 w-4" />
              {locations.length} members worldwide
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLocationSettings(true)}
          className="transition-all duration-200 hover:scale-105"
        >
          <Settings className="h-4 w-4 mr-2" />
          Location Settings
        </Button>
      </div>

      <div className="flex-1 p-6">
        {/* World Map Visualization */}
        <div className="relative w-full h-96 bg-gradient-to-b from-sky-200 to-blue-300 dark:from-gray-700 dark:to-gray-800 rounded-2xl overflow-hidden shadow-xl mb-6">
          {/* Simplified world map background */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-200 via-yellow-100 to-green-200 dark:from-gray-600 dark:via-gray-700 dark:to-gray-600 opacity-60">
            {/* Continent shapes (simplified) */}
            <div className="absolute top-8 left-8 w-32 h-24 bg-green-400 dark:bg-gray-500 rounded-tl-3xl rounded-br-3xl opacity-70"></div>
            <div className="absolute top-16 left-40 w-28 h-20 bg-green-400 dark:bg-gray-500 rounded-2xl opacity-70"></div>
            <div className="absolute top-6 left-96 w-40 h-32 bg-green-400 dark:bg-gray-500 rounded-3xl opacity-70"></div>
            <div className="absolute top-32 left-96 w-24 h-40 bg-green-400 dark:bg-gray-500 rounded-2xl opacity-70"></div>
            <div className="absolute top-12 right-32 w-48 h-28 bg-green-400 dark:bg-gray-500 rounded-3xl opacity-70"></div>
            <div className="absolute bottom-16 right-16 w-20 h-16 bg-green-400 dark:bg-gray-500 rounded-full opacity-70"></div>
          </div>

          {/* Region markers */}
          {groupedRegions.map(region => (
            <div
              key={region.name}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-125 ${
                region.members.length > 0 ? 'animate-pulse' : ''
              }`}
              style={{ left: `${region.coords.x}%`, top: `${region.coords.y}%` }}
              onClick={() => region.members.length > 0 && setSelectedMember(region.members[0])}
            >
              <div className={`w-6 h-6 rounded-full border-3 border-white shadow-lg ${
                region.members.some(m => m.online_status?.is_online) 
                  ? 'bg-green-500 shadow-green-400' 
                  : region.members.length > 0 
                    ? 'bg-blue-500 shadow-blue-400' 
                    : 'bg-gray-400'
              }`}>
                {region.members.length > 0 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {region.members.length}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Member Details */}
        {selectedMember && (
          <Card className="mb-6 border-2 border-blue-200 dark:border-blue-800 shadow-xl animate-fade-in">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">
                      {selectedMember.profile?.full_name?.charAt(0) || 
                       selectedMember.profile?.username?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      {selectedMember.profile?.full_name || 
                       selectedMember.profile?.username || 'Member'}
                    </h3>
                    <Badge 
                      variant={selectedMember.online_status?.is_online ? "default" : "secondary"}
                      className="mt-1"
                    >
                      {selectedMember.online_status?.is_online ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMember(null)}
                  className="hover:bg-red-100 hover:text-red-600"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span>{selectedMember.region || 'Unknown region'}</span>
                </div>
                {selectedMember.timezone && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span>
                      {formatLocalTime(selectedMember.timezone)}
                      <span className="text-muted-foreground ml-1">
                        ({getTimeDifference(selectedMember.timezone)})
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Regions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupedRegions.map(region => (
            <Card 
              key={region.name} 
              className={`transition-all duration-200 hover:scale-105 cursor-pointer ${
                region.members.length > 0 
                  ? 'border-blue-200 dark:border-blue-800 hover:shadow-lg' 
                  : 'opacity-60'
              }`}
              onClick={() => region.members.length > 0 && setSelectedMember(region.members[0])}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  {region.name}
                  <Badge variant="outline">{region.members.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {region.members.length > 0 ? (
                  <div className="space-y-2">
                    {region.members.slice(0, 3).map(member => (
                      <div key={member.id} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          member.online_status?.is_online ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        <span className="text-sm">
                          {member.profile?.full_name || member.profile?.username || 'Member'}
                        </span>
                      </div>
                    ))}
                    {region.members.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{region.members.length - 3} more
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No members in this region</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg animate-pulse"></div>
              <span>Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span>Offline</span>
            </div>
          </div>
          <span>Click region cards or map markers to view member details</span>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
