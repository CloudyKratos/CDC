
import { supabase } from "@/integrations/supabase/client";
import { ExtendedSpeakerRequest, ExtendedSpeakerRequestInsert } from "@/types/supabase-extended";

class StageSpeakerService {
  async getPendingSpeakerRequests(stageId: string): Promise<ExtendedSpeakerRequest[]> {
    console.log('Fetching pending speaker requests for stage:', stageId);
    
    const { data, error } = await supabase
      .from('speaker_requests')
      .select('*')
      .eq('stage_id', stageId)
      .eq('status', 'pending')
      .order('requested_at', { ascending: true });

    if (error) {
      console.error('Error fetching speaker requests:', error);
      throw new Error(`Failed to fetch speaker requests: ${error.message}`);
    }

    return (data || []) as ExtendedSpeakerRequest[];
  }

  async respondToSpeakerRequest(requestId: string, approved: boolean): Promise<boolean> {
    console.log('Responding to speaker request:', { requestId, approved });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const status = approved ? 'approved' : 'denied';
    
    const { error } = await supabase
      .from('speaker_requests')
      .update({
        status,
        responded_at: new Date().toISOString(),
        responded_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) {
      console.error('Error responding to speaker request:', error);
      throw new Error(`Failed to respond to speaker request: ${error.message}`);
    }

    // If approved, update the participant's role to speaker
    if (approved) {
      const { data: request } = await supabase
        .from('speaker_requests')
        .select('stage_id, user_id')
        .eq('id', requestId)
        .single();

      if (request) {
        await supabase
          .from('stage_participants')
          .update({ 
            role: 'speaker',
            is_muted: false,
            updated_at: new Date().toISOString()
          })
          .eq('stage_id', request.stage_id)
          .eq('user_id', request.user_id)
          .is('left_at', null);
      }
    }

    return true;
  }

  async createSpeakerRequest(stageId: string): Promise<ExtendedSpeakerRequest> {
    console.log('Creating speaker request for stage:', stageId);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const requestData: ExtendedSpeakerRequestInsert = {
      stage_id: stageId,
      user_id: user.id,
      status: 'pending',
      requested_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('speaker_requests')
      .insert(requestData)
      .select()
      .single();

    if (error) {
      console.error('Error creating speaker request:', error);
      throw new Error(`Failed to create speaker request: ${error.message}`);
    }

    return data as ExtendedSpeakerRequest;
  }

  subscribeToSpeakerRequests(stageId: string, callback: (payload: any) => void) {
    console.log('Setting up speaker requests subscription for stage:', stageId);
    
    const channel = supabase
      .channel(`speaker_requests_${stageId}`)
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

    return channel;
  }
}

export default new StageSpeakerService();
