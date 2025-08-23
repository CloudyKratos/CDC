import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { message_id, channel_id, sender_id, content, created_at } = await req.json();

    console.log(`🔍 Parsing mentions for message: ${message_id}`);

    // Extract @username mentions using regex
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      const username = match[1];
      mentions.push(username);
    }

    console.log(`📝 Found mentions: ${mentions.join(', ')}`);

    if (mentions.length === 0) {
      console.log('✅ No mentions found, returning');
      return new Response(
        JSON.stringify({ success: true, mentions_count: 0 }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Look up user IDs by username
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username')
      .in('username', mentions);

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      throw profilesError;
    }

    console.log(`👥 Found ${profiles?.length || 0} matching users`);

    // Insert mentions into message_mentions table (if it exists)
    const { data: tableExists } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'message_mentions')
      .maybeSingle();

    if (tableExists && profiles && profiles.length > 0) {
      const mentionInserts = profiles.map(profile => ({
        message_id,
        mentioned_user_id: profile.id,
        mentioned_by_user_id: sender_id,
        channel_id,
        created_at: new Date(created_at).toISOString()
      }));

      const { error: insertError } = await supabase
        .from('message_mentions')
        .insert(mentionInserts);

      if (insertError) {
        console.error('❌ Error inserting mentions:', insertError);
        throw insertError;
      }

      console.log(`✅ Successfully inserted ${mentionInserts.length} mentions`);
    } else {
      console.log('ℹ️ message_mentions table not found or no valid mentions');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        mentions_count: profiles?.length || 0,
        mentions: profiles?.map(p => p.username) || []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('💥 Parse mentions error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});