
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type SpeakerRequest = Database['public']['Tables']['speaker_requests']['Row'];

class StageSpeakerService {
  async getPendingSpeakerRequests(stageId: string): Promise<SpeakerRequest[]> {
    try {
      const { data, error } = await supabase
        .from('speaker_requests')
        .select('*')
        .eq('stage_id', stageId)
        .eq('status', 'pending')
        .order('requested_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching speaker requests:', error);
      return [];
    }
  }

  async respondToSpeakerRequest(requestId: string, approved: boolean): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const status = approved ? 'approved' : 'denied';
      
      const { error } = await supabase
        .from('speaker_requests')
        .update({ 
          status: status as Database['public']['Enums']['speaker_request_status'],
          responded_at: new Date().toISOString(),
          responded_by: user.id
        })
        .eq('id', requestId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error responding to speaker request:', error);
      return false;
    }
  }

  subscribeToSpeakerRequests(stageId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`speaker-requests-${stageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'speaker_requests',
          filter: `stage_id=eq.${stageId}`
        },
        callback
      )
      .subscribe();
  }
}

export default new StageSpeakerService();
