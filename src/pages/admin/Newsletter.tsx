import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, Users, Send, Plus, Trash2, Search, Filter,
  Download, Upload, BarChart3, Eye, Clock, CheckCircle,
  XCircle, AlertCircle, Edit2, Copy, RefreshCw, List } from
'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  list_id: string;
  status: string;
  source: string;
  subscribed_at: string;
  email_count: number;
}

interface NewsletterList {
  id: string;
  name: string;
  description: string | null;
  subscriber_count: number;
  is_active: boolean;
}

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  sent_count: number;
  open_count: number;
  click_count: number;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
}

type TabType = 'subscribers' | 'lists' | 'campaigns' | 'stats';

export default function AdminNewsletter() {
  const [activeTab, setActiveTab] = useState<TabType>('subscribers');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [lists, setLists] = useState<NewsletterList[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedList, setSelectedList] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    unsubscribed: 0,
    thisWeek: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!supabase) return;
    setLoading(true);

    try {
      // Fetch subscribers
      const { data: subsData } = await supabase.
      from('newsletter_subscribers').
      select('*').
      order('subscribed_at', { ascending: false });
      setSubscribers(subsData || []);

      // Fetch lists
      const { data: listsData } = await supabase.
      from('newsletter_lists').
      select('*').
      order('name');
      setLists(listsData || []);

      // Fetch campaigns
      const { data: campaignsData } = await supabase.
      from('newsletter_campaigns').
      select('*').
      order('created_at', { ascending: false });
      setCampaigns(campaignsData || []);

      // Calculate stats
      if (subsData) {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        setStats({
          total: subsData.length,
          active: subsData.filter((s) => s.status === 'active').length,
          unsubscribed: subsData.filter((s) => s.status === 'unsubscribed').length,
          thisWeek: subsData.filter((s) => new Date(s.subscribed_at) > weekAgo).length
        });
      }
    } catch (err) {
      console.error('Error fetching newsletter data:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSubscriber = async (id: string) => {
    if (!supabase || !confirm('האם למחוק מנוי זה?')) return;

    await supabase.from('newsletter_subscribers').delete().eq('id', id);
    setSubscribers(subscribers.filter((s) => s.id !== id));
  };

  const updateSubscriberStatus = async (id: string, status: string) => {
    if (!supabase) return;

    await supabase.
    from('newsletter_subscribers').
    update({ status }).
    eq('id', id);

    setSubscribers(subscribers.map((s) =>
    s.id === id ? { ...s, status } : s
    ));
  };

  const exportSubscribers = () => {
    const csv = [
    ['Email', 'Name', 'List', 'Status', 'Source', 'Subscribed At'].join(','),
    ...filteredSubscribers.map((s) => [
    s.email,
    s.name || '',
    s.list_id,
    s.status,
    s.source,
    s.subscribed_at].
    join(','))].
    join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredSubscribers = subscribers.filter((s) => {
    const matchesSearch = s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesList = selectedList === 'all' || s.list_id === selectedList;
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
    return matchesSearch && matchesList && matchesStatus;
  });

  const tabs = [
  { id: 'subscribers', label: 'מנויים', icon: Users, count: stats.total },
  { id: 'lists', label: 'רשימות', icon: List, count: lists.length },
  { id: 'campaigns', label: 'קמפיינים', icon: Send, count: campaigns.length },
  { id: 'stats', label: 'סטטיסטיקות', icon: BarChart3 }];


  return (
    <AdminLayout>
      <div data-ev-id="ev_4dc294eb9c" className="p-6">
        {/* Header */}
        <div data-ev-id="ev_a90bda77d0" className="flex items-center justify-between mb-8">
          <div data-ev-id="ev_44a0855bcd">
            <h1 data-ev-id="ev_cebfa8d6e0" className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Mail className="w-8 h-8 text-secondary" />
              ניהול ניוזלטר
            </h1>
            <p data-ev-id="ev_7bbf2b67a5" className="text-gray-500 mt-1">ניהול מנויים, רשימות תפוצה וקמפיינים</p>
          </div>
          <button data-ev-id="ev_4f3d224748"
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">

            <RefreshCw className="w-4 h-4" />
            רענן
          </button>
        </div>

        {/* Stats Cards */}
        <div data-ev-id="ev_f7af62e60b" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div data-ev-id="ev_779d5c95ec" className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div data-ev-id="ev_5a3612815f" className="flex items-center gap-3">
              <div data-ev-id="ev_80a881de03" className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div data-ev-id="ev_1364b610c5">
                <p data-ev-id="ev_05bca0d746" className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
                <p data-ev-id="ev_8b36239a5d" className="text-sm text-gray-500">סה"כ מנויים</p>
              </div>
            </div>
          </div>
          <div data-ev-id="ev_99861fef3c" className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div data-ev-id="ev_6eb0947d5c" className="flex items-center gap-3">
              <div data-ev-id="ev_974457a7a0" className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div data-ev-id="ev_7c56eec733">
                <p data-ev-id="ev_55ecc2cd12" className="text-2xl font-bold text-gray-900">{stats.active.toLocaleString()}</p>
                <p data-ev-id="ev_d755e1525f" className="text-sm text-gray-500">פעילים</p>
              </div>
            </div>
          </div>
          <div data-ev-id="ev_152314ebf4" className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div data-ev-id="ev_98d05dceb0" className="flex items-center gap-3">
              <div data-ev-id="ev_72fb51cf12" className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div data-ev-id="ev_257d263c01">
                <p data-ev-id="ev_13eb155f97" className="text-2xl font-bold text-gray-900">{stats.unsubscribed.toLocaleString()}</p>
                <p data-ev-id="ev_a6bd56c822" className="text-sm text-gray-500">ביטלו</p>
              </div>
            </div>
          </div>
          <div data-ev-id="ev_955e8cc740" className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div data-ev-id="ev_5b71151053" className="flex items-center gap-3">
              <div data-ev-id="ev_11db55c208" className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div data-ev-id="ev_ed6bcece33">
                <p data-ev-id="ev_53be7ddc15" className="text-2xl font-bold text-gray-900">{stats.thisWeek.toLocaleString()}</p>
                <p data-ev-id="ev_de28dbdf39" className="text-sm text-gray-500">השבוע</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div data-ev-id="ev_e1795bb99b" className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button data-ev-id="ev_2489b3e91c"
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id ?
              'bg-primary text-white' :
              'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
              }>

                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined &&
                <span data-ev-id="ev_f02be3158f" className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ?
                'bg-white/20' :
                'bg-gray-200'}`
                }>
                    {tab.count}
                  </span>
                }
              </button>);

          })}
        </div>

        {/* Subscribers Tab */}
        {activeTab === 'subscribers' &&
        <div data-ev-id="ev_14de837eb7" className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            {/* Toolbar */}
            <div data-ev-id="ev_8175539c43" className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4">
              <div data-ev-id="ev_c5e0640b16" className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input data-ev-id="ev_5481959349"
              type="text"
              placeholder="חיפוש לפי מייל או שם..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent" />

              </div>
              <div data-ev-id="ev_1ef82c4543" className="flex gap-2">
                <select data-ev-id="ev_159f819d99"
              value={selectedList}
              onChange={(e) => setSelectedList(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary">

                  <option data-ev-id="ev_a9508fb36b" value="all">כל הרשימות</option>
                  {lists.map((list) =>
                <option data-ev-id="ev_1e28907f26" key={list.id} value={list.id}>{list.name}</option>
                )}
                </select>
                <select data-ev-id="ev_99bf1b0f95"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary">

                  <option data-ev-id="ev_1ae03ca542" value="all">כל הסטטוסים</option>
                  <option data-ev-id="ev_9ad8da2fce" value="active">פעיל</option>
                  <option data-ev-id="ev_10af8c2dec" value="unsubscribed">ביטל</option>
                  <option data-ev-id="ev_c0b484aaae" value="bounced">קפץ</option>
                </select>
                <button data-ev-id="ev_c7c282b092"
              onClick={exportSubscribers}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors">

                  <Download className="w-4 h-4" />
                  ייצא CSV
                </button>
              </div>
            </div>

            {/* Table */}
            <div data-ev-id="ev_704f1f3dc4" className="overflow-x-auto">
              <table data-ev-id="ev_aa543908be" className="w-full">
                <thead data-ev-id="ev_081be67bf7" className="bg-gray-50">
                  <tr data-ev-id="ev_67c3df6460">
                    <th data-ev-id="ev_a6b688d046" className="text-right px-4 py-3 text-sm font-medium text-gray-600">מייל</th>
                    <th data-ev-id="ev_1e44bfa85c" className="text-right px-4 py-3 text-sm font-medium text-gray-600">שם</th>
                    <th data-ev-id="ev_76a484daa4" className="text-right px-4 py-3 text-sm font-medium text-gray-600">רשימה</th>
                    <th data-ev-id="ev_8e1efe22de" className="text-right px-4 py-3 text-sm font-medium text-gray-600">סטטוס</th>
                    <th data-ev-id="ev_f6ca70ca9e" className="text-right px-4 py-3 text-sm font-medium text-gray-600">מקור</th>
                    <th data-ev-id="ev_57b4fa53f8" className="text-right px-4 py-3 text-sm font-medium text-gray-600">תאריך</th>
                    <th data-ev-id="ev_db7f7463df" className="text-right px-4 py-3 text-sm font-medium text-gray-600">פעולות</th>
                  </tr>
                </thead>
                <tbody data-ev-id="ev_cd50820be5" className="divide-y divide-gray-100">
                  {loading ?
                <tr data-ev-id="ev_a3214fe928">
                      <td data-ev-id="ev_9bb6b3acda" colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        טוען...
                      </td>
                    </tr> :
                filteredSubscribers.length === 0 ?
                <tr data-ev-id="ev_489150308f">
                      <td data-ev-id="ev_bc37fae21a" colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        לא נמצאו מנויים
                      </td>
                    </tr> :

                filteredSubscribers.slice(0, 50).map((sub) =>
                <tr data-ev-id="ev_04ff5d18b4" key={sub.id} className="hover:bg-gray-50">
                        <td data-ev-id="ev_1d5342f46c" className="px-4 py-3">
                          <span data-ev-id="ev_1c859ecbc7" className="font-medium text-gray-900">{sub.email}</span>
                        </td>
                        <td data-ev-id="ev_673f076431" className="px-4 py-3 text-gray-600">{sub.name || '-'}</td>
                        <td data-ev-id="ev_bb6671f1fd" className="px-4 py-3">
                          <span data-ev-id="ev_55e16aeb41" className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                            {lists.find((l) => l.id === sub.list_id)?.name || sub.list_id}
                          </span>
                        </td>
                        <td data-ev-id="ev_a74514ebfa" className="px-4 py-3">
                          <select data-ev-id="ev_0f7a0212fb"
                    value={sub.status}
                    onChange={(e) => updateSubscriberStatus(sub.id, e.target.value)}
                    className={`px-2 py-1 rounded-lg text-sm border-0 ${
                    sub.status === 'active' ? 'bg-green-100 text-green-700' :
                    sub.status === 'unsubscribed' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'}`
                    }>

                            <option data-ev-id="ev_3554bdfd05" value="active">פעיל</option>
                            <option data-ev-id="ev_48de54cbe8" value="unsubscribed">ביטל</option>
                            <option data-ev-id="ev_5d186b1427" value="bounced">קפץ</option>
                            <option data-ev-id="ev_7de8b16f35" value="spam">ספאם</option>
                          </select>
                        </td>
                        <td data-ev-id="ev_aeb4c01ceb" className="px-4 py-3 text-gray-500 text-sm">{sub.source}</td>
                        <td data-ev-id="ev_8d16b5e209" className="px-4 py-3 text-gray-500 text-sm">
                          {new Date(sub.subscribed_at).toLocaleDateString('he-IL')}
                        </td>
                        <td data-ev-id="ev_b83526d8f4" className="px-4 py-3">
                          <button data-ev-id="ev_b86e5475a2"
                    onClick={() => deleteSubscriber(sub.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">

                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                )
                }
                </tbody>
              </table>
            </div>

            {filteredSubscribers.length > 50 &&
          <div data-ev-id="ev_16667df820" className="p-4 border-t border-gray-100 text-center text-gray-500 text-sm">
                מציג 50 מתוך {filteredSubscribers.length} מנויים
              </div>
          }
          </div>
        }

        {/* Lists Tab */}
        {activeTab === 'lists' &&
        <div data-ev-id="ev_5085d9c170" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lists.map((list) =>
          <motion.div
            key={list.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">

                <div data-ev-id="ev_f7a06f61bc" className="flex items-start justify-between mb-4">
                  <div data-ev-id="ev_2efeae6278">
                    <h3 data-ev-id="ev_ba4ef83c31" className="font-bold text-lg text-gray-900">{list.name}</h3>
                    <p data-ev-id="ev_a272c8db13" className="text-sm text-gray-500">{list.description}</p>
                  </div>
                  <span data-ev-id="ev_fd60d9f4b2" className={`px-2 py-1 rounded-full text-xs ${
              list.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`
              }>
                    {list.is_active ? 'פעיל' : 'לא פעיל'}
                  </span>
                </div>
                <div data-ev-id="ev_abef2eaf02" className="flex items-center justify-between">
                  <div data-ev-id="ev_cb1f9b15ad" className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span data-ev-id="ev_b66cdcd031" className="font-medium">{list.subscriber_count.toLocaleString()}</span>
                    <span data-ev-id="ev_dcac43fc8b" className="text-sm">מנויים</span>
                  </div>
                  <button data-ev-id="ev_994eac2c57" className="text-secondary hover:underline text-sm">
                    צפה במנויים
                  </button>
                </div>
              </motion.div>
          )}
          </div>
        }

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' &&
        <div data-ev-id="ev_7efbb5fcfe" className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div data-ev-id="ev_3c15536301" className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 data-ev-id="ev_dd6e2a49c7" className="font-bold text-lg">קמפייני מייל</h3>
              <button data-ev-id="ev_c6310ed900" className="flex items-center gap-2 px-4 py-2 bg-secondary text-black font-medium rounded-xl hover:bg-secondary-light transition-colors">
                <Plus className="w-4 h-4" />
                קמפיין חדש
              </button>
            </div>
            
            {campaigns.length === 0 ?
          <div data-ev-id="ev_09425cc65f" className="p-8 text-center text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p data-ev-id="ev_ba9a3dcf67">אין קמפיינים עדיין</p>
                <p data-ev-id="ev_a2d447570a" className="text-sm">צור קמפיין חדש לשליחת מיילים</p>
              </div> :

          <div data-ev-id="ev_ae343857b8" className="divide-y divide-gray-100">
                {campaigns.map((campaign) =>
            <div data-ev-id="ev_fcbb739e7c" key={campaign.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                    <div data-ev-id="ev_cbfec4950e">
                      <h4 data-ev-id="ev_83af6a11ee" className="font-medium text-gray-900">{campaign.name}</h4>
                      <p data-ev-id="ev_95c4960bad" className="text-sm text-gray-500">{campaign.subject}</p>
                    </div>
                    <div data-ev-id="ev_6805f28375" className="flex items-center gap-4">
                      <span data-ev-id="ev_32a5239509" className={`px-3 py-1 rounded-full text-sm ${
                campaign.status === 'sent' ? 'bg-green-100 text-green-700' :
                campaign.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'}`
                }>
                        {campaign.status === 'sent' ? 'נשלח' :
                  campaign.status === 'draft' ? 'טיוטה' :
                  campaign.status === 'scheduled' ? 'מתוזמן' : campaign.status}
                      </span>
                      {campaign.status === 'sent' &&
                <div data-ev-id="ev_07310f55fe" className="flex items-center gap-3 text-sm text-gray-500">
                          <span data-ev-id="ev_fa7d31e2ec">📨 {campaign.sent_count}</span>
                          <span data-ev-id="ev_f78997fa8a">👁 {campaign.open_count}</span>
                          <span data-ev-id="ev_03f82f2b9c">👆 {campaign.click_count}</span>
                        </div>
                }
                    </div>
                  </div>
            )}
              </div>
          }
          </div>
        }

        {/* Stats Tab */}
        {activeTab === 'stats' &&
        <div data-ev-id="ev_ae75cd1c22" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 data-ev-id="ev_99caffc27e" className="text-xl font-bold text-gray-900 mb-2">סטטיסטיקות מפורטות</h3>
            <p data-ev-id="ev_6241bbda8a" className="text-gray-500">בקרוב - נתוני פתיחות, קליקים וטרנדים</p>
          </div>
        }
      </div>
    </AdminLayout>);

}