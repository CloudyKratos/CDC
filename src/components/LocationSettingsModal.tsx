
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MapPin, Shield, Globe } from 'lucide-react';

interface LocationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LocationData {
  city?: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  is_location_visible: boolean;
}

const commonCountries = [
  { code: 'US', name: 'United States', lat: 39.8283, lng: -98.5795, timezone: 'America/New_York' },
  { code: 'CA', name: 'Canada', lat: 56.1304, lng: -106.3468, timezone: 'America/Toronto' },
  { code: 'GB', name: 'United Kingdom', lat: 55.3781, lng: -3.4360, timezone: 'Europe/London' },
  { code: 'DE', name: 'Germany', lat: 51.1657, lng: 10.4515, timezone: 'Europe/Berlin' },
  { code: 'FR', name: 'France', lat: 46.2276, lng: 2.2137, timezone: 'Europe/Paris' },
  { code: 'AU', name: 'Australia', lat: -25.2744, lng: 133.7751, timezone: 'Australia/Sydney' },
  { code: 'JP', name: 'Japan', lat: 36.2048, lng: 138.2529, timezone: 'Asia/Tokyo' },
  { code: 'IN', name: 'India', lat: 20.5937, lng: 78.9629, timezone: 'Asia/Kolkata' },
  { code: 'BR', name: 'Brazil', lat: -14.2350, lng: -51.9253, timezone: 'America/Sao_Paulo' },
  { code: 'MX', name: 'Mexico', lat: 23.6345, lng: -102.5528, timezone: 'America/Mexico_City' },
];

const LocationSettingsModal: React.FC<LocationSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [locationData, setLocationData] = useState<LocationData>({
    country: '',
    country_code: '',
    latitude: 0,
    longitude: 0,
    is_location_visible: false,
  });

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchUserLocation();
    }
  }, [isOpen, user?.id]);

  const fetchUserLocation = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('member_locations')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setLocationData({
          city: data.city || '',
          country: data.country,
          country_code: data.country_code,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone || '',
          is_location_visible: data.is_location_visible,
        });
      }
    } catch (error) {
      console.error('Error fetching user location:', error);
      toast.error('Failed to load location settings');
    }
  };

  const handleCountryChange = (countryCode: string) => {
    const country = commonCountries.find(c => c.code === countryCode);
    if (country) {
      setLocationData(prev => ({
        ...prev,
        country: country.name,
        country_code: country.code,
        latitude: country.lat,
        longitude: country.lng,
        timezone: country.timezone,
      }));
    }
  };

  const handleSave = async () => {
    if (!user?.id || !locationData.country) {
      toast.error('Please select a country');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('member_locations')
        .upsert({
          user_id: user.id,
          city: locationData.city || null,
          country: locationData.country,
          country_code: locationData.country_code,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          timezone: locationData.timezone || null,
          is_location_visible: locationData.is_location_visible,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Location settings saved successfully');
      onClose();
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error('Failed to save location settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Privacy First</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  We only show your approximate location (city/country level) and only when you choose to share it.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Select
                value={locationData.country_code}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {commonCountries.map(country => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {country.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City (Optional)</Label>
              <Input
                id="city"
                placeholder="Enter your city"
                value={locationData.city || ''}
                onChange={(e) => setLocationData(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="space-y-1">
                <div className="font-medium">Show on World Map</div>
                <div className="text-sm text-muted-foreground">
                  Make your location visible to other community members
                </div>
              </div>
              <Switch
                checked={locationData.is_location_visible}
                onCheckedChange={(checked) => 
                  setLocationData(prev => ({ ...prev, is_location_visible: checked }))
                }
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading} className="flex-1">
              {loading ? 'Saving...' : 'Save Location'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationSettingsModal;
