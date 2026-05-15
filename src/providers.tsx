import { ReactNode } from 'react';
import { RTLProvider } from '@/contexts/RTLContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { MobileMenuProvider } from '@/contexts/MobileMenuContext';

/**
 * ⚠️ App-wide providers. Add new providers here — they'll be available in all routes.
 */

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <RTLProvider>
      <AuthProvider>
        <MobileMenuProvider>
          {children}
        </MobileMenuProvider>
      </AuthProvider>
    </RTLProvider>
  );
}
