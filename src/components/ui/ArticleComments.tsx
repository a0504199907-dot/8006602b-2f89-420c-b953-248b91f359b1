import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Reply, Send, Loader2, User, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface Comment {
  id: string;
  author_name: string;
  author_email: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  replies?: Comment[];
}

interface ArticleCommentsProps {
  articleType: string;
  articleId: string;
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'עכשיו';
  if (diffMins < 60) return `לפני ${diffMins} דקות`;
  if (diffHours < 24) return `לפני ${diffHours} שעות`;
  if (diffDays < 7) return `לפני ${diffDays} ימים`;
  return date.toLocaleDateString('he-IL');
}

function buildCommentTree(comments: Comment[]): Comment[] {
  const map = new Map<string, Comment>();
  const roots: Comment[] = [];

  // Create a map of all comments
  comments.forEach((comment) => {
    map.set(comment.id, { ...comment, replies: [] });
  });

  // Build the tree
  comments.forEach((comment) => {
    const node = map.get(comment.id)!;
    if (comment.parent_id && map.has(comment.parent_id)) {
      map.get(comment.parent_id)!.replies!.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

function CommentItem({
  comment,
  onReply,
  depth = 0




}: {comment: Comment;onReply: (parentId: string, authorName: string) => void;depth?: number;}) {
  const [showReplies, setShowReplies] = useState(true);
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div data-ev-id="ev_cb8658366e" className={`${depth > 0 ? 'mr-6 md:mr-10 border-r-2 border-secondary/20 pr-4' : ''}`}>
      <div data-ev-id="ev_657061ee5b" className="bg-muted/30 rounded-lg p-4 mb-3">
        <div data-ev-id="ev_7e0478d31c" className="flex items-start gap-3">
          <div data-ev-id="ev_17ea533d57" className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-secondary" />
          </div>
          <div data-ev-id="ev_7f04fe7e55" className="flex-1 min-w-0">
            <div data-ev-id="ev_8e1b4c5852" className="flex items-center gap-2 flex-wrap mb-1">
              <span data-ev-id="ev_aac6bc3742" className="font-bold text-foreground">{comment.author_name}</span>
              <span data-ev-id="ev_8bec5e9e27" className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(comment.created_at)}
              </span>
            </div>
            <p data-ev-id="ev_24136a4706" className="text-foreground/90 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
            <button data-ev-id="ev_e0bfb8f149"
            onClick={() => onReply(comment.id, comment.author_name)}
            className="mt-2 text-sm text-secondary hover:text-secondary-dark transition-colors flex items-center gap-1">

              <Reply className="w-4 h-4" />
              הגב
            </button>
          </div>
        </div>
      </div>
      
      {/* Replies toggle */}
      {hasReplies &&
      <button data-ev-id="ev_5c460e0d57"
      onClick={() => setShowReplies(!showReplies)}
      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 mr-4">

          {showReplies ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {comment.replies!.length} תגובות
        </button>
      }
      
      {/* Nested replies */}
      {showReplies && hasReplies &&
      <div data-ev-id="ev_b34a448786" className="mt-2">
          {comment.replies!.map((reply) =>
        <CommentItem
          key={reply.id}
          comment={reply}
          onReply={onReply}
          depth={depth + 1} />

        )}
        </div>
      }
    </div>);

}

export default function ArticleComments({ articleType, articleId }: ArticleCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<{id: string;name: string;} | null>(null);

  // Load saved name/email from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('comment-author-name');
    const savedEmail = localStorage.getItem('comment-author-email');
    if (savedName) setName(savedName);
    if (savedEmail) setEmail(savedEmail);
  }, []);

  useEffect(() => {
    fetchComments();
  }, [articleType, articleId]);

  const fetchComments = async () => {
    if (!supabase) {setLoading(false);return;}

    try {
      const { data, error } = await supabase.
      from('article_comments').
      select('*').
      eq('article_type', articleType).
      eq('article_id', articleId).
      order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data ?? []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase || !name.trim() || !email.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      // Save name/email to localStorage
      localStorage.setItem('comment-author-name', name);
      localStorage.setItem('comment-author-email', email);

      const { data, error } = await supabase.
      from('article_comments').
      insert({
        article_type: articleType,
        article_id: articleId,
        author_name: name.trim(),
        author_email: email.trim(),
        content: content.trim(),
        parent_id: replyTo?.id || null
      }).
      select().
      single();

      if (error) throw error;

      // Add new comment to list
      setComments((prev) => [...prev, data]);
      setContent('');
      setReplyTo(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (parentId: string, authorName: string) => {
    setReplyTo({ id: parentId, name: authorName });
    setShowForm(true);
    // Scroll to form
    setTimeout(() => {
      document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const commentTree = buildCommentTree(comments);
  const totalComments = comments.length;

  return (
    <div data-ev-id="ev_d59dc73d03" className="bg-surface border border-border rounded-xl p-6">
      <div data-ev-id="ev_a67191f261" className="flex items-center justify-between mb-6">
        <h3 data-ev-id="ev_f59c778af8" className="text-lg font-bold text-foreground font-serif flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-secondary" />
          תגובות
          {totalComments > 0 &&
          <span data-ev-id="ev_c322a8b910" className="text-sm font-normal text-muted-foreground">({totalComments})</span>
          }
        </h3>
        
        {!showForm &&
        <button data-ev-id="ev_885ae9b70f"
        onClick={() => {setShowForm(true);setReplyTo(null);}}
        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary-light transition-colors flex items-center gap-2">

            <MessageCircle className="w-4 h-4" />
            הוסף תגובה
          </button>
        }
      </div>
      
      {/* Comment Form */}
      {showForm &&
      <form data-ev-id="ev_19d5bcf789" id="comment-form" onSubmit={handleSubmit} className="mb-6 bg-muted/50 rounded-lg p-4">
          {replyTo &&
        <div data-ev-id="ev_a6052b7d45" className="mb-3 flex items-center gap-2 text-sm">
              <span data-ev-id="ev_22e40ce64c" className="text-muted-foreground">מגיב ל:</span>
              <span data-ev-id="ev_efdc62eb7d" className="font-medium text-secondary">{replyTo.name}</span>
              <button data-ev-id="ev_359902c813"
          type="button"
          onClick={() => setReplyTo(null)}
          className="text-muted-foreground hover:text-foreground">

                ✕
              </button>
            </div>
        }
          
          <div data-ev-id="ev_077f952c18" className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input data-ev-id="ev_1e801b3c97"
          type="text"
          placeholder="שם *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="px-4 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none" />

            <input data-ev-id="ev_38d95b9969"
          type="email"
          placeholder="אימייל *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="px-4 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none" />

          </div>
          
          <textarea data-ev-id="ev_da7721c8b0"
        placeholder="כתוב את התגובה שלך..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        rows={4}
        className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none resize-none mb-3" />

          
          <div data-ev-id="ev_97bfe5bd1b" className="flex items-center gap-3">
            <button data-ev-id="ev_80d4968b4e"
          type="submit"
          disabled={submitting || !name.trim() || !email.trim() || !content.trim()}
          className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">

              {submitting ?
            <Loader2 className="w-4 h-4 animate-spin" /> :

            <Send className="w-4 h-4" />
            }
              שלח תגובה
            </button>
            <button data-ev-id="ev_69d73312bd"
          type="button"
          onClick={() => {setShowForm(false);setReplyTo(null);}}
          className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors">

              ביטול
            </button>
          </div>
        </form>
      }
      
      {/* Comments List */}
      {loading ?
      <div data-ev-id="ev_3375bf0613" className="text-center py-8">
          <Loader2 className="w-6 h-6 text-secondary animate-spin mx-auto" />
        </div> :
      commentTree.length > 0 ?
      <div data-ev-id="ev_498ee15543" className="flex flex-col gap-2">
          {commentTree.map((comment) =>
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={handleReply} />

        )}
        </div> :

      <div data-ev-id="ev_867e4864c6" className="text-center py-8 text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p data-ev-id="ev_cea9ab649b">אין תגובות עדיין. היה הראשון להגיב!</p>
        </div>
      }
    </div>);

}