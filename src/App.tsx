/**
 * ⚠️ ROUTING RULES:
 * - Router is in main.tsx. Do NOT add another <BrowserRouter> here or anywhere.
 * - Use <Routes> + <Route> components ONLY. Do NOT use useRoutes().
 * - STATIC IMPORTS ONLY — no React.lazy() or dynamic import().
 * - Import from 'react-router' — NOT 'react-router-dom' (does not exist).
 */
import { Routes, Route } from 'react-router';
import ScrollToTop from '@/components/ui/ScrollToTop';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useMobileMenu } from '@/contexts/MobileMenuContext';
import MobileMenuDrawer from '@/components/layout/MobileMenuDrawer';
import Index from '@/pages/Index';
import NewsPage from '@/pages/NewsPage';
import GalleryPage from '@/pages/GalleryPage';
import GalleryDetail from '@/pages/GalleryDetail';
import ArticlesPage from '@/pages/ArticlesPage';
import EventsPage from '@/pages/EventsPage';
import EventDetail from '@/pages/EventDetail';
import VideoPage from '@/pages/VideoPage';
import VideoDetail from '@/pages/VideoDetail';
import ArticleDetail from '@/pages/ArticleDetail';
import AdStats from '@/pages/AdStats';
import AdminDashboard from '@/pages/AdminDashboard';

// New Newspaper Section Pages
import NewspaperPage from '@/pages/NewspaperPage';
import SiahHatziburPage from '@/pages/SiahHatziburPage';
import SiahDetail from '@/pages/SiahDetail';
import Before18Page from '@/pages/Before18Page';
import Before18Detail from '@/pages/Before18Detail';
import BeinHatziburPage from '@/pages/BeinHatziburPage';
import BeinHatziburDetail from '@/pages/BeinHatziburDetail';
import NewsBatziburPage from '@/pages/NewsBatziburPage';
import NewsBatziburDetail from '@/pages/NewsBatziburDetail';
import HistoricalEventsPage from '@/pages/HistoricalEventsPage';
import HistoricalEventDetail from '@/pages/HistoricalEventDetail';

// Site Pages
import SitePage from '@/pages/SitePage';
import Advertise from '@/pages/Advertise';

// Admin Pages
import AdminLogin from '@/pages/admin/Login';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminArticles from '@/pages/admin/Articles';
import AdminArticleEdit from '@/pages/admin/ArticleEdit';
import AdminGalleries from '@/pages/admin/Galleries';
import AdminEvents from '@/pages/admin/Events';
import AdminVideos from '@/pages/admin/Videos';
import AdminAds from '@/pages/admin/Ads';
import AdminDataManager from '@/pages/admin/DataManager';
import AdminSettings from '@/pages/admin/Settings';
import AdminUsers from '@/pages/admin/Users';
import AdminNewspaperIssues from '@/pages/admin/NewspaperIssues';
import AdminSiahHatzibur from '@/pages/admin/SiahHatzibur';
import AdminBefore18Years from '@/pages/admin/Before18Years';
import AdminBeinHatzibur from '@/pages/admin/BeinHatzibur';
import AdminNewsBatzibur from '@/pages/admin/NewsBatzibur';
import AdminHistoricalEvents from '@/pages/admin/HistoricalEvents';
import AdminHeroBanners from '@/pages/admin/HeroBanners';
import AdminWatermarkTool from '@/pages/admin/WatermarkTool';
import AdminDriveSync from '@/pages/admin/DriveSync';
import AdminDriveSyncCallback from '@/pages/admin/DriveSyncCallback';
import AdminSitePages from '@/pages/admin/SitePages';
import AdminAdRequests from '@/pages/admin/AdRequests';
import AdminAllPagesPreview from '@/pages/admin/AllPagesPreview';
import AdminWriters from '@/pages/admin/Writers';
import AdminMedia from '@/pages/admin/Media';
import AdminComments from '@/pages/admin/Comments';
import AdminSiteAnalytics from '@/pages/admin/SiteAnalytics';
import ExportCode from '@/pages/admin/ExportCode';
import AdminNewsletter from '@/pages/admin/Newsletter';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import NotFound from '@/pages/NotFound';
import InstallPWA from '@/components/ui/InstallPWA';
import OfflineIndicator from '@/components/ui/OfflineIndicator';
import UpdatePrompt from '@/components/ui/UpdatePrompt';

export default function App() {
  // Enable analytics tracking
  useAnalytics();

  const { isOpen: mobileMenuOpen } = useMobileMenu();

  return (
    <>
      {/* Page-content wrapper. When the mobile drawer opens, this slides LEFT
          to reveal the drawer (fixed on the right edge). Desktop is unaffected.
          IMPORTANT: when the menu is CLOSED we deliberately add NO transform /
          will-change-transform classes — they would create a containing block
          for `position: fixed` descendants and break every modal in the app
          (PDF viewer, lightbox, search, etc.) by sizing them to the page
          instead of the viewport. */}
      <div
        className={
        mobileMenuOpen ?
        'transition-transform duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform -translate-x-[78%] sm:-translate-x-[360px] lg:translate-x-0' :
        'transition-transform duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
        }>
        <ScrollToTop />
        <OfflineIndicator />
        <InstallPWA variant="floating" />
        <UpdatePrompt />
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/gallery/:id" element={<GalleryDetail />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/video" element={<VideoPage />} />
        <Route path="/video/:id" element={<VideoDetail />} />
        <Route path="/article/:id" element={<ArticleDetail />} />
        <Route path="/ad-stats/:token" element={<AdStats />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
        
        {/* New Newspaper Section Routes */}
        <Route path="/newspaper" element={<NewspaperPage />} />
        <Route path="/siah" element={<SiahHatziburPage />} />
        <Route path="/siah/:id" element={<SiahDetail />} />
        <Route path="/before-18" element={<Before18Page />} />
        <Route path="/before-18/:id" element={<Before18Detail />} />
        <Route path="/bein-hatzibur" element={<BeinHatziburPage />} />
        <Route path="/bein-hatzibur/:id" element={<BeinHatziburDetail />} />
        <Route path="/news-batzibur" element={<NewsBatziburPage />} />
        <Route path="/news-batzibur/:id" element={<NewsBatziburDetail />} />
        <Route path="/historical" element={<HistoricalEventsPage />} />
        <Route path="/historical/:id" element={<HistoricalEventDetail />} />

        {/* Site Pages */}
        <Route path="/terms" element={<SitePage />} />
        <Route path="/privacy" element={<SitePage />} />
        <Route path="/accessibility" element={<SitePage />} />
        <Route path="/advertise" element={<Advertise />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/articles" element={<ProtectedRoute><AdminArticles /></ProtectedRoute>} />
        <Route path="/admin/articles/new" element={<ProtectedRoute><AdminArticleEdit /></ProtectedRoute>} />
        <Route path="/admin/articles/:id" element={<ProtectedRoute><AdminArticleEdit /></ProtectedRoute>} />
        <Route path="/admin/galleries" element={<ProtectedRoute><AdminGalleries /></ProtectedRoute>} />
        <Route path="/admin/galleries/new" element={<ProtectedRoute><AdminGalleries /></ProtectedRoute>} />
        <Route path="/admin/events" element={<ProtectedRoute><AdminEvents /></ProtectedRoute>} />
        <Route path="/admin/events/new" element={<ProtectedRoute><AdminEvents /></ProtectedRoute>} />
        <Route path="/admin/videos" element={<ProtectedRoute><AdminVideos /></ProtectedRoute>} />
        <Route path="/admin/videos/new" element={<ProtectedRoute><AdminVideos /></ProtectedRoute>} />
        <Route path="/admin/ads" element={<ProtectedRoute><AdminAds /></ProtectedRoute>} />
        <Route path="/admin/data" element={<ProtectedRoute><AdminDataManager /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminSettings /></ProtectedRoute>} />
        
        {/* New Admin Newspaper Routes */}
        <Route path="/admin/newspaper" element={<ProtectedRoute><AdminNewspaperIssues /></ProtectedRoute>} />
        <Route path="/admin/siah" element={<ProtectedRoute><AdminSiahHatzibur /></ProtectedRoute>} />
        <Route path="/admin/before-18" element={<ProtectedRoute><AdminBefore18Years /></ProtectedRoute>} />
        <Route path="/admin/bein-hatzibur" element={<ProtectedRoute><AdminBeinHatzibur /></ProtectedRoute>} />
        <Route path="/admin/news-batzibur" element={<ProtectedRoute><AdminNewsBatzibur /></ProtectedRoute>} />
        <Route path="/admin/historical" element={<ProtectedRoute><AdminHistoricalEvents /></ProtectedRoute>} />
        <Route path="/admin/hero-banners" element={<ProtectedRoute><AdminHeroBanners /></ProtectedRoute>} />
        <Route path="/admin/watermark" element={<ProtectedRoute requireAdmin><AdminWatermarkTool /></ProtectedRoute>} />
        <Route path="/admin/drive-sync" element={<ProtectedRoute requireAdmin><AdminDriveSync /></ProtectedRoute>} />
        <Route path="/admin/drive-sync/callback" element={<AdminDriveSyncCallback />} />
        <Route path="/admin/site-pages" element={<ProtectedRoute><AdminSitePages /></ProtectedRoute>} />
        <Route path="/admin/ad-requests" element={<ProtectedRoute><AdminAdRequests /></ProtectedRoute>} />
        <Route path="/admin/all-pages" element={<ProtectedRoute><AdminAllPagesPreview /></ProtectedRoute>} />
        <Route path="/admin/writers" element={<ProtectedRoute><AdminWriters /></ProtectedRoute>} />
        <Route path="/admin/media" element={<ProtectedRoute><AdminMedia /></ProtectedRoute>} />
        <Route path="/admin/comments" element={<ProtectedRoute><AdminComments /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute><AdminSiteAnalytics /></ProtectedRoute>} />
        <Route path="/admin/export" element={<ProtectedRoute><ExportCode /></ProtectedRoute>} />
        <Route path="/admin/newsletter" element={<ProtectedRoute><AdminNewsletter /></ProtectedRoute>} />
        
        {/* 404 - Catch All */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </div>

      {/* Mobile menu drawer — rendered OUTSIDE the transforming wrapper so it
          stays fixed to the right edge while the page slides left. */}
      <MobileMenuDrawer />
    </>
  );
}
