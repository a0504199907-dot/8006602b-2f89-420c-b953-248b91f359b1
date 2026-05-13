import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Megaphone, Mail, Phone, ExternalLink, Check, X, Clock, MessageSquare } from 'lucide-react';

interface AdRequest {
  id: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  business_name: string | null;
  ad_type: string;
  ad_size: string;
  duration: string;
  image_url: string | null;
  target_url: string | null;
  notes: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const statusLabels: Record<string, {label: string;color: string;}> = {
  pending: { label: 'ממתין', color: 'bg-amber-500/10 text-amber-400' },
  contacted: { label: 'ניצר קשר', color: 'bg-blue-500/10 text-blue-400' },
  approved: { label: 'אושר', color: 'bg-green-500/10 text-green-400' },
  rejected: { label: 'נדחה', color: 'bg-red-500/10 text-red-400' }
};

const adTypeLabels: Record<string, string> = {
  'banner-top': 'באנר עליון',
  'banner-side': 'באנר צדדי',
  'banner-content': 'בתוך תוכן',
  'sponsored': 'תוכן ממומן'
};

const durationLabels: Record<string, string> = {
  '1week': 'שבוע',
  '2weeks': 'שבועיים',
  '1month': 'חודש',
  '3months': '3 חודשים'
};

export default function AdminAdRequests() {
  const [requests, setRequests] = useState<AdRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AdRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    if (!supabase) return;

    const { data } = await supabase.
    from('ad_requests').
    select('*').
    order('created_at', { ascending: false });

    if (data) setRequests(data);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    if (!supabase) return;

    await supabase.
    from('ad_requests').
    update({ status, updated_at: new Date().toISOString() }).
    eq('id', id);

    fetchRequests();
    if (selectedRequest?.id === id) {
      setSelectedRequest({ ...selectedRequest, status });
    }
  };

  const saveAdminNotes = async () => {
    if (!supabase || !selectedRequest) return;

    await supabase.
    from('ad_requests').
    update({ admin_notes: selectedRequest.admin_notes }).
    eq('id', selectedRequest.id);
  };

  const filteredRequests = requests.filter((r) =>
  filterStatus === 'all' || r.status === filterStatus
  );

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <AdminLayout>
      <div data-ev-id="ev_f7559e4965" className="p-6">
        {/* Header */}
        <div data-ev-id="ev_32e14702d1" className="flex items-center justify-between mb-6">
          <div data-ev-id="ev_5e894cea8c" className="flex items-center gap-3">
            <div data-ev-id="ev_1a671d54c8" className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-secondary" />
            </div>
            <div data-ev-id="ev_55f3ecfc0d">
              <h1 data-ev-id="ev_727f17813a" className="text-2xl font-bold text-white">בקשות פרסום</h1>
              <p data-ev-id="ev_e531f171ab" className="text-zinc-400 text-sm">ניהול בקשות פרסום מהציבור</p>
            </div>
          </div>
          
          {pendingCount > 0 &&
          <div data-ev-id="ev_832509f002" className="px-4 py-2 bg-amber-500/10 text-amber-400 rounded-lg flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {pendingCount} בקשות ממתינות
            </div>
          }
        </div>

        {/* Filters */}
        <div data-ev-id="ev_dbc118c7ea" className="flex gap-2 mb-6">
          {['all', 'pending', 'contacted', 'approved', 'rejected'].map((status) =>
          <button data-ev-id="ev_a80b91293a"
          key={status}
          onClick={() => setFilterStatus(status)}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
          filterStatus === status ?
          'bg-secondary text-primary font-bold' :
          'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`
          }>

              {status === 'all' ? 'הכל' : statusLabels[status].label}
            </button>
          )}
        </div>

        {loading ?
        <div data-ev-id="ev_accb0f3c17" className="text-center py-12">
            <div data-ev-id="ev_901a24ddf9" className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto" />
          </div> :

        <div data-ev-id="ev_6cdbb6ed0e" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Requests List */}
            <div data-ev-id="ev_3de6fc0860" className="lg:col-span-2">
              <div data-ev-id="ev_858497e303" className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                {filteredRequests.length === 0 ?
              <div data-ev-id="ev_880e0995d0" className="text-center py-12 text-zinc-500">
                    אין בקשות
                  </div> :

              <div data-ev-id="ev_3ff51919e9" className="divide-y divide-zinc-800">
                    {filteredRequests.map((request) =>
                <div data-ev-id="ev_173e48b8e4"
                key={request.id}
                onClick={() => setSelectedRequest(request)}
                className={`p-4 cursor-pointer transition-colors ${
                selectedRequest?.id === request.id ?
                'bg-secondary/5' :
                'hover:bg-zinc-800/50'}`
                }>

                        <div data-ev-id="ev_f08c24dbb8" className="flex items-start justify-between gap-4">
                          <div data-ev-id="ev_8e224b374f" className="flex-1">
                            <div data-ev-id="ev_2beed83d4a" className="flex items-center gap-3 mb-2">
                              <span data-ev-id="ev_6062e9e3fe" className="font-bold text-white">{request.contact_name}</span>
                              {request.business_name &&
                        <span data-ev-id="ev_0bd3da7216" className="text-zinc-400 text-sm">({request.business_name})</span>
                        }
                            </div>
                            <div data-ev-id="ev_05a2a73318" className="flex flex-wrap gap-2 text-sm">
                              <span data-ev-id="ev_7de248f5e9" className="px-2 py-1 bg-zinc-800 rounded text-zinc-300">
                                {adTypeLabels[request.ad_type]}
                              </span>
                              <span data-ev-id="ev_9dc14c9873" className="px-2 py-1 bg-zinc-800 rounded text-zinc-300">
                                {request.ad_size}
                              </span>
                              <span data-ev-id="ev_798c2e05e5" className="px-2 py-1 bg-zinc-800 rounded text-zinc-300">
                                {durationLabels[request.duration]}
                              </span>
                            </div>
                          </div>
                          <div data-ev-id="ev_f2b0a41e20" className="flex flex-col items-end gap-2">
                            <span data-ev-id="ev_d0ea506c05" className={`px-2 py-1 rounded text-xs ${statusLabels[request.status].color}`}>
                              {statusLabels[request.status].label}
                            </span>
                            <span data-ev-id="ev_be1d53c8b0" className="text-xs text-zinc-500">
                              {new Date(request.created_at).toLocaleDateString('he-IL')}
                            </span>
                          </div>
                        </div>
                      </div>
                )}
                  </div>
              }
              </div>
            </div>

            {/* Request Details */}
            <div data-ev-id="ev_a6da44e121" className="lg:col-span-1">
              {selectedRequest ?
            <div data-ev-id="ev_d9d58afcdd" className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden sticky top-6">
                  <div data-ev-id="ev_e217ef0ccb" className="p-4 border-b border-zinc-800">
                    <h2 data-ev-id="ev_a4c3761fdf" className="font-bold text-white">פרטי בקשה</h2>
                  </div>
                  
                  <div data-ev-id="ev_b15e90382e" className="p-4 space-y-4">
                    {/* Contact Info */}
                    <div data-ev-id="ev_a98f68d193">
                      <h3 data-ev-id="ev_ac2823ba50" className="text-sm text-zinc-400 mb-2">פרטי קשר</h3>
                      <div data-ev-id="ev_f2661bcf61" className="space-y-2">
                        <a data-ev-id="ev_320b02fed8" href={`mailto:${selectedRequest.contact_email}`} className="flex items-center gap-2 text-white hover:text-secondary">
                          <Mail className="w-4 h-4" />
                          {selectedRequest.contact_email}
                        </a>
                        <a data-ev-id="ev_220225dcb2" href={`tel:${selectedRequest.contact_phone}`} className="flex items-center gap-2 text-white hover:text-secondary">
                          <Phone className="w-4 h-4" />
                          {selectedRequest.contact_phone}
                        </a>
                      </div>
                    </div>

                    {/* Ad Details */}
                    <div data-ev-id="ev_4d6ab578a8">
                      <h3 data-ev-id="ev_6d46abd01e" className="text-sm text-zinc-400 mb-2">פרטי פרסום</h3>
                      <div data-ev-id="ev_28bf4725d6" className="text-white text-sm space-y-1">
                        <p data-ev-id="ev_b15060d854"><strong data-ev-id="ev_7d52924976">סוג:</strong> {adTypeLabels[selectedRequest.ad_type]}</p>
                        <p data-ev-id="ev_647cec4c02"><strong data-ev-id="ev_fb0ecc1aee">גודל:</strong> {selectedRequest.ad_size}</p>
                        <p data-ev-id="ev_22e726784d"><strong data-ev-id="ev_a7dc5a1deb">תקופה:</strong> {durationLabels[selectedRequest.duration]}</p>
                      </div>
                    </div>

                    {/* Image Preview */}
                    {selectedRequest.image_url &&
                <div data-ev-id="ev_5c78ec3b39">
                        <h3 data-ev-id="ev_72cba0b4d2" className="text-sm text-zinc-400 mb-2">תמונה</h3>
                        <img data-ev-id="ev_648503d46c"
                  src={selectedRequest.image_url}
                  alt="תצוגה מקדימה"
                  className="w-full rounded-lg" />

                      </div>
                }

                    {/* Target URL */}
                    {selectedRequest.target_url &&
                <div data-ev-id="ev_537452a4a3">
                        <h3 data-ev-id="ev_1a7aa15cf0" className="text-sm text-zinc-400 mb-2">קישור יעד</h3>
                        <a data-ev-id="ev_7969b6647d"
                  href={selectedRequest.target_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-secondary hover:underline text-sm">

                          <ExternalLink className="w-4 h-4" />
                          {selectedRequest.target_url}
                        </a>
                      </div>
                }

                    {/* Notes */}
                    {selectedRequest.notes &&
                <div data-ev-id="ev_30e63a289e">
                        <h3 data-ev-id="ev_a0cf0fa0c6" className="text-sm text-zinc-400 mb-2">הערות</h3>
                        <p data-ev-id="ev_f78b9855f5" className="text-white text-sm bg-zinc-800 p-3 rounded-lg">
                          {selectedRequest.notes}
                        </p>
                      </div>
                }

                    {/* Admin Notes */}
                    <div data-ev-id="ev_1819071eec">
                      <h3 data-ev-id="ev_c988004f0e" className="text-sm text-zinc-400 mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        הערות פנימיות
                      </h3>
                      <textarea data-ev-id="ev_962773e34d"
                  value={selectedRequest.admin_notes || ''}
                  onChange={(e) => setSelectedRequest({ ...selectedRequest, admin_notes: e.target.value })}
                  onBlur={saveAdminNotes}
                  rows={3}
                  placeholder="הוסף הערות..."
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:border-secondary focus:outline-none resize-none" />

                    </div>

                    {/* Status Actions */}
                    <div data-ev-id="ev_1c1fc204c4">
                      <h3 data-ev-id="ev_47502e9cd1" className="text-sm text-zinc-400 mb-2">עדכון סטטוס</h3>
                      <div data-ev-id="ev_e9743581ae" className="grid grid-cols-2 gap-2">
                        <button data-ev-id="ev_867f97ee38"
                    onClick={() => updateStatus(selectedRequest.id, 'contacted')}
                    className="px-3 py-2 bg-blue-500/10 text-blue-400 rounded-lg text-sm hover:bg-blue-500/20">

                          ניצר קשר
                        </button>
                        <button data-ev-id="ev_d31ce47a8a"
                    onClick={() => updateStatus(selectedRequest.id, 'approved')}
                    className="px-3 py-2 bg-green-500/10 text-green-400 rounded-lg text-sm hover:bg-green-500/20 flex items-center justify-center gap-1">

                          <Check className="w-4 h-4" />
                          אישור
                        </button>
                        <button data-ev-id="ev_d5503fdd88"
                    onClick={() => updateStatus(selectedRequest.id, 'rejected')}
                    className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20 flex items-center justify-center gap-1 col-span-2">

                          <X className="w-4 h-4" />
                          דחייה
                        </button>
                      </div>
                    </div>
                  </div>
                </div> :

            <div data-ev-id="ev_ec4bdaaa5d" className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center text-zinc-500">
                  בחר בקשה לצפייה בפרטים
                </div>
            }
            </div>
          </div>
        }
      </div>
    </AdminLayout>);

}