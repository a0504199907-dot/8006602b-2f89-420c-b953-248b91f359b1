import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function DriveSyncCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('מעבד את החיבור...');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage('החיבור נכשל: ' + error);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('לא התקבל קוד אימות');
      return;
    }

    // Exchange the code for tokens
    exchangeCode(code);
  }, [searchParams]);

  const exchangeCode = async (code: string) => {
    try {
      setMessage('מחבר ל-Google Drive...');

      // Call our edge function to exchange the code
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/drive-sync`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            action: 'exchange_code',
            code,
            redirectUri: `${window.location.origin}/admin/drive-sync/callback`
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setMessage('החיבור הצליח!');
        setTimeout(() => navigate('/admin/drive-sync'), 2000);
      } else {
        throw new Error(result.error || 'שגיאה בחיבור');
      }
    } catch (err) {
      console.error('OAuth error:', err);
      setStatus('error');
      // Properly extract error message
      let errorMessage = 'שגיאה לא ידועה';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = String((err as any).message);
      }
      setMessage('שגיאה בחיבור: ' + errorMessage);
    }
  };

  return (
    <div data-ev-id="ev_112a1c3acb" className="min-h-screen bg-zinc-950 flex items-center justify-center" dir="rtl">
      <div data-ev-id="ev_cd4bd5c1bf" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center max-w-md">
        {status === 'loading' &&
        <>
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
            <h1 data-ev-id="ev_14deb60daf" className="text-xl font-bold text-white mb-2">מתחבר ל-Google Drive</h1>
            <p data-ev-id="ev_0c50e5f7fd" className="text-zinc-400">{message}</p>
          </>
        }

        {status === 'success' &&
        <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 data-ev-id="ev_b7644f95c2" className="text-xl font-bold text-white mb-2">החיבור הצליח!</h1>
            <p data-ev-id="ev_6ef89e0f48" className="text-zinc-400">מעביר אותך לדף הסנכרון...</p>
          </>
        }

        {status === 'error' &&
        <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h1 data-ev-id="ev_1990da2b56" className="text-xl font-bold text-white mb-2">שגיאה</h1>
            <p data-ev-id="ev_2f7f01c935" className="text-zinc-400 mb-6">{message}</p>
            <button data-ev-id="ev_5424d0458c"
          onClick={() => navigate('/admin/drive-sync')}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors">

              חזור לדף הסנכרון
            </button>
          </>
        }
      </div>
    </div>);

}