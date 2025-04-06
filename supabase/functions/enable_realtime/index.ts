
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // We'll accept either an object with table_name or a simple string
    let tableName: string;
    
    try {
      const body = await req.json();
      tableName = body.table_name || 'messages';  // Default to 'messages' if not specified
    } catch (e) {
      tableName = 'messages'; // If parsing fails, use default
    }

    if (!tableName) {
      throw new Error('Table name is required');
    }

    // Unfortunately we can't easily set REPLICA IDENTITY to FULL via RPC
    // So this function is limited to just adding the table to the publication
    const { data, error } = await supabaseClient
      .rpc('add_table_to_publication', { table_name: tableName });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, message: `Table ${tableName} added to publication` }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    );
  }
});
