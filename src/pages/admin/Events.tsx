import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import ImageUploader from '@/components/ui/ImageUploader';
import RichTextEditor from '@/components/ui/RichTextEditor';
import SmartAutocomplete from '@/components/ui/SmartAutocomplete';
import { useChassiduyot } from '@/hooks/useChassiduyot';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  Loader2,
  X,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Copy } from

'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  event_type: string;
  chassidut: string;
  status: string;
  image_url: string;
  display_order: number;
}

const eventTypeLabels: Record<string, string> = {
  wedding: 'חתונה',
  bar_mitzvah: 'בר מצווה',
  tish: 'טיש',
  yahrtzeit: 'יארצייט',
  celebration: 'שמחה',
  shiur: 'שיעור',
  other: 'אחר'
};

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [reordering, setReordering] = useState(false);
  const { chassiduyot, addChassidut } = useChassiduyot();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    address: '',
    event_type: 'celebration',
    chassidut: '',
    hebrew_date: '',
    image_url: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    if (!supabase) {setLoading(false);return;}

    try {
      const { data, error } = await supabase.
      from('events').
      select('*').
      order('display_order', { ascending: false }).
      order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    if (!supabase) return;
    const filteredList = filteredEvents;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= filteredList.length) return;

    const currentItem = filteredList[index];
    const swapItem = filteredList[newIndex];

    setReordering(true);

    const currentOrder = currentItem.display_order || 0;
    const swapOrder = swapItem.display_order || 0;

    setEvents(events.map((e) => {
      if (e.id === currentItem.id) return { ...e, display_order: swapOrder };
      if (e.id === swapItem.id) return { ...e, display_order: currentOrder };
      return e;
    }));

    try {
      await supabase.from('events').update({ display_order: swapOrder }).eq('id', currentItem.id);
      await supabase.from('events').update({ display_order: currentOrder }).eq('id', swapItem.id);
    } catch (error) {
      console.error('Error updating order:', error);
      fetchEvents();
    } finally {
      setReordering(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    try {
      if (editingEvent) {
        const { error } = await supabase.from('events').update(formData).eq('id', editingEvent.id);
        if (error) throw error;
      } else {
        const maxOrder = events.length > 0 ? Math.max(...events.map((e) => e.display_order || 0)) : 0;
        const { error } = await supabase.from('events').insert({ ...formData, display_order: maxOrder + 1 });
        if (error) throw error;
      }
      setShowModal(false);
      setEditingEvent(null);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('האם למחוק את האירוע?')) return;
    if (!supabase) return;

    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      setEvents(events.filter((e) => e.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const duplicateEvent = async (event: Event) => {
    if (!supabase) return;

    try {
      const maxOrder = events.length > 0 ? Math.max(...events.map((e) => e.display_order || 0)) : 0;
      const { error } = await supabase.
      from('events').
      insert({
        title: `${event.title} (עותק)`,
        description: event.description,
        event_date: event.event_date,
        event_time: event.event_time,
        location: event.location,
        event_type: event.event_type,
        chassidut: event.chassidut,
        image_url: event.image_url,
        status: 'draft',
        display_order: maxOrder + 1
      });
      if (error) throw error;
      fetchEvents();
    } catch (error) {
      console.error('Error duplicating event:', error);
    }
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date,
      event_time: event.event_time || '',
      location: event.location || '',
      address: '',
      event_type: event.event_type,
      chassidut: event.chassidut || '',
      hebrew_date: '',
      image_url: event.image_url || '',
      status: event.status
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_date: '',
      event_time: '',
      location: '',
      address: '',
      event_type: 'celebration',
      chassidut: '',
      hebrew_date: '',
      image_url: '',
      status: 'draft'
    });
  };

  const filteredEvents = events.filter((e) =>
  e?.title?.toLowerCase()?.includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div data-ev-id="ev_e6f9d7d214" className="flex flex-col gap-6">
        {/* Header */}
        <div data-ev-id="ev_70714a4ba0" className="flex items-center justify-between">
          <div data-ev-id="ev_d328d2e303">
            <h1 data-ev-id="ev_0f80ae9764" className="text-2xl font-bold text-foreground font-serif">ניהול אירועים</h1>
            <p data-ev-id="ev_7b394e7b4a" className="text-muted-foreground mt-1">{events.length} אירועים במערכת</p>
          </div>
          <button data-ev-id="ev_21b35e18f2"
          onClick={() => {resetForm();setEditingEvent(null);setShowModal(true);}}
          className="flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-bold px-5 py-2.5 rounded-xl transition-colors">

            <Plus className="w-5 h-5" />
            אירוע חדש
          </button>
        </div>

        {/* Search */}
        <div data-ev-id="ev_ccea5460cd" className="relative max-w-md">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input data-ev-id="ev_fbc1b28fcc"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש אירועים..."
          className="w-full bg-surface border border-border rounded-xl py-3 px-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary" />

        </div>

        {/* Reorder hint */}
        {filteredEvents.length > 1 && !search &&
        <div data-ev-id="ev_7fe4633cce" className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
            <ArrowUpDown className="w-4 h-4" />
            <span data-ev-id="ev_0cd84f0559">השתמש בחיצים כדי לשנות את סדר האירועים</span>
          </div>
        }

        {/* Events List */}
        {loading ?
        <div data-ev-id="ev_8490a50af8" className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          </div> :
        filteredEvents.length === 0 ?
        <div data-ev-id="ev_8fb0abda74" className="text-center py-20 bg-surface rounded-2xl border border-border">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p data-ev-id="ev_038b56bee3" className="text-muted-foreground">אין אירועים להצגה</p>
          </div> :

        <div data-ev-id="ev_04954bff9f" className="flex flex-col gap-4">
            {filteredEvents.map((event, idx) =>
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-surface rounded-2xl border border-border p-5 flex items-center gap-4">

                {/* Reorder buttons */}
                {!search &&
            <div data-ev-id="ev_e10c6befaa" className="flex flex-col gap-1">
                    <button data-ev-id="ev_37483163e9"
              onClick={() => moveItem(idx, 'up')}
              disabled={idx === 0 || reordering}
              className={`p-1 rounded transition-colors ${idx === 0 ? 'text-muted-foreground/30 cursor-not-allowed' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              title="העבר למעלה">

                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button data-ev-id="ev_11894b3c33"
              onClick={() => moveItem(idx, 'down')}
              disabled={idx === filteredEvents.length - 1 || reordering}
              className={`p-1 rounded transition-colors ${idx === filteredEvents.length - 1 ? 'text-muted-foreground/30 cursor-not-allowed' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              title="העבר למטה">

                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
            }

                <div data-ev-id="ev_71a8c54411" className="w-16 h-16 bg-secondary/10 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                  <span data-ev-id="ev_42674b44ee" className="text-2xl font-bold text-secondary">
                    {new Date(event.event_date).getDate()}
                  </span>
                  <span data-ev-id="ev_92cb10705a" className="text-xs text-muted-foreground">
                    {new Date(event.event_date).toLocaleDateString('he-IL', { month: 'short' })}
                  </span>
                </div>
                <div data-ev-id="ev_d21b08ee4d" className="flex-1 min-w-0">
                  <div data-ev-id="ev_92afcdb046" className="flex items-center gap-2">
                    <h3 data-ev-id="ev_17fad164de" className="font-bold text-foreground">{event.title}</h3>
                    <span data-ev-id="ev_aeda7c3298" className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                      {eventTypeLabels[event.event_type] || event.event_type}
                    </span>
                  </div>
                  <div data-ev-id="ev_3e92c42611" className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    {event.location &&
                <span data-ev-id="ev_f1a75672bf" className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </span>
                }
                    {event.event_time &&
                <span data-ev-id="ev_a167f0e8da" className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {event.event_time}
                      </span>
                }
                    {event.chassidut &&
                <span data-ev-id="ev_340ab19bcb" className="text-secondary">{event.chassidut}</span>
                }
                  </div>
                </div>
                <div data-ev-id="ev_00076dec76" className="flex items-center gap-2">
                  <span data-ev-id="ev_7fe50dbf3a" className={`px-3 py-1 rounded-full text-xs font-bold ${event.status === 'published' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                    {event.status === 'published' ? 'פורסם' : 'טיוטה'}
                  </span>
                  <button data-ev-id="ev_e44301f219"
              onClick={() => duplicateEvent(event)}
              className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors text-blue-500"
              title="שכפל">

                    <Copy className="w-4 h-4" />
                  </button>
                  <button data-ev-id="ev_c6cc5e79ff"
              onClick={() => openEditModal(event)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="ערוך">

                    <Edit className="w-4 h-4" />
                  </button>
                  <button data-ev-id="ev_1c4544d881"
              onClick={() => deleteEvent(event.id)}
              className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-500"
              title="מחק">

                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
          )}
          </div>
        }
      </div>

      {/* Modal */}
      {showModal &&
      <div data-ev-id="ev_c6a13672e0" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            <div data-ev-id="ev_74ec7a6d15" className="flex items-center justify-between p-6 border-b border-border">
              <h2 data-ev-id="ev_2195b5e6b2" className="text-xl font-bold text-foreground">
                {editingEvent ? 'עריכת אירוע' : 'אירוע חדש'}
              </h2>
              <button data-ev-id="ev_a4afe94f33" onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form data-ev-id="ev_e3a5e7581d" onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div data-ev-id="ev_16c37940e1">
                <label data-ev-id="ev_5bfaf7ab92" className="block text-sm font-medium mb-2">שם האירוע</label>
                <input data-ev-id="ev_597b8fad74"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4"
              required />

              </div>
              <div data-ev-id="ev_9330d9a451" className="grid grid-cols-2 gap-4">
                <div data-ev-id="ev_3ee6da528d">
                  <label data-ev-id="ev_012b8dc7bb" className="block text-sm font-medium mb-2">תאריך</label>
                  <input data-ev-id="ev_c5bec13516"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, event_date: e.target.value }))}
                className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4"
                required />

                </div>
                <div data-ev-id="ev_c8d46719a2">
                  <label data-ev-id="ev_ae95fe2273" className="block text-sm font-medium mb-2">שעה</label>
                  <input data-ev-id="ev_1fb71c749d"
                type="time"
                value={formData.event_time}
                onChange={(e) => setFormData((prev) => ({ ...prev, event_time: e.target.value }))}
                className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4" />

                </div>
              </div>
              <div data-ev-id="ev_aace124dbe">
                <label data-ev-id="ev_9f2e905f3f" className="block text-sm font-medium mb-2">מיקום</label>
                <input data-ev-id="ev_5d2f03c749"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4" />

              </div>
              <div data-ev-id="ev_092537513b">
                <label data-ev-id="ev_5ca1b7bed8" className="block text-sm font-medium mb-2">תיאור</label>
                <RichTextEditor
                content={formData.description}
                onChange={(description) => setFormData((prev) => ({ ...prev, description }))}
                placeholder="תיאור האירוע..." />

              </div>
              <div data-ev-id="ev_732f881c28" className="grid grid-cols-2 gap-4">
                <div data-ev-id="ev_dcebcea880">
                  <label data-ev-id="ev_457b8b6d26" className="block text-sm font-medium mb-2">סוג אירוע</label>
                  <select data-ev-id="ev_df117b749c"
                value={formData.event_type}
                onChange={(e) => setFormData((prev) => ({ ...prev, event_type: e.target.value }))}
                className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4">

                    {Object.entries(eventTypeLabels).map(([k, v]) =>
                  <option data-ev-id="ev_fc9c6f8333" key={k} value={k}>{v}</option>
                  )}
                  </select>
                </div>
                <div data-ev-id="ev_0bfcbb3a5b">
                  <label data-ev-id="ev_95118f3997" className="block text-sm font-medium mb-2">חסידות</label>
                  <SmartAutocomplete
                  value={formData.chassidut}
                  onChange={(value) => setFormData((prev) => ({ ...prev, chassidut: value }))}
                  placeholder="בחר או הקלד חסידות"
                  options={chassiduyot}
                  onAddNew={addChassidut} />


                </div>
              </div>
              <div data-ev-id="ev_fb488ff395">
                <label data-ev-id="ev_147df9e4dd" className="block text-sm font-medium mb-2">סטטוס</label>
                <select data-ev-id="ev_df5eff7697"
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4">

                  <option data-ev-id="ev_1f58d8e9e9" value="draft">טיוטה</option>
                  <option data-ev-id="ev_1732be3258" value="published">פורסם</option>
                </select>
              </div>
              <div data-ev-id="ev_5519b4838f" className="flex gap-3 mt-4">
                <button data-ev-id="ev_7743ae344b"
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 py-2.5 border border-border rounded-xl hover:bg-muted transition-colors">

                  ביטול
                </button>
                <button data-ev-id="ev_6a960fd7b3"
              type="submit"
              className="flex-1 py-2.5 bg-secondary text-primary font-bold rounded-xl hover:bg-secondary-light transition-colors">

                  שמור
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      }
    </AdminLayout>);

}
