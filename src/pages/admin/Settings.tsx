import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Save,
  Settings as SettingsIcon,
  Globe,
  Palette,
  Bell,
  Shield,
  Users,
  Loader2,
  Check,
  Upload } from
'lucide-react';

export default function AdminSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('general');

  const [settings, setSettings] = useState({
    site_name: 'הציבור החרדי',
    site_description: 'פורטל החדשות החרדי המוביל',
    contact_email: '',
    contact_phone: '',
    primary_color: '#D4AF37',
    secondary_color: '#0a0a0a',
    logo_url: '',
    facebook_url: '',
    twitter_url: '',
    whatsapp_number: '',
    show_hero_banner: 'true'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    if (!supabase) return;

    try {
      const { data } = await supabase.from('site_settings').select('*');
      if (data) {
        const settingsObj: Record<string, any> = {};
        data.forEach((item) => {
          settingsObj[item.key] = item.value;
        });
        setSettings((prev) => ({ ...prev, ...settingsObj }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!supabase || !user) return;

    setLoading(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        await supabase.from('site_settings').upsert({
          key,
          value,
          updated_by: user.id
        }, { onConflict: 'key' });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
  { id: 'general', icon: Globe, label: 'כללי' },
  { id: 'appearance', icon: Palette, label: 'מראה' },
  { id: 'notifications', icon: Bell, label: 'התראות' },
  { id: 'security', icon: Shield, label: 'אבטחה' },
  { id: 'users', icon: Users, label: 'משתמשים' }];


  return (
    <AdminLayout>
      <div data-ev-id="ev_29dbcb3ac6" className="flex flex-col gap-6">
        {/* Header */}
        <div data-ev-id="ev_ec3393a724" className="flex items-center justify-between">
          <div data-ev-id="ev_0d17922f52">
            <h1 data-ev-id="ev_86f2cd02af" className="text-2xl font-bold text-foreground font-serif">הגדרות</h1>
            <p data-ev-id="ev_5d32facbef" className="text-muted-foreground mt-1">נהל את הגדרות האתר</p>
          </div>
          <button data-ev-id="ev_a35651ef36"
          onClick={saveSettings}
          disabled={loading}
          className="flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50">

            {loading ?
            <Loader2 className="w-5 h-5 animate-spin" /> :
            saved ?
            <Check className="w-5 h-5" /> :

            <Save className="w-5 h-5" />
            }
            {saved ? 'נשמר!' : 'שמור שינויים'}
          </button>
        </div>

        <div data-ev-id="ev_bb69bf4108" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div data-ev-id="ev_d009b80495" className="lg:col-span-1">
            <div data-ev-id="ev_5021103a78" className="bg-surface rounded-2xl border border-border p-4">
              <nav data-ev-id="ev_c6eb0a2a46" className="flex flex-col gap-1">
                {sections.map((section) =>
                <button data-ev-id="ev_de65150dca"
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-right ${
                activeSection === section.id ?
                'bg-secondary text-primary' :
                'text-foreground hover:bg-muted'}`
                }>

                    <section.icon className="w-5 h-5" />
                    <span data-ev-id="ev_0393ecb92f" className="font-medium">{section.label}</span>
                  </button>
                )}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div data-ev-id="ev_424c36d58c" className="lg:col-span-3">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface rounded-2xl border border-border p-6">

              {activeSection === 'general' &&
              <div data-ev-id="ev_2a32ae0444" className="flex flex-col gap-6">
                  <h2 data-ev-id="ev_75cc214113" className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Globe className="w-5 h-5 text-secondary" />
                    הגדרות כלליות
                  </h2>
                  
                  <div data-ev-id="ev_5faaa4dcaa" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div data-ev-id="ev_78c54417fc">
                      <label data-ev-id="ev_a791c78010" className="block text-sm font-medium mb-2">שם האתר</label>
                      <input data-ev-id="ev_92c52935c4"
                    type="text"
                    value={settings.site_name}
                    onChange={(e) => setSettings((prev) => ({ ...prev, site_name: e.target.value }))}
                    className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4" />

                    </div>
                    <div data-ev-id="ev_d8b8ba743f">
                      <label data-ev-id="ev_f85d2910b9" className="block text-sm font-medium mb-2">אימייל ליצירת קשר</label>
                      <input data-ev-id="ev_fa93a85836"
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => setSettings((prev) => ({ ...prev, contact_email: e.target.value }))}
                    className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4"
                    dir="ltr" />

                    </div>
                    <div data-ev-id="ev_06034d7313" className="md:col-span-2">
                      <label data-ev-id="ev_4f6e9de975" className="block text-sm font-medium mb-2">תיאור האתר</label>
                      <textarea data-ev-id="ev_86b17cd2f9"
                    value={settings.site_description}
                    onChange={(e) => setSettings((prev) => ({ ...prev, site_description: e.target.value }))}
                    className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 resize-none"
                    rows={2} />

                    </div>
                    <div data-ev-id="ev_a909dc89cd">
                      <label data-ev-id="ev_4b4ad31447" className="block text-sm font-medium mb-2">טלפון</label>
                      <input data-ev-id="ev_39b1756d45"
                    type="tel"
                    value={settings.contact_phone}
                    onChange={(e) => setSettings((prev) => ({ ...prev, contact_phone: e.target.value }))}
                    className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4"
                    dir="ltr" />

                    </div>
                    <div data-ev-id="ev_f113be3903">
                      <label data-ev-id="ev_bf8693a47a" className="block text-sm font-medium mb-2">מספר WhatsApp</label>
                      <input data-ev-id="ev_d5ded8023b"
                    type="tel"
                    value={settings.whatsapp_number}
                    onChange={(e) => setSettings((prev) => ({ ...prev, whatsapp_number: e.target.value }))}
                    className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4"
                    dir="ltr"
                    placeholder="972501234567" />

                    </div>
                  </div>

                  <div data-ev-id="ev_b044c85f62">
                    <h3 data-ev-id="ev_17f4dbc7cb" className="font-medium text-foreground mb-4">רשתות חברתיות</h3>
                    <div data-ev-id="ev_5863ae4c16" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div data-ev-id="ev_fef89323e1">
                        <label data-ev-id="ev_c31e05513d" className="block text-sm font-medium mb-2">Facebook</label>
                        <input data-ev-id="ev_f0cfded403"
                      type="url"
                      value={settings.facebook_url}
                      onChange={(e) => setSettings((prev) => ({ ...prev, facebook_url: e.target.value }))}
                      className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4"
                      dir="ltr"
                      placeholder="https://facebook.com/..." />

                      </div>
                      <div data-ev-id="ev_64f7f51b72">
                        <label data-ev-id="ev_9acf74a1c0" className="block text-sm font-medium mb-2">Twitter</label>
                        <input data-ev-id="ev_77620e420c"
                      type="url"
                      value={settings.twitter_url}
                      onChange={(e) => setSettings((prev) => ({ ...prev, twitter_url: e.target.value }))}
                      className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4"
                      dir="ltr"
                      placeholder="https://twitter.com/..." />

                      </div>
                    </div>
                  </div>
                </div>
              }

              {activeSection === 'appearance' &&
              <div data-ev-id="ev_46791fbfef" className="flex flex-col gap-6">
                  <h2 data-ev-id="ev_bf8769bb89" className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Palette className="w-5 h-5 text-secondary" />
                    מראה ועיצוב
                  </h2>
                  
                  <div data-ev-id="ev_ae548580ec">
                    <label data-ev-id="ev_54f551bf1c" className="block text-sm font-medium mb-2">לוגו (קישור)</label>
                    <input data-ev-id="ev_1875ca5a29"
                  type="url"
                  value={settings.logo_url}
                  onChange={(e) => setSettings((prev) => ({ ...prev, logo_url: e.target.value }))}
                  className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4"
                  dir="ltr"
                  placeholder="https://..." />

                  </div>

                  <div data-ev-id="ev_10a80758d5" className="grid grid-cols-2 gap-4">
                    <div data-ev-id="ev_39e3a49a3d">
                      <label data-ev-id="ev_aaa95fa107" className="block text-sm font-medium mb-2">צבע ראשי</label>
                      <div data-ev-id="ev_3cd7d111ab" className="flex items-center gap-3">
                        <input data-ev-id="ev_d1d5351d0e"
                      type="color"
                      value={settings.primary_color}
                      onChange={(e) => setSettings((prev) => ({ ...prev, primary_color: e.target.value }))}
                      className="w-12 h-12 rounded-xl cursor-pointer border-0" />

                        <input data-ev-id="ev_e0e53a0d62"
                      type="text"
                      value={settings.primary_color}
                      onChange={(e) => setSettings((prev) => ({ ...prev, primary_color: e.target.value }))}
                      className="flex-1 bg-muted/50 border border-border rounded-xl py-2.5 px-4 font-mono"
                      dir="ltr" />

                      </div>
                    </div>
                    <div data-ev-id="ev_d5fa3298f4">
                      <label data-ev-id="ev_79617468a3" className="block text-sm font-medium mb-2">צבע משני</label>
                      <div data-ev-id="ev_f618a740ff" className="flex items-center gap-3">
                        <input data-ev-id="ev_16048220e9"
                      type="color"
                      value={settings.secondary_color}
                      onChange={(e) => setSettings((prev) => ({ ...prev, secondary_color: e.target.value }))}
                      className="w-12 h-12 rounded-xl cursor-pointer border-0" />

                        <input data-ev-id="ev_aa7cc45abe"
                      type="text"
                      value={settings.secondary_color}
                      onChange={(e) => setSettings((prev) => ({ ...prev, secondary_color: e.target.value }))}
                      className="flex-1 bg-muted/50 border border-border rounded-xl py-2.5 px-4 font-mono"
                      dir="ltr" />

                      </div>
                    </div>
                  </div>

                  {/* Hero Banner Toggle */}
                  <div data-ev-id="ev_24cecebae6" className="border-t border-border pt-6">
                    <div data-ev-id="ev_0bd5131f4f" className="flex items-center justify-between">
                      <div data-ev-id="ev_41b1765624">
                        <h3 data-ev-id="ev_21a52a2b37" className="font-medium text-foreground">באנר עליון (Hero)</h3>
                        <p data-ev-id="ev_4c0c621477" className="text-muted-foreground text-sm mt-1">הצג את הבאנר המרכזי בראש עמוד הבית</p>
                      </div>
                      <button data-ev-id="ev_b35c3ecc69"
                    type="button"
                    onClick={() => setSettings((prev) => ({
                      ...prev,
                      show_hero_banner: prev.show_hero_banner === 'true' ? 'false' : 'true'
                    }))}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                    settings.show_hero_banner === 'true' ? 'bg-secondary' : 'bg-muted'}`
                    }>

                        <span data-ev-id="ev_3b8c28cbe3"
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${
                      settings.show_hero_banner === 'true' ? 'right-1' : 'right-8'}`
                      } />

                      </button>
                    </div>
                  </div>
                </div>
              }

              {activeSection === 'notifications' &&
              <div data-ev-id="ev_a39913a1b7" className="flex flex-col gap-6">
                  <h2 data-ev-id="ev_9137b6640f" className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Bell className="w-5 h-5 text-secondary" />
                    התראות
                  </h2>
                  <p data-ev-id="ev_2d68a5376a" className="text-muted-foreground">הגדרות התראות יהיו זמינות בקרוב</p>
                </div>
              }

              {activeSection === 'security' &&
              <div data-ev-id="ev_e7630dd6a4" className="flex flex-col gap-6">
                  <h2 data-ev-id="ev_e4abf7d00b" className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Shield className="w-5 h-5 text-secondary" />
                    אבטחה
                  </h2>
                  <p data-ev-id="ev_c573a0e5be" className="text-muted-foreground">הגדרות אבטחה יהיו זמינות בקרוב</p>
                </div>
              }

              {activeSection === 'users' &&
              <div data-ev-id="ev_f19f1758d7" className="flex flex-col gap-6">
                  <h2 data-ev-id="ev_8090923873" className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Users className="w-5 h-5 text-secondary" />
                    ניהול משתמשים
                  </h2>
                  <p data-ev-id="ev_2eef9777d1" className="text-muted-foreground">ניהול משתמשים יהיה זמין בקרוב</p>
                  
                  {user &&
                <div data-ev-id="ev_d8d86e6823" className="bg-muted/30 rounded-xl p-4">
                      <h3 data-ev-id="ev_99c81c387d" className="font-medium text-foreground mb-2">המשתמש שלי</h3>
                      <p data-ev-id="ev_1f95fb7233" className="text-muted-foreground text-sm">אימייל: {user.email}</p>
                      <p data-ev-id="ev_84e6f76129" className="text-muted-foreground text-sm">תפקיד: מנהל</p>
                    </div>
                }
                </div>
              }
            </motion.div>
          </div>
        </div>
      </div>
    </AdminLayout>);

}