import { type ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Brief loading state (max 2 seconds handled by AuthContext)
  if (loading) {
    return (
      <div data-ev-id="ev_7773005f36" className="min-h-screen bg-zinc-950 flex items-center justify-center" dir="rtl">
        <div data-ev-id="ev_30f4dced52" className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          <p data-ev-id="ev_3d20ddc478" className="text-zinc-400">טוען...</p>
        </div>
      </div>);

  }

  // No user - redirect to login
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // User is authenticated - render children
  return <>{children}</>;
}