
import { supabase } from "@/integrations/supabase/client";

class StageSubscriptionService {
  subscribeToStageUpdates(stageId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`stage-${stageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stages',
          filter: `id=eq.${stageId}`
        },
        callback
      )
      .subscribe();
  }

  subscribeToParticipants(stageId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel(`participants-${stageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stage_participants',
          filter: `stage_id=eq.${stageId}`
        },
        (payload) => {
          console.log('Participant change:', payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        console.log('Participant subscription status:', status);
      });

    return {
      unsubscribe: () => {
        console.log('Unsubscribing from participants channel');
        supabase.removeChannel(channel);
      }
    };
  }
}

export default new StageSubscriptionService();
