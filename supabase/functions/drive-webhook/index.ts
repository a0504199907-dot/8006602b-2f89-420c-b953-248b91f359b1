import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-goog-channel-id, x-goog-resource-state, x-goog-resource-id',
};

/**
 * Google Drive Webhook Handler
 * 
 * This function receives push notifications from Google Drive
 * when files/folders are changed in the watched folder.
 * 
 * Flow:
 * 1. Google Drive sends a POST request when changes occur
 * 2. We verify the channel ID matches our subscription
 * 3. Trigger a sync for the affected config
 */

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Google sends a sync message first, just acknowledge it
  const resourceState = req.headers.get('x-goog-resource-state');
  if (resourceState === 'sync') {
    console.log('Received sync verification from Google');
    return new Response('OK', { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const channelId = req.headers.get('x-goog-channel-id');
    const resourceId = req.headers.get('x-goog-resource-id');
    
    console.log('Webhook received:', { resourceState, channelId, resourceId });

    if (resourceState === 'change' || resourceState === 'update') {
      // Find the config associated with this channel
      const { data: config } = await supabase
        .from('drive_sync_config')
        .select('*')
        .eq('is_active', true)
        .single();

      if (config) {
        // Trigger a sync via the main drive-sync function
        const syncUrl = `${supabaseUrl}/functions/v1/drive-sync`;
        
        await fetch(syncUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            action: 'sync',
            configId: config.id,
          }),
        });

        // Log the webhook event
        await supabase.from('drive_sync_log').insert({
          config_id: config.id,
          action: 'webhook_triggered',
          details: { resourceState, channelId, resourceId },
          status: 'success',
        });

        console.log('Sync triggered successfully');
      }
    }

    return new Response('OK', { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Error', { status: 500, headers: corsHeaders });
  }
});
