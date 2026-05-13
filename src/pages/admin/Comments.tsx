import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  MessageCircle,
  Trash2,
  Check,
  X,
  Search,
  Filter,
  Loader2,
  Eye,
  Calendar,
  User,
  Mail,
  ExternalLink,
  ThumbsUp,
  ThumbsDown } from
'lucide-react';

interface Comment {
  id: string;
  article_type: string;
  article_id: string;
  parent_id: string | null;
  author_name: string;
  author_email: string;
  content: string;
  is_approved: boolean;
  created_at: string;
}

interface VoteStats {
  article_type: string;
  article_id: string;
  yes_count: number;
  no_count: number;
}

const ARTICLE_TYPE_LABELS: Record<string, string> = {
  articles: 'כתבות',
  siah_hatzibur: 'שיח הציבור',
  bein_hatzibur: 'בעין הציבור',
  news_batzibur: 'נייעס בציבור',
  before_18_years: 'לפני 18 שנה',
  historical_events: 'אירועים היסטוריים'
};

const ARTICLE_TYPE_ROUTES: Record<string, string> = {
  articles: '/article',
  siah_hatzibur: '/siah',
  bein_hatzibur: '/bein-hatzibur',
  news_batzibur: '/news-batzibur',
  before_18_years: '/before-18',
  historical_events: '/historical'
};

export default function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [voteStats, setVoteStats] = useState<VoteStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterApproval, setFilterApproval] = useState<'all' | 'approved' | 'pending'>('all');
  const [activeTab, setActiveTab] = useState<'comments' | 'votes'>('comments');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!supabase) {setLoading(false);return;}
    setLoading(true);

    try {
      // Fetch comments (including non-approved for admin)
      const { data: commentsData, error: commentsError } = await supabase.
      from('article_comments').
      select('*').
      order('created_at', { ascending: false });

      if (commentsError) throw commentsError;
      setComments(commentsData ?? []);

      // Fetch vote statistics
      const { data: votesData, error: votesError } = await supabase.
      from('article_votes').
      select('article_type, article_id, vote_type');

      if (votesError) throw votesError;

      // Aggregate votes
      const statsMap = new Map<string, VoteStats>();
      (votesData ?? []).forEach((vote) => {
        const key = `${vote.article_type}-${vote.article_id}`;
        if (!statsMap.has(key)) {
          statsMap.set(key, {
            article_type: vote.article_type,
            article_id: vote.article_id,
            yes_count: 0,
            no_count: 0
          });
        }
        const stat = statsMap.get(key)!;
        if (vote.vote_type === 'yes') stat.yes_count++;else
        stat.no_count++;
      });

      setVoteStats(Array.from(statsMap.values()).sort((a, b) =>
      b.yes_count + b.no_count - (a.yes_count + a.no_count)
      ));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (comment: Comment) => {
    if (!supabase) return;
    setToggling(comment.id);

    try {
      const { error } = await supabase.
      from('article_comments').
      update({ is_approved: !comment.is_approved }).
      eq('id', comment.id);

      if (error) throw error;

      setComments((prev) => prev.map((c) =>
      c.id === comment.id ? { ...c, is_approved: !c.is_approved } : c
      ));
    } catch (error) {
      console.error('Error toggling approval:', error);
    } finally {
      setToggling(null);
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!supabase || !confirm('האם אתה בטוח שברצונך למחוק תגובה זו?')) return;
    setDeleting(id);

    try {
      const { error } = await supabase.
      from('article_comments').
      delete().
      eq('id', id);

      if (error) throw error;
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setDeleting(null);
    }
  };

  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
    comment.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.author_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || comment.article_type === filterType;

    const matchesApproval =
    filterApproval === 'all' ||
    filterApproval === 'approved' && comment.is_approved ||
    filterApproval === 'pending' && !comment.is_approved;

    return matchesSearch && matchesType && matchesApproval;
  });

  const pendingCount = comments.filter((c) => !c.is_approved).length;
  const totalVotes = voteStats.reduce((sum, s) => sum + s.yes_count + s.no_count, 0);

  return (
    <AdminLayout>
      <div data-ev-id="ev_02885a9889" className="flex flex-col gap-6">
        {/* Header */}
        <div data-ev-id="ev_64bf2094e3" className="flex items-center justify-between">
          <div data-ev-id="ev_49203349cf">
            <h1 data-ev-id="ev_447c6c1a87" className="text-2xl font-bold text-foreground flex items-center gap-3">
              <MessageCircle className="w-7 h-7 text-secondary" />
              ניהול תגובות והצבעות
            </h1>
            <p data-ev-id="ev_b7478b4f2d" className="text-muted-foreground mt-1">
              צפה ונהל תגובות והצבעות על כתבות
            </p>
          </div>
          
          {/* Stats */}
          <div data-ev-id="ev_4be1c2def2" className="flex items-center gap-4">
            <div data-ev-id="ev_f212b2e201" className="bg-surface border border-border rounded-lg px-4 py-2 text-center">
              <div data-ev-id="ev_45befa1d75" className="text-2xl font-bold text-foreground">{comments.length}</div>
              <div data-ev-id="ev_61eff68bd7" className="text-xs text-muted-foreground">תגובות</div>
            </div>
            {pendingCount > 0 &&
            <div data-ev-id="ev_11108453d5" className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-center">
                <div data-ev-id="ev_f7bf324089" className="text-2xl font-bold text-amber-600">{pendingCount}</div>
                <div data-ev-id="ev_39a7482036" className="text-xs text-amber-600">ממתינות לאישור</div>
              </div>
            }
            <div data-ev-id="ev_567171984b" className="bg-surface border border-border rounded-lg px-4 py-2 text-center">
              <div data-ev-id="ev_529776145f" className="text-2xl font-bold text-foreground">{totalVotes}</div>
              <div data-ev-id="ev_36e320e657" className="text-xs text-muted-foreground">הצבעות</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div data-ev-id="ev_0b16c9c61d" className="flex items-center gap-2 border-b border-border">
          <button data-ev-id="ev_4c8a873747"
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
          activeTab === 'comments' ?
          'border-secondary text-secondary' :
          'border-transparent text-muted-foreground hover:text-foreground'}`
          }>

            <MessageCircle className="w-4 h-4 inline ml-2" />
            תגובות ({comments.length})
          </button>
          <button data-ev-id="ev_96ad4ba58e"
          onClick={() => setActiveTab('votes')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
          activeTab === 'votes' ?
          'border-secondary text-secondary' :
          'border-transparent text-muted-foreground hover:text-foreground'}`
          }>

            <ThumbsUp className="w-4 h-4 inline ml-2" />
            הצבעות ({voteStats.length} כתבות)
          </button>
        </div>

        {activeTab === 'comments' &&
        <>
            {/* Filters */}
            <div data-ev-id="ev_77fbec860a" className="flex flex-wrap items-center gap-4 bg-surface border border-border rounded-lg p-4">
              <div data-ev-id="ev_adf859a3ae" className="flex-1 min-w-[200px]">
                <div data-ev-id="ev_8478b4d15e" className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input data-ev-id="ev_ca3d1ebfe5"
                type="text"
                placeholder="חיפוש לפי שם, אימייל או תוכן..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-secondary outline-none" />

                </div>
              </div>
              
              <div data-ev-id="ev_5c75fe243e" className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select data-ev-id="ev_70e520767b"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-secondary outline-none">

                  <option data-ev-id="ev_920230bffb" value="all">כל הסוגים</option>
                  {Object.entries(ARTICLE_TYPE_LABELS).map(([key, label]) =>
                <option data-ev-id="ev_cdcee407d3" key={key} value={key}>{label}</option>
                )}
                </select>
              </div>
              
              <select data-ev-id="ev_9852d37f10"
            value={filterApproval}
            onChange={(e) => setFilterApproval(e.target.value as 'all' | 'approved' | 'pending')}
            className="px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-secondary outline-none">

                <option data-ev-id="ev_9ed3aa34a6" value="all">כל הסטטוסים</option>
                <option data-ev-id="ev_e81893edcf" value="approved">מאושרות</option>
                <option data-ev-id="ev_606cf08d02" value="pending">ממתינות לאישור</option>
              </select>
            </div>

            {/* Comments List */}
            {loading ?
          <div data-ev-id="ev_55257c5509" className="text-center py-12">
                <Loader2 className="w-8 h-8 text-secondary animate-spin mx-auto" />
              </div> :
          filteredComments.length > 0 ?
          <div data-ev-id="ev_64957a34d0" className="flex flex-col gap-4">
                {filteredComments.map((comment) =>
            <div data-ev-id="ev_3f4d592d38"
            key={comment.id}
            className={`bg-surface border rounded-lg p-4 ${
            comment.is_approved ? 'border-border' : 'border-amber-300 bg-amber-50/50'}`
            }>

                    <div data-ev-id="ev_b3230298bb" className="flex items-start justify-between gap-4">
                      <div data-ev-id="ev_8a642a9242" className="flex-1">
                        {/* Author Info */}
                        <div data-ev-id="ev_be4cc92a61" className="flex items-center gap-3 mb-2">
                          <div data-ev-id="ev_fdf5f56c79" className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-secondary" />
                          </div>
                          <div data-ev-id="ev_7a3e0ed17d">
                            <div data-ev-id="ev_333d2e8a79" className="font-bold text-foreground">{comment.author_name}</div>
                            <div data-ev-id="ev_7eecc094bb" className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {comment.author_email}
                            </div>
                          </div>
                          <span data-ev-id="ev_573377be97" className={`px-2 py-0.5 rounded text-xs font-medium ${
                    comment.is_approved ?
                    'bg-green-100 text-green-700' :
                    'bg-amber-100 text-amber-700'}`
                    }>
                            {comment.is_approved ? 'מאושרת' : 'ממתינה לאישור'}
                          </span>
                        </div>
                        
                        {/* Content */}
                        <p data-ev-id="ev_57eef0c928" className="text-foreground mb-3 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                        
                        {/* Meta */}
                        <div data-ev-id="ev_540d6782b4" className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span data-ev-id="ev_77aac5ea5e" className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(comment.created_at).toLocaleDateString('he-IL')}
                          </span>
                          <span data-ev-id="ev_974f53154a" className="bg-muted px-2 py-0.5 rounded text-xs">
                            {ARTICLE_TYPE_LABELS[comment.article_type] || comment.article_type}
                          </span>
                          {comment.parent_id &&
                    <span data-ev-id="ev_faa42c67f6" className="text-xs text-secondary">⤴ תגובה</span>
                    }
                          <a data-ev-id="ev_fd00aa938b"
                    href={`${ARTICLE_TYPE_ROUTES[comment.article_type] || '/article'}/${comment.article_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:underline flex items-center gap-1">

                            <Eye className="w-3 h-3" />
                            צפה בכתבה
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div data-ev-id="ev_ac7d31aace" className="flex items-center gap-2">
                        <button data-ev-id="ev_4c0fdfbef5"
                  onClick={() => handleToggleApproval(comment)}
                  disabled={toggling === comment.id}
                  className={`p-2 rounded-lg transition-colors ${
                  comment.is_approved ?
                  'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                  'bg-green-100 text-green-700 hover:bg-green-200'}`
                  }
                  title={comment.is_approved ? 'בטל אישור' : 'אשר תגובה'}>

                          {toggling === comment.id ?
                    <Loader2 className="w-4 h-4 animate-spin" /> :
                    comment.is_approved ?
                    <X className="w-4 h-4" /> :

                    <Check className="w-4 h-4" />
                    }
                        </button>
                        <button data-ev-id="ev_3210c896d0"
                  onClick={() => handleDeleteComment(comment.id)}
                  disabled={deleting === comment.id}
                  className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                  title="מחק תגובה">

                          {deleting === comment.id ?
                    <Loader2 className="w-4 h-4 animate-spin" /> :

                    <Trash2 className="w-4 h-4" />
                    }
                        </button>
                      </div>
                    </div>
                  </div>
            )}
              </div> :

          <div data-ev-id="ev_84619d1147" className="text-center py-12 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p data-ev-id="ev_bffa48c421">לא נמצאו תגובות</p>
              </div>
          }
          </>
        }

        {activeTab === 'votes' &&
        <div data-ev-id="ev_9649776f86" className="bg-surface border border-border rounded-lg overflow-hidden">
            <table data-ev-id="ev_a365c57527" className="w-full">
              <thead data-ev-id="ev_2bd6dd2c58" className="bg-muted/50">
                <tr data-ev-id="ev_dbc3001a6b">
                  <th data-ev-id="ev_a3b09f5bc5" className="text-right px-4 py-3 font-medium text-muted-foreground">סוג</th>
                  <th data-ev-id="ev_e78872925c" className="text-right px-4 py-3 font-medium text-muted-foreground">מזהה כתבה</th>
                  <th data-ev-id="ev_7436df3b83" className="text-center px-4 py-3 font-medium text-green-600">
                    <ThumbsUp className="w-4 h-4 inline ml-1" />
                    כן
                  </th>
                  <th data-ev-id="ev_50286ab9f2" className="text-center px-4 py-3 font-medium text-red-600">
                    <ThumbsDown className="w-4 h-4 inline ml-1" />
                    לא
                  </th>
                  <th data-ev-id="ev_55e5aca551" className="text-center px-4 py-3 font-medium text-muted-foreground">סה"כ</th>
                  <th data-ev-id="ev_ed04449194" className="text-center px-4 py-3 font-medium text-muted-foreground">% חיובי</th>
                  <th data-ev-id="ev_8ceb5c8d92" className="text-center px-4 py-3 font-medium text-muted-foreground">פעולות</th>
                </tr>
              </thead>
              <tbody data-ev-id="ev_d5b565a969">
                {loading ?
              <tr data-ev-id="ev_7388e95d68">
                    <td data-ev-id="ev_47c3e98d38" colSpan={7} className="text-center py-8">
                      <Loader2 className="w-6 h-6 text-secondary animate-spin mx-auto" />
                    </td>
                  </tr> :
              voteStats.length > 0 ?
              voteStats.map((stat, idx) => {
                const total = stat.yes_count + stat.no_count;
                const yesPercent = total > 0 ? Math.round(stat.yes_count / total * 100) : 0;
                return (
                  <tr data-ev-id="ev_77301c501b" key={`${stat.article_type}-${stat.article_id}`} className="border-t border-border hover:bg-muted/30">
                        <td data-ev-id="ev_5f3ea49fcd" className="px-4 py-3">
                          <span data-ev-id="ev_30418c004e" className="bg-muted px-2 py-1 rounded text-sm">
                            {ARTICLE_TYPE_LABELS[stat.article_type] || stat.article_type}
                          </span>
                        </td>
                        <td data-ev-id="ev_027847a20d" className="px-4 py-3">
                          <span data-ev-id="ev_e6c0dcbf5e" className="text-xs text-muted-foreground font-mono">
                            {stat.article_id.slice(0, 8)}...
                          </span>
                        </td>
                        <td data-ev-id="ev_2eafc0a79f" className="text-center px-4 py-3">
                          <span data-ev-id="ev_4b49dd1316" className="bg-green-100 text-green-700 px-2 py-1 rounded font-bold">
                            {stat.yes_count}
                          </span>
                        </td>
                        <td data-ev-id="ev_d033996dd9" className="text-center px-4 py-3">
                          <span data-ev-id="ev_e3aa86fab9" className="bg-red-100 text-red-700 px-2 py-1 rounded font-bold">
                            {stat.no_count}
                          </span>
                        </td>
                        <td data-ev-id="ev_3572cfcede" className="text-center px-4 py-3 font-bold">{total}</td>
                        <td data-ev-id="ev_da777f9ba6" className="text-center px-4 py-3">
                          <div data-ev-id="ev_f6800ba596" className="flex items-center gap-2">
                            <div data-ev-id="ev_4df06c092c" className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div data-ev-id="ev_da52f58c51"
                          className="h-full bg-green-500"
                          style={{ width: `${yesPercent}%` }} />

                            </div>
                            <span data-ev-id="ev_6e3f0ab925" className="text-sm font-medium w-12">{yesPercent}%</span>
                          </div>
                        </td>
                        <td data-ev-id="ev_2423cf011f" className="text-center px-4 py-3">
                          <a data-ev-id="ev_c45a6792b3"
                      href={`${ARTICLE_TYPE_ROUTES[stat.article_type] || '/article'}/${stat.article_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary hover:underline inline-flex items-center gap-1">

                            <Eye className="w-4 h-4" />
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>);

              }) :

              <tr data-ev-id="ev_ac55242f0f">
                    <td data-ev-id="ev_2baddc6a3a" colSpan={7} className="text-center py-8 text-muted-foreground">
                      <ThumbsUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p data-ev-id="ev_0f602c52f1">אין הצבעות עדיין</p>
                    </td>
                  </tr>
              }
              </tbody>
            </table>
          </div>
        }
      </div>
    </AdminLayout>);

}