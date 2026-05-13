import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, CheckCircle, Loader2, Sparkles, Gift, Bell, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface NewsletterSubscribeProps {
  variant?: 'inline' | 'card' | 'modal' | 'floating' | 'minimal';
  listId?: string;
  source?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  onSuccess?: (email: string) => void;
  showNameField?: boolean;
}

export default function NewsletterSubscribe({
  variant = 'card',
  listId = 'general',
  source = 'website',
  title = 'הירשמו לניוזלטר',
  subtitle = 'קבלו עדכונים שבועיים ישירות למייל',
  className = '',
  onSuccess,
  showNameField = false
}: NewsletterSubscribeProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage('נא להזין כתובת מייל תקינה');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      if (!supabase) {
        throw new Error('המערכת לא זמינה');
      }

      // Check if email already exists
      const { data: existing } = await supabase.
      from('newsletter_subscribers').
      select('id, status').
      eq('email', email.toLowerCase()).
      single();

      if (existing) {
        if (existing.status === 'active') {
          setStatus('error');
          setErrorMessage('כתובת המייל כבר רשומה');
          return;
        } else {
          // Reactivate subscription
          await supabase.
          from('newsletter_subscribers').
          update({
            status: 'active',
            resubscribed_at: new Date().toISOString(),
            name: name || existing.name
          }).
          eq('id', existing.id);
        }
      } else {
        // New subscription
        const { error } = await supabase.
        from('newsletter_subscribers').
        insert({
          email: email.toLowerCase(),
          name: name || null,
          list_id: listId,
          source,
          status: 'active'
        });

        if (error) throw error;
      }

      setStatus('success');
      onSuccess?.(email);

      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setEmail('');
        setName('');
      }, 5000);
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      setStatus('error');
      setErrorMessage('שגיאה בהרשמה, נסה שוב');
    }
  };

  // Minimal variant - just input and button
  if (variant === 'minimal') {
    return (
      <form data-ev-id="ev_d097e2f16e" onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <input data-ev-id="ev_f0fb001540"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="כתובת מייל"
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
        disabled={status === 'loading' || status === 'success'} />

        <button data-ev-id="ev_314f72bed1"
        type="submit"
        disabled={status === 'loading' || status === 'success'}
        className="px-4 py-2 bg-secondary text-black font-medium rounded-lg hover:bg-secondary-light transition-colors disabled:opacity-50">

          {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> :
          status === 'success' ? <CheckCircle className="w-5 h-5" /> :
          <Send className="w-5 h-5" />}
        </button>
      </form>);

  }

  // Inline variant - horizontal layout
  if (variant === 'inline') {
    return (
      <div data-ev-id="ev_ad04d4b928" className={`bg-gradient-to-r from-primary to-gray-900 rounded-xl p-6 ${className}`}>
        <div data-ev-id="ev_172d3e4df0" className="flex flex-col md:flex-row items-center gap-4">
          <div data-ev-id="ev_60cb9fa247" className="flex items-center gap-3 text-white">
            <div data-ev-id="ev_6eb0be2ea8" className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-secondary" />
            </div>
            <div data-ev-id="ev_be1bc45ea1">
              <h3 data-ev-id="ev_bb506670de" className="font-bold text-lg">{title}</h3>
              <p data-ev-id="ev_6af28dd100" className="text-sm text-gray-300">{subtitle}</p>
            </div>
          </div>
          
          <form data-ev-id="ev_9ea80cba43" onSubmit={handleSubmit} className="flex-1 flex gap-2 w-full md:w-auto">
            <input data-ev-id="ev_382905145b"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="כתובת מייל"
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:ring-2 focus:ring-secondary focus:border-transparent"
            disabled={status === 'loading' || status === 'success'} />

            <button data-ev-id="ev_4785f5926e"
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="px-6 py-3 bg-secondary text-black font-bold rounded-xl hover:bg-secondary-light transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2">

              {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> :
              status === 'success' ?
              <><CheckCircle className="w-5 h-5" />תודה!</> :

              <><Send className="w-5 h-5" />הרשמה</>
              }
            </button>
          </form>
        </div>
        
        {status === 'error' &&
        <p data-ev-id="ev_10b672aba0" className="text-red-400 text-sm mt-2 text-center md:text-right">{errorMessage}</p>
        }
      </div>);

  }

  // Card variant (default)
  return (
    <div data-ev-id="ev_226edcdd59" className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 overflow-hidden ${className}`}>
      {/* Header with gradient */}
      <div data-ev-id="ev_eab19c347a" className="bg-gradient-to-br from-primary via-gray-900 to-primary p-6 text-white text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div data-ev-id="ev_29da7420b0" className="absolute top-0 left-0 w-full h-full">
          <motion.div
            className="absolute top-4 left-4 text-secondary/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>

            <Sparkles className="w-8 h-8" />
          </motion.div>
          <motion.div
            className="absolute bottom-4 right-4 text-secondary/20"
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}>

            <Gift className="w-6 h-6" />
          </motion.div>
        </div>
        
        <div data-ev-id="ev_af891e2b72" className="relative z-10">
          <motion.div
            className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
            whileHover={{ scale: 1.1, rotate: 5 }}>

            <Mail className="w-8 h-8 text-secondary" />
          </motion.div>
          <h3 data-ev-id="ev_7d4d3b88a9" className="text-2xl font-bold mb-2">{title}</h3>
          <p data-ev-id="ev_826de79a15" className="text-gray-300">{subtitle}</p>
        </div>
      </div>

      {/* Form */}
      <div data-ev-id="ev_33b086a5f6" className="p-6">
        <AnimatePresence mode="wait">
          {status === 'success' ?
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-8">

              <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">

                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </motion.div>
              <h4 data-ev-id="ev_e902512ad0" className="text-xl font-bold text-gray-900 mb-2">תודה על ההרשמה!</h4>
              <p data-ev-id="ev_9fff2c3c8c" className="text-gray-500">נשלח לך אימייל אישור בקרוב</p>
            </motion.div> :

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4">

              {showNameField &&
            <div data-ev-id="ev_b02b3b9793">
                  <label data-ev-id="ev_99c853b233" className="block text-sm font-medium text-gray-700 mb-1">שם</label>
                  <input data-ev-id="ev_00f42c9ca8"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="השם שלך"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
              disabled={status === 'loading'} />

                </div>
            }
              
              <div data-ev-id="ev_f891f3cfc5">
                <label data-ev-id="ev_ea0b3aea31" className="block text-sm font-medium text-gray-700 mb-1">כתובת מייל *</label>
                <input data-ev-id="ev_1c623fc10f"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
              required
              disabled={status === 'loading'} />

              </div>

              {status === 'error' &&
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm">

                  {errorMessage}
                </motion.p>
            }

              <button data-ev-id="ev_c39803a246"
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-4 bg-gradient-to-r from-secondary to-secondary-dark text-black font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2">

                {status === 'loading' ?
              <><Loader2 className="w-5 h-5 animate-spin" />שולח...</> :

              <><Bell className="w-5 h-5" />הרשמו אותי עכשיו!</>
              }
              </button>

              <p data-ev-id="ev_dc487e1cf8" className="text-center text-xs text-gray-400">
                ללא ספאם • ניתן לבטל בכל עת
              </p>
            </motion.form>
          }
        </AnimatePresence>
      </div>
    </div>);

}