
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface MemberLocation {
  id: string;
  user_id: string;
  city?: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  is_location_visible: boolean;
  profiles?: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
  member_online_status?: {
    is_online: boolean;
    last_seen: string;
  };
}

const WorldMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const { user } = useAuth();
  
  const [locations, setLocations] = useState<MemberLocation[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberLocation | null>(null);
  const [showLocationSettings, setShowLocationSettings] = useState(false);
  const [mapboxToken, setMapboxToken] = useState('');

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      projection: 'globe',
      zoom: 1.5,
      center: [30, 15],
      pitch: 0,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add atmosphere and fog effects
    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(255, 255, 255)',
        'high-color': 'rgb(200, 200, 225)',
        'horizon-blend': 0.2,
      });
    });

    // Cleanup
    return () => {
      Object.values(markersRef.current).forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, [mapboxToken]);

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
    }, 30000); // Every 30 seconds

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

  useEffect(() => {
    if (map.current && locations.length > 0) {
      updateMapMarkers();
    }
  }, [locations]);

  const fetchMemberLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('member_locations')
        .select(`
          *,
          profiles!member_locations_user_id_fkey (
            full_name,
            username,
            avatar_url
          ),
          member_online_status!member_online_status_user_id_fkey (
            is_online,
            last_seen
          )
        `)
        .eq('is_location_visible', true);

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching member locations:', error);
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

  const updateMapMarkers = () => {
    if (!map.current) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add new markers
    locations.forEach(location => {
      if (location.latitude && location.longitude) {
        const isOnline = location.member_online_status?.is_online || false;
        
        // Create marker element
        const markerEl = document.createElement('div');
        markerEl.className = 'member-location-marker';
        markerEl.style.width = '20px';
        markerEl.style.height = '20px';
        markerEl.style.borderRadius = '50%';
        markerEl.style.border = '3px solid white';
        markerEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        markerEl.style.cursor = 'pointer';
        markerEl.style.backgroundColor = isOnline ? '#10b981' : '#6b7280';
        
        if (isOnline) {
          markerEl.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.6), 0 2px 4px rgba(0,0,0,0.3)';
        }

        // Create marker
        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat([location.longitude, location.latitude])
          .addTo(map.current!);

        // Add click handler
        markerEl.addEventListener('click', () => {
          setSelectedMember(location);
        });

        markersRef.current[location.id] = marker;
      }
    });
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

  if (!mapboxToken) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mapbox Token Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please enter your Mapbox public token to display the world map.
            </p>
            <input
              type="text"
              placeholder="pk.eyJ1IjoieW91cnVzZXIi..."
              className="w-full px-3 py-2 border rounded-md"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get your token from{' '}
              <a 
                href="https://mapbox.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                mapbox.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-500" />
          <h2 className="font-semibold">Member World Map</h2>
          <Badge variant="secondary">{locations.length} members</Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLocationSettings(true)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Location Settings
        </Button>
      </div>

      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {selectedMember && (
          <div className="absolute top-4 left-4 w-80 z-10">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {selectedMember.profiles?.full_name?.charAt(0) || 
                         selectedMember.profiles?.username?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {selectedMember.profiles?.full_name || 
                         selectedMember.profiles?.username || 'Member'}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={selectedMember.member_online_status?.is_online ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {selectedMember.member_online_status?.is_online ? 'Online' : 'Offline'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMember(null)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {selectedMember.city && `${selectedMember.city}, `}
                      {selectedMember.country}
                    </span>
                  </div>
                  {selectedMember.timezone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
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
          </div>
        )}
      </div>

      <div className="p-4 bg-muted/50 border-t">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg"></div>
              <span>Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span>Offline</span>
            </div>
          </div>
          <span>Click pins to view member details</span>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
