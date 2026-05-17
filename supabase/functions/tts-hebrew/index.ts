// Edge Function: Hebrew Text-to-Speech using Microsoft Edge TTS (Azure Neural voices)
// Voice: he-IL-AvriNeural (male, Hebrew) - free, no auth required via Edge's public endpoint.

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const SYNTH_URL = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}`;

function escapeXml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
}

function buildSSML(text: string, voice: string, rate: string, pitch: string): string {
    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="he-IL">` +
          `<voice name="${voice}">` +
          `<prosody rate="${rate}" pitch="${pitch}">${escapeXml(text)}</prosody>` +
          `</voice></speak>`;
}

function generateRequestId(): string {
    const hex = '0123456789abcdef';
    let s = '';
    for (let i = 0; i < 32; i++) s += hex[Math.floor(Math.random() * 16)];
    return s;
}

async function synthesize(text: string, voice: string, rate: string, pitch: string): Promise<Uint8Array> {
    const requestId = generateRequestId();
    const ssml = buildSSML(text, voice, rate, pitch);
    const timestamp = new Date().toString();

  const configMessage =
        `X-Timestamp:${timestamp}\r\n` +
        `Content-Type:application/json; charset=utf-8\r\n` +
        `Path:speech.config\r\n\r\n` +
        `{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`;

  const ssmlMessage =
        `X-RequestId:${requestId}\r\n` +
        `Content-Type:application/ssml+xml\r\n` +
        `X-Timestamp:${timestamp}Z\r\n` +
        `Path:ssml\r\n\r\n` +
        ssml;

  const ws = new WebSocket(`wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&ConnectionId=${requestId}`);
    ws.binaryType = 'arraybuffer';

  return await new Promise<Uint8Array>((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        const timer = setTimeout(() => {
                try { ws.close(); } catch (_) {}
                reject(new Error('TTS timeout'));
        }, 30000);

                                           ws.onopen = () => {
                                                   ws.send(configMessage);
                                                   ws.send(ssmlMessage);
                                           };

                                           ws.onmessage = (ev) => {
                                                   if (typeof ev.data === 'string') {
                                                             if (ev.data.includes('Path:turn.end')) {
                                                                         clearTimeout(timer);
                                                                         try { ws.close(); } catch (_) {}
                                                                         const total = chunks.reduce((s, c) => s + c.length, 0);
                                                                         const merged = new Uint8Array(total);
                                                                         let off = 0;
                                                                         for (const c of chunks) { merged.set(c, off); off += c.length; }
                                                                         resolve(merged);
                                                             }
                                                   } else {
                                                             const buf = new Uint8Array(ev.data as ArrayBuffer);
                                                             // Binary frames start with: 2 bytes header length (big-endian) + header text + audio bytes.
                                                     if (buf.length < 2) return;
                                                             const headerLen = (buf[0] << 8) | buf[1];
                                                             const audioStart = 2 + headerLen;
                                                             if (audioStart < buf.length) {
                                                                         chunks.push(buf.slice(audioStart));
                                                             }
                                                   }
                                           };

                                           ws.onerror = (e) => {
                                                   clearTimeout(timer);
                                                   reject(new Error('TTS websocket error'));
                                           };

                                           ws.onclose = () => {
                                                   // resolve handled in turn.end
                                           };
  });
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
          return new Response('ok', { headers: corsHeaders });
    }

             if (req.method !== 'POST') {
                   return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                           status: 405,
                           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                   });
             }

             try {
                   const body = await req.json();
                   const rawText = typeof body?.text === 'string' ? body.text : '';
                   const voice = typeof body?.voice === 'string' && body.voice ? body.voice : 'he-IL-AvriNeural';
                   const rate = typeof body?.rate === 'string' && body.rate ? body.rate : '+0%';
                   const pitch = typeof body?.pitch === 'string' && body.pitch ? body.pitch : '+0Hz';

      const text = rawText.trim().slice(0, 8000);
                   if (!text) {
                           return new Response(JSON.stringify({ error: 'Missing text' }), {
                                     status: 400,
                                     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                           });
                   }

      const audio = await synthesize(text, voice, rate, pitch);

      return new Response(audio, {
              status: 200,
              headers: {
                        ...corsHeaders,
                        'Content-Type': 'audio/mpeg',
                        'Cache-Control': 'public, max-age=86400',
              },
      });
             } catch (err) {
                   console.error('tts-hebrew error:', err);
                   return new Response(JSON.stringify({ error: (err as Error).message || 'TTS failed' }), {
                           status: 500,
                           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                   });
             }
});
