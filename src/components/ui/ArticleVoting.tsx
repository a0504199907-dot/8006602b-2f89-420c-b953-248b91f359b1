import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';

interface ArticleVotingProps {
  articleType: string;
  articleId: string;
}

interface VoteCounts {
  yes: number;
  no: number;
}

async function getVoterHash(): Promise<string> {
  // Create a simple hash from browser fingerprint
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
  }
  const canvasData = canvas.toDataURL();

  const userAgent = navigator.userAgent;
  const language = navigator.language;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const screenRes = `${screen.width}x${screen.height}`;

  const fingerprint = `${canvasData}-${userAgent}-${language}-${timezone}-${screenRes}`;

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export default function ArticleVoting({ articleType, articleId }: ArticleVotingProps) {
  const [counts, setCounts] = useState<VoteCounts>({ yes: 0, no: 0 });
  const [userVote, setUserVote] = useState<'yes' | 'no' | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [voterHash, setVoterHash] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      const hash = await getVoterHash();
      setVoterHash(hash);
      await fetchVotes(hash);
    };
    init();
  }, [articleType, articleId]);

  const fetchVotes = async (hash: string) => {
    if (!supabase) {setLoading(false);return;}

    try {
      // Get vote counts
      const { data: votes, error } = await supabase.
      from('article_votes').
      select('vote_type').
      eq('article_type', articleType).
      eq('article_id', articleId);

      if (error) throw error;

      const yesCount = (votes ?? []).filter((v) => v.vote_type === 'yes').length;
      const noCount = (votes ?? []).filter((v) => v.vote_type === 'no').length;
      setCounts({ yes: yesCount, no: noCount });

      // Check if user already voted
      const { data: userVoteData } = await supabase.
      from('article_votes').
      select('vote_type').
      eq('article_type', articleType).
      eq('article_id', articleId).
      eq('voter_hash', hash).
      maybeSingle();

      if (userVoteData) {
        setUserVote(userVoteData.vote_type as 'yes' | 'no');
      }
    } catch (error) {
      console.error('Error fetching votes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType: 'yes' | 'no') => {
    if (!supabase || voting || userVote) return;

    setVoting(true);
    try {
      const { error } = await supabase.
      from('article_votes').
      insert({
        article_type: articleType,
        article_id: articleId,
        vote_type: voteType,
        voter_hash: voterHash
      });

      if (error) {
        if (error.code === '23505') {
          // Duplicate vote - already voted
          console.log('User already voted');
        } else {
          throw error;
        }
      } else {
        setUserVote(voteType);
        setCounts((prev) => ({
          ...prev,
          [voteType]: prev[voteType] + 1
        }));
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVoting(false);
    }
  };

  const total = counts.yes + counts.no;
  const yesPercent = total > 0 ? Math.round(counts.yes / total * 100) : 0;

  if (loading) {
    return (
      <div data-ev-id="ev_c2eccda01e" className="bg-surface border border-border rounded-xl p-6 text-center">
        <Loader2 className="w-6 h-6 text-secondary animate-spin mx-auto" />
      </div>);

  }

  return (
    <div data-ev-id="ev_2bba3f8cda" className="bg-surface border border-border rounded-xl p-6">
      <h3 data-ev-id="ev_48d33e2564" className="text-lg font-bold text-foreground mb-4 text-center font-serif">
        הכתבה עניינה אותך?
      </h3>
      
      <div data-ev-id="ev_66dc7cc4be" className="flex items-center justify-center gap-4 mb-4">
        <button data-ev-id="ev_8ecb0b97d5"
        onClick={() => handleVote('yes')}
        disabled={voting || userVote !== null}
        className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
            ${userVote === 'yes' ?
        'bg-green-600 text-white' :
        userVote ?
        'bg-muted text-muted-foreground cursor-not-allowed' :
        'bg-green-100 text-green-700 hover:bg-green-200'}
          `}>

          <ThumbsUp className="w-5 h-5" />
          <span data-ev-id="ev_fcda47b337">כן</span>
          <span data-ev-id="ev_15dd338178" className="bg-white/20 px-2 py-0.5 rounded text-sm">{counts.yes}</span>
        </button>
        
        <button data-ev-id="ev_0427c30e13"
        onClick={() => handleVote('no')}
        disabled={voting || userVote !== null}
        className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
            ${userVote === 'no' ?
        'bg-red-600 text-white' :
        userVote ?
        'bg-muted text-muted-foreground cursor-not-allowed' :
        'bg-red-100 text-red-700 hover:bg-red-200'}
          `}>

          <ThumbsDown className="w-5 h-5" />
          <span data-ev-id="ev_e89a94ddda">לא</span>
          <span data-ev-id="ev_15f8aa6a47" className="bg-white/20 px-2 py-0.5 rounded text-sm">{counts.no}</span>
        </button>
      </div>
      
      {/* Progress bar */}
      {total > 0 &&
      <div data-ev-id="ev_fb5362b302" className="mt-4">
          <div data-ev-id="ev_bb6af9a725" className="h-2 bg-muted rounded-full overflow-hidden">
            <div data-ev-id="ev_8440437578"
          className="h-full bg-gradient-to-l from-green-500 to-green-400 transition-all duration-500"
          style={{ width: `${yesPercent}%` }} />

          </div>
          <p data-ev-id="ev_6e6ebdb9fd" className="text-center text-sm text-muted-foreground mt-2">
            {total} הצבעות • {yesPercent}% מצאו את הכתבה מעניינת
          </p>
        </div>
      }
      
      {userVote &&
      <p data-ev-id="ev_55bdd10d52" className="text-center text-sm text-secondary mt-3">
          תודה על ההצבעה!
        </p>
      }
    </div>);

}