import { useState } from 'react';
import { Link } from 'react-router';
import {
  Home,
  FileText,
  Image,
  Video,
  Calendar,
  Newspaper,
  History,
  Eye,
  ExternalLink,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Monitor,
  ArrowRight } from
'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

interface PageInfo {
  name: string;
  icon: any;
  listPath: string;
  detailPath: string;
  description: string;
  pageType: 'home' | 'section' | 'article';
  sections: string[];
}

const PAGES: PageInfo[] = [
  {
    name: 'דף הבית',
    icon: Home,
    listPath: '/',
    detailPath: '/',
    description: 'עמוד הראשי של האתר עם כל המדורים',
    pageType: 'home',
    sections: ['באנר עליון', 'סיידבר 1', 'סיידבר 2', 'סיידבר 3', 'באנר תחתון']
  },
  {
    name: 'גלריות',
    icon: Image,
    listPath: '/gallery',
    detailPath: '/gallery/:id',
    description: 'רשימת גלריות תמונות',
    pageType: 'section',
    sections: ['סיידבר 1', 'סיידבר 2', 'באנר תחתון']
  },
  {
    name: 'שיח הציבור',
    icon: FileText,
    listPath: '/siah',
    detailPath: '/siah/:id',
    description: 'מאמרים וכתבות מעמיקים',
    pageType: 'section',
    sections: ['סיידבר 1', 'סיידבר 2', 'באנר תחתון']
  },
  {
    name: 'נייעס בציבור',
    icon: Newspaper,
    listPath: '/news-batzibur',
    detailPath: '/news-batzibur/:id',
    description: 'חדשות ועדכונים',
    pageType: 'section',
    sections: ['סיידבר 1', 'סיידבר 2', 'באנר תחתון']
  },
  {
    name: 'לפני 18 שנה',
    icon: History,
    listPath: '/before-18',
    detailPath: '/before-18/:id',
    description: 'תמונות ואירועים מלפני 18 שנה',
    pageType: 'section',
    sections: ['סיידבר 1', 'סיידבר 2', 'באנר תחתון']
  },
  {
    name: 'בעין הציבור',
    icon: Eye,
    listPath: '/bein-hatzibur',
    detailPath: '/bein-hatzibur/:id',
    description: 'תמונות אקטואליות',
    pageType: 'section',
    sections: ['סיידבר 1', 'סיידבר 2', 'באנר תחתון']
  },
  {
    name: 'אירועים היסטוריים',
    icon: Calendar,
    listPath: '/historical',
    detailPath: '/historical/:id',
    description: 'תיעוד אירועים היסטוריים',
    pageType: 'section',
    sections: ['סיידבר 1', 'סיידבר 2', 'באנר תחתון']
  },
  {
    name: 'סרטונים',
    icon: Video,
    listPath: '/video',
    detailPath: '/video/:id',
    description: 'ארכיון סרטונים',
    pageType: 'section',
    sections: ['סיידבר 1', 'סיידבר 2', 'באנר תחתון']
  },
  {
    name: 'אירועים',
    icon: Calendar,
    listPath: '/events',
    detailPath: '/events/:id',
    description: 'אירועים קרובים',
    pageType: 'section',
    sections: ['סיידבר 1', 'סיידבר 2', 'באנר תחתון']
  },
  {
    name: 'עיתון',
    icon: Newspaper,
    listPath: '/newspaper',
    detailPath: '/newspaper',
    description: 'ארכיון גיליונות העיתון',
    pageType: 'section',
    sections: ['סיידבר 1', 'סיידבר 2', 'באנר תחתון']
  }
];


const PAGE_TYPE_LABELS: Record<string, {label: string;color: string;}> = {
  home: { label: 'דף הבית', color: 'bg-blue-500' },
  section: { label: 'עמוד מדור', color: 'bg-green-500' },
  article: { label: 'עמוד תוכן', color: 'bg-purple-500' }
};

export default function AllPagesPreview() {
  const [expandedPage, setExpandedPage] = useState<string | null>(null);

  return (
    <AdminLayout>
      <div data-ev-id="ev_17f77162d1" className="p-6">
        {/* Header */}
        <div data-ev-id="ev_0ef111a84e" className="mb-8">
          <div data-ev-id="ev_f655d0f6f6" className="flex items-center gap-3 mb-2">
            <Monitor className="w-8 h-8 text-secondary" />
            <h1 data-ev-id="ev_afe040d0c3" className="text-3xl font-bold">סקירת כל העמודים</h1>
          </div>
          <p data-ev-id="ev_ebc0f6e0d7" className="text-muted-foreground">
            צפה בכל עמודי האתר ובדוק שהכל מחובר ועובד כמו שצריך
          </p>
        </div>

        {/* Page Type Legend */}
        <div data-ev-id="ev_c999c0e19d" className="flex items-center gap-6 mb-8 p-4 bg-muted/30 rounded-xl">
          <span data-ev-id="ev_bbfe223ff8" className="text-sm font-medium">סוגי עמודים:</span>
          {Object.entries(PAGE_TYPE_LABELS).map(([key, val]) =>
          <div data-ev-id="ev_87e610bf0a" key={key} className="flex items-center gap-2">
              <span data-ev-id="ev_ccd0c2b9b9" className={`w-3 h-3 rounded-full ${val.color}`} />
              <span data-ev-id="ev_0fe123119c" className="text-sm">{val.label}</span>
            </div>
          )}
        </div>

        {/* Pages Grid */}
        <div data-ev-id="ev_c1589f0375" className="flex flex-col gap-4">
          {PAGES.map((page) => {
            const Icon = page.icon;
            const typeInfo = PAGE_TYPE_LABELS[page.pageType];
            const isExpanded = expandedPage === page.name;

            return (
              <div data-ev-id="ev_e24ae65c3b"
              key={page.name}
              className="bg-surface rounded-xl border border-border overflow-hidden">

                {/* Page Header */}
                <div data-ev-id="ev_f63268c162"
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedPage(isExpanded ? null : page.name)}>

                  <div data-ev-id="ev_dbba33aad5" className={`w-12 h-12 rounded-xl ${typeInfo.color} flex items-center justify-center text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div data-ev-id="ev_8426e830b5" className="flex-1 min-w-0">
                    <div data-ev-id="ev_33bc47b8ee" className="flex items-center gap-2">
                      <h3 data-ev-id="ev_b8224a8021" className="font-bold text-lg">{page.name}</h3>
                      <span data-ev-id="ev_153285acc3" className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.color} text-white`}>
                        {typeInfo.label}
                      </span>
                    </div>
                    <p data-ev-id="ev_29ef7976e3" className="text-sm text-muted-foreground">{page.description}</p>
                  </div>

                  <div data-ev-id="ev_1b35f2c332" className="flex items-center gap-3">
                    <Link
                      to={page.listPath}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">

                      <ExternalLink className="w-4 h-4" />
                      צפה בעמוד
                    </Link>
                    {isExpanded ?
                    <ChevronUp className="w-5 h-5 text-muted-foreground" /> :

                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    }
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded &&
                <div data-ev-id="ev_d87e1e163a" className="border-t border-border bg-muted/20 p-6">
                    <div data-ev-id="ev_07fdba12f3" className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* List Page */}
                      <div data-ev-id="ev_414748863e">
                        <h4 data-ev-id="ev_c0547ead42" className="font-bold mb-3 flex items-center gap-2">
                          <span data-ev-id="ev_6d71055ad6" className="w-2 h-2 rounded-full bg-secondary" />
                          עמוד רשימה
                        </h4>
                        <div data-ev-id="ev_c0953bac19" className="bg-surface rounded-xl border border-border overflow-hidden">
                          <div data-ev-id="ev_5b671310e9" className="aspect-video bg-muted/30 relative">
                            <div data-ev-id="ev_b905801ddb" className="absolute inset-0 flex items-center justify-center">
                              <div data-ev-id="ev_21a55d423b" className="text-center">
                                <Icon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                <p data-ev-id="ev_41a5ddb626" className="text-sm text-muted-foreground">{page.listPath}</p>
                              </div>
                            </div>
                          </div>
                          <div data-ev-id="ev_35ef55f25c" className="p-4">
                            <div data-ev-id="ev_e9a1bfbcd5" className="flex items-center justify-between mb-3">
                              <span data-ev-id="ev_2e418db71b" className="font-medium">מיקומי פרסום</span>
                              <span data-ev-id="ev_95ed2267d1" className="text-xs text-muted-foreground">{page.sections.length} מיקומים</span>
                            </div>
                            <div data-ev-id="ev_783d34e4ec" className="flex flex-wrap gap-2">
                              {page.sections.map((section) =>
                            <span data-ev-id="ev_2e02801fb9"
                            key={section}
                            className="text-xs px-2 py-1 bg-muted rounded-full">

                                  {section}
                                </span>
                            )}
                            </div>
                          </div>
                        </div>
                        <Link
                        to={page.listPath}
                        target="_blank"
                        className="flex items-center gap-2 mt-3 text-sm text-secondary hover:underline">

                          <ExternalLink className="w-4 h-4" />
                          פתח עמוד רשימה
                        </Link>
                      </div>

                      {/* Detail Page */}
                      <div data-ev-id="ev_900f2fc065">
                        <h4 data-ev-id="ev_cd9fcb7e92" className="font-bold mb-3 flex items-center gap-2">
                          <span data-ev-id="ev_233cd9e9a1" className="w-2 h-2 rounded-full bg-purple-500" />
                          עמוד פנימי (תוכן)
                        </h4>
                        <div data-ev-id="ev_ce2c1db3fd" className="bg-surface rounded-xl border border-border overflow-hidden">
                          <div data-ev-id="ev_f80ec66922" className="aspect-video bg-muted/30 relative">
                            <div data-ev-id="ev_b3ca0c7051" className="absolute inset-0 flex items-center justify-center">
                              <div data-ev-id="ev_96dc5ea92d" className="text-center">
                                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                <p data-ev-id="ev_ef5a49d14e" className="text-sm text-muted-foreground">{page.detailPath}</p>
                              </div>
                            </div>
                          </div>
                          <div data-ev-id="ev_9ff99f7013" className="p-4">
                            <div data-ev-id="ev_6aea8d54ad" className="flex items-center justify-between mb-3">
                              <span data-ev-id="ev_11b587b37a" className="font-medium">מיקומי פרסום</span>
                              <span data-ev-id="ev_b2b1c625e3" className="text-xs text-muted-foreground">4 מיקומים</span>
                            </div>
                            <div data-ev-id="ev_fd59b875da" className="flex flex-wrap gap-2">
                              <span data-ev-id="ev_a152cea10f" className="text-xs px-2 py-1 bg-muted rounded-full">סיידבר גדול</span>
                              <span data-ev-id="ev_aa1b19ec3f" className="text-xs px-2 py-1 bg-muted rounded-full">סיידבר קטן 1</span>
                              <span data-ev-id="ev_1e18bd1676" className="text-xs px-2 py-1 bg-muted rounded-full">סיידבר קטן 2</span>
                              <span data-ev-id="ev_702151f5af" className="text-xs px-2 py-1 bg-muted rounded-full">באנר תחתון</span>
                            </div>
                          </div>
                        </div>
                        <p data-ev-id="ev_7f7e59aac3" className="text-xs text-muted-foreground mt-3">
                          * כדי לצפות בעמוד פנימי, בחר פריט מעמוד הרשימה
                        </p>
                      </div>
                    </div>
                  </div>
                }
              </div>);

          })}
        </div>

        {/* Summary Card */}
        <div data-ev-id="ev_0dee9b46b1" className="mt-8 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl p-6 border border-secondary/20">
          <h3 data-ev-id="ev_17f69526c8" className="font-bold text-lg mb-4">סיכום מבנה האתר</h3>
          <div data-ev-id="ev_2b5b67d5ff" className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div data-ev-id="ev_245aaf9e9a" className="text-center p-4 bg-surface rounded-lg">
              <div data-ev-id="ev_ae03d73ed1" className="text-3xl font-bold text-secondary">1</div>
              <div data-ev-id="ev_db8193cfc0" className="text-sm text-muted-foreground">דף הבית</div>
            </div>
            <div data-ev-id="ev_f9b201970c" className="text-center p-4 bg-surface rounded-lg">
              <div data-ev-id="ev_98b753f843" className="text-3xl font-bold text-green-500">{PAGES.filter((p) => p.pageType === 'section').length}</div>
              <div data-ev-id="ev_c116127658" className="text-sm text-muted-foreground">עמודי מדור</div>
            </div>
            <div data-ev-id="ev_3318b6ab8e" className="text-center p-4 bg-surface rounded-lg">
              <div data-ev-id="ev_de4c3f7708" className="text-3xl font-bold text-purple-500">{PAGES.length}</div>
              <div data-ev-id="ev_f3856e7281" className="text-sm text-muted-foreground">עמודים פנימיים</div>
            </div>
            <div data-ev-id="ev_3998314395" className="text-center p-4 bg-surface rounded-lg">
              <div data-ev-id="ev_7730b761e2" className="text-3xl font-bold text-orange-500">15</div>
              <div data-ev-id="ev_50f918e660" className="text-sm text-muted-foreground">מיקומי פרסום</div>
            </div>
          </div>

          <div data-ev-id="ev_9839eec7f0" className="mt-6 flex items-center justify-center gap-4">
            <Link
              to="/admin/ads"
              className="flex items-center gap-2 px-6 py-3 bg-secondary text-primary rounded-lg font-medium hover:opacity-90">

              ניהול פרסומות
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90">

              <ExternalLink className="w-4 h-4" />
              צפה באתר
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>);

}