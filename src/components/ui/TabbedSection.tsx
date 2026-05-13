import { useState } from 'react';
import { Link } from 'react-router';
import { Clock } from 'lucide-react';
import type { Article } from '@/data/sampleData';

interface Tab {
  id: string;
  label: string;
}

interface TabbedSectionProps {
  title: string;
  tabs: Tab[];
  articles: Record<string, Article[]>;
}

export default function TabbedSection({ title, tabs, articles }: TabbedSectionProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'לפני פחות משעה';
    if (diffInHours < 24) return `לפני ${diffInHours} שעות`;
    return 'אתמול';
  };

  const currentArticles = articles[activeTab] || [];

  return (
    <div data-ev-id="ev_d6e6a8d498" className="bg-surface rounded-[12px] shadow-card border border-border/50 overflow-hidden">
      {/* Header with tabs */}
      <div data-ev-id="ev_f1f646ca1b" className="bg-gradient-to-r from-primary to-primary-light">
        <h3 data-ev-id="ev_2216bbe21b" className="text-lg font-bold text-white px-4 pt-4 pb-2 font-serif">{title}</h3>
        <div data-ev-id="ev_a89e5ec045" className="flex border-b border-white/10">
          {tabs.map((tab) =>
          <button data-ev-id="ev_72188de52d"
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 px-3 py-2 text-sm font-medium transition-all ${
          activeTab === tab.id ?
          'text-secondary bg-white/10 border-b-2 border-secondary' :
          'text-white/70 hover:text-white hover:bg-white/5'}`
          }>

              {tab.label}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div data-ev-id="ev_e519d91ea8" className="p-4">
        <div data-ev-id="ev_71b2d3cb0f" className="flex flex-col gap-3">
          {currentArticles.slice(0, 5).map((article, idx) =>
          <Link
            key={article.id}
            to={`/article/${article.id}`}
            className="group flex items-start gap-3 pb-3 border-b border-border/50 last:border-0 last:pb-0">

              <span data-ev-id="ev_4236beb604" className="text-2xl font-bold text-secondary/30 font-serif shrink-0 w-8">{idx + 1}</span>
              <div data-ev-id="ev_def5c59164" className="flex-1 min-w-0">
                <h4 data-ev-id="ev_366a590575" className="font-medium text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">
                  {article.title}
                </h4>
                <span data-ev-id="ev_4536417774" className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeAgo(article.publishedAt)}
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>);

}