import { Resend } from 'npm:resend';

interface RequestPayload {
  email: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email }: RequestPayload = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sendfoxApiKey = Deno.env.get('SENDFOX_API_KEY');
    const sendfoxListId = Deno.env.get('SENDFOX_LIST_ID');

    if (!sendfoxApiKey) {
      console.error('SENDFOX_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Newsletter service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Subscribe to Sendfox
    const sendfoxResponse = await fetch('https://api.sendfox.com/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendfoxApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        lists: sendfoxListId ? [parseInt(sendfoxListId)] : [],
      }),
    });

    const sendfoxData = await sendfoxResponse.json();

    if (!sendfoxResponse.ok) {
      // Check if already subscribed (Sendfox returns 422 for duplicates)
      if (sendfoxResponse.status === 422) {
        return new Response(
          JSON.stringify({ success: true, message: 'Already subscribed' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.error('Sendfox error:', sendfoxData);
      return new Response(
        JSON.stringify({ error: 'Failed to subscribe' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Optionally send welcome email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: 'הציבור החרדי <newsletter@hatzibur.co.il>',
          to: [email],
          subject: 'ברוכים הבאים לניוזלטר הציבור החרדי',
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #d4af37;">ברוכים הבאים!</h1>
              <p>תודה שנרשמת לניוזלטר של הציבור החרדי.</p>
              <p>מעכשיו תקבלו עדכונים על החדשות והתמונות החשובות ביותר מהעולם החרדי.</p>
              <hr style="border: 1px solid #eee; margin: 20px 0;" />
              <p style="color: #888; font-size: 12px;">נשלח על ידי הציבור החרדי</p>
            </div>
          `,
        });
      } catch (emailError) {
        // Don't fail the subscription if welcome email fails
        console.error('Welcome email failed:', emailError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Subscribed successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
