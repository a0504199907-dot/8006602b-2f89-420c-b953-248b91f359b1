import { useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { usePhotographers, type Photographer } from '@/hooks/usePhotographers';
import { useChassiduyot, type Chassidut } from '@/hooks/useChassiduyot';
import { useWriters, type Writer } from '@/hooks/useWriters';
import {
  Plus,
  Edit,
  Trash2,
  Camera,
  Users,
  Loader2,
  X,
  Check,
  Phone,
  Mail,
  Search,
  PenTool } from
'lucide-react';

type TabType = 'photographers' | 'writers' | 'chassiduyot';

export default function DataManager() {
  const [activeTab, setActiveTab] = useState<TabType>('photographers');
  const [search, setSearch] = useState('');

  // Photographers state
  const {
    photographers,
    loading: photographersLoading,
    addPhotographer,
    updatePhotographer,
    deletePhotographer
  } = usePhotographers();

  const [showPhotographerModal, setShowPhotographerModal] = useState(false);
  const [editingPhotographer, setEditingPhotographer] = useState<Photographer | null>(null);
  const [photographerForm, setPhotographerForm] = useState({ name: '', phone: '', email: '' });
  const [savingPhotographer, setSavingPhotographer] = useState(false);

  // Writers state
  const {
    writers,
    loading: writersLoading,
    addWriter,
    updateWriter,
    deleteWriter
  } = useWriters();

  const [showWriterModal, setShowWriterModal] = useState(false);
  const [editingWriter, setEditingWriter] = useState<Writer | null>(null);
  const [writerForm, setWriterForm] = useState({ name: '', phone: '', email: '' });
  const [savingWriter, setSavingWriter] = useState(false);

  // Chassiduyot state
  const {
    chassiduyot,
    loading: chassiduyotLoading,
    addChassidut,
    updateChassidut,
    deleteChassidut
  } = useChassiduyot();

  const [showChassidutModal, setShowChassidutModal] = useState(false);
  const [editingChassidut, setEditingChassidut] = useState<Chassidut | null>(null);
  const [chassidutForm, setChassidutForm] = useState({ name: '' });
  const [savingChassidut, setSavingChassidut] = useState(false);

  // Filtered data
  const filteredPhotographers = photographers.filter((p) =>
  p.name.toLowerCase().includes(search.toLowerCase()) ||
  p.phone && p.phone.includes(search) ||
  p.email && p.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredWriters = writers.filter((w) =>
  w.name.toLowerCase().includes(search.toLowerCase()) ||
  w.phone && w.phone.includes(search) ||
  w.email && w.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredChassiduyot = chassiduyot.filter((c) =>
  c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Photographer handlers
  const handlePhotographerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photographerForm.name.trim()) return;

    setSavingPhotographer(true);
    try {
      if (editingPhotographer) {
        await updatePhotographer(editingPhotographer.id, photographerForm);
      } else {
        await addPhotographer(photographerForm.name, photographerForm.phone, photographerForm.email);
      }
      setShowPhotographerModal(false);
      setEditingPhotographer(null);
      setPhotographerForm({ name: '', phone: '', email: '' });
    } finally {
      setSavingPhotographer(false);
    }
  };

  const handleDeletePhotographer = async (id: string) => {
    if (!confirm('האם למחוק את הצלם?')) return;
    await deletePhotographer(id);
  };

  const openEditPhotographer = (photographer: Photographer) => {
    setEditingPhotographer(photographer);
    setPhotographerForm({
      name: photographer.name,
      phone: photographer.phone || '',
      email: photographer.email || ''
    });
    setShowPhotographerModal(true);
  };

  // Writer handlers
  const handleWriterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!writerForm.name.trim()) return;

    setSavingWriter(true);
    try {
      if (editingWriter) {
        await updateWriter(editingWriter.id, writerForm);
      } else {
        await addWriter(writerForm.name, writerForm.phone, writerForm.email);
      }
      setShowWriterModal(false);
      setEditingWriter(null);
      setWriterForm({ name: '', phone: '', email: '' });
    } finally {
      setSavingWriter(false);
    }
  };

  const handleDeleteWriter = async (id: string) => {
    if (!confirm('האם למחוק את הכתב?')) return;
    await deleteWriter(id);
  };

  const openEditWriter = (writer: Writer) => {
    setEditingWriter(writer);
    setWriterForm({
      name: writer.name,
      phone: writer.phone || '',
      email: writer.email || ''
    });
    setShowWriterModal(true);
  };

  // Chassidut handlers
  const handleChassidutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chassidutForm.name.trim()) return;

    setSavingChassidut(true);
    try {
      if (editingChassidut) {
        await updateChassidut(editingChassidut.id, chassidutForm.name);
      } else {
        await addChassidut(chassidutForm.name);
      }
      setShowChassidutModal(false);
      setEditingChassidut(null);
      setChassidutForm({ name: '' });
    } finally {
      setSavingChassidut(false);
    }
  };

  const handleDeleteChassidut = async (id: string) => {
    if (!confirm('האם למחוק את החסידות?')) return;
    await deleteChassidut(id);
  };

  const openEditChassidut = (chassidut: Chassidut) => {
    setEditingChassidut(chassidut);
    setChassidutForm({ name: chassidut.name });
    setShowChassidutModal(true);
  };

  const loading = activeTab === 'photographers' ? photographersLoading :
  activeTab === 'writers' ? writersLoading : chassiduyotLoading;

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'photographers':return 'חפש צלם...';
      case 'writers':return 'חפש כתב...';
      case 'chassiduyot':return 'חפש חסידות...';
    }
  };

  const getAddButtonText = () => {
    switch (activeTab) {
      case 'photographers':return 'צלם חדש';
      case 'writers':return 'כתב חדש';
      case 'chassiduyot':return 'חסידות חדשה';
    }
  };

  const handleAddClick = () => {
    switch (activeTab) {
      case 'photographers':
        setEditingPhotographer(null);
        setPhotographerForm({ name: '', phone: '', email: '' });
        setShowPhotographerModal(true);
        break;
      case 'writers':
        setEditingWriter(null);
        setWriterForm({ name: '', phone: '', email: '' });
        setShowWriterModal(true);
        break;
      case 'chassiduyot':
        setEditingChassidut(null);
        setChassidutForm({ name: '' });
        setShowChassidutModal(true);
        break;
    }
  };

  return (
    <AdminLayout>
      <div data-ev-id="ev_d3da1a1cc4" className="flex flex-col gap-6">
        {/* Header */}
        <div data-ev-id="ev_7d070552fb" className="flex items-center justify-between">
          <div data-ev-id="ev_7bae0c9ed7">
            <h1 data-ev-id="ev_f369d36427" className="text-2xl font-bold text-foreground font-serif">ניהול נתונים</h1>
            <p data-ev-id="ev_337001e8ef" className="text-muted-foreground mt-1">
              ניהול צלמים, כתבים וחסידויות לשימוש בכל המערכת
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div data-ev-id="ev_eced8c53da" className="flex items-center gap-2 p-1 bg-muted/50 rounded-xl w-fit">
          <button data-ev-id="ev_01d91d0730"
          onClick={() => {setActiveTab('photographers');setSearch('');}}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
          activeTab === 'photographers' ?
          'bg-surface text-foreground shadow-sm' :
          'text-muted-foreground hover:text-foreground'}`
          }>

            <Camera className="w-4 h-4" />
            צלמים ({photographers.length})
          </button>
          <button data-ev-id="ev_fd02329a2b"
          onClick={() => {setActiveTab('writers');setSearch('');}}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
          activeTab === 'writers' ?
          'bg-surface text-foreground shadow-sm' :
          'text-muted-foreground hover:text-foreground'}`
          }>

            <PenTool className="w-4 h-4" />
            כתבים ({writers.length})
          </button>
          <button data-ev-id="ev_96fc2e81b9"
          onClick={() => {setActiveTab('chassiduyot');setSearch('');}}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
          activeTab === 'chassiduyot' ?
          'bg-surface text-foreground shadow-sm' :
          'text-muted-foreground hover:text-foreground'}`
          }>

            <Users className="w-4 h-4" />
            חסידויות ({chassiduyot.length})
          </button>
        </div>

        {/* Search and Add */}
        <div data-ev-id="ev_b3075908a7" className="flex items-center gap-4">
          <div data-ev-id="ev_947812700f" className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input data-ev-id="ev_2721fd81d2"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={getPlaceholder()}
            className="w-full bg-surface border border-border rounded-xl py-2.5 pr-12 pl-4" />

          </div>
          <button data-ev-id="ev_ad5dfff13c"
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-bold px-5 py-2.5 rounded-xl transition-colors">

            <Plus className="w-5 h-5" />
            {getAddButtonText()}
          </button>
        </div>

        {/* Content */}
        {loading ?
        <div data-ev-id="ev_04fb8589b9" className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          </div> :
        activeTab === 'photographers' ? (
        /* Photographers List */
        filteredPhotographers.length === 0 ?
        <div data-ev-id="ev_e5065ab9e4" className="text-center py-20 bg-surface rounded-2xl border border-border">
              <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p data-ev-id="ev_2c920f9e6f" className="text-muted-foreground">
                {search ? 'לא נמצאו צלמים התואמים לחיפוש' : 'אין צלמים במערכת'}
              </p>
            </div> :

        <div data-ev-id="ev_16d43b1ea2" className="bg-surface rounded-2xl border border-border overflow-hidden">
              <div data-ev-id="ev_c794e5305f" className="grid grid-cols-12 gap-4 p-4 bg-muted/30 border-b border-border text-sm font-medium text-muted-foreground">
                <div data-ev-id="ev_46ce38fdf1" className="col-span-5">שם הצלם</div>
                <div data-ev-id="ev_80f2710197" className="col-span-3">טלפון</div>
                <div data-ev-id="ev_7f513cf6b4" className="col-span-3">אימייל</div>
                <div data-ev-id="ev_8a53abd526" className="col-span-1"></div>
              </div>
              {filteredPhotographers.map((photographer, idx) =>
          <motion.div
            key={photographer.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
            className={`grid grid-cols-12 gap-4 p-4 items-center ${
            idx !== filteredPhotographers.length - 1 ? 'border-b border-border' : ''}`
            }>

                  <div data-ev-id="ev_96ff69c83f" className="col-span-5 flex items-center gap-3">
                    <div data-ev-id="ev_bfe87d2444" className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-secondary" />
                    </div>
                    <span data-ev-id="ev_8d975c023f" className="font-medium text-foreground">{photographer.name}</span>
                  </div>
                  <div data-ev-id="ev_7cbde9fcf0" className="col-span-3 flex items-center gap-2 text-muted-foreground">
                    {photographer.phone ?
              <>
                        <Phone className="w-4 h-4" />
                        <span data-ev-id="ev_f951a8d6d0" dir="ltr">{photographer.phone}</span>
                      </> :

              <span data-ev-id="ev_c9314fa4c5" className="text-sm">—</span>
              }
                  </div>
                  <div data-ev-id="ev_61186a7bb0" className="col-span-3 flex items-center gap-2 text-muted-foreground">
                    {photographer.email ?
              <>
                        <Mail className="w-4 h-4" />
                        <span data-ev-id="ev_49ef39687a" className="truncate">{photographer.email}</span>
                      </> :

              <span data-ev-id="ev_f9ac97b580" className="text-sm">—</span>
              }
                  </div>
                  <div data-ev-id="ev_4f50cf622e" className="col-span-1 flex items-center justify-end gap-2">
                    <button data-ev-id="ev_3db8f85a09"
              onClick={() => openEditPhotographer(photographer)}
              className="p-2 hover:bg-muted rounded-lg transition-colors">

                      <Edit className="w-4 h-4" />
                    </button>
                    <button data-ev-id="ev_3530bab422"
              onClick={() => handleDeletePhotographer(photographer.id)}
              className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-500">

                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
          )}
            </div>) :

        activeTab === 'writers' ? (
        /* Writers List */
        filteredWriters.length === 0 ?
        <div data-ev-id="ev_4dd7c1376c" className="text-center py-20 bg-surface rounded-2xl border border-border">
              <PenTool className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p data-ev-id="ev_3c6a1d451c" className="text-muted-foreground">
                {search ? 'לא נמצאו כתבים התואמים לחיפוש' : 'אין כתבים במערכת'}
              </p>
            </div> :

        <div data-ev-id="ev_eff29ba9f2" className="bg-surface rounded-2xl border border-border overflow-hidden">
              <div data-ev-id="ev_8fdae317d4" className="grid grid-cols-12 gap-4 p-4 bg-muted/30 border-b border-border text-sm font-medium text-muted-foreground">
                <div data-ev-id="ev_2c65025ca6" className="col-span-5">שם הכתב</div>
                <div data-ev-id="ev_de337ca211" className="col-span-3">טלפון</div>
                <div data-ev-id="ev_f3b15a50de" className="col-span-3">אימייל</div>
                <div data-ev-id="ev_4904199462" className="col-span-1"></div>
              </div>
              {filteredWriters.map((writer, idx) =>
          <motion.div
            key={writer.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
            className={`grid grid-cols-12 gap-4 p-4 items-center ${
            idx !== filteredWriters.length - 1 ? 'border-b border-border' : ''}`
            }>

                  <div data-ev-id="ev_891d678a41" className="col-span-5 flex items-center gap-3">
                    <div data-ev-id="ev_9a7cf01fcd" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <PenTool className="w-5 h-5 text-primary" />
                    </div>
                    <span data-ev-id="ev_d7731b85fc" className="font-medium text-foreground">{writer.name}</span>
                  </div>
                  <div data-ev-id="ev_73169d8caa" className="col-span-3 flex items-center gap-2 text-muted-foreground">
                    {writer.phone ?
              <>
                        <Phone className="w-4 h-4" />
                        <span data-ev-id="ev_7bb06ec08b" dir="ltr">{writer.phone}</span>
                      </> :

              <span data-ev-id="ev_a92d0be0f9" className="text-sm">—</span>
              }
                  </div>
                  <div data-ev-id="ev_e6bd13c9d4" className="col-span-3 flex items-center gap-2 text-muted-foreground">
                    {writer.email ?
              <>
                        <Mail className="w-4 h-4" />
                        <span data-ev-id="ev_62120de3df" className="truncate">{writer.email}</span>
                      </> :

              <span data-ev-id="ev_f1afe45218" className="text-sm">—</span>
              }
                  </div>
                  <div data-ev-id="ev_b850fb2514" className="col-span-1 flex items-center justify-end gap-2">
                    <button data-ev-id="ev_3947a4d74d"
              onClick={() => openEditWriter(writer)}
              className="p-2 hover:bg-muted rounded-lg transition-colors">

                      <Edit className="w-4 h-4" />
                    </button>
                    <button data-ev-id="ev_f7da256275"
              onClick={() => handleDeleteWriter(writer.id)}
              className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-500">

                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
          )}
            </div>) : (


        /* Chassiduyot List */
        filteredChassiduyot.length === 0 ?
        <div data-ev-id="ev_1fd4d5b445" className="text-center py-20 bg-surface rounded-2xl border border-border">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p data-ev-id="ev_4f930cff93" className="text-muted-foreground">
                {search ? 'לא נמצאו חסידויות התואמות לחיפוש' : 'אין חסידויות במערכת'}
              </p>
            </div> :

        <div data-ev-id="ev_140a7798f5" className="bg-surface rounded-2xl border border-border overflow-hidden">
              <div data-ev-id="ev_72a271f360" className="grid grid-cols-2 gap-4">
                {filteredChassiduyot.map((chassidut, idx) =>
            <motion.div
              key={chassidut.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.02 }}
              className="flex items-center justify-between p-4 border-b border-border hover:bg-muted/30 transition-colors">

                    <div data-ev-id="ev_ba5ef55559" className="flex items-center gap-3">
                      <div data-ev-id="ev_1c3137ab59" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <span data-ev-id="ev_ba098965a9" className="font-medium text-foreground">{chassidut.name}</span>
                    </div>
                    <div data-ev-id="ev_b1f05394a4" className="flex items-center gap-2">
                      <button data-ev-id="ev_00d11ee990"
                onClick={() => openEditChassidut(chassidut)}
                className="p-2 hover:bg-muted rounded-lg transition-colors">

                        <Edit className="w-4 h-4" />
                      </button>
                      <button data-ev-id="ev_26957e8981"
                onClick={() => handleDeleteChassidut(chassidut.id)}
                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-500">

                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
            )}
              </div>
            </div>)

        }
      </div>

      {/* Photographer Modal */}
      {showPhotographerModal &&
      <div data-ev-id="ev_bcff68c177" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface rounded-2xl w-full max-w-md">

            <div data-ev-id="ev_a2080fea4b" className="flex items-center justify-between p-6 border-b border-border">
              <h2 data-ev-id="ev_e080c6ee2d" className="text-xl font-bold text-foreground">
                {editingPhotographer ? 'עריכת צלם' : 'צלם חדש'}
              </h2>
              <button data-ev-id="ev_857e61f877"
            onClick={() => setShowPhotographerModal(false)}
            className="p-2 hover:bg-muted rounded-lg">

                <X className="w-5 h-5" />
              </button>
            </div>

            <form data-ev-id="ev_b399a06800" onSubmit={handlePhotographerSubmit} className="p-6 flex flex-col gap-4">
              <div data-ev-id="ev_aed8c6e19f">
                <label data-ev-id="ev_bd675bd6c6" className="block text-sm font-medium mb-2">שם הצלם *</label>
                <input data-ev-id="ev_d25d4719a5"
              type="text"
              value={photographerForm.name}
              onChange={(e) => setPhotographerForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4"
              required />

              </div>

              <div data-ev-id="ev_db686b840a">
                <label data-ev-id="ev_ee1b8a3666" className="block text-sm font-medium mb-2">טלפון</label>
                <input data-ev-id="ev_cd0936cda9"
              type="tel"
              dir="ltr"
              value={photographerForm.phone}
              onChange={(e) => setPhotographerForm((p) => ({ ...p, phone: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-left"
              placeholder="050-0000000" />

              </div>

              <div data-ev-id="ev_546082d45f">
                <label data-ev-id="ev_77e9c94913" className="block text-sm font-medium mb-2">אימייל</label>
                <input data-ev-id="ev_e88ffc9631"
              type="email"
              dir="ltr"
              value={photographerForm.email}
              onChange={(e) => setPhotographerForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-left"
              placeholder="email@example.com" />

              </div>

              <div data-ev-id="ev_306fa33c62" className="flex justify-end gap-3 mt-4">
                <button data-ev-id="ev_49b5a17a11"
              type="button"
              onClick={() => setShowPhotographerModal(false)}
              className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors">

                  ביטול
                </button>
                <button data-ev-id="ev_256991b732"
              type="submit"
              disabled={savingPhotographer || !photographerForm.name.trim()}
              className="flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50">

                  {savingPhotographer ?
                <Loader2 className="w-4 h-4 animate-spin" /> :

                <Check className="w-4 h-4" />
                }
                  {editingPhotographer ? 'עדכן' : 'הוסף'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      }

      {/* Writer Modal */}
      {showWriterModal &&
      <div data-ev-id="ev_c5c8cbe41d" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface rounded-2xl w-full max-w-md">

            <div data-ev-id="ev_f263b6c455" className="flex items-center justify-between p-6 border-b border-border">
              <h2 data-ev-id="ev_2100105d9e" className="text-xl font-bold text-foreground">
                {editingWriter ? 'עריכת כתב' : 'כתב חדש'}
              </h2>
              <button data-ev-id="ev_85c8fb0fb1"
            onClick={() => setShowWriterModal(false)}
            className="p-2 hover:bg-muted rounded-lg">

                <X className="w-5 h-5" />
              </button>
            </div>

            <form data-ev-id="ev_e1990a51db" onSubmit={handleWriterSubmit} className="p-6 flex flex-col gap-4">
              <div data-ev-id="ev_581532277b">
                <label data-ev-id="ev_75ebe4b1eb" className="block text-sm font-medium mb-2">שם הכתב *</label>
                <input data-ev-id="ev_114ea7e814"
              type="text"
              value={writerForm.name}
              onChange={(e) => setWriterForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4"
              required />

              </div>

              <div data-ev-id="ev_43a7da9f76">
                <label data-ev-id="ev_a7f6cb0eed" className="block text-sm font-medium mb-2">טלפון</label>
                <input data-ev-id="ev_838c98aa40"
              type="tel"
              dir="ltr"
              value={writerForm.phone}
              onChange={(e) => setWriterForm((p) => ({ ...p, phone: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-left"
              placeholder="050-0000000" />

              </div>

              <div data-ev-id="ev_fee1c651e3">
                <label data-ev-id="ev_39749c438e" className="block text-sm font-medium mb-2">אימייל</label>
                <input data-ev-id="ev_c990d312c3"
              type="email"
              dir="ltr"
              value={writerForm.email}
              onChange={(e) => setWriterForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-left"
              placeholder="email@example.com" />

              </div>

              <div data-ev-id="ev_bbd5c859d8" className="flex justify-end gap-3 mt-4">
                <button data-ev-id="ev_ef51f6f3ea"
              type="button"
              onClick={() => setShowWriterModal(false)}
              className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors">

                  ביטול
                </button>
                <button data-ev-id="ev_6be6b37411"
              type="submit"
              disabled={savingWriter || !writerForm.name.trim()}
              className="flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50">

                  {savingWriter ?
                <Loader2 className="w-4 h-4 animate-spin" /> :

                <Check className="w-4 h-4" />
                }
                  {editingWriter ? 'עדכן' : 'הוסף'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      }

      {/* Chassidut Modal */}
      {showChassidutModal &&
      <div data-ev-id="ev_71abc40b10" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface rounded-2xl w-full max-w-md">

            <div data-ev-id="ev_2fbb7a4f12" className="flex items-center justify-between p-6 border-b border-border">
              <h2 data-ev-id="ev_0df3dd54a5" className="text-xl font-bold text-foreground">
                {editingChassidut ? 'עריכת חסידות' : 'חסידות חדשה'}
              </h2>
              <button data-ev-id="ev_dd4246c24a"
            onClick={() => setShowChassidutModal(false)}
            className="p-2 hover:bg-muted rounded-lg">

                <X className="w-5 h-5" />
              </button>
            </div>

            <form data-ev-id="ev_2efd8aeba9" onSubmit={handleChassidutSubmit} className="p-6 flex flex-col gap-4">
              <div data-ev-id="ev_2b1da92de7">
                <label data-ev-id="ev_2b7e368162" className="block text-sm font-medium mb-2">שם החסידות *</label>
                <input data-ev-id="ev_2f6dd58481"
              type="text"
              value={chassidutForm.name}
              onChange={(e) => setChassidutForm({ name: e.target.value })}
              className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4"
              placeholder="לדוגמה: ויז'ניץ, גור, בעלז..."
              required />

              </div>

              <div data-ev-id="ev_5049137298" className="flex justify-end gap-3 mt-4">
                <button data-ev-id="ev_a345d307f5"
              type="button"
              onClick={() => setShowChassidutModal(false)}
              className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors">

                  ביטול
                </button>
                <button data-ev-id="ev_f05c0648c4"
              type="submit"
              disabled={savingChassidut || !chassidutForm.name.trim()}
              className="flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50">

                  {savingChassidut ?
                <Loader2 className="w-4 h-4 animate-spin" /> :

                <Check className="w-4 h-4" />
                }
                  {editingChassidut ? 'עדכן' : 'הוסף'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      }
    </AdminLayout>);

}