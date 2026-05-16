import { Link, useLocation } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Newspaper,
  Image as ImageIcon,
  ImagePlus,
  Calendar,
  Video,
  Megaphone,
  Database,
  Settings,
  Users,
  UserPen,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronLeft,
  FileText,
  Clock,
  Eye,
  History,
  Presentation,
  Droplets,
  Cloud,
  MessageSquare,
  MessageCircle,
  FileEdit,
  BarChart3,
  Download,
  Mail
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/admin', label: 'דשבורד', icon: LayoutDashboard },
  { path: '/admin/drive-sync', label: 'סנכרון Drive', icon: Cloud },
  { path: '/admin/media', label: 'מדיה', icon: ImagePlus },
  { path: '/admin/newspaper', label: 'גיליונות העיתון', icon: Newspaper },
  { path: '/admin/siah', label: 'שיח הציבור', icon: FileText },
  { path: '/admin/before-18', label: 'לפני 18 שנה', icon: Clock },
  { path: '/admin/bein-hatzibur', label: 'בעין הציבור', icon: Eye },
  { path: '/admin/news-batzibur', label: 'נייעס בציבור', icon: Newspaper },
  { path: '/admin/historical', label: 'אירועים היסטוריים', icon: History },
  { path: '/admin/galleries', label: 'גלריות', icon: ImageIcon },
  { path: '/admin/events', label: 'אירועים', icon: Calendar },
  { path: '/admin/videos', label: 'סרטונים', icon: Video },
  { path: '/admin/data', label: 'צלמים וחסידויות', icon: Database },
  { path: '/admin/ads', label: 'פרסומות', icon: Megaphone },
  { path: '/admin/analytics', label: 'אנליטיקס', icon: BarChart3 },
  { path: '/admin/ad-requests', label: 'בקשות פרסום', icon: MessageSquare },
  { path: '/admin/comments', label: 'תגובות והצבעות', icon: MessageCircle },
  { path: '/admin/site-pages', label: 'דפי מידע', icon: FileEdit },
  { path: '/admin/watermark', label: 'סימן מים', icon: Droplets },
  { path: '/admin/newsletter', label: 'ניוזלטר', icon: Mail },
  { path: '/admin/users', label: 'משתמשים', icon: Users },
  { path: '/admin/settings', label: 'הגדרות', icon: Settings }
];


export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/admin/login';
  };

  return (
    <div data-ev-id="ev_cf2e2afa52" className="min-h-screen bg-zinc-950" dir="rtl">
      {/* Mobile Header */}
      <header data-ev-id="ev_34df4345e3" className="lg:hidden fixed top-0 right-0 left-0 h-16 bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800 z-50 flex items-center justify-between px-4">
        <button data-ev-id="ev_e45355ac98"
        onClick={() => setSidebarOpen(true)}
        className="p-2 text-zinc-400 hover:text-white">

          <Menu className="w-6 h-6" />
        </button>
        <span data-ev-id="ev_dde92bd295" className="text-lg font-bold text-white">מערכת ניהול</span>
        <div data-ev-id="ev_30f54fa839" className="w-10" />
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen &&
      <div data-ev-id="ev_470f3a274d"
      className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      onClick={() => setSidebarOpen(false)} />

      }

      {/* Sidebar */}
      <aside data-ev-id="ev_8e8bf8389a"
      className={`fixed top-0 right-0 h-full w-72 bg-zinc-900/95 backdrop-blur-xl border-l border-zinc-800 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
      sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`
      }>

        {/* Sidebar Header */}
        <div data-ev-id="ev_0faa6fdf93" className="h-16 flex items-center justify-between px-6 border-b border-zinc-800">
          <Link to="/admin" className="flex items-center gap-2">
            <span data-ev-id="ev_08a0baa913" className="text-xl font-bold bg-gradient-to-l from-amber-400 to-amber-600 bg-clip-text text-transparent">
              מערכת ניהול
            </span>
          </Link>
          <button data-ev-id="ev_b52046b4ac"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-2 text-zinc-400 hover:text-white">

            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div data-ev-id="ev_2f2e45b3d0" className="p-4 border-b border-zinc-800">
          <div data-ev-id="ev_b34391405f" className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl">
            <div data-ev-id="ev_2d21347cf1" className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-900 font-bold">
              {profile?.full_name?.[0] || profile?.email?.[0] || 'מ'}
            </div>
            <div data-ev-id="ev_be2c850808" className="flex-1 min-w-0">
              <p data-ev-id="ev_b5d808a0dd" className="text-sm font-medium text-white truncate">
                {profile?.full_name || 'מנהל'}
              </p>
              <p data-ev-id="ev_08ecc513f4" className="text-xs text-zinc-500 truncate">
                {profile?.role === 'admin' ? 'מנהל ראשי' : 'עורך'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav data-ev-id="ev_43aa254420" className="p-4 flex flex-col gap-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
            item.path !== '/admin' && location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive ?
                'bg-amber-500 text-zinc-900 font-medium' :
                'text-zinc-400 hover:text-white hover:bg-zinc-800'}`
                }>

                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>);

          })}
        </nav>

        {/* Logout Button */}
        <div data-ev-id="ev_7ce1220e5f" className="absolute bottom-0 right-0 left-0 p-4 border-t border-zinc-800">
          <button data-ev-id="ev_40fd608483"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">

            <LogOut className="w-5 h-5" />
            התנתק
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main data-ev-id="ev_b4ab6b7703" className="lg:mr-72 pt-16 lg:pt-0">
        {/* Top Bar */}
        <header data-ev-id="ev_e6ee090d7d" className="hidden lg:flex h-16 items-center justify-between px-6 border-b border-zinc-800 bg-zinc-900/50">
          <div data-ev-id="ev_7418b101ca" className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
              <span data-ev-id="ev_2c8f13ac02" className="text-sm">חזרה לאתר</span>
            </Link>
          </div>
          <div data-ev-id="ev_5ad11d5d1d" className="flex items-center gap-4">
            {/* Search */}
            <div data-ev-id="ev_ab0ff16634" className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input data-ev-id="ev_6e0177ce7e"
              type="text"
              placeholder="חיפוש..."
              className="w-64 bg-zinc-800/50 border border-zinc-700 rounded-lg py-2 px-4 pr-10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />

            </div>
            {/* Notifications */}
            <button data-ev-id="ev_0fa1379738" className="relative p-2 text-zinc-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span data-ev-id="ev_e78c4c4171" className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
            </button>
            {/* User Avatar */}
            <div data-ev-id="ev_45529684ae" className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-900 font-bold text-sm">
              {profile?.full_name?.[0] || 'מ'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div data-ev-id="ev_2d56fd0da6" className="p-6">
          {children}
        </div>
      </main>
    </div>);

}
