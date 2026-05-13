/**
 * Edge Function to get visitor info including IP address.
 * Returns both the actual IP and a hashed version for privacy-compliant tracking.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple hash function for IP
function hashIP(ip: string): string {
  let hash = 0;
  const str = ip + 'analytics_salt_2024';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'v_' + Math.abs(hash).toString(36);
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get client IP from various headers
    const ip = 
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      'unknown';
    
    const hashedIP = hashIP(ip);
    
    return new Response(
      JSON.stringify({ 
        visitor_id: hashedIP,
        ip_address: ip,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to generate visitor ID' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
