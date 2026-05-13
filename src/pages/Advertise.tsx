import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Megaphone, Upload, Check, ChevronLeft, Image, Monitor, Smartphone, LayoutGrid } from 'lucide-react';

const adTypes = [
{ id: 'banner-top', name: 'באנר עליון', icon: Monitor, description: 'מופיע בראש כל עמוד', sizes: ['970x90', '728x90'] },
{ id: 'banner-side', name: 'באנר צדדי', icon: LayoutGrid, description: 'מופיע בצד התוכן', sizes: ['160x600', '300x600'] },
{ id: 'banner-content', name: 'בתוך תוכן', icon: Image, description: 'מופיע בין הכתבות', sizes: ['728x90', '300x250'] },
{ id: 'sponsored', name: 'תוכן ממומן', icon: Smartphone, description: 'כתבה פרסומית', sizes: ['מותאם אישית'] }];


const durations = [
{ id: '1week', name: 'שבוע', price: 'הכי משתלם' },
{ id: '2weeks', name: 'שבועיים', price: 'משתלם' },
{ id: '1month', name: 'חודש', price: 'פופולרי' },
{ id: '3months', name: '3 חודשים', price: 'חסכון מיוחד' }];


export default function Advertise() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    adType: '',
    adSize: '',
    duration: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    businessName: '',
    targetUrl: '',
    notes: '',
    imageUrl: ''
  });

  const selectedAdType = adTypes.find((t) => t.id === form.adType);

  const handleSubmit = async () => {
    if (!supabase) return;

    setSubmitting(true);

    const { error } = await supabase.
    from('ad_requests').
    insert({
      ad_type: form.adType,
      ad_size: form.adSize,
      duration: form.duration,
      contact_name: form.contactName,
      contact_email: form.contactEmail,
      contact_phone: form.contactPhone,
      business_name: form.businessName,
      target_url: form.targetUrl,
      notes: form.notes,
      image_url: form.imageUrl
    });

    setSubmitting(false);

    if (!error) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <Layout showTicker={false}>
        <div data-ev-id="ev_876e4d986a" className="container mx-auto px-4 py-20">
          <div data-ev-id="ev_c67f93ab68" className="max-w-lg mx-auto text-center">
            <div data-ev-id="ev_81b9690107" className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h1 data-ev-id="ev_450c05b03d" className="text-3xl font-bold text-foreground mb-4 font-serif">הבקשה נשלחה בהצלחה!</h1>
            <p data-ev-id="ev_9ae7c73a24" className="text-muted-foreground mb-8">
              תודה רבה! קיבלנו את בקשת הפרסום שלך.
              <br data-ev-id="ev_808d07ab43" />נחזור אליך בהקדם.
            </p>
            <a data-ev-id="ev_033b9238d3" href="/" className="inline-flex items-center gap-2 text-secondary hover:underline">
              <ChevronLeft className="w-4 h-4" />
              חזרה לדף הבית
            </a>
          </div>
        </div>
      </Layout>);

  }

  return (
    <Layout showTicker={false}>
      <div data-ev-id="ev_d88ea4d806" className="container mx-auto px-4 py-12">
        <div data-ev-id="ev_0a89847eaa" className="max-w-3xl mx-auto">
          {/* Header */}
          <div data-ev-id="ev_ffc82534b9" className="text-center mb-10">
            <div data-ev-id="ev_fca6fa806b" className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-8 h-8 text-secondary" />
            </div>
            <h1 data-ev-id="ev_73aa11da83" className="text-3xl font-bold text-foreground font-serif mb-2">פרסמו אצלנו</h1>
            <p data-ev-id="ev_fcb5b4de41" className="text-muted-foreground">הגיעו לקהל החרדי הגדול בישראל</p>
          </div>

          {/* Progress */}
          <div data-ev-id="ev_91ef96fe5b" className="flex items-center justify-center gap-2 mb-10">
            {[1, 2, 3].map((s) =>
            <div data-ev-id="ev_cd8f86924d" key={s} className="flex items-center gap-2">
                <div data-ev-id="ev_0c300dd1d5" className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              step >= s ? 'bg-secondary text-primary' : 'bg-muted text-muted-foreground'}`
              }>
                  {s}
                </div>
                {s < 3 && <div data-ev-id="ev_e65171b0f9" className={`w-12 h-1 rounded ${step > s ? 'bg-secondary' : 'bg-muted'}`} />}
              </div>
            )}
          </div>

          {/* Step 1: Choose Ad Type */}
          {step === 1 &&
          <div data-ev-id="ev_4ce47371db" className="space-y-6">
              <h2 data-ev-id="ev_09f010e93d" className="text-xl font-bold text-foreground mb-4">בחרו סוג פרסום</h2>
              
              <div data-ev-id="ev_9ecd5f960a" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adTypes.map((type) =>
              <button data-ev-id="ev_52e9ce24b7"
              key={type.id}
              onClick={() => setForm({ ...form, adType: type.id, adSize: type.sizes[0] })}
              className={`p-5 rounded-xl border-2 text-right transition-all ${
              form.adType === type.id ?
              'border-secondary bg-secondary/5' :
              'border-border hover:border-secondary/50'}`
              }>

                    <type.icon className={`w-8 h-8 mb-3 ${form.adType === type.id ? 'text-secondary' : 'text-muted-foreground'}`} />
                    <h3 data-ev-id="ev_88bc6faac5" className="font-bold text-foreground mb-1">{type.name}</h3>
                    <p data-ev-id="ev_6d4fd455f6" className="text-sm text-muted-foreground">{type.description}</p>
                  </button>
              )}
              </div>

              {selectedAdType &&
            <div data-ev-id="ev_b14dba452f">
                  <h3 data-ev-id="ev_08388bd62c" className="font-bold text-foreground mb-3">בחרו גודל</h3>
                  <div data-ev-id="ev_81f511181e" className="flex flex-wrap gap-2">
                    {selectedAdType.sizes.map((size) =>
                <button data-ev-id="ev_63b11ddff6"
                key={size}
                onClick={() => setForm({ ...form, adSize: size })}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                form.adSize === size ?
                'border-secondary bg-secondary text-primary font-bold' :
                'border-border hover:border-secondary'}`
                }>

                        {size}
                      </button>
                )}
                  </div>
                </div>
            }

              <div data-ev-id="ev_2aed3b1f09">
                <h3 data-ev-id="ev_2eb62ec215" className="font-bold text-foreground mb-3">בחרו תקופה</h3>
                <div data-ev-id="ev_4fe860d2db" className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {durations.map((d) =>
                <button data-ev-id="ev_d628665174"
                key={d.id}
                onClick={() => setForm({ ...form, duration: d.id })}
                className={`p-3 rounded-xl border text-center transition-all ${
                form.duration === d.id ?
                'border-secondary bg-secondary/5' :
                'border-border hover:border-secondary/50'}`
                }>

                      <div data-ev-id="ev_58e9c015d5" className="font-bold text-foreground">{d.name}</div>
                      <div data-ev-id="ev_c7005be917" className="text-xs text-muted-foreground">{d.price}</div>
                    </button>
                )}
                </div>
              </div>

              <button data-ev-id="ev_a9cf0ed247"
            onClick={() => setStep(2)}
            disabled={!form.adType || !form.adSize || !form.duration}
            className="w-full py-3 bg-secondary text-primary font-bold rounded-xl hover:bg-secondary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed">

                המשך
              </button>
            </div>
          }

          {/* Step 2: Upload & Details */}
          {step === 2 &&
          <div data-ev-id="ev_164a1178ef" className="space-y-6">
              <h2 data-ev-id="ev_0f0993891d" className="text-xl font-bold text-foreground mb-4">פרטי הפרסום</h2>
              
              {/* Image URL */}
              <div data-ev-id="ev_30613fbb9f">
                <label data-ev-id="ev_2b5db70e3a" className="block text-sm font-medium text-foreground mb-2">
                  <Upload className="w-4 h-4 inline ml-1" />
                  קישור לתמונה (אופציונלי)
                </label>
                <input data-ev-id="ev_35e771b706"
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:border-secondary focus:outline-none" />

                <p data-ev-id="ev_97d1843f19" className="text-xs text-muted-foreground mt-1">העלו את התמונה לאחסון חיצוני והדביקו את הקישור כאן</p>
              </div>

              {/* Preview */}
              {form.imageUrl &&
            <div data-ev-id="ev_2f272b296f" className="border border-border rounded-xl p-4">
                  <p data-ev-id="ev_c4582b65cc" className="text-sm text-muted-foreground mb-2">תצוגה מקדימה:</p>
                  <img data-ev-id="ev_13b4c90c6f"
              src={form.imageUrl}
              alt="תצוגה מקדימה"
              className="max-w-full max-h-48 object-contain rounded-lg mx-auto"
              onError={(e) => e.currentTarget.style.display = 'none'} />

                </div>
            }

              {/* Target URL */}
              <div data-ev-id="ev_116a7ba8c4">
                <label data-ev-id="ev_b5648ba31a" className="block text-sm font-medium text-foreground mb-2">קישור יעד</label>
                <input data-ev-id="ev_6a1e6ed88b"
              type="url"
              value={form.targetUrl}
              onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
              placeholder="https://your-website.com"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:border-secondary focus:outline-none" />

              </div>

              {/* Notes */}
              <div data-ev-id="ev_e3c8573f0e">
                <label data-ev-id="ev_09f5e1422f" className="block text-sm font-medium text-foreground mb-2">הערות נוספות</label>
                <textarea data-ev-id="ev_61a87949d2"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="פרטים נוספים, בקשות מיוחדות..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:border-secondary focus:outline-none resize-none" />

              </div>

              <div data-ev-id="ev_45648c6bb2" className="flex gap-3">
                <button data-ev-id="ev_f3541c1fdf"
              onClick={() => setStep(1)}
              className="flex-1 py-3 border border-border rounded-xl hover:bg-muted transition-colors">

                  חזרה
                </button>
                <button data-ev-id="ev_0e9570a1bc"
              onClick={() => setStep(3)}
              className="flex-1 py-3 bg-secondary text-primary font-bold rounded-xl hover:bg-secondary-light transition-colors">

                  המשך
                </button>
              </div>
            </div>
          }

          {/* Step 3: Contact Info */}
          {step === 3 &&
          <div data-ev-id="ev_d50c541ea5" className="space-y-6">
              <h2 data-ev-id="ev_3f262440ec" className="text-xl font-bold text-foreground mb-4">פרטי התקשרות</h2>
              
              <div data-ev-id="ev_fb8b38d872" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div data-ev-id="ev_1a84a93f00">
                  <label data-ev-id="ev_7cb02a3e81" className="block text-sm font-medium text-foreground mb-2">שם מלא *</label>
                  <input data-ev-id="ev_7d5c63b029"
                type="text"
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:border-secondary focus:outline-none" />

                </div>
                <div data-ev-id="ev_264fe78def">
                  <label data-ev-id="ev_1db43ab713" className="block text-sm font-medium text-foreground mb-2">שם העסק</label>
                  <input data-ev-id="ev_3a7792c983"
                type="text"
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:border-secondary focus:outline-none" />

                </div>
              </div>

              <div data-ev-id="ev_c929574c10">
                <label data-ev-id="ev_5b5c58e4f2" className="block text-sm font-medium text-foreground mb-2">אימייל *</label>
                <input data-ev-id="ev_0a4d3792db"
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:border-secondary focus:outline-none" />

              </div>

              <div data-ev-id="ev_6e7a1ce630">
                <label data-ev-id="ev_c381766ecc" className="block text-sm font-medium text-foreground mb-2">טלפון *</label>
                <input data-ev-id="ev_fad9b7e951"
              type="tel"
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:border-secondary focus:outline-none" />

              </div>

              {/* Summary */}
              <div data-ev-id="ev_5fd4aaeffb" className="bg-muted/50 rounded-xl p-4">
                <h3 data-ev-id="ev_2bfaa415aa" className="font-bold text-foreground mb-3">סיכום הבקשה</h3>
                <div data-ev-id="ev_96cd21d30d" className="text-sm text-muted-foreground space-y-1">
                  <p data-ev-id="ev_cfe1168399"><strong data-ev-id="ev_3943efc645">סוג:</strong> {selectedAdType?.name}</p>
                  <p data-ev-id="ev_8521ff5882"><strong data-ev-id="ev_4af61c0022">גודל:</strong> {form.adSize}</p>
                  <p data-ev-id="ev_dfa3d964aa"><strong data-ev-id="ev_2af10e2425">תקופה:</strong> {durations.find((d) => d.id === form.duration)?.name}</p>
                </div>
              </div>

              <div data-ev-id="ev_04b9a009a4" className="flex gap-3">
                <button data-ev-id="ev_2706210754"
              onClick={() => setStep(2)}
              className="flex-1 py-3 border border-border rounded-xl hover:bg-muted transition-colors">

                  חזרה
                </button>
                <button data-ev-id="ev_09490231c2"
              onClick={handleSubmit}
              disabled={!form.contactName || !form.contactEmail || !form.contactPhone || submitting}
              className="flex-1 py-3 bg-secondary text-primary font-bold rounded-xl hover:bg-secondary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">

                  {submitting ?
                <>
                      <div data-ev-id="ev_88b4e4c725" className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      שולח...
                    </> :

                'שלח בקשה'
                }
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </Layout>);

}