import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Lock, Mail, Newspaper, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError('שם משתמש או סיסמה שגויים');
      setIsLoading(false);
    } else {
      navigate('/admin');
    }
  }

  return (
    <div data-ev-id="ev_004cb5aad3" className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4" dir="rtl">
      {/* Decorative elements */}
      <div data-ev-id="ev_7c21d3d599" className="absolute inset-0 overflow-hidden">
        <div data-ev-id="ev_99a82070fc" className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div data-ev-id="ev_b29580c99b" className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
      </div>

      <div data-ev-id="ev_0214f65aab" className="relative w-full max-w-md">
        {/* Logo & Header */}
        <div data-ev-id="ev_edbdbd0c8d" className="text-center mb-8">
          <div data-ev-id="ev_0519a3e2be" className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-2xl shadow-amber-500/20 mb-6">
            <Newspaper className="w-10 h-10 text-zinc-900" />
          </div>
          <h1 data-ev-id="ev_c83cbe5b16" className="text-3xl font-bold text-white mb-2">מערכת ניהול</h1>
          <p data-ev-id="ev_907ac401f6" className="text-zinc-400">התחבר לניהול אתר החדשות</p>
        </div>

        {/* Login Card */}
        <div data-ev-id="ev_55479ef3c6" className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          <form data-ev-id="ev_19c3cbbaa4" onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Error Message */}
            {error &&
            <div data-ev-id="ev_666a2c00e8" className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span data-ev-id="ev_8ffaa74597" className="text-sm">{error}</span>
              </div>
            }

            {/* Email Field */}
            <div data-ev-id="ev_52c89a1b89" className="flex flex-col gap-2">
              <label data-ev-id="ev_3fb25c76df" htmlFor="email" className="text-sm font-medium text-zinc-300">
                דואר אלקטרוני
              </label>
              <div data-ev-id="ev_019c3662e9" className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input data-ev-id="ev_75d0702a65"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-3 px-4 pr-12 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                placeholder="admin@example.com"
                required />

              </div>
            </div>

            {/* Password Field */}
            <div data-ev-id="ev_7d649d6f16" className="flex flex-col gap-2">
              <label data-ev-id="ev_8a9ddb035f" htmlFor="password" className="text-sm font-medium text-zinc-300">
                סיסמה
              </label>
              <div data-ev-id="ev_cba21e4463" className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input data-ev-id="ev_6731b29d1c"
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-3 px-4 pr-12 pl-12 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                placeholder="••••••••"
                required />

                <button data-ev-id="ev_50313ce422"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">

                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button data-ev-id="ev_c1bb5df6d2"
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-900 font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">

              {isLoading ?
              <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  מתחבר...
                </> :

              'התחבר'
              }
            </button>
          </form>

          {/* Footer */}
          <div data-ev-id="ev_d14bfa1b9f" className="mt-6 pt-6 border-t border-zinc-800 text-center">
            <p data-ev-id="ev_91d97b43f7" className="text-sm text-zinc-500">
              נתקלת בבעיה? <a data-ev-id="ev_68ae53f982" href="#" className="text-amber-500 hover:text-amber-400">פנה לתמיכה</a>
            </p>
          </div>
        </div>

        {/* Back to site */}
        <div data-ev-id="ev_36f0d8b0c8" className="text-center mt-6">
          <a data-ev-id="ev_5d2faf3262" href="/" className="text-zinc-400 hover:text-white text-sm transition-colors">
            ← חזור לאתר
          </a>
        </div>
      </div>
    </div>);

}