import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { useWriters, Writer } from '@/hooks/useWriters';
import {
  Plus,
  Edit,
  Trash2,
  User,
  Loader2,
  X,
  Phone,
  Mail,
  Search,
  Save,
  Users } from
'lucide-react';

export default function AdminWriters() {
  const { writers, loading, addWriter, updateWriter, deleteWriter, refetch } = useWriters();
  const [showModal, setShowModal] = useState(false);
  const [editingWriter, setEditingWriter] = useState<Writer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const resetForm = () => {
    setFormData({ name: '', phone: '', email: '' });
    setEditingWriter(null);
  };

  const openNewModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (writer: Writer) => {
    setEditingWriter(writer);
    setFormData({
      name: writer.name,
      phone: writer.phone || '',
      email: writer.email || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      if (editingWriter) {
        // Update existing
        const success = await updateWriter(editingWriter.id, {
          name: formData.name.trim(),
          phone: formData.phone.trim() || null,
          email: formData.email.trim() || null
        });
        if (success) {
          closeModal();
        }
      } else {
        // Add new
        const result = await addWriter(
          formData.name.trim(),
          formData.phone.trim() || undefined,
          formData.email.trim() || undefined
        );
        if (result) {
          closeModal();
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (writer: Writer) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את הכתב "${writer.name}"?`)) return;
    await deleteWriter(writer.id);
  };

  // Filter writers by search term
  const filteredWriters = writers.filter((w) =>
  w?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
  w?.email && w?.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
  w.phone && w.phone.includes(searchTerm)
  );

  return (
    <AdminLayout>
      <div data-ev-id="ev_49d0b15b18" className="p-6">
        {/* Header */}
        <div data-ev-id="ev_3f0919821f" className="flex items-center justify-between mb-8">
          <div data-ev-id="ev_fb4d321a32">
            <div data-ev-id="ev_f4cd4879cf" className="flex items-center gap-3">
              <Users className="w-8 h-8 text-secondary" />
              <h1 data-ev-id="ev_2463ce4e38" className="text-3xl font-bold">ניהול כתבים</h1>
            </div>
            <p data-ev-id="ev_7b8efb50d4" className="text-muted-foreground mt-1">
              נהל את רשימת הכתבים והעורכים
            </p>
          </div>
          <button data-ev-id="ev_da13416a51"
          onClick={openNewModal}
          className="flex items-center gap-2 px-6 py-3 bg-secondary text-primary font-bold rounded-xl hover:bg-secondary-light transition-colors shadow-gold">

            <Plus className="w-5 h-5" />
            הוסף כתב
          </button>
        </div>

        {/* Search */}
        <div data-ev-id="ev_df223a60ae" className="mb-6">
          <div data-ev-id="ev_103307042d" className="relative max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input data-ev-id="ev_ead5ad84e7"
            type="text"
            placeholder="חפש כתב..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground" />

          </div>
        </div>

        {/* Loading */}
        {loading &&
        <div data-ev-id="ev_38459aba18" className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          </div>
        }

        {/* Empty State */}
        {!loading && writers.length === 0 &&
        <div data-ev-id="ev_dd604b8815" className="text-center py-20 bg-surface rounded-2xl border border-border">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 data-ev-id="ev_968816b27d" className="text-xl font-bold mb-2">אין כתבים</h3>
            <p data-ev-id="ev_4bbb68d238" className="text-muted-foreground mb-6">הוסף את הכתב הראשון שלך</p>
            <button data-ev-id="ev_7f9e99480b"
          onClick={openNewModal}
          className="px-6 py-3 bg-secondary text-primary font-bold rounded-xl hover:bg-secondary-light transition-colors">

              <Plus className="w-5 h-5 inline mr-2" />
              הוסף כתב
            </button>
          </div>
        }

        {/* Writers Grid */}
        {!loading && filteredWriters.length > 0 &&
        <div data-ev-id="ev_3187a7ef7e" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWriters.map((writer, idx) =>
          <motion.div
            key={writer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-surface rounded-xl border border-border p-5 hover:border-secondary/50 transition-colors group">

                <div data-ev-id="ev_94c0c5fd65" className="flex items-start gap-4">
                  {/* Avatar */}
                  <div data-ev-id="ev_1162d2d2e8" className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center text-secondary font-bold text-xl shrink-0">
                    {writer.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div data-ev-id="ev_012276b6ac" className="flex-1 min-w-0">
                    <h3 data-ev-id="ev_16d2afd33f" className="font-bold text-lg text-foreground truncate">
                      {writer.name}
                    </h3>
                    {writer.email &&
                <div data-ev-id="ev_61516a2a90" className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Mail className="w-4 h-4" />
                        <span data-ev-id="ev_3725d2ef02" className="truncate">{writer.email}</span>
                      </div>
                }
                    {writer.phone &&
                <div data-ev-id="ev_17913b0f7a" className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Phone className="w-4 h-4" />
                        <span data-ev-id="ev_01c61c68c6" dir="ltr">{writer.phone}</span>
                      </div>
                }
                  </div>
                </div>

                {/* Actions */}
                <div data-ev-id="ev_6bf95a14b0" className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  <button data-ev-id="ev_375e54aaea"
              onClick={() => openEditModal(writer)}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors">

                    <Edit className="w-4 h-4" />
                    עריכה
                  </button>
                  <button data-ev-id="ev_3ca8e497f1"
              onClick={() => handleDelete(writer)}
              className="flex items-center justify-center gap-2 py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-colors">

                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
          )}
          </div>
        }

        {/* No Results */}
        {!loading && writers.length > 0 && filteredWriters.length === 0 &&
        <div data-ev-id="ev_66c3f9a0c8" className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p data-ev-id="ev_194e8de1c8" className="text-muted-foreground">לא נמצאו כתבים לחיפוש "{searchTerm}"</p>
          </div>
        }

        {/* Stats */}
        {!loading && writers.length > 0 &&
        <div data-ev-id="ev_f283b1ef8a" className="mt-8 p-4 bg-muted/30 rounded-xl text-center text-muted-foreground">
            סה"כ {writers.length} כתבים במערכת
          </div>
        }
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={closeModal}>

            <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-surface rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}>

              {/* Modal Header */}
              <div data-ev-id="ev_6c32af1f39" className="flex items-center justify-between p-6 border-b border-border">
                <h2 data-ev-id="ev_9621122178" className="text-xl font-bold">
                  {editingWriter ? 'עריכת כתב' : 'הוספת כתב חדש'}
                </h2>
                <button data-ev-id="ev_1306b77e88"
              onClick={closeModal}
              className="p-2 hover:bg-muted rounded-lg transition-colors">

                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div data-ev-id="ev_1c9684c62d" className="p-6 flex flex-col gap-5">
                {/* Name */}
                <div data-ev-id="ev_69d0a73eeb">
                  <label data-ev-id="ev_3c05a3b70a" className="block text-sm font-medium mb-2">
                    שם הכתב <span data-ev-id="ev_dc7db6391e" className="text-red-500">*</span>
                  </label>
                  <div data-ev-id="ev_cd68a04531" className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input data-ev-id="ev_7847ec2bbe"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="הרב ישראל ישראלי"
                  className="w-full pr-12 pl-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground"
                  autoFocus />

                  </div>
                </div>

                {/* Phone */}
                <div data-ev-id="ev_8e69ba5356">
                  <label data-ev-id="ev_9d5f129875" className="block text-sm font-medium mb-2">טלפון</label>
                  <div data-ev-id="ev_ee87c97ba2" className="relative">
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input data-ev-id="ev_2c244ab660"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="050-1234567"
                  dir="ltr"
                  className="w-full pr-12 pl-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground text-left" />

                  </div>
                </div>

                {/* Email */}
                <div data-ev-id="ev_4ceadf2543">
                  <label data-ev-id="ev_49e0351443" className="block text-sm font-medium mb-2">אימייל</label>
                  <div data-ev-id="ev_9845856ee9" className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input data-ev-id="ev_7505dd47eb"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="email@example.com"
                  dir="ltr"
                  className="w-full pr-12 pl-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground text-left" />

                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div data-ev-id="ev_84800c7afb" className="flex items-center gap-3 p-6 border-t border-border">
                <button data-ev-id="ev_e6a30789dc"
              onClick={closeModal}
              className="flex-1 py-3 bg-muted hover:bg-muted/80 rounded-xl font-medium transition-colors">

                  ביטול
                </button>
                <button data-ev-id="ev_7786352518"
              onClick={handleSave}
              disabled={saving || !formData.name.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-secondary text-primary font-bold rounded-xl hover:bg-secondary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed">

                  {saving ?
                <Loader2 className="w-5 h-5 animate-spin" /> :

                <>
                      <Save className="w-5 h-5" />
                      {editingWriter ? 'שמור' : 'הוסף'}
                    </>
                }
                </button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </AdminLayout>);

}
