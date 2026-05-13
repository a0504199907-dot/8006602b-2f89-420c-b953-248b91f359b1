import { useState } from 'react';
import { Link } from 'react-router';
import { Mail, Phone, Newspaper, Image, Calendar, FileText, Camera, History, Clock, Send, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import logoImage from '@/assets/uploads/logo.png';
import { supabase } from '@/integrations/supabase/client';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const mainCategories = [
  { name: 'גליונות', link: '/newspaper', icon: Newspaper },
  { name: 'שיח הציבור', link: '/siah', icon: FileText },
  { name: 'נייעס בציבור', link: '/news-batzibur', icon: Newspaper },
  { name: 'בעין הציבור', link: '/bein-hatzibur', icon: Camera },
  { name: 'לפני 18 שנה', link: '/before-18', icon: Clock },
  { name: 'אירועים היסטוריים', link: '/historical', icon: History },
  { name: 'גלריות', link: '/gallery', icon: Image },
  { name: 'אירועים', link: '/events', icon: Calendar }];


  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage('נא להזין כתובת אימייל תקינה');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      if (!supabase) {
        throw new Error('Database not configured');
      }

      const response = await supabase.functions.invoke('newsletter-subscribe', {
        body: { email }
      });

      if (response.error) {
        throw new Error(response.error.message || 'שגיאה בהרשמה');
      }

      setStatus('success');
      setEmail('');

      // Reset after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'שגיאה בהרשמה. נסו שוב מאוחר יותר.');
    }
  };

  return (
    <footer data-ev-id="ev_32f4d99597" className="bg-gradient-to-b from-[#0a0a0a] via-primary to-primary-dark relative overflow-hidden">
      {/* Decorative elements */}
      <div data-ev-id="ev_a79f071b5c" className="absolute inset-0 pointer-events-none">
        <div data-ev-id="ev_bcba3cbef8" className="absolute top-0 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div data-ev-id="ev_3e5bd58766" className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/3 rounded-full blur-3xl" />
      </div>

      {/* Gold accent line */}
      <div data-ev-id="ev_6946609c9c" className="h-1 bg-gradient-to-r from-transparent via-secondary to-transparent relative z-10" />
      
      {/* Main footer content */}
      <div data-ev-id="ev_b8e2425937" className="container mx-auto px-4 py-12 relative z-10">
        {/* Top section - Logo and description */}
        <div data-ev-id="ev_b25e4fc382" className="text-center mb-8">
          <Link to="/" className="inline-block group overflow-hidden">
            <img data-ev-id="ev_e4c6aff237"
            src={logoImage}
            alt="הציבור החרדי"
            className="h-36 md:h-44 w-auto object-contain mx-auto transition-transform group-hover:scale-105 -mb-8 md:-mb-10" />

          </Link>
          <p data-ev-id="ev_04d418ed02" className="text-white/50 text-sm max-w-md mx-auto">
            המגזין המצולם החרדי המוביל בעולם היהודי
          </p>
        </div>

        {/* Middle section - Categories and Contact */}
        <div data-ev-id="ev_9c7fcab7f4" className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-10">
          {/* Categories - Column 1 */}
          <div data-ev-id="ev_0bcfedd592" className="text-center md:text-right">
            <h4 data-ev-id="ev_50fc44ab9a" className="text-sm font-bold mb-4 text-secondary uppercase tracking-wider">מדורים</h4>
            <div data-ev-id="ev_9afce77827" className="flex flex-col gap-2">
              {mainCategories.slice(0, 4).map((cat) =>
              <Link
                key={cat.name}
                to={cat.link}
                className="text-white/60 hover:text-secondary transition-colors text-sm flex items-center gap-2 justify-center md:justify-start group">

                  <cat.icon className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                  {cat.name}
                </Link>
              )}
            </div>
          </div>

          {/* Categories - Column 2 */}
          <div data-ev-id="ev_f9fe375d04" className="text-center md:text-right">
            <h4 data-ev-id="ev_9865dbd8f7" className="text-sm font-bold mb-4 text-secondary uppercase tracking-wider">עוד תוכן</h4>
            <div data-ev-id="ev_b653b18244" className="flex flex-col gap-2">
              {mainCategories.slice(4).map((cat) =>
              <Link
                key={cat.name}
                to={cat.link}
                className="text-white/60 hover:text-secondary transition-colors text-sm flex items-center gap-2 justify-center md:justify-start group">

                  <cat.icon className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                  {cat.name}
                </Link>
              )}
            </div>
          </div>

          {/* Contact */}
          <div data-ev-id="ev_5f01f528e1" className="text-center md:text-right">
            <h4 data-ev-id="ev_87ef5f5ab9" className="text-sm font-bold mb-4 text-secondary uppercase tracking-wider">צור קשר</h4>
            <div data-ev-id="ev_6902d88681" className="flex flex-col gap-3">
              <a data-ev-id="ev_483cf4cf71"
              href="mailto:info@hatzibur.co.il"
              className="text-white/60 hover:text-secondary transition-colors text-sm flex items-center gap-2 justify-center md:justify-start group">

                <Mail className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                info@hatzibur.co.il
              </a>
              <a data-ev-id="ev_737308e56d"
              href="tel:+972-3-1234567"
              className="text-white/60 hover:text-secondary transition-colors text-sm flex items-center gap-2 justify-center md:justify-start group">

                <Phone className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                03-1234567
              </a>
            </div>
            
            {/* Advertise CTA */}
            <Link
              to="/advertise"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-gradient-to-r from-secondary to-secondary-light text-primary font-bold rounded-lg hover:shadow-lg hover:shadow-secondary/25 transition-all text-sm">

              <Sparkles className="w-4 h-4" />
              פרסמו אצלנו
            </Link>
          </div>
        </div>
      </div>

      {/* Newsletter strip - compact but visible */}
      <div data-ev-id="ev_40cb314ec2" className="border-t border-white/10 relative z-10 bg-white/5">
        <div data-ev-id="ev_2dcda31545" className="container mx-auto px-4 py-4">
          <form data-ev-id="ev_02c0a5a3c2" onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <span data-ev-id="ev_ef1b80ace6" className="text-white/70 text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-secondary" />
              הישארו מעודכנים:
            </span>
            {status === 'success' ?
            <span data-ev-id="ev_216a482f11" className="text-green-400 text-sm flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                נרשמת בהצלחה!
              </span> :

            <div data-ev-id="ev_236449e4c0" className="flex items-center gap-2">
                <input data-ev-id="ev_998918dcbe"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="כתובת אימייל"
              disabled={status === 'loading'}
              className="w-48 sm:w-56 bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-secondary transition-all disabled:opacity-50" />

                <button data-ev-id="ev_1679cd145c"
              type="submit"
              disabled={status === 'loading'}
              className="bg-secondary text-primary font-bold py-2 px-5 rounded-lg hover:bg-secondary-light transition-all disabled:opacity-50 text-sm flex items-center gap-1.5">

                  {status === 'loading' ?
                <Loader2 className="w-4 h-4 animate-spin" /> :

                <>
                      <Send className="w-3.5 h-3.5 rotate-180" />
                      הרשמה
                    </>
                }
                </button>
              </div>
            }
            {status === 'error' && errorMessage &&
            <span data-ev-id="ev_7b786d5784" className="text-red-400 text-xs">{errorMessage}</span>
            }
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div data-ev-id="ev_4dc5a5414b" className="border-t border-white/10 relative z-10">
        <div data-ev-id="ev_3da99f6ce5" className="container mx-auto px-4 py-4">
          <div data-ev-id="ev_11c4a5451c" className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
            <p data-ev-id="ev_75f5f06f2c" className="text-white/40">
              © {new Date().getFullYear()} הציבור החרדי. כל הזכויות שמורות.
            </p>
            <div data-ev-id="ev_8a0bb07f82" className="flex items-center gap-4">
              <Link to="/terms" className="text-white/40 hover:text-secondary transition-colors">תנאי שימוש</Link>
              <Link to="/privacy" className="text-white/40 hover:text-secondary transition-colors">מדיניות פרטיות</Link>
              <Link to="/accessibility" className="text-white/40 hover:text-secondary transition-colors">נגישות</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>);

}