import { useState } from 'react';
import { Download, Loader2, CheckCircle, Database, FileText, AlertCircle, FolderArchive, Server, Code, BookOpen, FileCode } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Database tables to export - ALL tables
const DATABASE_TABLES = [
'ad_campaigns',
'ad_creatives',
'ad_impressions',
'ad_placements',
'ad_requests',
'ad_stats',
'analytics_content_stats',
'analytics_events',
'analytics_pageviews',
'analytics_sessions',
'article_comments',
'article_votes',
'articles',
'bein_hatzibur',
'categories',
'chassiduyot',
'drive_folder_mapping',
'drive_section_mappings',
'drive_sync_config',
'drive_sync_log',
'drive_synced_items',
'events',
'galleries',
'gallery_images',
'hero_banners',
'hero_settings',
'historical_events',
'news_batzibur',
'newspaper_issues',
'photographers',
'profiles',
'siah_hatzibur',
'site_pages',
'site_settings',
'videos',
'writers'];


// Complete list of ALL source files in the project
const ALL_SOURCE_FILES = [
// Config files
'package.json', 'vite.config.ts', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json',
'eslint.config.js', 'index.html', '.env.example',

// Core source
'src/App.tsx', 'src/main.tsx', 'src/providers.tsx', 'src/index.css', 'src/theme.css',

// Contexts
'src/contexts/AuthContext.tsx', 'src/contexts/RTLContext.tsx',

// Hooks (19 files)
'src/hooks/useAds.ts', 'src/hooks/useAnalytics.ts', 'src/hooks/useArticleCache.ts',
'src/hooks/useArticles.ts', 'src/hooks/useCategories.ts', 'src/hooks/useChassiduyot.ts',
'src/hooks/useDriveSync.ts', 'src/hooks/useEvents.ts', 'src/hooks/useGalleries.ts',
'src/hooks/useHebrewDate.ts', 'src/hooks/useHebrewDateFull.ts', 'src/hooks/useHeroBanners.ts',
'src/hooks/useHomepageData.ts', 'src/hooks/useNewspaperSections.ts', 'src/hooks/usePhotographers.ts',
'src/hooks/useScrollPosition.ts', 'src/hooks/useVideos.ts', 'src/hooks/useWriters.ts',

// Lib
'src/lib/cache.ts', 'src/lib/imagePreloader.ts', 'src/lib/watermark.ts',

// Integrations
'src/integrations/supabase/client.ts', 'src/integrations/supabase/helpers.ts', 'src/integrations/supabase/types.ts',

// Layout components
'src/components/layout/Footer.tsx', 'src/components/layout/Header.tsx', 'src/components/layout/Layout.tsx',

// Admin components
'src/components/admin/AdPlacementMap.tsx', 'src/components/admin/AdSiteMap.tsx',
'src/components/admin/AdminLayout.tsx', 'src/components/admin/AnalyticsDashboard.tsx',
'src/components/admin/PageLayoutPreview.tsx', 'src/components/admin/ProtectedRoute.tsx',
'src/components/admin/RoleManager.tsx', 'src/components/admin/VisualAdMap.tsx',

// UI components (66 files)
'src/components/ui/ActionBar.tsx', 'src/components/ui/AdBanner.tsx', 'src/components/ui/AdWrapper.tsx',
'src/components/ui/AdvancedBlockEditor.tsx', 'src/components/ui/AnimatedCounter.tsx',
'src/components/ui/ArticleCard.tsx', 'src/components/ui/ArticleCardClean.tsx',
'src/components/ui/ArticleComments.tsx', 'src/components/ui/ArticleDetailLayout.tsx',
'src/components/ui/ArticleGrid.tsx', 'src/components/ui/ArticleVoting.tsx',
'src/components/ui/BlockEditor.tsx', 'src/components/ui/CategoryStrip.tsx',
'src/components/ui/CookieConsentBanner.tsx', 'src/components/ui/DriveImagePicker.tsx',
'src/components/ui/EventCard.tsx', 'src/components/ui/FeaturedHistoricalSection.tsx',
'src/components/ui/FeaturedIssueSection.tsx', 'src/components/ui/FloatingActions.tsx',
'src/components/ui/FloatingAd.tsx', 'src/components/ui/GalleryCard.tsx',
'src/components/ui/GalleryCardClean.tsx', 'src/components/ui/GlowButton.tsx',
'src/components/ui/HebrewDate.tsx', 'src/components/ui/HeroAdSlider.tsx',
'src/components/ui/HeroSection.tsx', 'src/components/ui/HomepageSection.tsx',
'src/components/ui/ImageUploader.tsx', 'src/components/ui/InFeedAd.tsx',
'src/components/ui/InterstitialAd.tsx', 'src/components/ui/LanguageToggle.tsx',
'src/components/ui/LocalNewsSection.tsx', 'src/components/ui/MagneticButton.tsx',
'src/components/ui/MusicSection.tsx', 'src/components/ui/NativeAd.tsx',
'src/components/ui/NewsTicker.tsx', 'src/components/ui/NewspaperSlider.tsx',
'src/components/ui/OpinionSection.tsx', 'src/components/ui/OptimizedImage.tsx',
'src/components/ui/PDFFlipViewer.tsx', 'src/components/ui/PDFUploader.tsx',
'src/components/ui/PDFViewer.tsx', 'src/components/ui/PageAds.tsx',
'src/components/ui/ParallaxImage.tsx', 'src/components/ui/PopupAd.tsx',
'src/components/ui/PremiumArticleCard.tsx', 'src/components/ui/RichTextEditor.tsx',
'src/components/ui/ScrollReveal.tsx', 'src/components/ui/ScrollToTop.tsx',
'src/components/ui/SectionHeader.tsx', 'src/components/ui/SectionPageLayout.tsx',
'src/components/ui/SectionTitle.tsx', 'src/components/ui/ShimmerText.tsx',
'src/components/ui/SideAd.tsx', 'src/components/ui/SideArticle.tsx',
'src/components/ui/SkeletonLoader.tsx', 'src/components/ui/SmartAutocomplete.tsx',
'src/components/ui/SmartSearch.tsx', 'src/components/ui/StaggerGrid.tsx',
'src/components/ui/TabbedSection.tsx', 'src/components/ui/TextSizeSelector.tsx',
'src/components/ui/TextToSpeechPlayer.tsx', 'src/components/ui/TiltCard.tsx',
'src/components/ui/VideoAd.tsx', 'src/components/ui/VideoCard.tsx',
'src/components/ui/VideoSection.tsx',

// Pages (25 files)
'src/pages/Index.tsx', 'src/pages/AdStats.tsx', 'src/pages/Advertise.tsx',
'src/pages/ArticleDetail.tsx', 'src/pages/ArticlesPage.tsx',
'src/pages/Before18Detail.tsx', 'src/pages/Before18Page.tsx',
'src/pages/BeinHatziburDetail.tsx', 'src/pages/BeinHatziburPage.tsx',
'src/pages/EventDetail.tsx', 'src/pages/EventsPage.tsx',
'src/pages/GalleryDetail.tsx', 'src/pages/GalleryPage.tsx',
'src/pages/HistoricalEventDetail.tsx', 'src/pages/HistoricalEventsPage.tsx',
'src/pages/NewsBatziburDetail.tsx', 'src/pages/NewsBatziburPage.tsx',
'src/pages/NewsPage.tsx', 'src/pages/NewspaperPage.tsx',
'src/pages/SiahDetail.tsx', 'src/pages/SiahHatziburPage.tsx',
'src/pages/SitePage.tsx', 'src/pages/VideoDetail.tsx', 'src/pages/VideoPage.tsx',

// Admin pages (29 files)
'src/pages/admin/AdRequests.tsx', 'src/pages/admin/Ads.tsx',
'src/pages/admin/AllPagesPreview.tsx', 'src/pages/admin/ArticleEdit.tsx',
'src/pages/admin/Articles.tsx', 'src/pages/admin/Before18Years.tsx',
'src/pages/admin/BeinHatzibur.tsx', 'src/pages/admin/Comments.tsx',
'src/pages/admin/Dashboard.tsx', 'src/pages/admin/DataManager.tsx',
'src/pages/admin/DriveSync.tsx', 'src/pages/admin/DriveSyncCallback.tsx',
'src/pages/admin/Events.tsx', 'src/pages/admin/ExportCode.tsx',
'src/pages/admin/Galleries.tsx', 'src/pages/admin/HeroBanners.tsx',
'src/pages/admin/HistoricalEvents.tsx', 'src/pages/admin/Login.tsx',
'src/pages/admin/Media.tsx', 'src/pages/admin/NewsBatzibur.tsx',
'src/pages/admin/NewspaperIssues.tsx', 'src/pages/admin/Settings.tsx',
'src/pages/admin/SiahHatzibur.tsx', 'src/pages/admin/SiteAnalytics.tsx',
'src/pages/admin/SitePages.tsx', 'src/pages/admin/Users.tsx',
'src/pages/admin/Videos.tsx', 'src/pages/admin/WatermarkTool.tsx',
'src/pages/admin/Writers.tsx',

// Edge functions
'supabase/functions/drive-sync/index.ts',
'supabase/functions/drive-webhook/index.ts',
'supabase/functions/get-visitor-id/index.ts',
'supabase/functions/hello/index.ts',
'supabase/functions/newsletter-subscribe/index.ts',

// Assets
'src/assets/fonts/Discovery_Fs-Bold.woff2',
'src/assets/fonts/Discovery_Fs-Regular.woff2',
'src/assets/uploads/logo.png',
'public/vite.svg',
'public/loading-animation.gif'];



interface ExportStats {
  tables: number;
  totalRows: number;
  errors: string[];
}

export default function ExportCode() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [stats, setStats] = useState<ExportStats>({ tables: 0, totalRows: 0, errors: [] });

  const exportProject = async () => {
    if (!supabase) {
      setStatus('error');
      setErrorMessage('Cloud Backend לא מחובר');
      return;
    }

    setIsExporting(true);
    setStatus('loading');
    setProgress(0);
    setErrorMessage('');
    setStats({ tables: 0, totalRows: 0, errors: [] });

    try {
      const zip = new JSZip();
      const totalSteps = DATABASE_TABLES.length;
      let completedSteps = 0;
      let loadedTables = 0;
      let totalRows = 0;
      const errors: string[] = [];
      const tableStats: Record<string, number> = {};

      // === Export Database Data ===
      setCurrentTask('מייצא נתונים מהמסד...');
      const dataFolder = zip.folder('data');

      for (const tableName of DATABASE_TABLES) {
        setCurrentTask(`מייצא ${tableName}...`);
        try {
          // Fetch ALL data (no limit)
          const { data, error } = await supabase.
          from(tableName).
          select('*');

          if (error) {
            errors.push(`${tableName}: ${error.message}`);
          } else if (data && data.length > 0) {
            dataFolder?.file(
              `${tableName}.json`,
              JSON.stringify(data, null, 2)
            );
            loadedTables++;
            totalRows += data.length;
            tableStats[tableName] = data.length;
          } else {
            // Empty table - still create file
            dataFolder?.file(`${tableName}.json`, '[]');
          }
        } catch (e) {
          errors.push(`${tableName}: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
        completedSteps++;
        setProgress(Math.round(completedSteps / totalSteps * 100));
      }

      // Update stats
      setStats({
        tables: loadedTables,
        totalRows: totalRows,
        errors: errors
      });

      // === Generate .env.example ===
      const envExample = `# Supabase Configuration
# קבל את המפתחות מ: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here

# Optional: Google Drive Integration
VITE_GOOGLE_CLIENT_ID=your-google-client-id
`;
      zip.file('.env.example', envExample);

      // === Generate comprehensive SETUP.md ===
      const setupGuide = `# 🚀 מדריך התקנה מלא - הציבור החרדי

## 📋 תוכן העניינים
1. [דרישות מקדימות](#דרישות-מקדימות)
2. [התקנת הקוד](#התקנת-הקוד)
3. [הגדרת Supabase](#הגדרת-supabase)
4. [הרצת המיגרציות](#הרצת-המיגרציות)
5. [ייבוא הנתונים](#ייבוא-הנתונים)
6. [הפעלת האתר](#הפעלת-האתר)
7. [פתרון בעיות](#פתרון-בעיות)

---

## דרישות מקדימות

- **Node.js** 18 או גבוה יותר - [הורדה](https://nodejs.org)
- **npm** או **yarn**
- **חשבון Supabase** (חינמי) - [הרשמה](https://supabase.com)
- **קוד המקור** של הפרויקט

---

## התקנת הקוד

### קבלת קוד המקור

אם יש לך גישה ל-Sticklight:
1. לחץ על **"Export"** או **"Download"** בממשק
2. פתח את קובץ ה-ZIP

או העתק ידנית את כל הקבצים מתיקיות:
- \`src/\` - כל קוד ה-React
- \`supabase/\` - Edge Functions ומיגרציות
- קבצי הגדרות (package.json, vite.config.ts, וכו')

### התקנת התלויות

\`\`\`bash
cd your-project-folder
npm install
\`\`\`

---

## הגדרת Supabase

### 1. יצירת פרויקט חדש

1. היכנס ל-[supabase.com/dashboard](https://supabase.com/dashboard)
2. לחץ **"New Project"**
3. בחר:
   - **Name**: שם הפרויקט
   - **Database Password**: סיסמה חזקה (שמור אותה!)
   - **Region**: Frankfurt (הכי קרוב לישראל)
4. לחץ **"Create new project"**
5. המתן 2-3 דקות ליצירת הפרויקט

### 2. קבלת המפתחות

1. לך ל-**Settings** → **API**
2. העתק:
   - **Project URL** (נראה כמו \`https://xxxxx.supabase.co\`)
   - **anon public** key (מתחיל ב-\`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\`)

### 3. הגדרת משתני סביבה

\`\`\`bash
cp .env.example .env
\`\`\`

ערוך את \`.env\`:
\`\`\`
VITE_SUPABASE_URL=https://your-actual-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

---

## הרצת המיגרציות

המיגרציות יוצרות את כל הטבלאות והרשאות ה-RLS.

### אפשרות א': דרך ממשק Supabase (מומלץ למתחילים)

1. לך ל-**SQL Editor** בדשבורד של Supabase
2. פתח כל קובץ מתיקיית \`supabase/migrations/\` **לפי סדר התאריכים**
3. העתק את תוכן הקובץ ל-SQL Editor
4. לחץ **"Run"**
5. חזור על זה לכל קובץ

### אפשרות ב': דרך Supabase CLI

\`\`\`bash
# התקנת CLI
npm install -g supabase

# התחברות
supabase login

# קישור לפרויקט
supabase link --project-ref YOUR_PROJECT_REF

# הרצת מיגרציות
supabase db push
\`\`\`

---

## ייבוא הנתונים

הנתונים נמצאים בתיקיית \`data/\` בפורמט JSON.

### אפשרות א': סקריפט אוטומטי

1. התקן את הסקריפט:
\`\`\`bash
cd scripts
npm install @supabase/supabase-js
\`\`\`

2. הגדר את המפתחות:
\`\`\`bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-role-key"
\`\`\`

> ⚠️ **חשוב**: ה-Service Role Key נמצא ב-Settings → API → service_role (secret)
> **אל תשתף את המפתח הזה!**

3. הרץ:
\`\`\`bash
node import-data.js
\`\`\`

### אפשרות ב': ייבוא ידני

1. לך ל-**Table Editor** ב-Supabase
2. בחר טבלה
3. לחץ **"Insert"** → **"Import data from CSV"**
4. המר את קובץ ה-JSON ל-CSV (ניתן להשתמש ב-[csvjson.com](https://csvjson.com))

### סדר ייבוא מומלץ (בגלל תלויות):

1. \`categories\`
2. \`chassiduyot\`
3. \`photographers\`
4. \`writers\`
5. \`profiles\`
6. שאר הטבלאות

---

## הפעלת האתר

\`\`\`bash
npm run dev
\`\`\`

האתר יעלה ב: **http://localhost:5173**

### יצירת משתמש אדמין

1. לך ל-Supabase → **Authentication** → **Users**
2. לחץ **"Add user"** → **"Create new user"**
3. הכנס email וסיסמה
4. לאחר היצירה, לך ל-**Table Editor** → **profiles**
5. מצא את המשתמש ושנה את \`role\` ל-**"admin"**

---

## פתרון בעיות

### "Supabase client is null"
- ודא שקובץ \`.env\` קיים (לא \`.env.example\`)
- ודא שהמפתחות נכונים
- הפעל מחדש את שרת הפיתוח

### "Permission denied" / "No rows returned"
- הרץ את כל המיגרציות
- ודא שה-RLS policies נוצרו

### תמונות לא נטענות
- התמונות מאוחסנות ב-Google Drive חיצוני
- תצטרך להעלות תמונות חדשות או להגדיר סנכרון Drive

### בעיות בהתחברות
- ודא שהמשתמש קיים ב-Authentication
- ודא שיש לו פרופיל בטבלת \`profiles\`

---

## 📊 סטטיסטיקות הייצוא

יוצא בתאריך: ${new Date().toLocaleString('he-IL')}

| טבלה | שורות |
|------|-------|
${Object.entries(tableStats).map(([table, count]) => `| ${table} | ${count.toLocaleString()} |`).join('\n')}

**סה"כ**: ${loadedTables} טבלאות, ${totalRows.toLocaleString()} שורות

---

## 📁 מבנה הפרויקט

\`\`\`
project/
├── src/
│   ├── components/          # קומפוננטות React
│   │   ├── admin/           # קומפוננטות ניהול
│   │   ├── layout/          # Header, Footer, Layout
│   │   └── ui/              # קומפוננטות UI כלליות
│   ├── contexts/            # React Contexts
│   ├── hooks/               # Custom Hooks
│   ├── integrations/        # Supabase client
│   ├── lib/                 # Utilities
│   ├── pages/               # דפי האתר
│   │   └── admin/           # דפי ניהול
│   ├── App.tsx              # הגדרות ראוטינג
│   ├── main.tsx             # Entry point
│   └── theme.css            # עיצוב ומשתני CSS
├── supabase/
│   ├── functions/           # Edge Functions
│   └── migrations/          # SQL migrations
├── data/                    # נתוני המסד (מיוצאים)
├── scripts/                 # סקריפטים עזר
├── .env.example             # תבנית משתני סביבה
└── package.json
\`\`\`

---

## 🔗 קישורים שימושיים

- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

**בהצלחה! 🎉**
`;

      zip.file('SETUP.md', setupGuide);

      // === Generate import script ===
      const importScript = `/**
 * 📦 Data Import Script
 * 
 * Usage:
 *   export SUPABASE_URL="https://your-project.supabase.co"
 *   export SUPABASE_SERVICE_KEY="your-service-role-key"
 *   node import-data.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const DATA_DIR = path.join(__dirname, '..', 'data');

// Import order (respects foreign key dependencies)
const IMPORT_ORDER = [
  'categories',
  'chassiduyot', 
  'photographers',
  'writers',
  'profiles',
  'site_settings',
  'site_pages',
  'hero_settings',
  'hero_banners',
  'newspaper_issues',
  'siah_hatzibur',
  'news_batzibur',
  'bein_hatzibur',
  'historical_events',
  'articles',
  'galleries',
  'gallery_images',
  'events',
  'videos',
  'ad_campaigns',
  'ad_creatives',
  'ad_placements',
  'ad_requests',
  'ad_stats',
  'ad_impressions',
  'article_votes',
  'article_comments',
  'drive_sync_config',
  'drive_folder_mapping',
  'drive_section_mappings',
  'drive_sync_log',
  'drive_synced_items',
  'analytics_sessions',
  'analytics_pageviews',
  'analytics_events',
  'analytics_content_stats',
];

async function importTable(tableName) {
  const filePath = path.join(DATA_DIR, \`\${tableName}.json\`);
  
  if (!fs.existsSync(filePath)) {
    console.log(\`⏭️  \${tableName} - no data file\`);
    return 0;
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!data || data.length === 0) {
    console.log(\`⏭️  \${tableName} - empty\`);
    return 0;
  }
  
  // Insert in batches
  const batchSize = 100;
  let imported = 0;
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from(tableName)
      .upsert(batch, { onConflict: 'id', ignoreDuplicates: true });
    
    if (error) {
      console.error(\`❌ \${tableName}: \${error.message}\`);
      return imported;
    }
    
    imported += batch.length;
    process.stdout.write(\`\\r📥 \${tableName}: \${imported}/\${data.length}\`);
  }
  
  console.log(\`\\r✅ \${tableName}: \${imported} rows imported\`);
  return imported;
}

async function main() {
  console.log('🚀 Starting data import...\\n');
  console.log('Tables to import:', IMPORT_ORDER.length);
  console.log('---\\n');
  
  let totalRows = 0;
  let successTables = 0;
  
  for (const table of IMPORT_ORDER) {
    const rows = await importTable(table);
    if (rows > 0) {
      totalRows += rows;
      successTables++;
    }
  }
  
  console.log('\\n---');
  console.log(\`✨ Done! \${successTables} tables, \${totalRows.toLocaleString()} rows imported.\`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
`;

      const scriptsFolder = zip.folder('scripts');
      scriptsFolder?.file('import-data.js', importScript);

      // Package.json for scripts folder
      scriptsFolder?.file('package.json', JSON.stringify({
        "name": "import-scripts",
        "type": "commonjs",
        "dependencies": {
          "@supabase/supabase-js": "^2.47.3"
        }
      }, null, 2));

      // === Generate table schema documentation ===
      const schemaDoc = `# 📊 Database Schema\n\n## Tables Overview\n\n${DATABASE_TABLES.map((t) => `- **${t}**`).join('\n')}\n\n## Data Statistics\n\n| Table | Rows |\n|-------|------|\n${Object.entries(tableStats).map(([t, c]) => `| ${t} | ${c} |`).join('\n')}\n\n**Total**: ${totalRows.toLocaleString()} rows\n`;
      zip.file('SCHEMA.md', schemaDoc);

      // === Generate ZIP ===
      setCurrentTask('יוצר קובץ ZIP...');
      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 }
      });

      // Download
      const date = new Date().toISOString().split('T')[0];
      const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
      saveAs(blob, `hatzibur-export-${date}-${time}.zip`);

      setStatus('success');
      setCurrentTask('');
    } catch (error) {
      console.error('Export failed:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'שגיאה בייצוא');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AdminLayout>
      <div data-ev-id="ev_afbbd5acca" className="p-6 max-w-4xl mx-auto">
        <div data-ev-id="ev_7378ea31ef" className="mb-8">
          <h1 data-ev-id="ev_2efa129512" className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <FolderArchive className="w-8 h-8 text-primary" />
            ייצוא מלא של הפרויקט
          </h1>
          <p data-ev-id="ev_a271c96b21" className="text-gray-600">
            הורד את כל נתוני המסד והוראות התקנה מפורטות להעברה לשרת חדש
          </p>
        </div>

        <div data-ev-id="ev_be2fc59c14" className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {/* What's Included */}
          <div data-ev-id="ev_4b29f82709" className="grid md:grid-cols-2 gap-4 mb-8">
            <div data-ev-id="ev_5bef4914e8" className="bg-green-50 border border-green-200 rounded-xl p-5">
              <h3 data-ev-id="ev_2275d30c5d" className="font-bold text-green-800 flex items-center gap-2 mb-3">
                <Database className="w-5 h-5" />
                מה כלול בייצוא
              </h3>
              <ul data-ev-id="ev_aac8548f0d" className="text-sm text-green-700 space-y-2">
                <li data-ev-id="ev_8ad357bc85" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  כל {DATABASE_TABLES.length} טבלאות המסד
                </li>
                <li data-ev-id="ev_fa1093b39d" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  כתבות, גלריות, אירועים, סרטונים
                </li>
                <li data-ev-id="ev_1bc89c84a7" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  הגדרות פרסום ובאנרים
                </li>
                <li data-ev-id="ev_44d77e1342" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  נתוני אנליטיקס
                </li>
                <li data-ev-id="ev_d0bd417901" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  סקריפט ייבוא אוטומטי
                </li>
                <li data-ev-id="ev_5f0453d1b5" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  מדריך התקנה מפורט
                </li>
              </ul>
            </div>
            
            <div data-ev-id="ev_6229fec36d" className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h3 data-ev-id="ev_49560466f7" className="font-bold text-blue-800 flex items-center gap-2 mb-3">
                <Code className="w-5 h-5" />
                קוד המקור
              </h3>
              <p data-ev-id="ev_db3e8294cf" className="text-sm text-blue-700 mb-3">
                את קוד המקור יש להעתיק בנפרד מממשק Sticklight:
              </p>
              <ul data-ev-id="ev_a0749dcc53" className="text-sm text-blue-700 space-y-2">
                <li data-ev-id="ev_5895627dc3">• לחץ על "Export" בתפריט העליון</li>
                <li data-ev-id="ev_242ecaa99c">• או העתק ידנית את תיקיות src/ ו-supabase/</li>
                <li data-ev-id="ev_49c0405940">• הקפד להעתיק גם package.json</li>
              </ul>
            </div>
          </div>

          {/* Export Button */}
          <button data-ev-id="ev_d328047d80"
          onClick={exportProject}
          disabled={isExporting}
          className="w-full py-5 px-6 bg-gradient-to-r from-primary to-gray-800 text-white rounded-xl font-bold text-xl flex items-center justify-center gap-3 hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">

            {isExporting ?
            <>
                <Loader2 className="w-7 h-7 animate-spin" />
                <span data-ev-id="ev_3e568771b6">{currentTask || `מייצא... ${progress}%`}</span>
              </> :
            status === 'success' ?
            <>
                <CheckCircle className="w-7 h-7" />
                הייצוא הושלם - לחץ להורדה נוספת
              </> :

            <>
                <Download className="w-7 h-7" />
                הורד ייצוא מלא של המסד
              </>
            }
          </button>

          {/* Progress Bar */}
          {isExporting &&
          <div data-ev-id="ev_a0982fcacb" className="mt-4">
              <div data-ev-id="ev_4bbb38fd30" className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div data-ev-id="ev_29b63fd883"
              className="h-full bg-gradient-to-r from-primary to-gray-600 transition-all duration-300"
              style={{ width: `${progress}%` }} />

              </div>
            </div>
          }

          {/* Success Message */}
          {status === 'success' &&
          <div data-ev-id="ev_aa440a9fc4" className="mt-6 p-5 bg-green-50 border border-green-200 rounded-xl">
              <div data-ev-id="ev_7442fffc07" className="flex items-center gap-2 mb-3 text-green-800">
                <CheckCircle className="w-6 h-6" />
                <span data-ev-id="ev_b4bc959458" className="font-bold text-lg">הייצוא הושלם בהצלחה!</span>
              </div>
              <div data-ev-id="ev_845dcccea4" className="grid grid-cols-2 gap-4 text-sm">
                <div data-ev-id="ev_63231dbba9" className="bg-white rounded-lg p-3 text-center">
                  <div data-ev-id="ev_d4131458cd" className="text-2xl font-bold text-green-900">{stats.tables}</div>
                  <div data-ev-id="ev_180d8d54d4" className="text-green-600">טבלאות</div>
                </div>
                <div data-ev-id="ev_7e9d483f92" className="bg-white rounded-lg p-3 text-center">
                  <div data-ev-id="ev_4003a72d31" className="text-2xl font-bold text-green-900">{stats.totalRows.toLocaleString()}</div>
                  <div data-ev-id="ev_865e87eeed" className="text-green-600">שורות נתונים</div>
                </div>
              </div>
              
              {stats.errors.length > 0 &&
            <div data-ev-id="ev_71a1952e6a" className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p data-ev-id="ev_9d9f3c86b1" className="text-yellow-800 font-medium text-sm">שגיאות ({stats.errors.length}):</p>
                  <ul data-ev-id="ev_202a11ae47" className="text-xs text-yellow-700 mt-1">
                    {stats.errors.slice(0, 5).map((err, i) =>
                <li data-ev-id="ev_42ab82b0c8" key={i}>• {err}</li>
                )}
                  </ul>
                </div>
            }
            </div>
          }

          {/* Error Message */}
          {status === 'error' &&
          <div data-ev-id="ev_f480766a80" className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <div data-ev-id="ev_ae37a63af6">
                <p data-ev-id="ev_476fa11620" className="font-medium">שגיאה בייצוא</p>
                <p data-ev-id="ev_03765aebaf" className="text-sm text-red-600">{errorMessage}</p>
              </div>
            </div>
          }

          {/* Instructions */}
          <div data-ev-id="ev_fdbeda8089" className="mt-8 border-t pt-6">
            <h3 data-ev-id="ev_e2f1b73b4d" className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              שלבי ההתקנה בשרת החדש
            </h3>
            
            <div data-ev-id="ev_775a0eb884" className="space-y-3">
              <div data-ev-id="ev_381a9b0112" className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div data-ev-id="ev_516a9ef2cf" className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div data-ev-id="ev_527ae2add5">
                  <p data-ev-id="ev_54b7539b40" className="font-medium">צור פרויקט Supabase חדש</p>
                  <p data-ev-id="ev_07b32490cd" className="text-sm text-gray-600">supabase.com → New Project</p>
                </div>
              </div>
              
              <div data-ev-id="ev_efce6c6f49" className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div data-ev-id="ev_6cbc68a2b6" className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div data-ev-id="ev_f49db24ce3">
                  <p data-ev-id="ev_96c50c861c" className="font-medium">הרץ את המיגרציות</p>
                  <p data-ev-id="ev_19cedde6b7" className="text-sm text-gray-600">SQL Editor → העתק כל קובץ מ-supabase/migrations/</p>
                </div>
              </div>
              
              <div data-ev-id="ev_3501c861b0" className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div data-ev-id="ev_6654876d1e" className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div data-ev-id="ev_c30477c026">
                  <p data-ev-id="ev_98539b9417" className="font-medium">ייבא את הנתונים</p>
                  <p data-ev-id="ev_a1048e6bd4" className="text-sm text-gray-600">הרץ: node scripts/import-data.js</p>
                </div>
              </div>
              
              <div data-ev-id="ev_406b725b5f" className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div data-ev-id="ev_46d4acc780" className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                <div data-ev-id="ev_d519ce5c08">
                  <p data-ev-id="ev_66d086a38e" className="font-medium">הגדר משתני סביבה והפעל</p>
                  <p data-ev-id="ev_9909862464" className="text-sm text-gray-600">.env → npm install → npm run dev</p>
                </div>
              </div>
            </div>
            
            <p data-ev-id="ev_add9970bf3" className="mt-4 text-sm text-gray-500 text-center">
              📖 הוראות מפורטות בקובץ SETUP.md שבייצוא
            </p>
          </div>

          {/* Complete File List */}
          <div data-ev-id="ev_329b6d8815" className="mt-8 border-t pt-6">
            <h3 data-ev-id="ev_737e692b96" className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileCode className="w-5 h-5" />
              רשימת כל קבצי הקוד ({ALL_SOURCE_FILES.length} קבצים)
            </h3>
            
            <div data-ev-id="ev_6e5566f0b2" className="bg-gray-900 rounded-xl p-4 max-h-64 overflow-y-auto">
              <pre data-ev-id="ev_e7d9091ce5" className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                {ALL_SOURCE_FILES.join('\n')}
              </pre>
            </div>
            
            <button data-ev-id="ev_28d6697ee3"
            onClick={() => {
              const textarea = document.createElement('textarea');
              textarea.value = ALL_SOURCE_FILES.join('\n');
              textarea.style.position = 'fixed';
              textarea.style.opacity = '0';
              document.body.appendChild(textarea);
              textarea.select();
              document.execCommand('copy');
              document.body.removeChild(textarea);
              alert('רשימת הקבצים הועתקה!');
            }}
            className="mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">

              📋 העתק רשימת קבצים
            </button>
          </div>

          {/* Contact Support Section */}
          <div data-ev-id="ev_f42e6b57c6" className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 data-ev-id="ev_63aa6e19e1" className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <Server className="w-5 h-5" />
              לייצוא קוד מלא
            </h3>
            <p data-ev-id="ev_bc03c7821c" className="text-blue-800 text-sm mb-3">
              לייצוא מלא של כל קבצי הקוד, פנה לתמיכה של Sticklight ובקש:
            </p>
            <div data-ev-id="ev_f4bdb184ca" className="bg-white/50 rounded-lg p-3 text-sm text-blue-900 font-mono">
              "אני צריך ייצוא מלא (Full Export) של הפרויקט שלי כולל כל קבצי המקור"
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>);

}