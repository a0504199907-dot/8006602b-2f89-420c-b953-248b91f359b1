import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import ImageUploader from '@/components/ui/ImageUploader';
import PDFUploader from '@/components/ui/PDFUploader';
import { useHebrewDate } from '@/hooks/useHebrewDateFull';
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Loader2,
  X,
  Eye,
  Calendar,
  Download,
  Upload } from
'lucide-react';

interface NewspaperIssue {
  id: string;
  issue_number: number;
  title: string;
  cover_image_url: string | null;
  pdf_url: string | null;
  hebrew_date: string | null;
  gregorian_date: string;
  parasha: string | null;
  description: string | null;
  is_published: boolean;
  created_at: string;
}

export default function AdminNewspaperIssues() {
  const [issues, setIssues] = useState<NewspaperIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState<NewspaperIssue | null>(null);
  const hebrewDate = useHebrewDate();

  const [formData, setFormData] = useState({
    issue_number: 1,
    title: '',
    cover_image_url: '',
    pdf_url: '',
    hebrew_date: '',
    gregorian_date: new Date().toISOString().split('T')[0],
    parasha: '',
    description: '',
    is_published: true
  });

  useEffect(() => {
    fetchIssues();
  }, []);

  useEffect(() => {
    // Auto-fill Hebrew date when gregorian date changes
    if (formData.gregorian_date && !editingIssue) {
      setFormData((prev) => ({
        ...prev,
        hebrew_date: hebrewDate.hebrewFull,
        parasha: hebrewDate.parasha
      }));
    }
  }, [formData.gregorian_date, hebrewDate]);

  const fetchIssues = async () => {
    if (!supabase) {setLoading(false);return;}

    try {
      const { data, error } = await supabase.
      from('newspaper_issues').
      select('*').
      order('gregorian_date', { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    try {
      if (editingIssue) {
        const { error } = await supabase.
        from('newspaper_issues').
        update(formData).
        eq('id', editingIssue.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.
        from('newspaper_issues').
        insert(formData);
        if (error) throw error;
      }
      setShowModal(false);
      setEditingIssue(null);
      resetForm();
      fetchIssues();
    } catch (error) {
      console.error('Error saving issue:', error);
    }
  };

  const deleteIssue = async (id: string) => {
    if (!confirm('האם למחוק את הגיליון?')) return;
    if (!supabase) return;

    try {
      const { error } = await supabase.from('newspaper_issues').delete().eq('id', id);
      if (error) throw error;
      setIssues(issues.filter((i) => i.id !== id));
    } catch (error) {
      console.error('Error deleting issue:', error);
    }
  };

  const openEditModal = (issue: NewspaperIssue) => {
    setEditingIssue(issue);
    setFormData({
      issue_number: issue.issue_number,
      title: issue.title,
      cover_image_url: issue.cover_image_url || '',
      pdf_url: issue.pdf_url || '',
      hebrew_date: issue.hebrew_date || '',
      gregorian_date: issue.gregorian_date,
      parasha: issue.parasha || '',
      description: issue.description || '',
      is_published: issue.is_published
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      issue_number: (issues[0]?.issue_number || 0) + 1,
      title: '',
      cover_image_url: '',
      pdf_url: '',
      hebrew_date: hebrewDate.hebrewFull,
      gregorian_date: new Date().toISOString().split('T')[0],
      parasha: hebrewDate.parasha,
      description: '',
      is_published: true
    });
  };

  return (
    <AdminLayout>
      <div data-ev-id="ev_ce07c87571" className="flex flex-col gap-6">
        {/* Header */}
        <div data-ev-id="ev_a3dfd76869" className="flex items-center justify-between">
          <div data-ev-id="ev_1cd0863ff3">
            <h1 data-ev-id="ev_cf22670402" className="text-2xl font-bold text-foreground font-serif">גיליונות העיתון</h1>
            <p data-ev-id="ev_0848f0e4f9" className="text-muted-foreground mt-1">{issues.length} גיליונות במערכת</p>
          </div>
          <button data-ev-id="ev_7ab9cf7ee0"
          onClick={() => {resetForm();setEditingIssue(null);setShowModal(true);}}
          className="flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary font-bold px-5 py-2.5 rounded-xl transition-colors">

            <Plus className="w-5 h-5" />
            גיליון חדש
          </button>
        </div>

        {/* Issues Grid */}
        {loading ?
        <div data-ev-id="ev_206fba7309" className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          </div> :
        issues.length === 0 ?
        <div data-ev-id="ev_4faa337b53" className="text-center py-20 bg-surface rounded-2xl border border-border">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p data-ev-id="ev_5851e061bc" className="text-muted-foreground">אין גיליונות להצגה</p>
          </div> :

        <div data-ev-id="ev_d896993624" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {issues.map((issue, idx) =>
          <motion.div
            key={issue.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-surface rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow">

                {/* Cover Image */}
                <div data-ev-id="ev_53f88d167f" className="aspect-[3/4] relative bg-muted">
                  {issue.cover_image_url ?
              <img data-ev-id="ev_38073a2f43"
              src={issue.cover_image_url}
              alt={issue.title}
              className="w-full h-full object-cover" /> :


              <div data-ev-id="ev_bd8a7c65f9" className="w-full h-full flex items-center justify-center">
                      <FileText className="w-16 h-16 text-muted-foreground" />
                    </div>
              }
                  
                  {/* Issue Number Badge */}
                  <div data-ev-id="ev_fd6ff6bfab" className="absolute top-3 right-3 bg-secondary text-primary px-3 py-1 rounded-full text-sm font-bold">
                    גיליון {issue.issue_number}
                  </div>
                  
                  {!issue.is_published &&
              <div data-ev-id="ev_bef1e7025a" className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs">
                      טיוטה
                    </div>
              }
                </div>

                {/* Info */}
                <div data-ev-id="ev_54c5fd09f4" className="p-4">
                  <h3 data-ev-id="ev_68b66db06e" className="font-bold text-foreground mb-1 line-clamp-1">{issue.title}</h3>
                  <div data-ev-id="ev_e48544a191" className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="w-4 h-4" />
                    <span data-ev-id="ev_cd856a8139">{issue.hebrew_date || issue.gregorian_date}</span>
                  </div>
                  {issue.parasha &&
              <p data-ev-id="ev_5bb2737225" className="text-sm text-secondary-dark mb-3">{issue.parasha}</p>
              }
                  
                  {/* Actions */}
                  <div data-ev-id="ev_1918a78ddb" className="flex items-center gap-2">
                    {issue.pdf_url &&
                <a data-ev-id="ev_188f41dda5"
                href={issue.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors text-sm">

                        <Eye className="w-4 h-4" />
                        צפיה
                      </a>
                }
                    <button data-ev-id="ev_0b4a733e3a"
                onClick={() => openEditModal(issue)}
                className="p-2 hover:bg-muted rounded-lg transition-colors">

                      <Edit className="w-4 h-4" />
                    </button>
                    <button data-ev-id="ev_316f0d440f"
                onClick={() => deleteIssue(issue.id)}
                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-500">

                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
          )}
          </div>
        }
      </div>

      {/* Modal */}
      {showModal &&
      <div data-ev-id="ev_12f1a4aa03" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            <div data-ev-id="ev_4a6378f221" className="flex items-center justify-between p-6 border-b border-border">
              <h2 data-ev-id="ev_c3ce5495f4" className="text-xl font-bold text-foreground">
                {editingIssue ? 'עריכת גיליון' : 'גיליון חדש'}
              </h2>
              <button data-ev-id="ev_1f908a55aa" onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form data-ev-id="ev_6807abcd74" onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div data-ev-id="ev_7762a3be0f" className="grid grid-cols-2 gap-4">
                <div data-ev-id="ev_6174c4099c">
                  <label data-ev-id="ev_6848f10785" className="block text-sm font-medium mb-2">מספר גיליון</label>
                  <input data-ev-id="ev_cd40e1580a"
                type="number"
                value={formData.issue_number}
                onChange={(e) => setFormData((prev) => ({ ...prev, issue_number: parseInt(e.target.value) }))}
                className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4"
                required />

                </div>
                <div data-ev-id="ev_dbc6535dc9">
                  <label data-ev-id="ev_44298b8a3d" className="block text-sm font-medium mb-2">תאריך</label>
                  <input data-ev-id="ev_4870f5e440"
                type="date"
                value={formData.gregorian_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, gregorian_date: e.target.value }))}
                className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4"
                required />

                </div>
              </div>

              <div data-ev-id="ev_f58fa7d98d">
                <label data-ev-id="ev_a434163af6" className="block text-sm font-medium mb-2">כותרת</label>
                <input data-ev-id="ev_d833c590cc"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="למשל: גיליון מיוחד לפסח"
              className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4"
              required />

              </div>

              <div data-ev-id="ev_7903b3c5d2" className="grid grid-cols-2 gap-4">
                <div data-ev-id="ev_85d6f2c550">
                  <label data-ev-id="ev_c92896dd34" className="block text-sm font-medium mb-2">תאריך עברי</label>
                  <input data-ev-id="ev_d26fa9d184"
                type="text"
                value={formData.hebrew_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, hebrew_date: e.target.value }))}
                placeholder="ה' שבט תשפ"
                className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4" />

                </div>
                <div data-ev-id="ev_d65e39b3a0">
                  <label data-ev-id="ev_09530ce3c7" className="block text-sm font-medium mb-2">פרשה</label>
                  <input data-ev-id="ev_15b288a521"
                type="text"
                value={formData.parasha}
                onChange={(e) => setFormData((prev) => ({ ...prev, parasha: e.target.value }))}
                placeholder="פרשת בשלח"
                className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4" />

                </div>
              </div>

              <div data-ev-id="ev_02ecb90aa7">
                <label data-ev-id="ev_fd749eff03" className="block text-sm font-medium mb-2">תמונת שער</label>
                <ImageUploader
                value={formData.cover_image_url}
                onChange={(url) => setFormData((prev) => ({ ...prev, cover_image_url: url }))}
                placeholder="העלה תמונת שער" />

              </div>

              <div data-ev-id="ev_33acf29c45">
                <PDFUploader
                  value={formData.pdf_url}
                  onChange={(url) => setFormData((prev) => ({ ...prev, pdf_url: url }))}
                  label="קובץ PDF"
                  placeholder="הדבק קישור לקובץ PDF"
                />
              </div>

              <div data-ev-id="ev_7d76edc703">
                <label data-ev-id="ev_312dfa267b" className="block text-sm font-medium mb-2">תיאור</label>
                <textarea data-ev-id="ev_3e3b4252f8"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 resize-none"
              rows={3} />

              </div>

              <label data-ev-id="ev_cbc846471d" className="flex items-center gap-3 cursor-pointer">
                <input data-ev-id="ev_fbe984ffd2"
              type="checkbox"
              checked={formData.is_published}
              onChange={(e) => setFormData((prev) => ({ ...prev, is_published: e.target.checked }))}
              className="w-5 h-5 rounded" />

                <span data-ev-id="ev_35c52e8282">פרסם גיליון</span>
              </label>

              <div data-ev-id="ev_96bd2e0170" className="flex gap-3 mt-4">
                <button data-ev-id="ev_c70071de12"
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 py-2.5 border border-border rounded-xl hover:bg-muted transition-colors">

                  ביטול
                </button>
                <button data-ev-id="ev_e8d39403c0"
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