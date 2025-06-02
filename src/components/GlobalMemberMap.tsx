
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Search, Settings } from 'lucide-react';
import LocationService from '@/services/LocationService';
import { useAuth } from '@/contexts/AuthContext';

const GlobalMemberMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [memberLocations, setMemberLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Check if we have a stored token or use a default
    const storedToken = localStorage.getItem('mapbox_token');
    if (storedToken) {
      setMapboxToken(storedToken);
      initializeMap(storedToken);
    } else {
      setShowTokenInput(true);
      setLoading(false);
    }

    // Load member locations
    loadMemberLocations();
  }, []);

  const loadMemberLocations = async () => {
    try {
      const locations = await LocationService.getVisibleMemberLocations();
      setMemberLocations(locations);
    } catch (error) {
      console.error('Error loading member locations:', error);
      // Use mock data for demonstration
      setMemberLocations(getMockLocations());
    }
  };

  const getMockLocations = () => [
    {
      id: '1',
      user_id: '1',
      latitude: 40.7128,
      longitude: -74.0060,
      city: 'New York',
      country: 'United States',
      country_code: 'US',
      timezone: 'America/New_York',
      profiles: { full_name: 'John Doe', username: 'johndoe' },
      member_online_status: { is_online: true }
    },
    {
      id: '2',
      user_id: '2',
      latitude: 51.5074,
      longitude: -0.1278,
      city: 'London',
      country: 'United Kingdom',
      country_code: 'GB',
      timezone: 'Europe/London',
      profiles: { full_name: 'Sarah Chen', username: 'sarahc' },
      member_online_status: { is_online: false }
    },
    {
      id: '3',
      user_id: '3',
      latitude: 35.6762,
      longitude: 139.6503,
      city: 'Tokyo',
      country: 'Japan',
      country_code: 'JP',
      timezone: 'Asia/Tokyo',
      profiles: { full_name: 'Kenji Tanaka', username: 'kenji' },
      member_online_status: { is_online: true }
    },
    {
      id: '4',
      user_id: '4',
      latitude: -33.8688,
      longitude: 151.2093,
      city: 'Sydney',
      country: 'Australia',
      country_code: 'AU',
      timezone: 'Australia/Sydney',
      profiles: { full_name: 'Emma Wilson', username: 'emmaw' },
      member_online_status: { is_online: true }
    },
    {
      id: '5',
      user_id: '5',
      latitude: 55.7558,
      longitude: 37.6173,
      city: 'Moscow',
      country: 'Russia',
      country_code: 'RU',
      timezone: 'Europe/Moscow',
      profiles: { full_name: 'Alex Petrov', username: 'alexp' },
      member_online_status: { is_online: false }
    }
  ];

  const initializeMap = (token: string) => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      projection: 'globe' as any,
      zoom: 1.5,
      center: [20, 20],
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
        color: 'rgb(30, 30, 50)',
        'high-color': 'rgb(50, 50, 80)',
        'horizon-blend': 0.3,
      });

      // Add member location markers
      addMemberMarkers();
    });

    setLoading(false);
  };

  const addMemberMarkers = () => {
    if (!map.current) return;

    memberLocations.forEach((location) => {
      // Create custom marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'member-marker';
      markerEl.style.cssText = `
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid white;
        background-color: ${location.member_online_status?.is_online ? '#22c55e' : '#6b7280'};
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        transition: all 0.2s ease;
      `;

      // Add hover effect
      markerEl.addEventListener('mouseenter', () => {
        markerEl.style.transform = 'scale(1.5)';
        markerEl.style.zIndex = '1000';
      });

      markerEl.addEventListener('mouseleave', () => {
        markerEl.style.transform = 'scale(1)';
        markerEl.style.zIndex = '1';
      });

      // Create popup with member info
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-3 min-w-[200px]">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span class="text-white font-semibold text-xs">
                ${(location.profiles?.full_name || location.profiles?.username || 'Unknown').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p class="font-semibold text-gray-900">${location.profiles?.full_name || 'Unknown Member'}</p>
              <p class="text-xs text-gray-500">@${location.profiles?.username || 'unknown'}</p>
            </div>
          </div>
          <div class="space-y-1 text-sm">
            <p><strong>📍 Location:</strong> ${location.city || 'Unknown'}, ${location.country}</p>
            <p><strong>🕐 Local Time:</strong> ${LocationService.formatLocalTime(location.timezone || 'UTC')}</p>
            <p><strong>📊 Status:</strong> 
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs ${
                location.member_online_status?.is_online 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }">
                ${location.member_online_status?.is_online ? '🟢 Online' : '⚫ Offline'}
              </span>
            </p>
          </div>
        </div>
      `);

      // Add marker to map
      new mapboxgl.Marker(markerEl)
        .setLngLat([location.longitude, location.latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });
  };

  const handleTokenSubmit = () => {
    if (mapboxToken) {
      localStorage.setItem('mapbox_token', mapboxToken);
      setShowTokenInput(false);
      initializeMap(mapboxToken);
    }
  };

  const onlineMembers = memberLocations.filter(loc => loc.member_online_status?.is_online);
  const totalMembers = memberLocations.length;

  if (showTokenInput) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            Global Member Map
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">Enter your Mapbox public token to display the global map</p>
            <p className="text-xs text-gray-500">
              Get your token at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">mapbox.com</a>
            </p>
          </div>
          <div className="flex gap-2 w-full max-w-md">
            <Input
              type="password"
              placeholder="pk.eyJ1Ijoi..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleTokenSubmit} disabled={!mapboxToken}>
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Locations</p>
                <p className="text-2xl font-bold text-blue-600">{totalMembers}</p>
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
                <p className="text-2xl font-bold text-green-600">{onlineMembers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Countries</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(memberLocations.map(loc => loc.country)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Map */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            Global Member Locations
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-600">
              🟢 {onlineMembers.length} Online
            </Badge>
            <Badge variant="outline" className="text-gray-600">
              ⚫ {totalMembers - onlineMembers.length} Offline
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowTokenInput(true)}
              className="h-8 w-8"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="h-96 flex items-center justify-center bg-gray-50">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm text-gray-600">Loading global map...</p>
              </div>
            </div>
          ) : (
            <div ref={mapContainer} className="h-96 w-full" />
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Online Members</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span>Offline Members</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span>Click pins for member details</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalMemberMap;
