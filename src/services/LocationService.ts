
import { supabase } from '@/integrations/supabase/client';

export interface MemberLocationData {
  id?: string;
  user_id: string;
  city?: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  is_location_visible: boolean;
}

export interface OnlineStatusData {
  user_id: string;
  is_online: boolean;
  last_seen: string;
}

class LocationService {
  // Get all visible member locations with profiles and online status
  async getVisibleMemberLocations() {
    try {
      const { data, error } = await supabase
        .from('member_locations')
        .select(`
          *,
          profiles:user_id (
            full_name,
            username,
            avatar_url
          ),
          member_online_status:user_id (
            is_online,
            last_seen
          )
        `)
        .eq('is_location_visible', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching member locations:', error);
      throw error;
    }
  }

  // Update or create user location
  async updateUserLocation(locationData: Omit<MemberLocationData, 'id'>) {
    try {
      const { data, error } = await supabase
        .from('member_locations')
        .upsert({
          ...locationData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user location:', error);
      throw error;
    }
  }

  // Get user's current location settings
  async getUserLocation(userId: string) {
    try {
      const { data, error } = await supabase
        .from('member_locations')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user location:', error);
      throw error;
    }
  }

  // Update user online status
  async updateOnlineStatus(isOnline: boolean) {
    try {
      const { error } = await supabase.rpc('update_user_online_status', {
        is_online_param: isOnline
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating online status:', error);
      throw error;
    }
  }

  // Subscribe to location changes
  subscribeToLocationChanges(callback: () => void) {
    const channel = supabase
      .channel('location-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'member_locations'
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'member_online_status'
        },
        callback
      )
      .subscribe();

    return () => channel.unsubscribe();
  }

  // Calculate timezone difference
  static getTimeDifference(timezone: string): string {
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
  }

  // Format local time for timezone
  static formatLocalTime(timezone: string): string {
    try {
      const now = new Date();
      return now.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Unknown time';
    }
  }
}

export default new LocationService();
