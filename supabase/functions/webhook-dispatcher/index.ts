
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  event_type: string;
  channel_id: string;
  data: any;
  timestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const payload: WebhookPayload = await req.json();
    console.log('Webhook payload received:', payload);

    // Get all active webhooks for this channel and event type
    const { data: webhooks, error: webhooksError } = await supabaseClient
      .from('webhooks')
      .select('*')
      .eq('channel_id', payload.channel_id)
      .eq('is_active', true)
      .contains('events', [payload.event_type]);

    if (webhooksError) {
      console.error('Error fetching webhooks:', webhooksError);
      throw webhooksError;
    }

    console.log(`Found ${webhooks?.length || 0} matching webhooks`);

    // Dispatch to all matching webhooks
    const dispatchPromises = (webhooks || []).map(async (webhook) => {
      try {
        console.log(`Dispatching to webhook: ${webhook.name} (${webhook.url})`);
        
        // Prepare webhook payload
        const webhookPayload = {
          event: payload.event_type,
          channel_id: payload.channel_id,
          data: payload.data,
          timestamp: payload.timestamp,
          webhook_id: webhook.id
        };

        // Add signature if secret key is provided
        let headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'Community-Webhook/1.0'
        };

        if (webhook.secret_key) {
          // Create HMAC signature
          const encoder = new TextEncoder();
          const keyData = encoder.encode(webhook.secret_key);
          const payloadData = encoder.encode(JSON.stringify(webhookPayload));
          
          const key = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
          );
          
          const signature = await crypto.subtle.sign('HMAC', key, payloadData);
          const signatureHex = Array.from(new Uint8Array(signature))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
          
          headers['X-Webhook-Signature'] = `sha256=${signatureHex}`;
        }

        // Make the webhook request
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers,
          body: JSON.stringify(webhookPayload),
        });

        // Log the webhook call
        const logData = {
          webhook_id: webhook.id,
          event_type: payload.event_type,
          payload: webhookPayload,
          response_status: response.status,
          response_body: response.status >= 400 ? await response.text() : null,
        };

        await supabaseClient
          .from('webhook_logs')
          .insert(logData);

        // Update last triggered timestamp
        await supabaseClient
          .from('webhooks')
          .update({ last_triggered_at: new Date().toISOString() })
          .eq('id', webhook.id);

        console.log(`Webhook ${webhook.name} responded with status: ${response.status}`);
        
        return { webhook: webhook.name, status: response.status };
      } catch (error) {
        console.error(`Error dispatching to webhook ${webhook.name}:`, error);
        
        // Log the error
        await supabaseClient
          .from('webhook_logs')
          .insert({
            webhook_id: webhook.id,
            event_type: payload.event_type,
            payload: payload,
            response_status: 0,
            response_body: error.message,
          });

        return { webhook: webhook.name, error: error.message };
      }
    });

    const results = await Promise.all(dispatchPromises);
    
    console.log('Webhook dispatch results:', results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        dispatched: results.length,
        results 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Webhook dispatcher error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
