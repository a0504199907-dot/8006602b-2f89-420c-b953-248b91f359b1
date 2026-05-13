import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useHeroBannersAdmin, type HeroBanner } from '@/hooks/useHeroBanners';
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Settings,
  Image,
  Link,
  Type,
  X,
  Save,
  ArrowUp,
  ArrowDown,
  RotateCcw } from
'lucide-react';

const overlayOptions = [
{ value: 'from-amber-900/90 via-amber-800/80 to-amber-900/90', label: 'זהב', color: 'bg-amber-600' },
{ value: 'from-blue-950/90 via-blue-900/80 to-blue-950/90', label: 'כחול', color: 'bg-blue-600' },
{ value: 'from-emerald-950/90 via-emerald-900/80 to-emerald-950/90', label: 'ירוק', color: 'bg-emerald-600' },
{ value: 'from-purple-950/90 via-purple-900/80 to-purple-950/90', label: 'סגול', color: 'bg-purple-600' },
{ value: 'from-rose-950/90 via-rose-900/80 to-rose-950/90', label: 'אדום', color: 'bg-rose-600' },
{ value: 'from-zinc-950/90 via-zinc-900/80 to-zinc-950/90', label: 'אפור כהה', color: 'bg-zinc-600' },
{ value: 'from-black/90 via-black/70 to-black/50', label: 'שחור', color: 'bg-black' }];


interface BannerFormData {
  title: string;
  subtitle: string;
  image_url: string;
  button_text: string;
  button_link: string;
  show_button: boolean;
  bg_overlay: string;
  is_active: boolean;
}

const defaultFormData: BannerFormData = {
  title: '',
  subtitle: '',
  image_url: '',
  button_text: 'לפרטים',
  button_link: '#',
  show_button: true,
  bg_overlay: 'from-amber-900/90 via-amber-800/80 to-amber-900/90',
  is_active: true
};

export default function AdminHeroBanners() {
  const {
    banners,
    settings,
    isLoading,
    createBanner,
    updateBanner,
    deleteBanner,
    updateSettings,
    reorderBanners
  } = useHeroBannersAdmin();

  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BannerFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState({
    autoplay_speed: 5000,
    show_arrows: true,
    show_dots: true,
    pause_on_hover: true
  });

  const handleEdit = (banner: HeroBanner) => {
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image_url: banner.image_url,
      button_text: banner.button_text || '',
      button_link: banner.button_link || '',
      show_button: banner.show_button,
      bg_overlay: banner.bg_overlay || defaultFormData.bg_overlay,
      is_active: banner.is_active
    });
    setEditingId(banner.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        await updateBanner(editingId, formData);
      } else {
        await createBanner({
          ...formData,
          sort_order: banners.length
        });
      }
      setShowForm(false);
      setEditingId(null);
      setFormData(defaultFormData);
    } catch (err) {
      console.error('Error saving banner:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('האם למחוק את הבאנר?')) {
      await deleteBanner(id);
    }
  };

  const handleToggleActive = async (banner: HeroBanner) => {
    await updateBanner(banner.id, { is_active: !banner.is_active });
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newOrder = [...banners];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    await reorderBanners(newOrder.map((b) => b.id));
  };

  const handleMoveDown = async (index: number) => {
    if (index === banners.length - 1) return;
    const newOrder = [...banners];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    await reorderBanners(newOrder.map((b) => b.id));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await updateSettings(localSettings);
      setShowSettings(false);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const openSettings = () => {
    if (settings) {
      setLocalSettings({
        autoplay_speed: settings.autoplay_speed,
        show_arrows: settings.show_arrows,
        show_dots: settings.show_dots,
        pause_on_hover: settings.pause_on_hover
      });
    }
    setShowSettings(true);
  };

  return (
    <AdminLayout>
      <div data-ev-id="ev_a49749d4be" className="p-6">
        {/* Header */}
        <div data-ev-id="ev_a4cc79d180" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div data-ev-id="ev_fd06824093">
            <h1 data-ev-id="ev_0dd32e8927" className="text-2xl font-bold text-white">ניהול באנרים ראשיים</h1>
            <p data-ev-id="ev_47049a1e84" className="text-zinc-400 mt-1">נהל את הסליידר הראשי בדף הבית</p>
          </div>
          <div data-ev-id="ev_ef7e6af6ee" className="flex gap-3">
            <button data-ev-id="ev_4e180e80b9"
            onClick={openSettings}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors">

              <Settings className="w-5 h-5" />
              <span data-ev-id="ev_b502d552ed">הגדרות</span>
            </button>
            <button data-ev-id="ev_2a1327cb1c"
            onClick={() => {
              setFormData(defaultFormData);
              setEditingId(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors">

              <Plus className="w-5 h-5" />
              <span data-ev-id="ev_558fa34000">באנר חדש</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div data-ev-id="ev_56cf3a8133" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div data-ev-id="ev_786784d280" className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div data-ev-id="ev_6c82501838" className="text-2xl font-bold text-white">{banners.length}</div>
            <div data-ev-id="ev_f5646bfa72" className="text-sm text-zinc-400">סה"כ באנרים</div>
          </div>
          <div data-ev-id="ev_ad535d4e17" className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div data-ev-id="ev_0bd194019e" className="text-2xl font-bold text-emerald-400">{banners.filter((b) => b.is_active).length}</div>
            <div data-ev-id="ev_8a3a4f3274" className="text-sm text-zinc-400">פעילים</div>
          </div>
          <div data-ev-id="ev_d9fd85d226" className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div data-ev-id="ev_a2be9ed54b" className="text-2xl font-bold text-amber-400">{(settings?.autoplay_speed || 5000) / 1000}s</div>
            <div data-ev-id="ev_4e469bb4d2" className="text-sm text-zinc-400">מהירות החלפה</div>
          </div>
          <div data-ev-id="ev_1e73274ee6" className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div data-ev-id="ev_22557f1292" className="text-2xl font-bold text-blue-400">
              {settings?.show_arrows ? 'כן' : 'לא'}
            </div>
            <div data-ev-id="ev_33ec039eb9" className="text-sm text-zinc-400">חיצי ניווט</div>
          </div>
        </div>

        {/* Banners List */}
        {isLoading ?
        <div data-ev-id="ev_399c380cde" className="flex items-center justify-center py-20">
            <div data-ev-id="ev_9c6413b857" className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div> :
        banners.length === 0 ?
        <div data-ev-id="ev_e25352a901" className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <Image className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 data-ev-id="ev_7382ba9a27" className="text-lg font-medium text-white mb-2">אין באנרים עדיין</h3>
            <p data-ev-id="ev_898ca6fe61" className="text-zinc-400 mb-4">הוסף באנר ראשון לסליידר הראשי</p>
            <button data-ev-id="ev_c9f52a2aa1"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors">

              <Plus className="w-5 h-5" />
              <span data-ev-id="ev_acadcf9434">הוסף באנר</span>
            </button>
          </div> :

        <div data-ev-id="ev_3fa23edc7c" className="flex flex-col gap-4">
            {banners.map((banner, index) =>
          <div data-ev-id="ev_11d8cf4e4b"
          key={banner.id}
          className={`bg-zinc-900 border rounded-xl overflow-hidden transition-all ${
          banner.is_active ? 'border-zinc-800' : 'border-zinc-800/50 opacity-60'}`
          }>

                <div data-ev-id="ev_ca781127e3" className="flex flex-col md:flex-row">
                  {/* Image Preview */}
                  <div data-ev-id="ev_e49b8b81cc" className="relative w-full md:w-64 h-40 md:h-auto flex-shrink-0">
                    <img data-ev-id="ev_b597e6be3b"
                src={banner.image_url}
                alt={banner.title}
                className="w-full h-full object-cover" />

                    <div data-ev-id="ev_866ee45a63" className={`absolute inset-0 bg-gradient-to-l ${banner.bg_overlay}`} />
                    <div data-ev-id="ev_3309b81ab3" className="absolute top-2 right-2">
                      <span data-ev-id="ev_3d1f97ba15" className={`px-2 py-1 text-xs font-medium rounded-full ${
                  banner.is_active ?
                  'bg-emerald-500/20 text-emerald-400' :
                  'bg-zinc-700/50 text-zinc-400'}`
                  }>
                        {banner.is_active ? 'פעיל' : 'מושבת'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div data-ev-id="ev_ad90c818e8" className="flex-1 p-4 flex flex-col md:flex-row md:items-center gap-4">
                    <div data-ev-id="ev_0252a07b0d" className="flex-1">
                      <h3 data-ev-id="ev_b8a313b23d" className="text-lg font-bold text-white mb-1">{banner.title}</h3>
                      {banner.subtitle &&
                  <p data-ev-id="ev_d650ab3c6f" className="text-sm text-zinc-400 mb-2">{banner.subtitle}</p>
                  }
                      <div data-ev-id="ev_bc7cc18662" className="flex flex-wrap gap-2 text-xs">
                        {banner.show_button && banner.button_text &&
                    <span data-ev-id="ev_64b918592d" className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded">
                            כפתור: {banner.button_text}
                          </span>
                    }
                        {banner.button_link && banner.button_link !== '#' &&
                    <span data-ev-id="ev_9ad9fda842" className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded truncate max-w-[200px]">
                            קישור: {banner.button_link}
                          </span>
                    }
                      </div>
                    </div>

                    {/* Order Controls */}
                    <div data-ev-id="ev_fd05111c37" className="flex flex-col gap-1">
                      <button data-ev-id="ev_cb80434780"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed">

                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button data-ev-id="ev_86d3830e1a"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === banners.length - 1}
                  className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed">

                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Actions */}
                    <div data-ev-id="ev_e2e6c311c5" className="flex items-center gap-2">
                      <button data-ev-id="ev_1a9a1acf63"
                  onClick={() => handleToggleActive(banner)}
                  className={`p-2 rounded-lg transition-colors ${
                  banner.is_active ?
                  'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' :
                  'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`
                  }
                  title={banner.is_active ? 'השבת' : 'הפעל'}>

                        {banner.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                      <button data-ev-id="ev_c860ac8dff"
                  onClick={() => handleEdit(banner)}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors"
                  title="ערוך">

                        <Pencil className="w-5 h-5" />
                      </button>
                      <button data-ev-id="ev_2dce22bfb6"
                  onClick={() => handleDelete(banner.id)}
                  className="p-2 bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg transition-colors"
                  title="מחק">

                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
          )}
          </div>
        }

        {/* Banner Form Modal */}
        {showForm &&
        <div data-ev-id="ev_999c9f0a1b" className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div data-ev-id="ev_f0d199563f" className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div data-ev-id="ev_1d6441e0d5" className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between">
                <h2 data-ev-id="ev_210b5abf68" className="text-xl font-bold text-white">
                  {editingId ? 'עריכת באנר' : 'באנר חדש'}
                </h2>
                <button data-ev-id="ev_1303dab333"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData(defaultFormData);
              }}
              className="p-2 text-zinc-400 hover:text-white transition-colors">

                  <X className="w-5 h-5" />
                </button>
              </div>

              <form data-ev-id="ev_1df9bd7492" onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                {/* Image URL */}
                <div data-ev-id="ev_365f6e2639">
                  <label data-ev-id="ev_5dd0d14a23" className="block text-sm font-medium text-zinc-300 mb-2">
                    <Image className="w-4 h-4 inline ml-1" />
                    קישור לתמונה *
                  </label>
                  <input data-ev-id="ev_7fddfa9c46"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                placeholder="https://example.com/image.jpg"
                required
                dir="ltr" />

                  {formData.image_url &&
                <div data-ev-id="ev_be729d5716" className="mt-2 relative h-32 rounded-lg overflow-hidden">
                      <img data-ev-id="ev_9298b54c80"
                  src={formData.image_url}
                  alt="תצוגה מקדימה"
                  className="w-full h-full object-cover" />

                      <div data-ev-id="ev_a5610ed88b" className={`absolute inset-0 bg-gradient-to-l ${formData.bg_overlay}`} />
                    </div>
                }
                </div>

                {/* Title */}
                <div data-ev-id="ev_ff44e13400">
                  <label data-ev-id="ev_a680486577" className="block text-sm font-medium text-zinc-300 mb-2">
                    <Type className="w-4 h-4 inline ml-1" />
                    כותרת *
                  </label>
                  <input data-ev-id="ev_26fcb1fb41"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                placeholder="כותרת הבאנר"
                required />

                </div>

                {/* Subtitle */}
                <div data-ev-id="ev_698d0522e9">
                  <label data-ev-id="ev_6494cb8850" className="block text-sm font-medium text-zinc-300 mb-2">
                    תת-כותרת
                  </label>
                  <input data-ev-id="ev_eb877a2ccb"
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                placeholder="תיאור קצר" />

                </div>

                {/* Button Settings */}
                <div data-ev-id="ev_e78ce91558" className="bg-zinc-800/50 rounded-xl p-4 flex flex-col gap-4">
                  <div data-ev-id="ev_de363a7ec9" className="flex items-center justify-between">
                    <span data-ev-id="ev_8c05dd38f8" className="text-sm font-medium text-zinc-300">הצג כפתור</span>
                    <button data-ev-id="ev_7653276072"
                  type="button"
                  onClick={() => setFormData({ ...formData, show_button: !formData.show_button })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                  formData.show_button ? 'bg-amber-500' : 'bg-zinc-700'}`
                  }>

                      <div data-ev-id="ev_1c6a95b198"
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    formData.show_button ? 'right-1' : 'right-7'}`
                    } />

                    </button>
                  </div>

                  {formData.show_button &&
                <>
                      <div data-ev-id="ev_cf897200e2">
                        <label data-ev-id="ev_cc7bd7060e" className="block text-sm font-medium text-zinc-400 mb-2">
                          טקסט הכפתור
                        </label>
                        <input data-ev-id="ev_2530166bbb"
                    type="text"
                    value={formData.button_text}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    placeholder="לפרטים" />

                      </div>
                      <div data-ev-id="ev_e9edc046bb">
                        <label data-ev-id="ev_f42d7aa97b" className="block text-sm font-medium text-zinc-400 mb-2">
                          <Link className="w-4 h-4 inline ml-1" />
                          קישור הכפתור
                        </label>
                        <input data-ev-id="ev_a02f529ad7"
                    type="text"
                    value={formData.button_link}
                    onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    placeholder="/page או https://..."
                    dir="ltr" />

                      </div>
                    </>
                }
                </div>

                {/* Overlay Color */}
                <div data-ev-id="ev_e814f4fc31">
                  <label data-ev-id="ev_de1519f1c6" className="block text-sm font-medium text-zinc-300 mb-3">צבע שכבת-על</label>
                  <div data-ev-id="ev_53c298bb08" className="flex flex-wrap gap-2">
                    {overlayOptions.map((option) =>
                  <button data-ev-id="ev_5433ffcbee"
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, bg_overlay: option.value })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                  formData.bg_overlay === option.value ?
                  'border-amber-500 bg-amber-500/10' :
                  'border-zinc-700 hover:border-zinc-600'}`
                  }>

                        <div data-ev-id="ev_c3708c0550" className={`w-4 h-4 rounded-full ${option.color}`} />
                        <span data-ev-id="ev_bd50919a36" className="text-sm text-zinc-300">{option.label}</span>
                      </button>
                  )}
                  </div>
                </div>

                {/* Active Toggle */}
                <div data-ev-id="ev_54ca6d689a" className="flex items-center justify-between bg-zinc-800/50 rounded-xl p-4">
                  <span data-ev-id="ev_5cef8e56dc" className="text-sm font-medium text-zinc-300">באנר פעיל</span>
                  <button data-ev-id="ev_4b56861208"
                type="button"
                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                formData.is_active ? 'bg-emerald-500' : 'bg-zinc-700'}`
                }>

                    <div data-ev-id="ev_f886d73dfc"
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  formData.is_active ? 'right-1' : 'right-7'}`
                  } />

                  </button>
                </div>

                {/* Submit */}
                <div data-ev-id="ev_12dca45da5" className="flex gap-3 pt-4">
                  <button data-ev-id="ev_62dba07e1e"
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-xl transition-colors disabled:opacity-50">

                    {saving ?
                  <div data-ev-id="ev_15573dbfcd" className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> :

                  <Save className="w-5 h-5" />
                  }
                    <span data-ev-id="ev_aa5401f924">{editingId ? 'עדכן באנר' : 'צור באנר'}</span>
                  </button>
                  <button data-ev-id="ev_39b4cdf0d4"
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData(defaultFormData);
                }}
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors">

                    ביטול
                  </button>
                </div>
              </form>
            </div>
          </div>
        }

        {/* Settings Modal */}
        {showSettings &&
        <div data-ev-id="ev_b37925e5df" className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div data-ev-id="ev_d69a242f20" className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md">
              <div data-ev-id="ev_cd06254334" className="border-b border-zinc-800 p-4 flex items-center justify-between">
                <h2 data-ev-id="ev_97a5b0ffc3" className="text-xl font-bold text-white">הגדרות סליידר</h2>
                <button data-ev-id="ev_e7fc3fcb3e"
              onClick={() => setShowSettings(false)}
              className="p-2 text-zinc-400 hover:text-white transition-colors">

                  <X className="w-5 h-5" />
                </button>
              </div>

              <div data-ev-id="ev_11f8eb070d" className="p-6 flex flex-col gap-6">
                {/* Autoplay Speed */}
                <div data-ev-id="ev_6fa75c66ee">
                  <label data-ev-id="ev_00174cfaca" className="block text-sm font-medium text-zinc-300 mb-2">
                    מהירות החלפה (שניות)
                  </label>
                  <div data-ev-id="ev_b42f4bf928" className="flex items-center gap-4">
                    <input data-ev-id="ev_e4e156edf5"
                  type="range"
                  min="2000"
                  max="10000"
                  step="500"
                  value={localSettings.autoplay_speed}
                  onChange={(e) => setLocalSettings({ ...localSettings, autoplay_speed: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />

                    <span data-ev-id="ev_7e66177ef0" className="text-white font-medium w-12 text-center">
                      {localSettings.autoplay_speed / 1000}s
                    </span>
                  </div>
                </div>

                {/* Show Arrows */}
                <div data-ev-id="ev_a309aceae6" className="flex items-center justify-between">
                  <span data-ev-id="ev_825973d043" className="text-sm font-medium text-zinc-300">הצג חיצי ניווט</span>
                  <button data-ev-id="ev_16294273eb"
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, show_arrows: !localSettings.show_arrows })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                localSettings.show_arrows ? 'bg-amber-500' : 'bg-zinc-700'}`
                }>

                    <div data-ev-id="ev_bb1000c0fc"
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  localSettings.show_arrows ? 'right-1' : 'right-7'}`
                  } />

                  </button>
                </div>

                {/* Show Dots */}
                <div data-ev-id="ev_24dfb7b9c3" className="flex items-center justify-between">
                  <span data-ev-id="ev_986da040b4" className="text-sm font-medium text-zinc-300">הצג נקודות ניווט</span>
                  <button data-ev-id="ev_3e86d26842"
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, show_dots: !localSettings.show_dots })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                localSettings.show_dots ? 'bg-amber-500' : 'bg-zinc-700'}`
                }>

                    <div data-ev-id="ev_043d3f09af"
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  localSettings.show_dots ? 'right-1' : 'right-7'}`
                  } />

                  </button>
                </div>

                {/* Pause on Hover */}
                <div data-ev-id="ev_6c119e78dc" className="flex items-center justify-between">
                  <span data-ev-id="ev_2f87dafdac" className="text-sm font-medium text-zinc-300">עצור בעת ריחוף</span>
                  <button data-ev-id="ev_61f35fa950"
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, pause_on_hover: !localSettings.pause_on_hover })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                localSettings.pause_on_hover ? 'bg-amber-500' : 'bg-zinc-700'}`
                }>

                    <div data-ev-id="ev_a9c16bfab2"
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  localSettings.pause_on_hover ? 'right-1' : 'right-7'}`
                  } />

                  </button>
                </div>

                {/* Save Button */}
                <button data-ev-id="ev_e27e602778"
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-xl transition-colors disabled:opacity-50 mt-2">

                  {saving ?
                <div data-ev-id="ev_202745d557" className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> :

                <Save className="w-5 h-5" />
                }
                  <span data-ev-id="ev_a98aab560b">שמור הגדרות</span>
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </AdminLayout>);

}